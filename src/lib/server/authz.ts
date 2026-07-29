import type { Role } from '$lib/types';

/**
 * Ranked user < analytics < admin. The role itself is resolved once per request
 * in `src/hooks.server.ts` and exposed as `locals.role`; this module only
 * answers "is that enough for what is about to happen".
 */
const RANK: Record<Role, number> = { user: 0, analytics: 1, admin: 2 };

/** Whether role is at least as privileged as minimum. */
export function roleMeets(role: Role | null, minimum: Role): boolean {
	if (!role) return false;
	return RANK[role] >= RANK[minimum];
}
