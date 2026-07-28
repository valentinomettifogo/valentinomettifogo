import { safeNext } from '$lib/safeNext';
import { fail, redirect, type Actions } from '@sveltejs/kit';

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
