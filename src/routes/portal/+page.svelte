<script lang="ts">
	import TenantForm from '$lib/components/alerts/TenantForm.svelte';
	import TenantTable from '$lib/components/alerts/TenantTable.svelte';
	import type { TenantView } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state<TenantView | null>(null);
</script>

<svelte:head>
	<title>Qlik alerts — Side Quest</title>
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-12">
	<h1 class="text-2xl font-semibold tracking-tight text-neutral-900">Qlik alerts</h1>
	<p class="mt-2 max-w-2xl text-sm text-neutral-600">
		Qlik Cloud tenants mapped to the webhook at <code class="font-mono text-xs">/api/webhooks/qlik</code
		>. When a reload fails, the server resolves the app and space names with the tenant's API key and
		sends the alert to Google Chat. If the key is missing or expired the alert still goes out, with
		the raw app ID.
	</p>

	{#if form?.message}
		<p class="mt-6 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700">
			{form.message}
		</p>
	{/if}

	<section class="mt-8">
		<TenantTable tenants={data.tenants} onEdit={data.canEdit ? (t) => (editing = t) : undefined} />
	</section>

	{#if data.canEdit}
		<section class="mt-10 rounded-md border border-neutral-200 p-6">
			<h2 class="mb-5 text-sm font-semibold text-neutral-900">
				{editing ? `Edit ${editing.client}` : 'New tenant'}
			</h2>
			<!-- The key remounts the form when the row changes, so fields do not carry over
			     values from the previously edited tenant. -->
			{#key editing?.id ?? 'new'}
				<TenantForm {editing} onDone={() => (editing = null)} />
			{/key}
		</section>
	{:else}
		<!-- Cosmetic: the actions in +page.server.ts refuse non-admins regardless. -->
		<p class="mt-8 text-sm text-neutral-500">
			Read-only. Adding or editing a tenant requires the <code class="font-mono text-xs">admin</code
			> role.
		</p>
	{/if}
</main>
