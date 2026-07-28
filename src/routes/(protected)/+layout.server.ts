import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
	const { session, user } = await safeGetSession();

	return {
		session,
		user,
		// Supabase cookies only: the official sample ships every cookie in the SSR payload.
		cookies: cookies.getAll().filter((c) => c.name.startsWith('sb-'))
	};
};
