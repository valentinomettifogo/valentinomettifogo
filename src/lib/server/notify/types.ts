export type AlertMessage = {
	client: string;
	appName: string;
	spaceName?: string | null;
};

export type NotifyResult = {
	ok: boolean;
	status: number;
	detail?: string;
};

/**
 * A notification channel. Telegram will be the second implementation: it only
 * needs a `telegram.ts` and a tenant column, without touching the endpoint.
 */
export type Notifier = {
	readonly channel: string;
	send(message: AlertMessage): Promise<NotifyResult>;
};
