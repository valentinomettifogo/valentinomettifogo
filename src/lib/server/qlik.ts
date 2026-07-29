/**
 * Port of the Qlik logic from the old Google Apps Script (`valmet-alert.js`).
 * Pure functions, or functions that only depend on fetch: testable without SvelteKit.
 */
import type { KeyCheck } from '$lib/types';

/** Per-call timeout against the tenant. Enrichment must never delay the alert. */
const LOOKUP_TIMEOUT_MS = 4000;

export type QlikEvent = {
	eventId: string | null;
	appId: string | null;
	spaceId: string | null;
	status: string;
	/** App name when Qlik includes it: the fallback before the raw appId. */
	name: string | null;
	source: string | null;
	/** CloudEvents type, e.g. `com.qlik.v1.reload.finished`. Logged, not acted on. */
	type: string | null;
};

export function parseQlikEvent(payload: unknown): QlikEvent {
	const event = (payload ?? {}) as Record<string, unknown>;
	const data = (event.data ?? {}) as Record<string, unknown>;

	const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);

	return {
		eventId: str(event.id),
		appId: str(data.appId) ?? str(data.appItemId),
		spaceId: str(data.spaceId),
		status: str(data.status) ?? 'No status',
		name: str(data.name),
		source: str(event.source),
		type: str(event.type)
	};
}

/**
 * Both are needed: `error` comes from com.qlik.v1.app.reload.finished,
 * `FAILED` from reload-task and automation events.
 */
export function isFailureStatus(status: string): boolean {
	return status === 'FAILED' || status === 'error';
}

/**
 * Works out the tenant host. Priority: explicit ?host=, then the tenant's `host`
 * column (authoritative, it covers hosts that do not follow the naming scheme),
 * then the client-name slug, and finally a regex over the event's `source` field.
 */
export function resolveTenantHost(input: {
	hostParam?: string | null;
	tenantHost?: string | null;
	client?: string | null;
	source?: string | null;
}): string | null {
	if (input.hostParam) return input.hostParam;
	if (input.tenantHost) return input.tenantHost;

	if (input.client) {
		const slug = input.client.toLowerCase().trim().replace(/\s+/g, '');
		if (slug) return `${slug}.eu.qlikcloud.com`;
	}

	if (input.source) {
		const m = input.source.match(/([a-z0-9-]+\.[a-z0-9-]+\.qlikcloud\.com)/i);
		if (m) return m[1];
	}

	return null;
}

async function qlikGet(host: string, apiKey: string, path: string): Promise<unknown | null> {
	try {
		const res = await fetch(`https://${host}${path}`, {
			headers: { Authorization: `Bearer ${apiKey}` },
			signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS)
		});
		if (!res.ok) return null;
		return await res.json();
	} catch (err) {
		// Expired key, unreachable tenant, timeout: all swallowed on purpose.
		console.error(`[qlik] lookup failed ${path}:`, err instanceof Error ? err.message : err);
		return null;
	}
}

export type ResolvedNames = { appName: string | null; spaceName: string | null };

/**
 * Translates appId/spaceId into real names. Strictly best-effort: any failure
 * returns null and the caller keeps its starting values. This is the invariant
 * the GAS version was written around — the alert goes out regardless.
 */
export async function resolveNames(
	host: string,
	apiKey: string,
	appId: string,
	spaceId: string | null
): Promise<ResolvedNames> {
	const result: ResolvedNames = { appName: null, spaceName: null };
	let effectiveSpaceId = spaceId;

	const app = (await qlikGet(host, apiKey, `/api/v1/apps/${appId}`)) as {
		name?: string;
		attributes?: { name?: string; spaceId?: string };
	} | null;

	if (app) {
		const attr = app.attributes ?? {};
		result.appName = attr.name ?? app.name ?? null;
		// The spaceId is typically absent from the Qlik payload: take it from here.
		if (!effectiveSpaceId && attr.spaceId) effectiveSpaceId = attr.spaceId;
		// No spaceId means the app lives in the owner's personal space.
		if (!effectiveSpaceId) result.spaceName = 'Personal space';
	}

	if (effectiveSpaceId && !result.spaceName) {
		const space = (await qlikGet(host, apiKey, `/api/v1/spaces/${effectiveSpaceId}`)) as {
			name?: string;
		} | null;
		if (space) result.spaceName = space.name ?? null;
	}

	return result;
}

/**
 * Checks whether the tenant API key is still valid.
 * Returns outcome and status code only: never the key, never the response body.
 */
export async function verifyApiKey(host: string, apiKey: string | null): Promise<KeyCheck> {
	if (!apiKey) {
		return { ok: false, code: 0, message: 'No key configured' };
	}

	try {
		const res = await fetch(`https://${host}/api/v1/users/me`, {
			headers: { Authorization: `Bearer ${apiKey}` },
			signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS)
		});

		if (res.status === 200) return { ok: true, code: 200, message: 'Key valid' };
		if (res.status === 401 || res.status === 403) {
			return { ok: false, code: res.status, message: 'Key invalid or expired' };
		}
		return { ok: false, code: res.status, message: 'Unexpected response from tenant' };
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		console.error(`[qlik] key check failed for ${host}: ${detail}`);
		return { ok: false, code: 0, message: 'Tenant unreachable' };
	}
}
