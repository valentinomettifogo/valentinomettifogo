# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Personal site and webhook hub. SvelteKit 2 + Svelte 5 (runes) + Tailwind v4, deployed on
Vercel, with Supabase for auth and data. Three parts:

1. **Public mini-blog** at `/` — posts come from a JSON file in the repo.
2. **Qlik Cloud webhook** at `/api/webhooks/qlik` — receives reload events from several
   Qlik tenants, filters the failures, resolves app and space names through the tenant's
   REST API, and sends an alert to Google Chat. It is a port of a Google Apps Script.
3. **`/portal` panel** — Qlik tenant list behind Google sign-in: `analytics` reads it,
   `admin` also edits it.
4. **`/admin` panel** — the user list, where an admin assigns roles.

A Telegram webhook is planned but not built. The extension point is the `Notifier`
interface in `src/lib/server/notify/`.

[`BACKUP/`](BACKUP/) holds an earlier, more elaborate version of the same app. It is
reference material, not built and not deployed — but when a feature already exists there,
port it rather than reinventing it.

## Commands

```bash
npm run dev      # http://localhost:5173
npm run check    # svelte-kit sync && svelte-check — must stay at 0 errors
npm run build
```

`npm run check` is the gate; run it after any change.

## Auth and roles

`public.users` has one row per `auth.users` row with a `role` of `user`, `analytics` or
`admin`, provisioned by a security-definer trigger (see [`docs/supabase/`](docs/supabase/)).
[`src/hooks.server.ts`](src/hooks.server.ts) resolves it once per request into
`locals.role`; `roleMeets()` in [`src/lib/server/authz.ts`](src/lib/server/authz.ts) ranks
it `user < analytics < admin`. There is no `(protected)` route group — each page guards
itself in its own `+page.server.ts`, and so does every form action.

| | `user` | `analytics` | `admin` |
|---|---|---|---|
| `/` | ✓ | ✓ | ✓ |
| `/portal` read | | ✓ | ✓ |
| `/portal` write | | | ✓ |
| `/admin` | | | ✓ |

Roles are changed only from `/admin`, and **an admin cannot change their own role**: the
last admin demoting themselves would leave no way back except the Supabase table editor.
RLS on `public.users` lets a user read only their own row, so the list is read with the
service client.

## Language conventions

Code, UI copy and comments are **English**.

Two deliberate exceptions, both because they are contracts already configured elsewhere:

- The webhook query parameter is **`?cliente=`** and the database column is **`cliente`**.
  Every Qlik tenant already points at that URL and the table already exists. The mapping
  to `client` happens once, in `toSecret()` / `toView()` in `src/lib/server/tenants.ts`.
- The Google Chat message body in `src/lib/server/notify/googleChat.ts` stays in Italian:
  it is read by Italian-speaking colleagues, not by users of this app.

## Invariants — do not break these

- **Enrichment is best-effort.** `resolveNames()` in `src/lib/server/qlik.ts` must never
  block or fail an alert. Expired API key, unreachable tenant, timeout — all swallowed,
  and the alert goes out with the raw appId. This is the whole reason the original Apps
  Script was written the way it was.
- **`api_key` must never reach the browser.** Rows leave `src/lib/server/tenants.ts` only
  through `toView()`, which has no such field. Always use explicit column lists, never
  `select('*')` — one wildcard in a load return value puts every customer's Qlik key into
  the SSR payload in plain text.
- **The webhook stays on the Node runtime.** `node:crypto` does not exist on edge; the
  route pins `export const config = { runtime: 'nodejs22.x' }`.
- **Secret form fields are write-only.** In `TenantForm.svelte`, blank means "leave
  unchanged" and an explicit checkbox means "clear". They are never sent to the browser,
  so the form cannot resubmit them.
- **Guards go on the server, in every action.** Hiding a link in `Navbar.svelte` is
  cosmetic; `/portal` re-asserts the role in `load` *and* in `saveTenant`/`deleteTenant`.
- **Sign-out is POST only.** A GET route would be triggered by link prefetching.

## Known traps

- **The service-role client bypasses RLS.** `getServiceClient()` must never be imported
  outside `src/lib/server/`. `qlik_tenants` has RLS on with zero policies precisely so a
  slip returns no rows instead of every customer's key.
- **Google redirect URI** is `https://<project-ref>.supabase.co/auth/v1/callback`, not the
  app URL.
- **`cookies.set` requires `path`.** SvelteKit throws without it; the `setAll` handler in
  `src/hooks.server.ts` always passes `path: '/'`.
- **`verbatimModuleSyntax` is on.** Type-only imports must use `import type`.
- **No `svelte.config.js`.** Kit config is passed inline to `sveltekit({...})` in
  `vite.config.ts`. Anything that would go under `kit: {}` goes flat in there.

## Where to add things

| Task | Where |
|---|---|
| A blog post | `src/lib/data/posts.json` |
| A notification channel | Implement `Notifier` in `src/lib/server/notify/`, add a branch to `notifierFor()` |
| A protected page | New route + a role check in its `+page.server.ts`, like `src/routes/portal/` |
| A generic example (client, host) | Use `Acme` / `tenant.eu.qlikcloud.com` — never a real customer name |
| A schema change | A new timestamped file in `docs/supabase/`, idempotent and re-runnable |

## Layout

```
src/
├── lib/
│   ├── components/        # Navbar, PostList…, plus alerts/ for the tenant panel
│   ├── data/posts.json
│   ├── server/            # server-only: qlik, tenants, notify, crypto, supabase, authz
│   └── types.ts           # types shared between server and client
└── routes/
    ├── +page.svelte       # public blog
    ├── portal/            # Qlik tenant panel (read: analytics, write: admin)
    ├── admin/             # user list and role assignment (admin)
    ├── auth/              # login, callback, logout
    └── api/webhooks/qlik/
```
