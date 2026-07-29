import type { AlertMessage, Notifier, NotifyResult } from './types';

/**
 * Same text as the old Apps Script: the chat space should not notice the switch.
 * The message itself stays in Italian because that is what the recipients read.
 */
export function formatChatText(message: AlertMessage): string {
	let body = `*📁 App:* ${message.appName}`;
	if (message.spaceName) body += `\n*🗂️ Spazio:* ${message.spaceName}`;

	return (
		'🚨 *ALLARME QLIK SENSE* 🚨\n\n' +
		`*🏢 Cliente:* ${message.client}\n` +
		`${body}\n` +
		'*⚠️ Stato:* Ricaricamento fallito'
	);
}

export function googleChatNotifier(webhookUrl: string): Notifier {
	return {
		channel: 'google-chat',

		async send(message: AlertMessage): Promise<NotifyResult> {
			try {
				const res = await fetch(webhookUrl, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ text: formatChatText(message) }),
					signal: AbortSignal.timeout(8000)
				});

				if (res.ok) return { ok: true, status: res.status };

				// The body can echo the webhook query string: it must not reach the logs.
				return { ok: false, status: res.status, detail: `Chat responded ${res.status}` };
			} catch (err) {
				const detail = err instanceof Error ? err.message : String(err);
				return { ok: false, status: 0, detail };
			}
		}
	};
}
