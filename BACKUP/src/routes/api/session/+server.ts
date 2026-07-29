import { getUserRole } from '$lib/server/authz';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Lets the prerendered homepage (which reads no session server-side) fill in
 * the role-aware navbar client-side after mount. Anonymous visitors get
 * `{ role: 'none', email: null }`, same as the static markup already shows.
 */
export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	const role = await getUserRole(user);

	return json({ role, email: user?.email ?? null });
};
