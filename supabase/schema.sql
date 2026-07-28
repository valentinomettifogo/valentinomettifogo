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
	-- null => GOOGLE_CHAT_WEBHOOK_URL is used.
	chat_webhook_url   text,
	-- Hex sha256 of the webhook token. null => QLIK_WEBHOOK_TOKEN is used.
	-- Having one per tenant allows revoking a single tenant without touching the rest.
	webhook_token_hash text,
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
-- Delivery log
-- ---------------------------------------------------------------------------
-- Answers "did the alert fire?" and drops duplicates: the unique index on
-- event_id makes the endpoint idempotent across Qlik resends.
create table if not exists public.qlik_webhook_events (
	id         uuid primary key default gen_random_uuid(),
	event_id   text,
	tenant_id  uuid references public.qlik_tenants(id) on delete set null,
	cliente    text,
	app_id     text,
	status     text,
	-- 'sent' | 'ignored' | 'chat_failed' | 'unauthorized' | 'error'
	outcome    text not null,
	detail     text,
	created_at timestamptz not null default now()
);

create unique index if not exists qlik_webhook_events_event_id_key
	on public.qlik_webhook_events (event_id) where event_id is not null;
create index if not exists qlik_webhook_events_created_idx
	on public.qlik_webhook_events (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: deny-all
-- ---------------------------------------------------------------------------
-- No policies, deliberately. Only service_role (which bypasses RLS) reads and
-- writes, and only the server uses it. The browser client exists purely for auth:
-- if a bug ever handed it a query on these tables, it would return zero rows
-- instead of the customers' API keys.
alter table public.qlik_tenants enable row level security;
alter table public.qlik_webhook_events enable row level security;

revoke all on public.qlik_tenants from anon, authenticated;
revoke all on public.qlik_webhook_events from anon, authenticated;
