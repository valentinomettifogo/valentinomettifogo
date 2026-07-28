# Deployment

How to take this repository from nothing to a live site with a working Qlik webhook.

The steps are in order and each one is verifiable on its own. Steps 1–4 are one-off
setup; 5–8 are the migration away from the Google Apps Script that does this job today.

---

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com). Pick the EU region — the
   Qlik tenants are on `eu.qlikcloud.com`.
2. Open the SQL editor and run [`supabase/schema.sql`](../supabase/schema.sql) in full.
   It is idempotent, so re-running it later is safe.
3. From Project Settings → API, note down three values:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **publishable / anon key** → `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

> The service_role key bypasses RLS. It only ever belongs in a server environment
> variable — never in a `PUBLIC_` one, never in client code.

**Verify:** the table editor shows `qlik_tenants` and `qlik_webhook_events`, both with
RLS enabled and zero policies. That is intentional: only the server touches them.

---

## 2. Google Cloud OAuth client

1. In the [Google Cloud console](https://console.cloud.google.com), create (or pick) a
   project → APIs & Services → Credentials → Create credentials → OAuth client ID →
   Web application.
2. Authorized redirect URI:

   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```

   **Not** your app's URL. Google talks to Supabase, and Supabase talks to the app.
   Getting this wrong is the number one cause of `redirect_uri_mismatch`.
3. Copy the client ID and client secret.

---

## 3. Supabase auth configuration

1. Authentication → Providers → **Google**: enable it and paste the client ID/secret.
2. Authentication → Providers → **Email: disable it.**

   This matters. The `/alerts` allowlist checks the email domain, and without this an
   attacker could simply sign up with an address at the allowed domain via
   email/password. The code also asserts `app_metadata.provider === 'google'` as a
   second lock, but both should be in place.
3. Authentication → URL Configuration:
   - **Site URL:** `http://localhost:5173` during development, the production domain later.
   - **Redirect URLs:** add all of these —
     ```
     http://localhost:5173/auth/callback
     https://<your-domain>/auth/callback
     https://*-<your-team>.vercel.app/auth/callback
     ```
     The wildcard covers Vercel preview deploys; you will want it the first time you
     test a preview branch.

---

## 4. Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new). The framework is
   detected automatically; the adapter is already `@sveltejs/adapter-vercel`.
2. Add every variable from [`.env.example`](../.env.example):

   | Variable | Environments | Notes |
   |---|---|---|
   | `PUBLIC_SUPABASE_URL` | **all three** | inlined at build time |
   | `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **all three** | inlined at build time |
   | `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | |
   | `QLIK_WEBHOOK_TOKEN` | Production, Preview | see below |
   | `GOOGLE_CHAT_WEBHOOK_URL` | Production, Preview | the Chat space in use today |
   | `ALERTS_ALLOWED_DOMAIN` | Production, Preview | e.g. `companydomain.com` |
   | `ALERTS_ALLOWED_EMAILS` | Production, Preview | comma-separated |

   The two `PUBLIC_` ones must exist in **Development** too, or `vercel build` fails
   locally: they are baked into the bundle rather than read at runtime.

   Generate the webhook token with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(36).toString('base64url'))"
   ```

3. Deploy, then set the custom domain if you have one, and update the Supabase Site URL
   and redirect URLs to match.

**Verify:** the homepage loads and `/alerts` bounces you to `/login`. Sign in with an
allowed account — you should land on the (empty) tenant table. Sign in with an account
outside the allowlist and you should get the 403 page **with a working sign-out button**.

---

## 5. Populate the tenants

Open `/alerts` and add one tenant per `QLIK_KEY_<host>` Script Property in the existing
Apps Script project (Project Settings → Script Properties).

For each one:

- **Client** — must produce the same slug currently used in `?cliente=`. The slug is the
  name lowercased with spaces stripped, so `Argea` → `argea`. If today's webhook URL says
  `?cliente=Argea`, then `Argea` is the right value here.
- **Host** — the value from the property name, e.g. `argea.eu.qlikcloud.com`.
- **Qlik API key** — the property value.
- Leave the webhook token and Chat webhook blank to use the globals.

**Verify:** press **Check all**. Every row should report `Key valid`. A row reporting
`Key invalid or expired` means that key needs regenerating in the Qlik tenant — worth
knowing before you cut anything over.

---

## 6. Point Qlik at the new endpoint

The webhook URL is:

```
https://<your-domain>/api/webhooks/qlik?cliente=<Client>
```

The token goes in **one** of two places:

- **Header `X-Webhook-Token` — preferred.** Qlik Cloud stores custom headers encrypted
  and decrypts them at delivery time.
- Query string `?token=…` — simpler, but the full URL is recorded in the Vercel runtime
  logs and kept in Qlik's own delivery history for a week, visible in the admin UI.

The endpoint accepts both, so there is no code change involved in switching later.

**Migrate one tenant at a time**, and leave the Apps Script running in parallel for a few
days. Duplicate alerts are a mild annoyance; a silent gap in alerting is not.

---

## 7. Verification checklist

Against a local dev server (`npm run dev`), using PowerShell:

```powershell
$base = 'http://localhost:5173/api/webhooks/qlik'
$tok  = $env:QLIK_WEBHOOK_TOKEN
$fail = '{"id":"evt-1","data":{"appId":"1a2b","status":"error","name":"Sales"}}'
$okb  = '{"id":"evt-2","data":{"appId":"1a2b","status":"ok","name":"Sales"}}'

# 405 — a browser hitting the URL
Invoke-WebRequest -Uri $base -SkipHttpErrorCheck

# 401 — wrong token
Invoke-WebRequest -Method POST -ContentType 'application/json' `
  -Uri "${base}?cliente=Argea&token=nope" -Body $fail -SkipHttpErrorCheck

# 400 — unparsable body
Invoke-WebRequest -Method POST -ContentType 'application/json' `
  -Uri "${base}?cliente=Argea&token=$tok" -Body 'not-json' -SkipHttpErrorCheck

# 200 ignored — a successful reload, i.e. most of the traffic
Invoke-RestMethod -Method POST -ContentType 'application/json' `
  -Uri "${base}?cliente=Argea&token=$tok" -Body $okb

# 200 sent — a failed reload, this one reaches Google Chat
Invoke-RestMethod -Method POST -ContentType 'application/json' `
  -Uri "${base}?cliente=Argea&token=$tok" -Body $fail
```

The case that matters most: point a tenant row at a **dead API key** and send a failure.
The alert must still arrive, showing the raw appId instead of the app name. Enrichment
degrades, it never blocks.

To send real Qlik traffic at a local server, expose it with `npx localtunnel --port 5173`
or `ngrok http 5173` and set that URL on a single test tenant.

Auth, in a browser:

| Account | Expected |
|---|---|
| Company Google account | lands on `/alerts` |
| Owner address in `ALERTS_ALLOWED_EMAILS` | lands on `/alerts` |
| Any other Google account | 403 page, sign-out works |
| Signed out, visiting `/alerts` | `303` to `/login?next=%2Falerts`, returns after sign-in |

---

## 8. Decommission the Apps Script

Only once every tenant is pointing here and a few real failures have been observed
arriving through the new path. Then disable the Apps Script deployment — do not delete
the project outright, it costs nothing to keep as a fallback for a while.

---

## Notes

**Windows local builds.** The final adapter step of `npm run build` fails with
`EPERM: operation not permitted, symlink` when Developer Mode is off: Windows does not
grant symlink creation to non-administrators. The bundle itself is already built, and
Vercel (Linux) is unaffected. To make it pass locally: Settings → System → For developers
→ Developer Mode.

**`npm run check` is the gate.** It catches missing `App.Locals` members, `import type`
violations from `verbatimModuleSyntax`, malformed `posts.json` entries and `cookies.set`
calls without `path`. Worth wiring into the Vercel build command so a broken
`hooks.server.ts` cannot reach production.
