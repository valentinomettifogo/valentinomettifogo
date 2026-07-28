import { env } from '$env/dynamic/private';
import { googleChatNotifier } from './googleChat';
import type { Notifier } from './types';

export type { AlertMessage, Notifier, NotifyResult } from './types';
export { formatChatText } from './googleChat';

/**
 * Picks the channel for a tenant. Today there is only Google Chat, with the
 * tenant's own URL taking precedence over the default space.
 * When Telegram lands, it is one more branch here and nothing else.
 */
export function notifierFor(tenant: { chatWebhookUrl?: string | null }): Notifier | null {
	const url = tenant.chatWebhookUrl || env.GOOGLE_CHAT_WEBHOOK_URL;
	if (!url) return null;
	return googleChatNotifier(url);
}
