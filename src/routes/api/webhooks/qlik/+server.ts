import { env } from '$env/dynamic/private';
import { safeEqual, sha256Hex } from '$lib/server/crypto';
import { notifierFor } from '$lib/server/notify';
import { isFailureStatus, parseQlikEvent, resolveNames, resolveTenantHost } from '$lib/server/qlik';
import { findTenantBySlug, toSlug, type TenantSecret } from '$lib/server/tenants';
import { logWebhookEvent } from '$lib/server/webhookLog';
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

function isAuthorized(token: string, tenant: TenantSecret | null): boolean {
	if (!token) return false;

	// Per-tenant token: revocable on its own, and it cannot impersonate other clients.
	if (tenant?.webhookTokenHash) {
		return safeEqual(sha256Hex(token), tenant.webhookTokenHash);
	}

	// Global fallback. An unconfigured secret means "deny", never "allow".
	const shared = env.QLIK_WEBHOOK_TOKEN;
	if (!shared) return false;
	return safeEqual(token, shared);
}

export const POST: RequestHandler = async ({ request, url }) => {
	// `cliente` is the query parameter already configured on every Qlik tenant.
	const client = url.searchParams.get('cliente') ?? 'Unknown client';
	const slug = toSlug(client);

	let tenant: TenantSecret | null = null;
	try {
		tenant = slug ? await findTenantBySlug(slug) : null;
	} catch (err) {
		console.error('[qlik-hook] tenant lookup failed:', err instanceof Error ? err.message : err);
	}

	if (!isAuthorized(readToken(url, request), tenant)) {
		// No detail in the body: it must not reveal whether the tenant exists.
		await logWebhookEvent({ client, outcome: 'unauthorized' });
		return text('unauthorized', { status: 401 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid_json' }, { status: 400 });
	}

	const event = parseQlikEvent(payload);

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

		const notifier = notifierFor({ chatWebhookUrl: tenant?.chatWebhookUrl });
		if (!notifier) {
			console.error('[qlik-hook] no channel configured for', client);
			await logWebhookEvent({
				eventId: event.eventId,
				tenantId: tenant?.id,
				client,
				appId: event.appId,
				status: event.status,
				outcome: 'error',
				detail: 'no notification channel configured'
			});
			return json({ ok: false, error: 'no_notifier' }, { status: 500 });
		}

		const sent = await notifier.send({ client: tenant?.client ?? client, appName, spaceName });

		await logWebhookEvent({
			eventId: event.eventId,
			tenantId: tenant?.id,
			client,
			appId: event.appId,
			status: event.status,
			outcome: sent.ok ? 'sent' : 'chat_failed',
			detail: sent.detail
		});

		if (!sent.ok) {
			// 502 shows up red in the Qlik delivery history: that is the diagnostic.
			return json({ ok: false, action: 'chat_failed', status: sent.status }, { status: 502 });
		}

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
