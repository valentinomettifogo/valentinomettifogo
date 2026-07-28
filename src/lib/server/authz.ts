import { env } from '$env/dynamic/private';
import type { User } from '@supabase/supabase-js';

const DOMAIN = (env.ALERTS_ALLOWED_DOMAIN ?? '').toLowerCase();

const EXTRA = new Set(
	(env.ALERTS_ALLOWED_EMAILS ?? '')
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean)
);

/**
 * Who gets into /alerts.
 *
 * The provider check is not redundant: without it, signing up with an address at
 * the allowed domain via email/password would be enough to get in. The Email
 * provider should be disabled in Supabase too — this is the second lock.
 *
 * The domain match uses split('@').pop() rather than endsWith, because endsWith
 * would also accept addresses carrying the domain in their local part.
 */
export function isAllowed(user: User | null | undefined): boolean {
	const email = user?.email?.toLowerCase();
	if (!email) return false;
	if (user?.app_metadata?.provider !== 'google') return false;
	if (EXTRA.has(email)) return true;
	return Boolean(DOMAIN) && email.split('@').pop() === DOMAIN;
}
