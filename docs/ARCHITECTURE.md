# Architecture

How this repo is put together, for anyone (human or agent) who isn't already in
`CLAUDE.md`'s context. Start there for the ground rules; this document goes one
level deeper into how the pieces connect.

## Stack

- **SvelteKit 2** on **Svelte 5** (runes), **Tailwind v4**, **TypeScript**.
- **Supabase**: Postgres + Auth (Google OAuth only) + Row Level Security.
- Deployed on **Vercel** (`@sveltejs/adapter-auto`); the webhook route pins the
  Node runtime, everything else runs on whatever the adapter picks.
- Markdown rendering: `marked` (posts) sanitized with `xss` — see
  [Known traps](#known-traps) for why not a jsdom-based sanitizer.

No test suite exists in the repo today. `npm run check` (`svelte-kit sync &&
svelte-check`) is the only gate, and it must stay at 0 errors.

## Request flow: auth and roles

Every request goes through [`src/hooks.server.ts`](../src/hooks.server.ts):

1. Builds a per-request Supabase client from cookies.
2. `safeGetSession()` re-validates the session against Supabase (`getUser()`,
   not just the cookie) and, if valid, reads the caller's row from
   `public.users` for their `role`.
3. Stores `supabase`, `session`, `user`, `role` on `event.locals` (typed in
   [`src/app.d.ts`](../src/app.d.ts)).

`public.users` is provisioned by a security-definer trigger on `auth.users`
(see [`docs/supabase/`](supabase/)) — there is no sign-up form, every row is
created the moment someone signs in with Google for the first time, at role
`user`.

[`src/lib/server/authz.ts`](../src/lib/server/authz.ts) exposes two
independent checks, not one ladder:

- `roleMeets(role, minimum)` — ranks `user`/`author` (0) < `analytics` (1) <
  `admin` (2), for `/portal` and `/admin`.
- `canWritePosts(role)` / `canModerateAllPosts(role)` — a separate axis for
  `/write`: `author` or `admin` can write, only `admin` can moderate everyone
  else's posts. Being an `author` grants **no** `/portal` access; it sits
  alongside `user` on the ladder above.

There is no `(protected)` route group. Every `+page.server.ts` and every form
`action` re-checks the role itself — see [Guards](#guards-are-per-route-not-shared)
below.

## The four surfaces

### `/` — public mini-blog

[`src/routes/+page.server.ts`](../src/routes/+page.server.ts) calls
`listPublishedPosts()` in [`src/lib/server/posts.ts`](../src/lib/server/posts.ts),
which reads `public.posts` where `status = 'published'`, newest first, and
renders each row's Markdown (`marked`) through an `xss` allowlist at **read**
time — not at save time, so sanitization rules can evolve without touching
existing rows.

### `/write` — author dashboard

Gated by `canWritePosts` (role `author` or `admin`). An author sees only their
own drafts/published posts (`listOwnPosts`); an admin sees everyone's
(`listAllPosts`) and can moderate. Every mutating action
(`createPost`/`updatePost`/`publishPost`/`unpublishPost`/`deletePost`) goes
through `requireOwnerOrAdmin()`, which re-reads the post's `author_id` from
the database rather than trusting anything the client sent — a non-owner
non-admin can't publish or delete someone else's draft by crafting a form
POST. `slug` is set once at creation from the title and never changes, so
published URLs don't move if the title is edited later.

### `/api/webhooks/qlik` — the actual webhook hub

Receives Qlik Cloud reload-event webhooks from multiple tenants at once (one
shared endpoint, tenant identified by the `?cliente=` query param), filters
for failures, and posts an alert to Google Chat. This is the part of the app
[`CLAUDE.md`](../CLAUDE.md) calls "a port of a Google Apps Script" — the old
`valmet-alert.js` GAS web app. Full flow in
[`src/routes/api/webhooks/qlik/+server.ts`](../src/routes/api/webhooks/qlik/+server.ts):

1. **Auth (incoming call)** — `QLIK_WEBHOOK_TOKEN`, compared with
   `safeEqual()` (`src/lib/server/crypto.ts`, hash-then-`timingSafeEqual` so
   unequal-length strings don't throw). Token can arrive in `?token=` or the
   `x-webhook-token` header — both are accepted so tenants can migrate one at
   a time. An unset shared secret means *deny*, never *allow*.
2. **Tenant lookup** — `?cliente=` is slugified and matched against
   `qlik_tenants.slug` (a generated column). This is unrelated to the tenant's
   own `api_key`, which is used the other direction — see next point.
3. **Filter** — only `FAILED` (reload-task/automation events) or `error`
   (`app.reload.finished` events) statuses continue; everything else is
   logged and 200'd away.
4. **Enrichment (best-effort, outgoing calls)** — if a tenant row with an
   `api_key` was found, the server calls *that tenant's own* Qlik Cloud REST
   API (`resolveNames()` in `qlik.ts`) to turn `appId`/`spaceId` into display
   names. Every failure mode (expired key, unreachable host, timeout) is
   swallowed and logged, never thrown — this is the invariant the whole thing
   is built around, restated in [Invariants](../CLAUDE.md#invariants--do-not-break-these).
5. **Notify** — `notifierFor()` (`src/lib/server/notify/index.ts`) currently
   returns a single Google Chat notifier built from
   `GOOGLE_CHAT_WEBHOOK_URL`. Adding a second channel (Telegram is the example
   in the code comments) is one new file + one branch, per the `Notifier`
   interface in `notify/types.ts`. The Chat message text stays in Italian on
   purpose (see `CLAUDE.md`'s language conventions).

### `/portal` and `/admin` — internal panels

`/portal` lists/edits `qlik_tenants` (read: `analytics`+, write: `admin`
only — see `requireRead`/`requireWrite` in
[`src/routes/portal/+page.server.ts`](../src/routes/portal/+page.server.ts)).
`/portal/verify` is a small JSON endpoint (not a form action) so the table can
check each tenant's API key independently and in parallel; it returns
`{ ok, code, message }` and never the key or the tenant's response body.

`/admin` lists every `public.users` row and lets an admin change roles
(`src/routes/admin/+page.server.ts`). An admin cannot demote themselves — the
one guard rail preventing a lockout, since the only recovery would be the
Supabase table editor.

## Data layer (`src/lib/server/`)

Every table read/write goes through the **service-role client**
(`getServiceClient()` in `src/lib/server/supabase.ts`, built from
`SUPABASE_SERVICE_ROLE_KEY`), which bypasses RLS. That's deliberate: RLS on
`qlik_tenants` and `posts` is enabled with **zero policies**, so a bug that
skips the service client returns no rows instead of every customer's Qlik key
or every draft. `public.users` does have one RLS policy (read own row), used
by `hooks.server.ts`'s per-request client, not the service client.

Each server module owns one table and exposes only view-shaped types to
callers, stripping secrets at the boundary:

| Module | Table | Secret stripped |
|---|---|---|
| `tenants.ts` | `qlik_tenants` | `api_key` — `toView()` is the only way a row leaves the module; the browser only ever sees `hasApiKey` + a masked `••••1234` |
| `posts.ts` | `posts` | none (raw `body_md` is fine to return — only the author or an admin ever sees it) |
| `users.ts` | `users` | none, but still uses an explicit column list on principle |

Every query in these modules uses an explicit column list, never `select('*')`
— see [Known traps](#known-traps).

## Guards are per-route, not shared

There is no middleware/layout that blocks a route. Every `+page.server.ts`
`load` and every form `action` calls its own `requireX()` at the top:

```
requireRead / requireWrite   → src/routes/portal/+page.server.ts
requireAdmin                  → src/routes/admin/+page.server.ts
requireWriter / requireOwnerOrAdmin → src/routes/write/+page.server.ts
```

`Navbar.svelte` hides links the current role can't use, but that's cosmetic
only — the comment in the component says so explicitly. If you add a new
protected route, the check belongs in that route's own `load` and in every
one of its `actions`, not in a shared place.

## Auth routes

Google OAuth only, via Supabase:

- `GET /auth/login` — starts `signInWithOAuth({ provider: 'google' })`,
  redirects to Google.
- `GET /auth/callback` — exchanges the `code` for a session, redirects to `/`
  (or `/auth/auth-code-error` on failure).
- `POST /auth/logout` — **POST only**, on purpose: a `GET` logout route would
  fire on link prefetch.

## Known traps

These are things that look like bugs but aren't, or things that *are*
leftover and worth knowing about:

- **`src/lib/posts.ts` and `src/lib/posts/*.md` are dead code.** The site
  used to read blog posts from Markdown files at build time; it now reads
  `public.posts` at request time (`src/lib/server/posts.ts`). The migration
  (`docs/supabase/20260804000002_seed_existing_posts.sql`) copied the file
  content into the table and says to delete the files once the homepage is
  confirmed working from the DB — that cleanup hasn't happened yet, so
  `parsePost()`/`Post` in `lib/posts.ts` and the `.md` files under
  `lib/posts/` are unused. Don't add new posts as `.md` files; use `/write`.
- **`xss`, not a jsdom/htmlparser2-based sanitizer.** Both pull in an
  ESM-only transitive dependency that crashes on Vercel's serverless Node
  runtime (`ERR_REQUIRE_ESM`) even though it builds fine locally — this is
  also why an earlier `sanitize-html` attempt was reverted (see git log).
- **`getServiceClient()` must never be imported outside `src/lib/server/`.**
  It bypasses RLS; `qlik_tenants` and `posts` have RLS on with zero policies
  specifically so that a slip returns no rows instead of every customer's key
  or every draft.
- **The webhook route is pinned to `nodejs22.x`.** `node:crypto` (used by
  `safeEqual()`) doesn't exist on the edge runtime.
- **Google's OAuth redirect URI is the Supabase project's**
  (`https://<project-ref>.supabase.co/auth/v1/callback`), not this app's URL.

## Where things live

See the "Where to add things" and "Layout" tables at the bottom of
[`CLAUDE.md`](../CLAUDE.md) — they're the day-to-day reference and are kept
in sync with this document.
