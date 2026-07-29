import { env } from '$env/dynamic/private';
import { googleChatNotifier } from './googleChat';
import type { Notifier } from './types';

export type { AlertMessage, Notifier, NotifyResult } from './types';
export { formatChatText } from './googleChat';

/**
 * Picks the channel. Today there is one Google Chat space for every tenant, its
 * webhook URL read from GOOGLE_CHAT_WEBHOOK_URL. `$env/dynamic/private` rather
 * than `static`, so rotating the URL on Vercel does not need a rebuild.
 * When Telegram lands, it is one more branch here and nothing else.
 */
export function notifierFor(): Notifier | null {
	const url = env.GOOGLE_CHAT_WEBHOOK_URL;
	if (!url) return null;
	return googleChatNotifier(url);
}
