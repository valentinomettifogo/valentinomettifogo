import { safeNext } from '$lib/safeNext';
import { getUserRole } from '$lib/server/authz';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** A signed-in visitor lands wherever their role takes them, not on this form again. */
export const load: PageServerLoad = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (!user) return {};

	const role = await getUserRole(user);
	// role: 'none' would immediately 403 through /alerts — send home instead.
	if (role === 'none') redirect(303, '/');

	redirect(303, safeNext(url.searchParams.get('next')));
};

export const actions: Actions = {
	/**
	 * OAuth starts here rather than in the browser: with skipBrowserRedirect,
	 * @supabase/ssr writes the PKCE code_verifier into a cookie, which is the only
	 * way /auth/callback can later complete the exchange server-side.
	 * Bonus: it works with JavaScript disabled.
	 */
	google: async ({ url, locals: { supabase } }) => {
		const next = safeNext(url.searchParams.get('next'));

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				// url.origin resolves correctly on localhost and behind the Vercel proxy.
				redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
				skipBrowserRedirect: true
			}
		});

		if (error || !data.url) {
			console.error('[auth] signInWithOAuth failed:', error?.message);
			return fail(500, { message: 'Sign-in is unavailable right now.' });
		}

		redirect(303, data.url);
	}
};
