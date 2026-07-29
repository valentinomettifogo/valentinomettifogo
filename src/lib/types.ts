export interface Post {
	id: string;
	date: string;
	title: string;
	body: string;
	link: string;
	linkLabel: string;
}

export type Role = 'user' | 'analytics' | 'admin';

/**
 * A Qlik tenant projection that is safe to send to the browser: by construction
 * it has no `api_key` field. The full row lives in `$lib/server/tenants.ts`.
 *
 * `client` and `slug` keep the Italian `cliente` column name at the database
 * boundary only — see the mapping in `tenants.ts`.
 */
export interface TenantView {
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
}

/**
 * Result of checking a tenant API key. It lives here rather than in $lib/server
 * because the tenant table renders it client-side.
 */
export interface KeyCheck {
	ok: boolean;
	code: number;
	message: string;
}

/** Per-row state of the "Check" button in the tenant table. */
export type CheckState =
	| { state: 'idle' }
	| { state: 'loading' }
	| { state: 'done'; result: KeyCheck };
