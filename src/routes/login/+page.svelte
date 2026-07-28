<script lang="ts">
	import { page } from '$app/state';
	import Shell from '$lib/components/site/Shell.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	// The next query is forwarded to the action: the post-login redirect uses it.
	const next = $derived(page.url.searchParams.get('next'));
	const action = $derived(next ? `?/google&next=${encodeURIComponent(next)}` : '?/google');
</script>

<svelte:head><title>Sign in — Valentino Mettifogo</title></svelte:head>

<Shell>
	<div class="border-b-3 border-line px-6 py-10">
		<p class="m-0 font-mono text-meta text-red uppercase">Restricted area</p>
		<h1 class="mt-3 mb-0 text-display uppercase">Sign<span class="text-red">&nbsp;in</span></h1>
	</div>

	<div class="flex flex-col gap-5 px-6 py-6">
		<p class="m-0 max-w-[58ch] text-base">
			Sign in with a company Google account. The panel is restricted: any other account
			lands on an error page.
		</p>

		<form method="POST" {action}>
			<button
				type="submit"
				class="cursor-pointer border-0 bg-ink px-3.5 py-2 font-mono text-xs font-bold text-bg uppercase hover:bg-red"
			>
				Continue with Google
			</button>
		</form>

		{#if form?.message}
			<p class="m-0 font-mono text-xs text-red uppercase">{form.message}</p>
		{/if}

		<a href="/" class="font-mono text-xs font-bold uppercase hover:text-red">← Home</a>
	</div>
</Shell>
