import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	const { data, error } = await locals.supabase.auth.signInWithOAuth({
		provider: 'google',
		options: { redirectTo: `${url.origin}/auth/callback` }
	});

	if (error || !data.url) {
		redirect(303, '/auth/auth-code-error');
	}

	redirect(303, data.url);
};
