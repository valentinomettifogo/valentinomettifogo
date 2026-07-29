import type { PageLoad } from './$types';
import type { Post } from '$lib/types';
import posts from '$lib/data/posts.json';

export const load: PageLoad = () => {
	const sorted: Post[] = [...(posts as Post[])].sort((a, b) => b.date.localeCompare(a.date));

	return { posts: sorted };
};
