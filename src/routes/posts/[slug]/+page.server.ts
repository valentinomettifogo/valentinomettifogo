import { error } from '@sveltejs/kit';
import { getPublishedPostBySlug } from '$lib/server/posts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPublishedPostBySlug(params.slug);
	if (!post) error(404, 'Post not found');

	return { post };
};
