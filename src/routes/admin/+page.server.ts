import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) redirect(303, '/auth/login');
	if (locals.role !== 'admin') error(403, 'Forbidden');

	return {};
};
