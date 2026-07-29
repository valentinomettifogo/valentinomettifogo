import { listTenantViews } from '$lib/server/tenants';
import type { PageServerLoad } from './$types';

// The hook already gates this route to analyzer-or-admin: read-only, no actions here.
export const load: PageServerLoad = async () => {
	return { tenants: await listTenantViews() };
};
