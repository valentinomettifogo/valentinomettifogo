# Ruoli

Come funzionano i ruoli utente in questo repo, per riferimento rapido. Per il flusso
completo di autenticazione vedi [`ARCHITECTURE.md`](ARCHITECTURE.md#request-flow-auth-and-roles);
per la matrice completa (incluso `/write`) vedi la tabella in
[`CLAUDE.md`](../CLAUDE.md#auth-and-roles).

## I quattro ruoli

`public.users` assegna un ruolo a ogni utente al primo login con Google (via trigger
security-definer, vedi [`docs/supabase/`](supabase/)): `user`, `author`, `analytics` o
`admin`. Ogni nuovo utente parte da `user`; i ruoli si cambiano solo da `/admin`.

| Ruolo | Cosa vede |
| :--- | :--- |
| `user` | solo la homepage (`/`) |
| `analytics` | anche `/portal`, in sola lettura |
| `admin` | anche la scrittura su `/portal` e la pagina `/admin` |

`author` non compare in questa tabella perché non è un altro gradino della stessa
scala: è un asse separato che riguarda solo `/write` (pubblicare i propri post), e non
dà accesso a `/portal` — vedi `canWritePosts()`/`canModerateAllPosts()` in
[`src/lib/server/authz.ts`](../src/lib/server/authz.ts).

## Dove viene applicato

- `roleMeets(role, minimum)` in `src/lib/server/authz.ts` classifica `user`/`author`
  (0) < `analytics` (1) < `admin` (2) e regge la scala `/portal`/`/admin`.
- `/portal` chiama `requireRead` (≥ `analytics`) per la lettura e `requireWrite`
  (= `admin`) per creare/modificare/eliminare un tenant — sia nel `load` sia in ogni
  `action`, in [`src/routes/portal/+page.server.ts`](../src/routes/portal/+page.server.ts).
- `/admin` chiama `requireAdmin` in
  [`src/routes/admin/+page.server.ts`](../src/routes/admin/+page.server.ts), sia nel
  `load` sia nella action che cambia ruolo. Un admin non può cambiare il proprio
  ruolo: è l'unica protezione contro un lockout, dato che l'unico recupero
  alternativo sarebbe il table editor di Supabase.
- `Navbar.svelte` nasconde i link che il ruolo corrente non può usare, ma è solo
  estetico — non è una guardia. Il controllo vero è sempre lato server, in ogni
  `+page.server.ts` e in ogni `action`.

## Non c'è una scala unica

Non esiste un gruppo di route protette condiviso (niente `(protected)` route group):
ogni pagina fa il proprio controllo. Questo significa che un ruolo può stare su due
assi indipendenti allo stesso tempo — ad esempio un `admin` è anche implicitamente
al livello più alto di `/write` (può moderare i post di tutti), ma un `analytics`
non ha alcun accesso a `/write`, e un `author` non ha alcun accesso a `/portal`.
