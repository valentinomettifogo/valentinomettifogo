import { roleMeets } from '$lib/server/authz';
import { verifyApiKey } from '$lib/server/qlik';
import { findTenantById } from '$lib/server/tenants';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// node:crypto arrives indirectly through lib/server: no edge runtime.
export const config = { runtime: 'nodejs22.x' };

/**
 * The equivalent of `google.script.run.verificaChiave(host)`.
 * It is a JSON endpoint rather than a form action because the page checks rows in
 * parallel, each with its own state.
 * Returns { ok, code, message } only: never the key, never the tenant response body.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!roleMeets(locals.role, 'analytics')) error(403, 'Forbidden');

	let id: unknown;
	try {
		({ id } = await request.json());
	} catch {
		error(400, 'Invalid body');
	}

	if (typeof id !== 'string' || !id) error(400, 'Missing id');

	const tenant = await findTenantById(id);
	if (!tenant) error(404, 'Tenant not found');

	return json(await verifyApiKey(tenant.host, tenant.apiKey));
};
