import { canModerateAllPosts, canWritePosts } from '$lib/server/authz';
import {
	createPost,
	deletePost,
	getPostOwner,
	listAllPosts,
	listOwnPosts,
	setPostStatus,
	updatePost
} from '$lib/server/posts';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Normalises a form field: a non-empty string, or null. */
function str(data: FormData, key: string): string | null {
	const value = data.get(key);
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}

function requireWriter(locals: App.Locals): void {
	if (!locals.session) redirect(303, '/auth/login');
	if (!canWritePosts(locals.role)) error(403, 'Forbidden');
}

/**
 * Every mutation re-checks ownership itself rather than trusting the page
 * that rendered the form -- the same reasoning as /portal's requireWrite.
 */
async function requireOwnerOrAdmin(id: string, locals: App.Locals): Promise<void> {
	const ownerId = await getPostOwner(id);
	if (!ownerId) error(404, 'Not found');
	if (ownerId !== locals.user?.id && !canModerateAllPosts(locals.role)) error(403, 'Forbidden');
}

export const load: PageServerLoad = async ({ locals }) => {
	requireWriter(locals);

	const isAdmin = canModerateAllPosts(locals.role);
	const posts = isAdmin ? await listAllPosts(locals.user!.id) : await listOwnPosts(locals.user!.id);

	return { posts, isAdmin };
};

export const actions: Actions = {
	createPost: async ({ request, locals }) => {
		requireWriter(locals);

		const data = await request.formData();
		const title = str(data, 'title');
		const bodyMd = str(data, 'bodyMd');
		if (!title || !bodyMd) return fail(400, { message: 'Title and body are required.' });

		try {
			await createPost({ title, bodyMd, authorId: locals.user!.id });
		} catch (err) {
			console.error('[write] create post failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Save failed.' });
		}

		return { message: `Draft "${title}" created.` };
	},

	updatePost: async ({ request, locals }) => {
		requireWriter(locals);

		const data = await request.formData();
		const id = str(data, 'id');
		const title = str(data, 'title');
		const bodyMd = str(data, 'bodyMd');
		if (!id || !title || !bodyMd) return fail(400, { message: 'Title and body are required.' });

		await requireOwnerOrAdmin(id, locals);

		try {
			await updatePost(id, { title, bodyMd });
		} catch (err) {
			console.error('[write] update post failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Save failed.' });
		}

		return { message: 'Post updated.' };
	},

	publishPost: async ({ request, locals }) => {
		requireWriter(locals);

		const id = str(await request.formData(), 'id');
		if (!id) return fail(400, { message: 'Missing id.' });

		await requireOwnerOrAdmin(id, locals);

		try {
			await setPostStatus(id, 'published');
		} catch (err) {
			console.error('[write] publish post failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Publish failed.' });
		}

		return { message: 'Post published.' };
	},

	unpublishPost: async ({ request, locals }) => {
		requireWriter(locals);

		const id = str(await request.formData(), 'id');
		if (!id) return fail(400, { message: 'Missing id.' });

		await requireOwnerOrAdmin(id, locals);

		try {
			await setPostStatus(id, 'draft');
		} catch (err) {
			console.error('[write] unpublish post failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Unpublish failed.' });
		}

		return { message: 'Post moved back to draft.' };
	},

	deletePost: async ({ request, locals }) => {
		requireWriter(locals);

		const id = str(await request.formData(), 'id');
		if (!id) return fail(400, { message: 'Missing id.' });

		await requireOwnerOrAdmin(id, locals);

		try {
			await deletePost(id);
		} catch (err) {
			console.error('[write] delete post failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Delete failed.' });
		}

		return { message: 'Post deleted.' };
	}
};
