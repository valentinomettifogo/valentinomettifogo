import { safeNext } from '$lib/safeNext';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Lives outside (protected) because it must run for an anonymous visitor.
 * locals.supabase is the SSR client, so exchangeCodeForSession reads the PKCE
 * code_verifier from the cookie written by the login server action.
 */
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const next = safeNext(url.searchParams.get('next'));

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) redirect(303, next);
		console.error('[auth] exchangeCodeForSession failed:', error.message);
	}

	redirect(303, '/auth/error');
};
