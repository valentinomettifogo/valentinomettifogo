import { isAllowed } from '$lib/server/authz';
import { sha256Hex } from '$lib/server/crypto';
import { deleteTenant, listTenantViews, upsertTenant } from '$lib/server/tenants';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Normalises a form field: a non-empty string, or null. */
function str(data: FormData, key: string): string | null {
	const value = data.get(key);
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}

export const load: PageServerLoad = async ({ locals }) => {
	// The hook already gated this route, but re-asserting holds: if this page ever
	// moved outside (protected), it still would not leak.
	if (!isAllowed(locals.user)) error(403, 'Access restricted');

	return { tenants: await listTenantViews(), email: locals.user?.email ?? null };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!isAllowed(locals.user)) error(403, 'Access restricted');

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

		// The plaintext token is never stored: only its hash is.
		const token = secret('webhookToken');

		try {
			await upsertTenant({
				id: str(data, 'id') ?? undefined,
				client,
				host,
				apiKey: secret('apiKey'),
				chatWebhookUrl: secret('chatWebhookUrl'),
				webhookTokenHash: token ? sha256Hex(token) : token,
				active: data.get('active') === 'on',
				note: str(data, 'note')
			});
		} catch (err) {
			console.error('[alerts] save failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Save failed.' });
		}

		return { message: `Tenant "${client}" saved.` };
	},

	delete: async ({ request, locals }) => {
		if (!isAllowed(locals.user)) error(403, 'Access restricted');

		const id = str(await request.formData(), 'id');
		if (!id) return fail(400, { message: 'Missing id.' });

		try {
			await deleteTenant(id);
		} catch (err) {
			console.error('[alerts] delete failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Delete failed.' });
		}

		return { message: 'Tenant deleted.' };
	}
};
