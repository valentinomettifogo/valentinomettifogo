<script lang="ts">
	import SignOutButton from '$lib/components/ui/SignOutButton.svelte';
	import type { Role } from '$lib/types';

	// Defaults let the public homepage render this without a session, which keeps
	// the root layout free of cookies — see the prerenderable-homepage invariant.
	let { role = 'none', email = null }: { role?: Role; email?: string | null } = $props();

	const link = 'font-mono text-[11px] font-bold uppercase hover:text-teal';
</script>

<nav class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
	<div class="flex flex-wrap items-center gap-5">
		<a href="/" class={link}>Home</a>
		{#if role !== 'none'}
			<a href="/alerts" class={link}>Alerts</a>
		{/if}
		{#if role === 'admin'}
			<a href="/alerts-settings" class={link}>Alerts settings</a>
		{/if}
	</div>

	{#if email}
		<div class="flex items-center gap-3">
			<span class="font-mono text-[11px] uppercase opacity-60">{email}</span>
			<SignOutButton />
		</div>
	{/if}
</nav>
