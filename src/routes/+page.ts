import type { PageLoad } from './$types';
import type { Post } from '$lib/types';
import { parsePost } from '$lib/posts';

const postFiles = import.meta.glob('/src/lib/posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export const load: PageLoad = () => {
	const posts: Post[] = Object.entries(postFiles).map(([path, raw]) => {
		const id = path.split('/').pop()?.replace(/\.md$/, '') ?? path;
		return parsePost(id, raw);
	});

	const sorted = posts.sort((a, b) => b.date.localeCompare(a.date));

	return { posts: sorted };
};
