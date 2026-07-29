import { getServiceClient } from './supabase';

const CHAT_WEBHOOK_KEY = 'google_chat_webhook_url';

export async function getChatWebhookUrl(): Promise<string | null> {
	const { data, error } = await getServiceClient()
		.from('app_settings')
		.select('value')
		.eq('key', CHAT_WEBHOOK_KEY)
		.maybeSingle<{ value: string | null }>();

	if (error) {
		console.error('[settings] reading chat webhook failed:', error.message);
		return null;
	}
	return data?.value ?? null;
}

export async function setChatWebhookUrl(value: string | null): Promise<void> {
	const { error } = await getServiceClient()
		.from('app_settings')
		.upsert({ key: CHAT_WEBHOOK_KEY, value });

	if (error) throw new Error(`Saving chat webhook failed: ${error.message}`);
}

/** Same masking convention as tenants.ts's maskKey(). */
export function maskWebhookUrl(url: string | null): string {
	if (!url) return '(empty)';
	if (url.length <= 4) return '••••';
	return `••••${url.slice(-4)}`;
}
