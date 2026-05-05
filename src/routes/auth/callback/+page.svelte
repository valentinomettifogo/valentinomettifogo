<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  let errore = $state('');

  async function vaiAllaProssimaPagina(next: string) {
    await goto(next.startsWith('/') ? next : `/${next}`);
  }

  onMount(async () => {
    const current = new URL(window.location.href);
    const code = current.searchParams.get('code');
    const next = current.searchParams.get('next') ?? '/test';
    const hashParams = new URLSearchParams(current.hash.replace(/^#/, ''));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        errore = error.message;
        return;
      }

      await vaiAllaProssimaPagina(next);
      return;
    }

    // Fallback per provider che ritornano i token nell'hash URL invece del code.
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        errore = error.message;
        return;
      }

      await vaiAllaProssimaPagina(next);
      return;
    }

    // Se la sessione e gia stata ripristinata automaticamente, procedi.
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      await vaiAllaProssimaPagina(next);
      return;
    }

    errore = 'Callback OAuth incompleta: nessun code o token ricevuto. Controlla Redirect URL su Supabase.';
  });
</script>

<section class="container mx-auto px-6 py-16 md:px-16">
  <div class="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
    <h1 class="text-2xl font-bold text-slate-900">Completamento accesso</h1>
    {#if errore}
      <p class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errore}</p>
      <a href="/login" class="btn mt-4 rounded-lg border-none bg-slate-900 text-white hover:bg-slate-800">Torna al login</a>
    {:else}
      <p class="mt-3 text-slate-500">Verifica in corso, attendi un attimo...</p>
    {/if}
  </div>
</section>
