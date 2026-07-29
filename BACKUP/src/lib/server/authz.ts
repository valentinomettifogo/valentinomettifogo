import type { Role } from '$lib/types';
import type { User } from '@supabase/supabase-js';
import { getServiceClient } from './supabase';

export type { Role };

const RANK: Record<Role, number> = { none: 0, analyzer: 1, admin: 2 };

/** Whether role is at least as privileged as minimum. */
export function roleMeets(role: Role, minimum: Role): boolean {
	return RANK[role] >= RANK[minimum];
}

/**
 * Looks up the caller's role in app_users. There is no self-serve first-admin
 * flow: the first row is inserted by hand in the Supabase table editor.
 */
export async function getUserRole(user: User | null | undefined): Promise<Role> {
	if (!user?.id) return 'none';

	// Same second lock as before: without it, an Email/password sign-up sharing an
	// allowed address would slip in. The Email provider should be disabled in
	// Supabase too.
	if (user.app_metadata?.provider !== 'google') return 'none';

	const email = user.email?.toLowerCase();
	if (!email) return 'none';

	const db = getServiceClient();
	const { data, error } = await db
		.from('app_users')
		.select('id, role, user_id')
		.or(`user_id.eq.${user.id},email.eq.${email}`)
		.maybeSingle<{ id: string; role: Role; user_id: string | null }>();

	if (error) {
		console.error('[authz] role lookup failed:', error.message);
		return 'none';
	}
	if (!data) return 'none';

	// Self-heal: a row granted by email only gets linked to the real auth.users
	// id on first successful lookup, so later lookups take the indexed user_id path.
	if (data.user_id !== user.id) {
		await db.from('app_users').update({ user_id: user.id }).eq('id', data.id);
	}

	return data.role;
}
