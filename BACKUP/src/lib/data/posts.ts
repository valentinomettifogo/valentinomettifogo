import type { Post, RenderedPost } from '$lib/types';
import raw from './posts.json';

/** `2026-07-28` -> `28.07.26` (entry rail). */
function shortDate(iso: string): string {
	const [y, m, d] = iso.split('-');
	return `${d}.${m}.${y.slice(2)}`;
}

/** `2026-07-28` -> `28.07.2026` (footer). */
export function longDate(iso: string): string {
	const [y, m, d] = iso.split('-');
	return `${d}.${m}.${y}`;
}

/**
 * ISO dates sort lexicographically, so there is nothing to parse.
 * The numbering is derived from the order: `01` is always the newest entry, and
 * inserting a post never forces renumbering the others by hand.
 */
export const posts: RenderedPost[] = (raw as Post[])
	.slice()
	.sort((a, b) => b.date.localeCompare(a.date))
	.map((post, i) => ({
		...post,
		number: post.number ?? i + 1,
		displayDate: shortDate(post.date)
	}));

/** Date of the newest post: this is the footer's "last updated". */
export const lastUpdated = posts[0]?.date;
