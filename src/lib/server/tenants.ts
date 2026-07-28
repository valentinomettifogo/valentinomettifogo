import type { TenantView } from '$lib/types';
import { getServiceClient } from './supabase';

export type { TenantView };

/**
 * Explicit column list, never `select('*')`: one wildcard in a load return value
 * would put every customer's Qlik API key into the SSR payload in plain text.
 */
const VIEW_COLUMNS =
	'id, cliente, slug, host, active, note, created_at, chat_webhook_url, webhook_token_hash, api_key';

/** The full row. It stays inside this module and the webhook endpoint. */
export type TenantSecret = {
	id: string;
	client: string;
	slug: string;
	host: string;
	apiKey: string | null;
	chatWebhookUrl: string | null;
	webhookTokenHash: string | null;
	active: boolean;
	note: string | null;
	createdAt: string;
};

/**
 * Database shape. The `cliente` column keeps its original name because the Qlik
 * tenants already point at `?cliente=` and the table already exists; the mapping
 * to `client` happens here and nowhere else.
 */
type Row = {
	id: string;
	cliente: string;
	slug: string;
	host: string;
	active: boolean;
	note: string | null;
	created_at: string;
	api_key: string | null;
	chat_webhook_url: string | null;
	webhook_token_hash: string | null;
};

function toSecret(row: Row): TenantSecret {
	return {
		id: row.id,
		client: row.cliente,
		slug: row.slug,
		host: row.host,
		apiKey: row.api_key,
		chatWebhookUrl: row.chat_webhook_url,
		webhookTokenHash: row.webhook_token_hash,
		active: row.active,
		note: row.note,
		createdAt: row.created_at
	};
}

function maskKey(key: string | null): string {
	if (!key) return '(empty)';
	if (key.length <= 4) return '••••';
	return `••••${key.slice(-4)}`;
}

/** The only way a row leaves this module towards the UI. */
export function toView(tenant: TenantSecret): TenantView {
	return {
		id: tenant.id,
		client: tenant.client,
		slug: tenant.slug,
		host: tenant.host,
		active: tenant.active,
		note: tenant.note,
		createdAt: tenant.createdAt,
		hasApiKey: Boolean(tenant.apiKey),
		apiKeyMasked: maskKey(tenant.apiKey),
		hasOwnChatWebhook: Boolean(tenant.chatWebhookUrl),
		hasOwnToken: Boolean(tenant.webhookTokenHash)
	};
}

/** Same normalisation as the generated `slug` column in the database. */
export function toSlug(client: string): string {
	return client.toLowerCase().trim().replace(/\s+/g, '');
}

export async function findTenantBySlug(slug: string): Promise<TenantSecret | null> {
	const { data, error } = await getServiceClient()
		.from('qlik_tenants')
		.select(VIEW_COLUMNS)
		.eq('slug', slug)
		.maybeSingle<Row>();

	if (error) {
		console.error('[tenants] lookup failed:', error.message);
		return null;
	}
	return data ? toSecret(data) : null;
}

export async function findTenantById(id: string): Promise<TenantSecret | null> {
	const { data, error } = await getServiceClient()
		.from('qlik_tenants')
		.select(VIEW_COLUMNS)
		.eq('id', id)
		.maybeSingle<Row>();

	if (error) {
		console.error('[tenants] lookup by id failed:', error.message);
		return null;
	}
	return data ? toSecret(data) : null;
}

export async function listTenantViews(): Promise<TenantView[]> {
	const { data, error } = await getServiceClient()
		.from('qlik_tenants')
		.select(VIEW_COLUMNS)
		.order('cliente', { ascending: true })
		.returns<Row[]>();

	if (error) throw new Error(`Reading tenants failed: ${error.message}`);
	return (data ?? []).map((row) => toView(toSecret(row)));
}

/**
 * The three secret fields (api_key, chat_webhook_url, webhook_token_hash) never
 * travel back to the browser, so the form cannot resubmit them. For those:
 * `undefined` = leave as is, `null` = clear, string = replace.
 */
export type TenantInput = {
	id?: string;
	client: string;
	host: string;
	apiKey?: string | null;
	chatWebhookUrl?: string | null;
	webhookTokenHash?: string | null;
	active?: boolean;
	note?: string | null;
};

export async function upsertTenant(input: TenantInput): Promise<void> {
	const patch: Record<string, unknown> = {
		cliente: input.client,
		host: input.host,
		active: input.active ?? true,
		note: input.note || null
	};

	if (input.apiKey !== undefined) patch.api_key = input.apiKey;
	if (input.chatWebhookUrl !== undefined) patch.chat_webhook_url = input.chatWebhookUrl;
	if (input.webhookTokenHash !== undefined) patch.webhook_token_hash = input.webhookTokenHash;

	const db = getServiceClient();
	const { error } = input.id
		? await db.from('qlik_tenants').update(patch).eq('id', input.id)
		: await db.from('qlik_tenants').insert(patch);

	if (error) throw new Error(`Saving tenant failed: ${error.message}`);
}

export async function deleteTenant(id: string): Promise<void> {
	const { error } = await getServiceClient().from('qlik_tenants').delete().eq('id', id);
	if (error) throw new Error(`Deleting tenant failed: ${error.message}`);
}
