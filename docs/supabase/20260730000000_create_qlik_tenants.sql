-- Qlik Cloud tenants: one row per customer tenant the webhook can receive from.
-- Replaces the QLIK_KEY_<host> Script Properties of the old Google Apps Script.
-- Idempotent, safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.qlik_tenants (
  id         uuid primary key default gen_random_uuid(),
  -- Display name. Matches the ?cliente= parameter in the webhook URL, which is
  -- kept in Italian because it is already configured on every Qlik tenant.
  cliente    text not null,
  -- Webhook lookup key: "San Marco" -> "sanmarco".
  slug       text generated always as (lower(regexp_replace(cliente, '\s', '', 'g'))) stored,
  -- Tenant host, e.g. tenant.eu.qlikcloud.com. Authoritative: tenants that do not
  -- follow the <slug>.eu.qlikcloud.com pattern only work thanks to this column.
  host       text not null,
  -- SERVER ONLY. It must never appear in a select whose result reaches a load.
  api_key    text,
  active     boolean not null default true,
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

-- RLS with no policies at all, deliberately. Only service_role (which bypasses
-- RLS) reads and writes this table, and only from $lib/server. The browser
-- client exists purely for auth: if a bug ever handed it a query on this table,
-- it would return zero rows instead of the customers' API keys.
alter table public.qlik_tenants enable row level security;

revoke all on public.qlik_tenants from anon, authenticated;
