-- Blog posts, written and published from /write. Modeled on qlik_tenants:
-- RLS enabled with zero policies -- only the service-role client, from
-- $lib/server/posts.ts, ever touches this table. Idempotent, safe to re-run.

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  -- Set once at creation from the title, kept stable afterwards even if the
  -- title is edited later -- published URLs must not move.
  slug         text not null,
  title        text not null,
  -- Raw markdown source, so it stays editable. Rendered to HTML (and
  -- sanitized) at read time in $lib/server/posts.ts, not stored as HTML.
  body_md      text not null,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  author_id    uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

create unique index if not exists posts_slug_key on public.posts (slug);
create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_status_published_at_idx on public.posts (status, published_at desc);

-- Reuses touch_updated_at(), already defined in
-- 20260730000000_create_qlik_tenants.sql.
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- Same reasoning as qlik_tenants: RLS on, no policies. If a bug ever handed
-- the browser client a query on this table, it returns zero rows instead of
-- unpublished drafts.
alter table public.posts enable row level security;

revoke all on public.posts from anon, authenticated;
