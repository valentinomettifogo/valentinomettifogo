import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { getUserRole, roleMeets } from '$lib/server/authz';
import { createServerClient } from '@supabase/ssr';
import type { Session, User } from '@supabase/supabase-js';
import { error, redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const supabase: Handle = async ({ event, resolve }) => {
	// Webhooks are machine traffic: no cookies, no session, no client.
	if (event.url.pathname.startsWith('/api/webhooks/')) {
		return resolve(event);
	}

	event.locals.supabase = createServerClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					for (const { name, value, options } of cookiesToSet) {
						// path is mandatory: SvelteKit throws without it.
						event.cookies.set(name, value, { ...options, path: '/' });
					}
				}
			}
		}
	);

	let cached: { session: Session | null; user: User | null } | null = null;

	/**
	 * getSession() alone is not trustworthy: it reads the cookie without verifying
	 * its signature. getUser() validates the JWT against Supabase. The result is
	 * memoised so the hook, the layout and the page load share one round-trip.
	 */
	event.locals.safeGetSession = async () => {
		if (cached) return cached;

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			cached = { session: null, user: null };
			return cached;
		}

		const {
			data: { user },
			error: err
		} = await event.locals.supabase.auth.getUser();

		cached = err ? { session: null, user: null } : { session, user };
		return cached;
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	// Gated on the route id: the prerendered homepage and the webhooks never pay
	// for the JWT validation round-trip.
	if (!event.route.id?.startsWith('/(protected)')) {
		return resolve(event);
	}

	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!user) {
		redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
	}

	const role = await getUserRole(user);
	event.locals.role = role;

	const minimum = event.route.id?.startsWith('/(protected)/alerts-settings') ? 'admin' : 'analyzer';
	if (!roleMeets(role, minimum)) {
		error(403, 'Access restricted');
	}

	return resolve(event);
};

export const handle = sequence(supabase, authGuard);
