import { roleMeets } from '$lib/server/authz';
import { isRole, listUserViews, setUserRole } from '$lib/server/users';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function requireAdmin(locals: App.Locals): void {
	if (!locals.session) redirect(303, '/auth/login');
	if (!roleMeets(locals.role, 'admin')) error(403, 'Forbidden');
}

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	return { users: await listUserViews(locals.user?.id ?? null) };
};

export const actions: Actions = {
	setRole: async ({ request, locals }) => {
		requireAdmin(locals);

		const data = await request.formData();
		const id = data.get('id');
		const role = data.get('role');

		if (typeof id !== 'string' || !id) return fail(400, { success: false, message: 'Missing user.' });
		if (!isRole(role)) return fail(400, { success: false, message: 'Unknown role.' });

		/**
		 * An admin cannot change their own role. Without this, the last admin can
		 * demote themselves and nobody can undo it from the app — the only way back
		 * would be the Supabase table editor.
		 */
		if (id === locals.user?.id) {
			return fail(400, { success: false, message: 'You cannot change your own role.' });
		}

		try {
			await setUserRole(id, role);
		} catch (err) {
			console.error('[admin] set role failed:', err instanceof Error ? err.message : err);
			return fail(500, { success: false, message: 'Save failed.' });
		}

		return { success: true, message: `Role updated to "${role}".` };
	}
};
