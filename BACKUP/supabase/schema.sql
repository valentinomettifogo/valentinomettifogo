-- Schema for valentinomettifogo.
-- Run it in the Supabase SQL editor. It is idempotent and can be re-run safely.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Qlik Cloud tenants
-- ---------------------------------------------------------------------------
-- Replaces the QLIK_KEY_<host> Script Properties of the old Google Apps Script.
create table if not exists public.qlik_tenants (
	id                 uuid primary key default gen_random_uuid(),
	-- Display name. Matches the ?cliente= parameter in the webhook URL, which is
	-- kept in Italian because it is already configured on every Qlik tenant.
	cliente            text not null,
	-- Webhook lookup key: "San Marco" -> "sanmarco".
	slug               text generated always as (lower(regexp_replace(cliente, '\s', '', 'g'))) stored,
	-- Tenant host, e.g. argea.eu.qlikcloud.com. It is authoritative: tenants that do
	-- not follow the <slug>.eu.qlikcloud.com pattern only work thanks to this column.
	host               text not null,
	-- SERVER ONLY. It must never appear in a select whose result reaches a load.
	api_key            text,
	active             boolean not null default true,
	note               text,
	created_at         timestamptz not null default now(),
	updated_at         timestamptz not null default now()
);

create unique index if not exists qlik_tenants_slug_key on public.qlik_tenants (slug);
create index if not exists qlik_tenants_host_idx on public.qlik_tenants (host);

create or replace function public.touch_updated_at() returns trigger
	language plpgsql as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists qlik_tenants_touch on public.qlik_tenants;
create trigger qlik_tenants_touch before update on public.qlik_tenants
	for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- App users / roles
-- ---------------------------------------------------------------------------
-- role gates route access: 'none' sees only the public site, 'analyzer' also
-- sees /alerts, 'admin' also sees /alerts-settings. There is no self-serve
-- first-admin flow: the first row is inserted by hand in the Supabase table
-- editor (see docs/deployment.md).
create table if not exists public.app_users (
	id         uuid primary key default gen_random_uuid(),
	-- Nullable: an admin can grant a role to an email before that person has
	-- ever signed in. getUserRole() backfills this to the real auth.users id
	-- the first time that email successfully signs in.
	user_id    uuid references auth.users(id) on delete cascade,
	email      text not null,
	role       text not null default 'none' check (role in ('none', 'analyzer', 'admin')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create unique index if not exists app_users_email_key on public.app_users (lower(email));
create unique index if not exists app_users_user_id_key on public.app_users (user_id) where user_id is not null;

drop trigger if exists app_users_touch on public.app_users;
create trigger app_users_touch before update on public.app_users
	for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- App settings
-- ---------------------------------------------------------------------------
-- Key/value so one more global setting later costs nothing. Today it holds a
-- single row: the one Google Chat webhook every tenant's alert is sent to.
create table if not exists public.app_settings (
	key        text primary key,
	value      text,
	updated_at timestamptz not null default now()
);

drop trigger if exists app_settings_touch on public.app_settings;
create trigger app_settings_touch before update on public.app_settings
	for each row execute function public.touch_updated_at();

insert into public.app_settings (key, value)
values ('google_chat_webhook_url', null)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Cleanup of removed per-tenant overrides and the delivery log
-- ---------------------------------------------------------------------------
-- There is now exactly one Chat webhook (app_settings) and one webhook token
-- (QLIK_WEBHOOK_TOKEN): the per-tenant overrides that used to live here are
-- gone. The delivery log is gone too — only tenant data is tracked. Both
-- statements are idempotent, so re-running this file after the drop is safe.
alter table public.qlik_tenants drop column if exists chat_webhook_url;
alter table public.qlik_tenants drop column if exists webhook_token_hash;
drop table if exists public.qlik_webhook_events;

-- ---------------------------------------------------------------------------
-- RLS: deny-all
-- ---------------------------------------------------------------------------
-- No policies, deliberately. Only service_role (which bypasses RLS) reads and
-- writes, and only the server uses it. The browser client exists purely for auth:
-- if a bug ever handed it a query on these tables, it would return zero rows
-- instead of the customers' API keys.
alter table public.qlik_tenants enable row level security;
alter table public.app_users enable row level security;
alter table public.app_settings enable row level security;

revoke all on public.qlik_tenants from anon, authenticated;
revoke all on public.app_users from anon, authenticated;
revoke all on public.app_settings from anon, authenticated;
