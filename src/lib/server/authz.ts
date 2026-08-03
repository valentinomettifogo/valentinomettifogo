import type { Role } from '$lib/types';

/**
 * Ranked user < analytics < admin, for /portal and /admin. `author` sits at
 * the same level as `user` here: it is a separate axis (can write posts)
 * rather than another step up this ladder, so being an author grants no
 * /portal access. See `canWritePosts`/`canModerateAllPosts` for that axis.
 */
const RANK: Record<Role, number> = { user: 0, author: 0, analytics: 1, admin: 2 };

/** Whether role is at least as privileged as minimum, on the /portal ladder. */
export function roleMeets(role: Role | null, minimum: Role): boolean {
	if (!role) return false;
	return RANK[role] >= RANK[minimum];
}

/** Whether role can write and publish their own posts from /write. */
export function canWritePosts(role: Role | null): boolean {
	return role === 'author' || role === 'admin';
}

/** Whether role can moderate (edit/publish/delete) everyone's posts, not just their own. */
export function canModerateAllPosts(role: Role | null): boolean {
	return role === 'admin';
}
