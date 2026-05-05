import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

type AppRole = 'admin' | 'user';

type RoleRow = {
  user_id: string;
  role: AppRole;
  created_at: string;
};

function createAnonClient() {
  return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function createServiceClient() {
  return createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY ?? '', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function requireAdminUser(request: Request): Promise<{ ok: true; userId: string } | { ok: false; status: number; message: string }> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { ok: false, status: 401, message: 'Token mancante.' };
  }

  const anonClient = createAnonClient();
  const {
    data: { user },
    error: authError
  } = await anonClient.auth.getUser(token);

  if (authError || !user) {
    return { ok: false, status: 401, message: 'Sessione non valida.' };
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 500, message: 'SUPABASE_SERVICE_ROLE_KEY non configurata.' };
  }

  const adminClient = createServiceClient();
  const { data: roleRow, error: roleError } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError) {
    return { ok: false, status: 500, message: `Errore verifica admin: ${roleError.message}` };
  }

  if (roleRow?.role !== 'admin') {
    return { ok: false, status: 403, message: 'Accesso riservato agli admin.' };
  }

  return { ok: true, userId: user.id };
}

export const GET: RequestHandler = async ({ request }) => {
  const adminCheck = await requireAdminUser(request);
  if (!adminCheck.ok) {
    return json({ error: adminCheck.message }, { status: adminCheck.status });
  }

  const adminClient = createServiceClient();

  const { data: roles, error: rolesError } = await adminClient
    .from('user_roles')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: false });

  if (rolesError) {
    return json({ error: `Errore caricamento ruoli: ${rolesError.message}` }, { status: 500 });
  }

  const { data: authUsersData, error: authUsersError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (authUsersError) {
    return json({ error: `Errore caricamento utenti auth: ${authUsersError.message}` }, { status: 500 });
  }

  const byUserId = new Map(
    authUsersData.users.map((u) => [
      u.id,
      {
        email: u.email ?? null,
        full_name: (u.user_metadata?.full_name as string | undefined) ?? null
      }
    ])
  );

  const users = ((roles ?? []) as RoleRow[]).map((row) => {
    const authInfo = byUserId.get(row.user_id);
    return {
      user_id: row.user_id,
      role: row.role,
      created_at: row.created_at,
      email: authInfo?.email ?? null,
      full_name: authInfo?.full_name ?? null
    };
  });

  return json({ users });
};

export const PATCH: RequestHandler = async ({ request }) => {
  const adminCheck = await requireAdminUser(request);
  if (!adminCheck.ok) {
    return json({ error: adminCheck.message }, { status: adminCheck.status });
  }

  const body = (await request.json()) as { userId?: string; role?: AppRole };
  const nextRole = body.role;
  const targetUserId = body.userId;

  if (!targetUserId || (nextRole !== 'admin' && nextRole !== 'user')) {
    return json({ error: 'Payload non valido.' }, { status: 400 });
  }

  if (adminCheck.userId === targetUserId && nextRole !== 'admin') {
    return json({ error: 'Non puoi toglierti il ruolo admin da questa schermata.' }, { status: 400 });
  }

  const adminClient = createServiceClient();

  const { error } = await adminClient
    .from('user_roles')
    .upsert({ user_id: targetUserId, role: nextRole }, { onConflict: 'user_id' });

  if (error) {
    return json({ error: `Errore aggiornamento ruolo: ${error.message}` }, { status: 500 });
  }

  return json({ success: true });
};
