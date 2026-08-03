-- Adds the 'author' role: signed-in people who can write and publish blog
-- posts from /write without needing /portal access. Idempotent, safe to re-run.

alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('user', 'analytics', 'admin', 'author'));
