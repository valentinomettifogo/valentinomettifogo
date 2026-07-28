import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * service_role client: it bypasses RLS, so it must never leave $lib/server.
 * Lazy, so a deploy without the key fails only on the routes that actually use
 * it rather than on the whole site.
 */
export function getServiceClient(): SupabaseClient {
	if (client) return client;

	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!key) {
		throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
	}

	client = createClient(PUBLIC_SUPABASE_URL, key, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
	return client;
}
