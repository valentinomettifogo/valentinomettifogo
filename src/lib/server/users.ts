import type { Role, UserView } from '$lib/types';
import { ROLES } from '$lib/types';
import { getServiceClient } from './supabase';

/**
 * Explicit column list, as everywhere else that touches the service client.
 * `public.users` has no secrets today, but the habit is what keeps it true.
 */
const USER_COLUMNS = 'id, email, role, created_at';

type Row = {
	id: string;
	email: string | null;
	role: Role;
	created_at: string;
};

/** Narrows an untrusted string from a form to a Role. */
export function isRole(value: unknown): value is Role {
	return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/**
 * Every account that has ever signed in, newest first. Rows are created by the
 * `handle_new_user` trigger on `auth.users`, so this list is the whole site.
 * The read goes through the service client because RLS on `public.users` only
 * lets a user see their own row.
 */
export async function listUserViews(currentUserId: string | null): Promise<UserView[]> {
	const { data, error } = await getServiceClient()
		.from('users')
		.select(USER_COLUMNS)
		.order('created_at', { ascending: false })
		.returns<Row[]>();

	if (error) throw new Error(`Reading users failed: ${error.message}`);

	return (data ?? []).map((row) => ({
		id: row.id,
		email: row.email,
		role: row.role,
		createdAt: row.created_at,
		isSelf: row.id === currentUserId
	}));
}

export async function setUserRole(id: string, role: Role): Promise<void> {
	const { error } = await getServiceClient().from('users').update({ role }).eq('id', id);
	if (error) throw new Error(`Saving role failed: ${error.message}`);
}
