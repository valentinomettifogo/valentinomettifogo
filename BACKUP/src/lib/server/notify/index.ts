import { getChatWebhookUrl } from '$lib/server/settings';
import { googleChatNotifier } from './googleChat';
import type { Notifier } from './types';

export type { AlertMessage, Notifier, NotifyResult } from './types';
export { formatChatText } from './googleChat';

/**
 * Picks the channel. Today there is only one Google Chat webhook, set at
 * /alerts-settings and stored in app_settings. When Telegram lands, it is one
 * more branch here and nothing else.
 */
export async function notifierFor(): Promise<Notifier | null> {
	const url = await getChatWebhookUrl();
	if (!url) return null;
	return googleChatNotifier(url);
}
