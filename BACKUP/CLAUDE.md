# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Personal site and webhook hub. SvelteKit 2 + Svelte 5 (runes) + Tailwind v4, deployed on
Vercel, with Supabase for auth and data. Three parts:

1. **Public mini-blog** at `/` — prerendered, posts come from a JSON file in the repo.
2. **Qlik Cloud webhook** at `/api/webhooks/qlik` — receives reload events from several
   Qlik tenants, filters the failures, resolves app and space names through the tenant's
   REST API, and sends an alert to Google Chat. It is a port of a Google Apps Script.
3. **`/alerts` panel** — tenant management behind Google sign-in, restricted to one email
   domain plus an owner allowlist.

A Telegram webhook is planned but not built. The extension point is the `Notifier`
interface in `src/lib/server/notify/`.

## Commands

```bash
npm run dev      # http://localhost:5173
npm run check    # svelte-kit sync && svelte-check — must stay at 0 errors
npm run build
```

`npm run check` is the gate; run it after any change. On Windows the last step of
`npm run build` fails with `EPERM: symlink` unless Developer Mode is on — the bundle is
still produced and Vercel is unaffected, so that failure is not a regression.

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
- **The homepage stays prerenderable.** No cookies, no session in the root layout. All
  auth loading lives inside the `(protected)` group. If the root layout ever reads
  cookies, `/` stops being a static file.
- **The webhook stays on the Node runtime.** `node:crypto` does not exist on edge; the
  route pins `export const config = { runtime: 'nodejs22.x' }`.
- **Secret form fields are write-only.** In `TenantForm.svelte`, blank means "leave
  unchanged" and an explicit checkbox means "clear". They are never sent to the browser,
  so the form cannot resubmit them.
- **Sign-out is POST only.** A GET route would be triggered by link prefetching.

## Known traps

- **PKCE.** OAuth starts from a server action with `skipBrowserRedirect: true`, so
  `@supabase/ssr` writes the `code_verifier` cookie that `/auth/callback` needs. Starting
  it in the browser and exchanging server-side does not work.
- **Google redirect URI** is `https://<project-ref>.supabase.co/auth/v1/callback`, not the
  app URL. See [`docs/deployment.md`](docs/deployment.md).
- **`cookies.set` requires `path`.** SvelteKit throws without it; the `setAll` handler in
  `src/hooks.server.ts` always passes `path: '/'`.
- **`verbatimModuleSyntax` is on.** Type-only imports must use `import type`.
- **No `svelte.config.js`.** Kit config is passed inline to `sveltekit({...})` in
  `vite.config.ts`. Anything that would go under `kit: {}` goes flat in there.
- **Tailwind is mobile-first, the design is not.** `--breakpoint-sm: 560px` maps `sm:` to
  the design's single breakpoint, so base styles are the narrow ones and `sm:` carries the
  desktop layout.

## Where to add things

| Task | Where |
|---|---|
| A blog post | `src/lib/data/posts.json`. Numbering is derived from the date — do not write it. |
| Header/footer copy | `src/lib/data/site.ts` |
| A notification channel | Implement `Notifier` in `src/lib/server/notify/`, add a branch to `notifierFor()` |
| A protected page | Under `src/routes/(protected)/` — the hook guards the whole group by route id |
| A schema change | `supabase/schema.sql`, kept idempotent and re-runnable |

## Layout

```
src/
├── lib/
│   ├── components/site|ui|alerts/
│   ├── data/posts.json, posts.ts, site.ts
│   ├── server/            # server-only: qlik, tenants, notify, crypto, authz
│   └── types.ts           # types shared between server and client
└── routes/
    ├── +page.svelte       # public blog, prerendered
    ├── (protected)/       # auth-gated group
    ├── auth/              # callback, signout, error
    └── api/webhooks/qlik/
```
