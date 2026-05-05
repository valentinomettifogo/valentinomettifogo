<script lang="ts">
  import type { Session, User } from '@supabase/supabase-js';
  import { onMount } from 'svelte';
  import { getCurrentUserRoleInfo } from '$lib/auth/roles';
  import { supabase } from '$lib/supabaseClient';

  let { name }: { name: string } = $props();

  let user = $state<User | null>(null);
  let userLabel = $state('');
  let role = $state<'admin' | 'user' | null>(null);
  let roleError = $state('');
  let loggingOut = $state(false);

  function updateUser(session: Session | null) {
    user = session?.user ?? null;
    const fullName = user?.user_metadata?.full_name as string | undefined;
    userLabel = fullName?.trim() || user?.email || '';
  }

  async function updateRole() {
    const info = await getCurrentUserRoleInfo();
    role = info.role;
    roleError = info.error ?? '';
    if (info.error) {
      console.warn('Errore lettura ruolo admin:', info.error);
    }
  }

  onMount(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      updateUser(data.session);
      if (data.session) {
        void updateRole();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUser(session);
      if (!session) {
        role = null;
        roleError = '';
      } else {
        void updateRole();
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  });

  async function handleLogout() {
    loggingOut = true;
    await supabase.auth.signOut();
    updateUser(null);
    role = null;
    roleError = '';
    loggingOut = false;
  }
</script>

<nav class="navbar sticky top-0 z-50 bg-slate-50/90 px-6 py-4 backdrop-blur-md transition-all duration-300 md:px-16">
  <div class="flex-1">
    <a href="/" class="text-xl font-bold tracking-tight transition-colors duration-300 hover:text-emerald-500">
      {name}<span class="text-emerald-500">.</span>
    </a>
  </div>

  <div class="dropdown dropdown-end sm:hidden">
    <button type="button" class="btn btn-ghost btn-sm rounded-lg text-slate-700">
      Menu
    </button>
    <ul class="menu dropdown-content z-60 mt-2 w-52 rounded-box border border-slate-200 bg-white p-2 shadow">
      <li><a href="/">Home</a></li>
      <li><a href="/#progetti">Progetti</a></li>
      <li><a href="/#contatti">Contatti</a></li>
      {#if role === 'admin'}
        <li><a href="/admin" class="font-semibold text-emerald-600 hover:text-emerald-700">Admin</a></li>
      {/if}
      {#if user}
        <li class="menu-title text-xs text-slate-500">{userLabel || 'Utente autenticato'}</li>
        <li>
          <button type="button" onclick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Logout...' : 'Logout'}
          </button>
        </li>
      {:else}
        <li><a href="/login">Login</a></li>
      {/if}
    </ul>
  </div>

  <div class="hidden flex-none items-center gap-4 sm:flex">
    {#if user}
      <div class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
        {userLabel || 'Utente autenticato'}
        {#if roleError}
          <span class="ml-2 text-xs text-amber-600">(ruolo non letto)</span>
        {/if}
      </div>
    {/if}

    <ul class="flex gap-6 font-medium">
      <li><a href="/" class="text-slate-600 transition-colors duration-300 hover:text-emerald-500">Home</a></li>
      <li><a href="/#progetti" class="text-slate-600 transition-colors duration-300 hover:text-emerald-500">Progetti</a></li>
      <li><a href="/#contatti" class="text-slate-600 transition-colors duration-300 hover:text-emerald-500">Contatti</a></li>
      {#if role === 'admin'}
        <li><a href="/admin" class="font-semibold text-emerald-600 transition-colors duration-300 hover:text-emerald-700">Admin</a></li>
      {/if}
      {#if user}
        <li>
          <button
            type="button"
            class="text-slate-600 transition-colors duration-300 hover:text-emerald-500"
            onclick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logout...' : 'Logout'}
          </button>
        </li>
      {:else}
        <li><a href="/login" class="text-slate-600 transition-colors duration-300 hover:text-emerald-500">Login</a></li>
      {/if}
    </ul>
  </div>
</nav>
