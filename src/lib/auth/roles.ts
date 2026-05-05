import { supabase } from '$lib/supabaseClient';

export type AppRole = 'admin' | 'user';

export type RoleInfo = {
  role: AppRole | null;
  userId: string | null;
  error: string | null;
};

function normalizeRole(rawRole: unknown): AppRole {
  const normalized = typeof rawRole === 'string' ? rawRole.trim().toLowerCase() : 'user';
  return normalized === 'admin' ? 'admin' : 'user';
}

export async function getCurrentUserRoleInfo(): Promise<RoleInfo> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    return { role: null, userId: null, error: userError.message };
  }

  if (!user) {
    return { role: null, userId: null, error: null };
  }

  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();

  if (error) {
    return { role: 'user', userId: user.id, error: error.message };
  }

  if (!data) {
    return {
      role: 'user',
      userId: user.id,
      error: 'Nessuna riga ruolo visibile per questo utente (possibile policy RLS non corretta).'
    };
  }

  return { role: normalizeRole(data.role), userId: user.id, error: null };
}

export async function getCurrentUserRole(): Promise<AppRole | null> {
  const info = await getCurrentUserRoleInfo();
  return info.role;
}
