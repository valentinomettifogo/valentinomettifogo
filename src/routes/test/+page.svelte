<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(async () => {
    await goto('/admin');
  });
</script>

<section class="container mx-auto px-6 py-16 md:px-16">
  <div class="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
    <h1 class="text-2xl font-bold text-slate-900">Reindirizzamento</h1>
    <p class="mt-3 text-slate-500">La funzione test e stata spostata nella dashboard admin.</p>
  </div>
</section>