-- 1. Table: one row per auth.users row, holds the app-level role.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'analytics', 'admin')),
  created_at timestamptz not null default now()
);

-- Defensive explicit grant: don't assume default privileges were pre-configured
-- for a fresh project -- RLS below still restricts which rows are visible.
grant select on public.users to authenticated;

-- 2. RLS: a user may read only their own row. No insert/update/delete policy
-- is defined for regular users at all -- provisioning happens only via the
-- security-definer trigger below, and role changes happen only via the
-- Supabase Dashboard / a manual SQL UPDATE. This makes self-service
-- role-escalation structurally impossible, not just UI-hidden.
alter table public.users enable row level security;

create policy "Users can view their own row"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

-- 3. Auto-provisioning: every new auth.users row gets a matching public.users
-- row with role defaulted to 'user'. security definer lets this trigger
-- write to public.users despite the RLS policy above (which has no INSERT
-- clause and would otherwise block it).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
