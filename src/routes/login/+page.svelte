<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let email = $state('');
  let password = $state('');
  let messaggio = $state('');
  let errore = $state('');
  let caricando = $state(false);
  let utenteLoggato = $state(false);

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    utenteLoggato = Boolean(data.session);
  });

  async function loginGoogle() {
    errore = '';
    messaggio = '';
    caricando = true;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    caricando = false;
    if (error) errore = error.message;
  }

  async function loginEmail() {
    errore = '';
    messaggio = '';

    if (!email || !password) {
      errore = 'Inserisci email e password.';
      return;
    }

    caricando = true;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    caricando = false;

    if (error) {
      errore = error.message;
      return;
    }

    messaggio = 'Login effettuato con successo.';
    utenteLoggato = true;
    await goto('/test');
  }

  async function signupEmail() {
    errore = '';
    messaggio = '';

    if (!email || !password) {
      errore = 'Inserisci email e password.';
      return;
    }

    caricando = true;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    caricando = false;

    if (error) {
      errore = error.message;
      return;
    }

    messaggio = "Registrazione completata. Controlla l'email per confermare l'account.";
  }

  async function logout() {
    await supabase.auth.signOut();
    utenteLoggato = false;
    messaggio = 'Logout eseguito.';
  }
</script>

<section class="container mx-auto px-6 py-16 md:px-16">
  <div class="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
    <h1 class="mb-2 text-3xl font-bold tracking-tight text-slate-900">Autenticazione</h1>
    <p class="mb-8 text-slate-500">Accedi con Google oppure con email e password tramite Supabase.</p>

    <button
      class="btn mb-6 w-full rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      onclick={loginGoogle}
      disabled={caricando}
    >
      {caricando ? 'Attendi...' : 'Continua con Google'}
    </button>

    <div class="divider text-xs uppercase tracking-wide text-slate-400">oppure</div>

    <div class="mt-4 space-y-4">
      <label class="form-control w-full">
        <span class="mb-1 text-sm font-medium text-slate-600">Email</span>
        <input
          type="email"
          bind:value={email}
          placeholder="nome@dominio.it"
          class="input input-bordered w-full rounded-lg border-slate-200"
          autocomplete="email"
        />
      </label>

      <label class="form-control w-full">
        <span class="mb-1 text-sm font-medium text-slate-600">Password</span>
        <input
          type="password"
          bind:value={password}
          placeholder="Minimo 6 caratteri"
          class="input input-bordered w-full rounded-lg border-slate-200"
          autocomplete="current-password"
        />
      </label>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button class="btn rounded-lg border-none bg-emerald-500 text-white hover:bg-emerald-600" onclick={loginEmail} disabled={caricando}>
        Accedi
      </button>
      <button class="btn rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onclick={signupEmail} disabled={caricando}>
        Registrati
      </button>
    </div>

    {#if utenteLoggato}
      <button class="btn mt-4 w-full rounded-lg border-none bg-slate-900 text-white hover:bg-slate-800" onclick={logout}>
        Logout
      </button>
    {/if}

    {#if messaggio}
      <p class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{messaggio}</p>
    {/if}

    {#if errore}
      <p class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errore}</p>
    {/if}
  </div>
</section>