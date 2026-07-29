import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** POST only: a GET would be triggered by link prefetching. */
export const POST: RequestHandler = async ({ locals: { supabase } }) => {
	await supabase.auth.signOut();
	redirect(303, '/');
};
