<script lang="ts">
  import { goto } from '$app/navigation';
  import { PUBLIC_SUPABASE_URL } from '$env/static/public';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { getCurrentUserRoleInfo } from '$lib/auth/roles';

  type UserRoleRow = {
    user_id: string;
    role: 'admin' | 'user';
    created_at: string;
    email: string | null;
    full_name: string | null;
  };

  let loading = $state(true);
  let role = $state<'admin' | 'user' | null>(null);
  let userId = $state<string | null>(null);
  let autenticato = $state(false);
  let nomeInserito = $state('');
  let salvataggioInCorso = $state(false);
  let ruoloInAggiornamentoPer = $state('');
  let righeRuoli = $state<UserRoleRow[]>([]);
  let ruoliLoading = $state(false);
  let messaggio = $state('');
  let errore = $state('');
  const supabaseHost = (() => {
    try {
      return new URL(PUBLIC_SUPABASE_URL).host;
    } catch {
      return 'URL non valida';
    }
  })();

  onMount(async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      await goto('/login');
      return;
    }

    autenticato = true;

    const roleInfo = await getCurrentUserRoleInfo();
    role = roleInfo.role;
    userId = roleInfo.userId;

    if (roleInfo.error) {
      errore = `Errore lettura ruolo: ${roleInfo.error}`;
    }

    if (role === 'admin') {
      await caricaRuoli();
    }

    loading = false;
  });

  async function caricaRuoli() {
    ruoliLoading = true;
    errore = '';

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      ruoliLoading = false;
      errore = 'Sessione non valida: effettua nuovamente il login.';
      return;
    }

    const response = await fetch('/admin/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    const payload = (await response.json()) as { users?: UserRoleRow[]; error?: string };

    ruoliLoading = false;

    if (!response.ok) {
      errore = payload.error ?? 'Errore caricamento ruoli.';
      return;
    }

    righeRuoli = (payload.users ?? []).map((row) => ({
      user_id: row.user_id,
      role: row.role === 'admin' ? 'admin' : 'user',
      created_at: row.created_at,
      email: row.email,
      full_name: row.full_name
    }));
  }

  async function aggiornaRuolo(targetUserId: string, nextRole: 'admin' | 'user') {
    errore = '';
    messaggio = '';

    if (role !== 'admin') {
      errore = 'Solo gli admin possono modificare i ruoli.';
      return;
    }

    if (targetUserId === userId && nextRole !== 'admin') {
      errore = 'Per sicurezza non puoi togliere il ruolo admin al tuo account da questa schermata.';
      return;
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      errore = 'Sessione non valida: effettua nuovamente il login.';
      return;
    }

    ruoloInAggiornamentoPer = targetUserId;

    const response = await fetch('/admin/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: targetUserId,
        role: nextRole
      })
    });

    const payload = (await response.json()) as { success?: boolean; error?: string };
    ruoloInAggiornamentoPer = '';

    if (!response.ok || !payload.success) {
      errore = payload.error ?? 'Errore aggiornamento ruolo.';
      return;
    }

    messaggio = `Ruolo aggiornato per ${targetUserId}.`;
    await caricaRuoli();
  }

  async function inviaDatiDiTest() {
    errore = '';
    messaggio = '';

    if (role !== 'admin') {
      errore = 'Solo gli admin possono usare questo strumento.';
      return;
    }

    if (!nomeInserito) {
      errore = 'Inserisci un valore prima di salvare.';
      return;
    }

    salvataggioInCorso = true;
    const { error } = await supabase.from('test_tabella').insert([{ name: nomeInserito }]);
    salvataggioInCorso = false;

    if (error) {
      errore = error.message;
      return;
    }

    messaggio = 'Successo! Dato salvato in test_tabella.';
    nomeInserito = '';
  }
</script>

<section class="container mx-auto px-6 py-16 md:px-16">
  <div class="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
    {#if loading}
      <h1 class="text-2xl font-bold text-slate-900">Verifica permessi admin...</h1>
      <p class="mt-2 text-slate-500">Attendi qualche istante.</p>
    {:else if role !== 'admin'}
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Accesso admin non consentito</h1>
      <p class="mt-3 text-slate-500">Se pensi di essere admin, verifica il record nella tabella user_roles.</p>

      <div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <p class="font-medium">Debug rapido</p>
        <p class="mt-1 text-sm">Sessione autenticata: {autenticato ? 'si' : 'no'}</p>
        <p class="mt-1 text-sm">User ID corrente: {userId ?? 'non disponibile'}</p>
        <p class="mt-1 text-sm">Ruolo letto: {role ?? 'nessuno'}</p>
        <p class="mt-1 text-sm">Progetto Supabase app: {supabaseHost}</p>
      </div>

      <a href="/" class="btn mt-6 rounded-lg border-none bg-slate-900 text-white hover:bg-slate-800">Torna alla home</a>
    {:else}
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Dashboard Admin</h1>
      <p class="mt-3 text-slate-500">Accesso consentito: sei autenticato come admin.</p>

      <div class="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700">
        Qui puoi inserire strumenti riservati (gestione utenti, contenuti, metriche, ecc.).
      </div>

      <div class="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h2 class="text-xl font-semibold text-slate-900">Strumento Test DB</h2>
        <p class="mt-1 text-sm text-slate-500">Questa e la vecchia scheda Test, ora disponibile solo in Admin.</p>

        <div class="mt-4 space-y-4">
          <label class="form-control w-full">
            <span class="mb-1 text-sm font-medium text-slate-600">Nome</span>
            <input
              type="text"
              bind:value={nomeInserito}
              placeholder="Scrivi un nome..."
              class="input input-bordered w-full rounded-lg border-slate-200"
              disabled={salvataggioInCorso}
            />
          </label>

          <button
            class="btn rounded-lg border-none bg-emerald-500 text-white hover:bg-emerald-600"
            onclick={inviaDatiDiTest}
            disabled={salvataggioInCorso}
          >
            {salvataggioInCorso ? 'Salvataggio...' : 'Salva su DB'}
          </button>
        </div>
      </div>

      <div class="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">Gestione Ruoli Utenti</h2>
            <p class="mt-1 text-sm text-slate-500">Modifica il ruolo nella tabella user_roles.</p>
          </div>
          <button class="btn btn-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onclick={caricaRuoli} disabled={ruoliLoading}>
            {ruoliLoading ? 'Aggiorno...' : 'Ricarica elenco'}
          </button>
        </div>

        <div class="mt-4 overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>User ID</th>
                <th>Ruolo</th>
                <th>Creato il</th>
                <th class="text-right">Azione</th>
              </tr>
            </thead>
            <tbody>
              {#if righeRuoli.length === 0}
                <tr>
                  <td colspan="6" class="text-slate-500">
                    {ruoliLoading ? 'Caricamento ruoli...' : 'Nessun record disponibile.'}
                  </td>
                </tr>
              {:else}
                {#each righeRuoli as riga (riga.user_id)}
                  <tr>
                    <td class="text-slate-700">{riga.full_name || 'N/D'}</td>
                    <td class="text-slate-700">{riga.email || 'N/D'}</td>
                    <td class="font-mono text-xs text-slate-700">{riga.user_id}</td>
                    <td>
                      <span class={`badge border-none ${riga.role === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {riga.role}
                      </span>
                    </td>
                    <td class="text-slate-500">{new Date(riga.created_at).toLocaleString()}</td>
                    <td class="text-right">
                      {#if riga.role === 'admin'}
                        <button
                          class="btn btn-xs rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          onclick={() => aggiornaRuolo(riga.user_id, 'user')}
                          disabled={ruoloInAggiornamentoPer === riga.user_id}
                        >
                          {ruoloInAggiornamentoPer === riga.user_id ? 'Salvo...' : 'Rendi user'}
                        </button>
                      {:else}
                        <button
                          class="btn btn-xs rounded-md border-none bg-emerald-500 text-white hover:bg-emerald-600"
                          onclick={() => aggiornaRuolo(riga.user_id, 'admin')}
                          disabled={ruoloInAggiornamentoPer === riga.user_id}
                        >
                          {ruoloInAggiornamentoPer === riga.user_id ? 'Salvo...' : 'Rendi admin'}
                        </button>
                      {/if}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if messaggio}
      <p class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{messaggio}</p>
    {/if}

    {#if errore}
      <p class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errore}</p>
    {/if}
  </div>
</section>
