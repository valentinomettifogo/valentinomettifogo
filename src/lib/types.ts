export interface Post {
	id: string;
	date: string;
	title: string;
	/** Markdown body, already rendered to HTML — render with `{@html}`. */
	html: string;
}

export type Role = 'user' | 'analytics' | 'admin' | 'author';

/** The roles in assignment order, for rendering pickers. */
export const ROLES: readonly Role[] = ['user', 'author', 'analytics', 'admin'];

/** A row of `public.users` as shown in the /admin table. */
export interface UserView {
	id: string;
	email: string | null;
	role: Role;
	createdAt: string;
	/** True for the signed-in admin looking at the list: their own role is locked. */
	isSelf: boolean;
}

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

export type PostStatus = 'draft' | 'published';

/**
 * A `public.posts` row shaped for the /write dashboard. There is no secret
 * field to strip here (unlike `TenantView`/`api_key`) -- `bodyMd` is safe to
 * send back because only the author who wrote it, or an admin, ever sees it.
 */
export interface PostRow {
	id: string;
	slug: string;
	title: string;
	bodyMd: string;
	status: PostStatus;
	updatedAt: string;
	authorEmail: string | null;
	isOwn: boolean;
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
