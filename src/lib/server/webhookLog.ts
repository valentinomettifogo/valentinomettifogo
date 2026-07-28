import { getServiceClient } from './supabase';

export type WebhookOutcome = 'sent' | 'ignored' | 'chat_failed' | 'unauthorized' | 'error';

export type WebhookLogEntry = {
	eventId?: string | null;
	tenantId?: string | null;
	client?: string | null;
	appId?: string | null;
	status?: string | null;
	outcome: WebhookOutcome;
	detail?: string | null;
};

/**
 * Records the delivery. It must never fail the request: if the log entry is lost,
 * the alert still went out, and that is what matters.
 */
export async function logWebhookEvent(entry: WebhookLogEntry): Promise<void> {
	try {
		const { error } = await getServiceClient()
			.from('qlik_webhook_events')
			.insert({
				event_id: entry.eventId ?? null,
				tenant_id: entry.tenantId ?? null,
				cliente: entry.client ?? null,
				app_id: entry.appId ?? null,
				status: entry.status ?? null,
				outcome: entry.outcome,
				detail: entry.detail ?? null
			});

		// 23505 = unique index violation on event_id: that is a resend, not an error.
		if (error && error.code !== '23505') {
			console.error('[webhook-log] insert failed:', error.message);
		}
	} catch (err) {
		console.error('[webhook-log] insert failed:', err instanceof Error ? err.message : err);
	}
}
