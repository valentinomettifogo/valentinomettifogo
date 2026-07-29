import type { AppUserView, Role } from '$lib/types';
import { getServiceClient } from './supabase';

type Row = {
	id: string;
	email: string;
	role: Role;
	created_at: string;
	user_id: string | null;
};

function toView(row: Row): AppUserView {
	return {
		id: row.id,
		email: row.email,
		role: row.role,
		createdAt: row.created_at,
		linked: row.user_id !== null
	};
}

export async function listAppUsers(): Promise<AppUserView[]> {
	const { data, error } = await getServiceClient()
		.from('app_users')
		.select('id, email, role, created_at, user_id')
		.order('email', { ascending: true })
		.returns<Row[]>();

	if (error) throw new Error(`Reading users failed: ${error.message}`);
	return (data ?? []).map(toView);
}

export type AppUserInput = {
	id?: string;
	email: string;
	role: Role;
};

export async function upsertAppUserRole(input: AppUserInput): Promise<void> {
	const patch = { email: input.email.toLowerCase(), role: input.role };

	const db = getServiceClient();
	const { error } = input.id
		? await db.from('app_users').update(patch).eq('id', input.id)
		: await db.from('app_users').insert(patch);

	if (error) throw new Error(`Saving user failed: ${error.message}`);
}

export async function deleteAppUser(id: string): Promise<void> {
	const { error } = await getServiceClient().from('app_users').delete().eq('id', id);
	if (error) throw new Error(`Deleting user failed: ${error.message}`);
}
