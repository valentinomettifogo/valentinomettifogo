/** A mini-blog entry, exactly as written in `src/lib/data/posts.json`. */
export type Post = {
	id: string;
	/** ISO-8601 (`2026-07-28`): sortable with localeCompare, no parsing needed. */
	date: string;
	title: string;
	body: string;
	link?: string;
	linkLabel?: string;
	/** Manual numbering override. Normally left alone. */
	number?: number;
};

/**
 * A Qlik tenant projection that is safe to send to the browser: by construction
 * it has no `api_key` field. The full row lives in `$lib/server/tenants.ts`.
 *
 * `client` and `slug` keep the Italian `cliente` column name at the database
 * boundary only — see the mapping in `tenants.ts`.
 */
export type TenantView = {
	id: string;
	client: string;
	slug: string;
	host: string;
	active: boolean;
	note: string | null;
	createdAt: string;
	hasApiKey: boolean;
	/** `••••1234`, like `mascheraChiave()` in the old Apps Script. */
	apiKeyMasked: string;
	hasOwnChatWebhook: boolean;
	hasOwnToken: boolean;
};

/**
 * Result of checking a tenant API key. It lives here rather than in $lib/server
 * because the tenant table renders it client-side.
 */
export type KeyCheck = {
	ok: boolean;
	code: number;
	message: string;
};

/** Per-row state of the "Check" button in the tenant table. */
export type CheckState =
	| { state: 'idle' }
	| { state: 'loading' }
	| { state: 'done'; result: KeyCheck };

/** A post enriched with the fields computed at render time. */
export type RenderedPost = Post & {
	/** `01`, `02`, … assigned newest to oldest. */
	number: number;
	/** Short date for the vertical rail: `28.07.26`. */
	displayDate: string;
};
