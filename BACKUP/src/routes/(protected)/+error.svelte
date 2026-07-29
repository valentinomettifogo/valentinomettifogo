<script lang="ts">
	import { page } from '$app/state';
	import Shell from '$lib/components/site/Shell.svelte';
	import SignOutButton from '$lib/components/ui/SignOutButton.svelte';

	const forbidden = $derived(page.status === 403);
</script>

<svelte:head><title>{page.status} — Valentino Mettifogo</title></svelte:head>

<Shell>
	<div class="border-b border-line px-6 py-10">
		<p class="m-0 font-mono text-meta text-red uppercase">Error {page.status}</p>
		<h1 class="mt-3 mb-0 text-display uppercase">
			{forbidden ? 'Access' : 'Something'}<br /><span class="text-red">
				{forbidden ? 'restricted' : 'broke'}
			</span>
		</h1>
	</div>

	<div class="flex flex-col gap-5 px-6 py-6">
		<p class="m-0 max-w-[58ch] text-base">
			{#if forbidden}
				This page is restricted to company accounts. If you signed in with the wrong one,
				sign out and try again with the right account.
			{:else}
				{page.error?.message ?? 'Something went wrong.'}
			{/if}
		</p>

		<!-- Without this, a rejected account is stuck on the 403 with no way out. -->
		<div class="flex flex-wrap items-center gap-3">
			<SignOutButton label="Sign out and switch account" />
			<a href="/" class="font-mono text-xs font-bold uppercase hover:text-teal">← Home</a>
		</div>
	</div>
</Shell>
