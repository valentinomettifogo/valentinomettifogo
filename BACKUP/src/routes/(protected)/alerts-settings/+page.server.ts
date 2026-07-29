import { roleMeets } from '$lib/server/authz';
import { getChatWebhookUrl, maskWebhookUrl, setChatWebhookUrl } from '$lib/server/settings';
import { deleteTenant, listTenantViews, upsertTenant } from '$lib/server/tenants';
import { deleteAppUser, listAppUsers, upsertAppUserRole } from '$lib/server/users';
import type { Role } from '$lib/types';
import { error, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Normalises a form field: a non-empty string, or null. */
function str(data: FormData, key: string): string | null {
	const value = data.get(key);
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}

/**
 * The hook already gated this route to admin, but re-asserting holds: if an
 * action ever moved outside (protected), it still would not leak. This is the
 * page that writes secrets and grants roles — the highest-value target for it.
 */
function requireAdmin(locals: App.Locals): void {
	if (!roleMeets(locals.role ?? 'none', 'admin')) error(403, 'Access restricted');
}

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const [tenants, appUsers, chatWebhookUrl] = await Promise.all([
		listTenantViews(),
		listAppUsers(),
		getChatWebhookUrl()
	]);

	return {
		tenants,
		appUsers,
		hasChatWebhook: Boolean(chatWebhookUrl),
		chatWebhookMasked: maskWebhookUrl(chatWebhookUrl),
		email: locals.user?.email ?? null
	};
};

export const actions: Actions = {
	saveTenant: async ({ request, locals }) => {
		requireAdmin(locals);

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
			console.error('[alerts-settings] save tenant failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Save failed.' });
		}

		return { message: `Tenant "${client}" saved.` };
	},

	deleteTenant: async ({ request, locals }) => {
		requireAdmin(locals);

		const id = str(await request.formData(), 'id');
		if (!id) return fail(400, { message: 'Missing id.' });

		try {
			await deleteTenant(id);
		} catch (err) {
			console.error('[alerts-settings] delete tenant failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Delete failed.' });
		}

		return { message: 'Tenant deleted.' };
	},

	saveWebhook: async ({ request, locals }) => {
		requireAdmin(locals);

		const data = await request.formData();

		if (data.get('clear_webhookUrl') === 'on') {
			try {
				await setChatWebhookUrl(null);
			} catch (err) {
				console.error('[alerts-settings] clear webhook failed:', err instanceof Error ? err.message : err);
				return fail(500, { message: 'Save failed.' });
			}
			return { message: 'Chat webhook removed.' };
		}

		const url = str(data, 'webhookUrl');
		if (url === null) return { message: 'Chat webhook left unchanged.' };

		try {
			await setChatWebhookUrl(url);
		} catch (err) {
			console.error('[alerts-settings] save webhook failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Save failed.' });
		}

		return { message: 'Chat webhook saved.' };
	},

	saveUser: async ({ request, locals }) => {
		requireAdmin(locals);

		const data = await request.formData();
		const email = str(data, 'email');
		const role = str(data, 'role') as Role | null;

		if (!email || !role) {
			return fail(400, { message: 'Email and role are required.' });
		}

		// No self-serve first-admin recovery: an admin locking themselves out has
		// no in-app escape hatch, only the Supabase table editor.
		if (email.toLowerCase() === locals.user?.email?.toLowerCase()) {
			return fail(400, { message: 'You cannot change your own role.' });
		}

		try {
			await upsertAppUserRole({ id: str(data, 'id') ?? undefined, email, role });
		} catch (err) {
			console.error('[alerts-settings] save user failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Save failed.' });
		}

		return { message: `Role for "${email}" saved.` };
	},

	deleteUser: async ({ request, locals }) => {
		requireAdmin(locals);

		const data = await request.formData();
		const id = str(data, 'id');
		const email = str(data, 'email');
		if (!id) return fail(400, { message: 'Missing id.' });

		if (email && email.toLowerCase() === locals.user?.email?.toLowerCase()) {
			return fail(400, { message: 'You cannot remove your own account.' });
		}

		try {
			await deleteAppUser(id);
		} catch (err) {
			console.error('[alerts-settings] delete user failed:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Delete failed.' });
		}

		return { message: 'User removed.' };
	}
};
