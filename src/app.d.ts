// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Role } from '$lib/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{
				session: Session | null;
				user: User | null;
				role: Role | null;
			}>;
			session: Session | null;
			user: User | null;
			role: Role | null;
		}
		interface PageData {
			user: { id: string; email: string | null } | null;
			role: Role | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
