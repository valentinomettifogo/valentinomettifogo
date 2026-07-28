// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			/** Session with the JWT already validated via getUser(). Memoised per request. */
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
		/**
		 * All optional: the homepage is prerendered and loads nothing auth-related,
		 * yet it shares this interface with the pages under (protected).
		 */
		interface PageData {
			session?: Session | null;
			user?: User | null;
			supabase?: SupabaseClient;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
