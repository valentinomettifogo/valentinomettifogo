import { roleMeets } from '$lib/server/authz';
import { deleteTenant, listTenantViews, upsertTenant } from '$lib/server/tenants';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Normalises a form field: a non-empty string, or null. */
function str(data: FormData, key: string): string | null {
	const value = data.get(key);
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}

/**
 * Re-asserted in every action, not just in `load`: this is the page that writes
 * customers' Qlik API keys, so the guard lives next to each write rather than
 * being inherited from the page that rendered the form.
 */
function requireAnalytics(locals: App.Locals): void {
	if (!locals.session) redirect(303, '/auth/login');
	if (!roleMeets(locals.role, 'analytics')) error(403, 'Forbidden');
}

export const load: PageServerLoad = async ({ locals }) => {
	requireAnalytics(locals);

	return { tenants: await listTenantViews() };
};

export const actions: Actions = {
	saveTenant: async ({ request, locals }) => {
		requireAnalytics(locals);

		const data = await request.formData();
		const client = str(data, 'client');
		const host = str(data, 'host');

		if (!client || !host) {
			return fail(400, { message: 'Client and host are required.' });
		}

		/**
		 * Secret fields are never sent back to the browser, so a blank field means
		 * "leave as is". Clearing one requires the dedicated checkbox.
		 */
		function secret(key: string): string | null | undefined {
			if (data.get(`clear_${key}`) === 'on') return null;
			return str(data, key) ?? undefined;
		}

		try {
			await upsertTenant({
				id: str(data, 'id') ?? undefined,
				client,
				host,
				apiKey: secret('apiKey'),
				active: data.get('active') === 'on',
				note: str(data, 'note')
			});
		} catch (err) {
			console.error('[portal] save tenant failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Save failed.' });
		}

		return { message: `Tenant "${client}" saved.` };
	},

	deleteTenant: async ({ request, locals }) => {
		requireAnalytics(locals);

		const id = str(await request.formData(), 'id');
		if (!id) return fail(400, { message: 'Missing id.' });

		try {
			await deleteTenant(id);
		} catch (err) {
			console.error('[portal] delete tenant failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Delete failed.' });
		}

		return { message: 'Tenant deleted.' };
	}
};
