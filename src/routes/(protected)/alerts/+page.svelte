<script lang="ts">
	import TenantForm from '$lib/components/alerts/TenantForm.svelte';
	import TenantTable from '$lib/components/alerts/TenantTable.svelte';
	import Shell from '$lib/components/site/Shell.svelte';
	import SignOutButton from '$lib/components/ui/SignOutButton.svelte';
	import type { TenantView } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state<TenantView | null>(null);
</script>

<svelte:head><title>Qlik alerts — Valentino Mettifogo</title></svelte:head>

<Shell>
	<header class="grid gap-4 border-b-3 border-line px-6 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
		<div>
			<p class="m-0 font-mono text-meta text-red uppercase">Panel</p>
			<h1 class="mt-3 mb-0 text-display uppercase">Alert<span class="text-red">s</span></h1>
		</div>

		<div class="flex flex-col items-start gap-3 sm:items-end">
			<span class="font-mono text-meta uppercase">{data.email}</span>
			<SignOutButton />
		</div>
	</header>

	<div class="border-b-3 border-line px-6 py-5">
		<p class="m-0 max-w-[58ch] text-base">
			Qlik Cloud tenants mapped to the webhook. When a reload fails, the server resolves
			the app and space names with the tenant's API key and sends the alert to Google Chat.
		</p>
	</div>

	{#if form?.message}
		<p class="m-0 border-b-3 border-line px-6 py-3 font-mono text-xs uppercase">
			{form.message}
		</p>
	{/if}

	<TenantTable tenants={data.tenants} onEdit={(t) => (editing = t)} />

	<div class="border-t-3 border-line">
		<h2 class="mt-0 mb-0 border-b-3 border-line px-6 py-4 text-entry uppercase">
			{editing ? `Edit ${editing.client}` : 'New tenant'}
		</h2>

		<!-- The key remounts the form when the row changes, so fields do not carry over
		     values from the previously edited tenant. -->
		{#key editing?.id ?? 'new'}
			<TenantForm {editing} onDone={() => (editing = null)} />
		{/key}
	</div>

	<footer class="mt-auto border-t-3 border-line px-6 py-5 font-mono text-meta uppercase">
		<a href="/" class="text-ink no-underline hover:text-red">← Home</a>
	</footer>
</Shell>
