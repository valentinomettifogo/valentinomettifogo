import type { Post, PostRow, PostStatus } from '$lib/types';
import { getServiceClient } from './supabase';
import { marked } from 'marked';
import xss from 'xss';
import type { IFilterXSSOptions } from 'xss';

const PUBLIC_COLUMNS = 'slug, title, body_md, published_at';
const ROW_COLUMNS = 'id, slug, title, body_md, status, author_id, updated_at';

type PublicRow = { slug: string; title: string; body_md: string; published_at: string };
type DbRow = {
	id: string;
	slug: string;
	title: string;
	body_md: string;
	status: PostStatus;
	author_id: string;
	updated_at: string;
};

/**
 * `xss` rather than a jsdom- or htmlparser2-based sanitizer: both pull in an
 * ESM-only transitive dependency that Vercel's serverless Node runtime can't
 * `require()` (ERR_REQUIRE_ESM), crashing the function at runtime even though
 * it builds fine locally. `xss` has no such dependency.
 *
 * Explicit allowlist -- the tags marked can actually produce from a post's
 * markdown -- rather than the library's own default list, which also would
 * need extending for `img` (not included by default).
 */
const SANITIZE_OPTIONS: IFilterXSSOptions = {
	whiteList: {
		p: [],
		br: [],
		hr: [],
		h1: [],
		h2: [],
		h3: [],
		h4: [],
		h5: [],
		h6: [],
		strong: [],
		b: [],
		em: [],
		i: [],
		u: [],
		s: [],
		del: [],
		ins: [],
		mark: [],
		small: [],
		blockquote: ['cite'],
		code: [],
		pre: [],
		ul: [],
		ol: [],
		li: [],
		a: ['href', 'title', 'target'],
		img: ['src', 'alt', 'title']
	}
};

/**
 * Body markdown is trusted as written by the author at save time, but
 * rendered HTML is sanitized here, at read time -- so sanitization rules can
 * evolve without needing to re-save every existing post.
 */
function renderHtml(bodyMd: string): string {
	return xss(marked.parse(bodyMd, { async: false }) as string, SANITIZE_OPTIONS);
}

const EXCERPT_LENGTH = 160;

/** Plain-text summary of rendered HTML, truncated at a word boundary — for meta/OG tags. */
function toExcerpt(html: string, maxLength: number = EXCERPT_LENGTH): string {
	const text = html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();

	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/** Turns a title into a URL-safe slug. Collisions are handled by `uniqueSlug`. */
function toSlug(title: string): string {
	const slug = title
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || 'post';
}

async function uniqueSlug(base: string): Promise<string> {
	const db = getServiceClient();
	let candidate = base;
	for (let suffix = 2; ; suffix++) {
		const { data, error } = await db.from('posts').select('id').eq('slug', candidate).maybeSingle();
		if (error) throw new Error(`Checking slug failed: ${error.message}`);
		if (!data) return candidate;
		candidate = `${base}-${suffix}`;
	}
}

/** Published posts for the public homepage, newest first, rendered and sanitized. */
export async function listPublishedPosts(): Promise<Post[]> {
	const { data, error } = await getServiceClient()
		.from('posts')
		.select(PUBLIC_COLUMNS)
		.eq('status', 'published')
		.order('published_at', { ascending: false })
		.returns<PublicRow[]>();

	if (error) throw new Error(`Reading posts failed: ${error.message}`);

	return (data ?? []).map((row) => {
		const html = renderHtml(row.body_md);
		return {
			id: row.slug,
			date: (row.published_at ?? '').slice(0, 10),
			title: row.title,
			html,
			excerpt: toExcerpt(html)
		};
	});
}

/** A single published post by slug, for its permalink page — or null if missing/unpublished. */
export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
	const { data, error } = await getServiceClient()
		.from('posts')
		.select(PUBLIC_COLUMNS)
		.eq('slug', slug)
		.eq('status', 'published')
		.maybeSingle<PublicRow>();

	if (error) throw new Error(`Reading post failed: ${error.message}`);
	if (!data) return null;

	const html = renderHtml(data.body_md);
	return {
		id: data.slug,
		date: (data.published_at ?? '').slice(0, 10),
		title: data.title,
		html,
		excerpt: toExcerpt(html)
	};
}

async function emailsByAuthor(authorIds: string[]): Promise<Map<string, string | null>> {
	if (authorIds.length === 0) return new Map();

	const { data, error } = await getServiceClient()
		.from('users')
		.select('id, email')
		.in('id', authorIds)
		.returns<{ id: string; email: string | null }[]>();

	if (error) throw new Error(`Reading authors failed: ${error.message}`);
	return new Map((data ?? []).map((row) => [row.id, row.email]));
}

function toRow(row: DbRow, currentUserId: string, authorEmail: string | null): PostRow {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		bodyMd: row.body_md,
		status: row.status,
		updatedAt: row.updated_at,
		authorEmail,
		isOwn: row.author_id === currentUserId
	};
}

/** One author's own drafts and published posts, for the /write dashboard. */
export async function listOwnPosts(authorId: string): Promise<PostRow[]> {
	const { data, error } = await getServiceClient()
		.from('posts')
		.select(ROW_COLUMNS)
		.eq('author_id', authorId)
		.order('updated_at', { ascending: false })
		.returns<DbRow[]>();

	if (error) throw new Error(`Reading posts failed: ${error.message}`);
	return (data ?? []).map((row) => toRow(row, authorId, null));
}

/** Every post from every author, for admin moderation. */
export async function listAllPosts(currentUserId: string): Promise<PostRow[]> {
	const { data, error } = await getServiceClient()
		.from('posts')
		.select(ROW_COLUMNS)
		.order('updated_at', { ascending: false })
		.returns<DbRow[]>();

	if (error) throw new Error(`Reading posts failed: ${error.message}`);

	const authorIds = [...new Set((data ?? []).map((row) => row.author_id))];
	const emails = await emailsByAuthor(authorIds);

	return (data ?? []).map((row) => toRow(row, currentUserId, emails.get(row.author_id) ?? null));
}

/** `author_id` of a post, or null if it doesn't exist -- used for ownership checks. */
export async function getPostOwner(id: string): Promise<string | null> {
	const { data, error } = await getServiceClient()
		.from('posts')
		.select('author_id')
		.eq('id', id)
		.maybeSingle<{ author_id: string }>();

	if (error) throw new Error(`Reading post failed: ${error.message}`);
	return data?.author_id ?? null;
}

export async function createPost(input: {
	title: string;
	bodyMd: string;
	authorId: string;
}): Promise<{ id: string; slug: string }> {
	const slug = await uniqueSlug(toSlug(input.title));

	const { data, error } = await getServiceClient()
		.from('posts')
		.insert({ title: input.title, body_md: input.bodyMd, slug, author_id: input.authorId, status: 'draft' })
		.select('id, slug')
		.single();

	if (error) throw new Error(`Creating post failed: ${error.message}`);
	return data;
}

/** Title and body only -- the slug stays whatever it was set to at creation. */
export async function updatePost(id: string, patch: { title: string; bodyMd: string }): Promise<void> {
	const { error } = await getServiceClient()
		.from('posts')
		.update({ title: patch.title, body_md: patch.bodyMd })
		.eq('id', id);

	if (error) throw new Error(`Saving post failed: ${error.message}`);
}

export async function setPostStatus(id: string, status: PostStatus): Promise<void> {
	const patch: Record<string, unknown> = { status };
	if (status === 'published') patch.published_at = new Date().toISOString();

	const { error } = await getServiceClient().from('posts').update(patch).eq('id', id);
	if (error) throw new Error(`Updating post status failed: ${error.message}`);
}

export async function deletePost(id: string): Promise<void> {
	const { error } = await getServiceClient().from('posts').delete().eq('id', id);
	if (error) throw new Error(`Deleting post failed: ${error.message}`);
}
