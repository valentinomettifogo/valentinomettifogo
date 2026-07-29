import { env } from '$env/dynamic/private';
import { safeEqual } from '$lib/server/crypto';
import { notifierFor } from '$lib/server/notify';
import { isFailureStatus, parseQlikEvent, resolveNames, resolveTenantHost } from '$lib/server/qlik';
import { findTenantBySlug, toSlug, type TenantSecret } from '$lib/server/tenants';
import { json, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// safeEqual uses node:crypto, which does not exist on the edge runtime.
export const config = { runtime: 'nodejs22.x', maxDuration: 15 };

/**
 * The token arrives either in the query string (like the old GAS web app) or in a
 * custom header. Qlik Cloud encrypts custom headers, while the URL ends up in the
 * Vercel logs and in the delivery history: accepting both lets tenants migrate
 * one at a time.
 */
function readToken(url: URL, request: Request): string {
	return url.searchParams.get('token') ?? request.headers.get('x-webhook-token') ?? '';
}

/**
 * QLIK_WEBHOOK_TOKEN authenticates *incoming* calls Qlik Cloud makes to this
 * endpoint. It is unrelated to a tenant's own api_key, which is used for
 * *outgoing* calls this server makes to Qlik's REST API (resolveNames/
 * verifyApiKey in qlik.ts) to look up app/space display names.
 */
function isAuthorized(token: string): boolean {
	if (!token) return false;

	// An unconfigured secret means "deny", never "allow".
	const shared = env.QLIK_WEBHOOK_TOKEN;
	if (!shared) return false;
	return safeEqual(token, shared);
}

export const POST: RequestHandler = async ({ request, url }) => {
	if (!isAuthorized(readToken(url, request))) {
		// No detail in the body: it must not reveal whether the tenant exists. The
		// log line says which of the two failure modes it was, because from the
		// outside "wrong token" and "server misconfigured" look identical.
		console.warn(
			'[qlik-hook] 401:',
			env.QLIK_WEBHOOK_TOKEN ? 'token mismatch' : 'QLIK_WEBHOOK_TOKEN is not set'
		);
		return text('unauthorized', { status: 401 });
	}

	// `cliente` is the query parameter already configured on every Qlik tenant.
	const client = url.searchParams.get('cliente') ?? 'Unknown client';
	const slug = toSlug(client);

	let tenant: TenantSecret | null = null;
	try {
		tenant = slug ? await findTenantBySlug(slug) : null;
	} catch (err) {
		console.error('[qlik-hook] tenant lookup failed:', err instanceof Error ? err.message : err);
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid_json' }, { status: 400 });
	}

	const event = parseQlikEvent(payload);

	/**
	 * One line per accepted call, always. Without it the happy paths are silent and
	 * the Vercel logs cannot tell "Qlik never called" from "called and ignored" —
	 * which is the first fork of every investigation. No secrets in here.
	 */
	console.log('[qlik-hook]', {
		client,
		slug,
		tenantFound: Boolean(tenant),
		hasApiKey: Boolean(tenant?.apiKey),
		type: event.type,
		status: event.status,
		appId: event.appId
	});

	// QLIK_WEBHOOK_DEBUG=1 dumps the whole event. Turn it on to inspect the real
	// shape a tenant sends, then turn it off: it is verbose, not sensitive.
	if (env.QLIK_WEBHOOK_DEBUG === '1') {
		console.log('[qlik-hook] raw payload:', JSON.stringify(payload));
	}

	// Most of the traffic is successful reloads: 200 and move on, no noise.
	if (!isFailureStatus(event.status)) {
		return json({ ok: true, action: 'ignored', status: event.status });
	}

	try {
		// Starting point: whatever is already in the payload.
		let appName = event.name ?? event.appId ?? 'ID not found';
		let spaceName: string | null = null;

		// Best-effort enrichment. It can fail in every way: the alert goes out anyway.
		const host = resolveTenantHost({
			hostParam: url.searchParams.get('host'),
			tenantHost: tenant?.host,
			client,
			source: event.source
		});

		if (host && event.appId && tenant?.apiKey) {
			const resolved = await resolveNames(host, tenant.apiKey, event.appId, event.spaceId);
			if (resolved.appName) appName = resolved.appName;
			if (resolved.spaceName) spaceName = resolved.spaceName;
		}

		const notifier = notifierFor();
		if (!notifier) {
			console.error('[qlik-hook] GOOGLE_CHAT_WEBHOOK_URL is not set — nothing to notify', client);
			return json({ ok: false, error: 'no_notifier' }, { status: 500 });
		}

		const sent = await notifier.send({ client: tenant?.client ?? client, appName, spaceName });

		if (!sent.ok) {
			// 502 shows up red in the Qlik delivery history: that is the diagnostic.
			console.error('[qlik-hook] chat delivery failed:', sent.detail);
			return json({ ok: false, action: 'chat_failed', status: sent.status }, { status: 502 });
		}

		console.log('[qlik-hook] alert sent to', notifier.channel, '-', appName);
		return json({ ok: true, action: 'sent', client, appName });
	} catch (err) {
		console.error('[qlik-hook] internal error:', err instanceof Error ? err.stack : err);
		return json({ ok: false, error: 'internal_error' }, { status: 500 });
	}
};

/** A browser hitting the URL should not look like a missing route during setup. */
export const GET: RequestHandler = async () =>
	text('Qlik webhook endpoint: POST only.', {
		status: 405,
		headers: { allow: 'POST' }
	});
