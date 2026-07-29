<script lang="ts">
	import TenantForm from '$lib/components/alerts/TenantForm.svelte';
	import TenantTable from '$lib/components/alerts/TenantTable.svelte';
	import ChatWebhookForm from '$lib/components/settings/ChatWebhookForm.svelte';
	import UserForm from '$lib/components/settings/UserForm.svelte';
	import UserTable from '$lib/components/settings/UserTable.svelte';
	import type { AppUserView, TenantView } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingTenant = $state<TenantView | null>(null);
	let editingUser = $state<AppUserView | null>(null);
</script>

<svelte:head><title>Alerts settings — Valentino Mettifogo</title></svelte:head>

<header class="border-b border-line px-6 py-10">
	<p class="m-0 font-mono text-meta text-teal uppercase">Panel</p>
	<h1 class="mt-3 mb-0 text-display uppercase">Settings</h1>
</header>

{#if form?.message}
	<p class="m-0 border-b border-line px-6 py-3 font-mono text-xs uppercase">{form.message}</p>
{/if}

<section>
	<h2 class="mt-0 mb-0 border-b border-line px-6 py-4 text-entry uppercase">Tenants</h2>

	<TenantTable tenants={data.tenants} onEdit={(t) => (editingTenant = t)} />

	<div class="border-t border-line">
		<h3 class="mt-0 mb-0 border-b border-line px-6 py-4 text-entry uppercase">
			{editingTenant ? `Edit ${editingTenant.client}` : 'New tenant'}
		</h3>
		<!-- The key remounts the form when the row changes, so fields do not carry over
		     values from the previously edited tenant. -->
		{#key editingTenant?.id ?? 'new'}
			<TenantForm editing={editingTenant} onDone={() => (editingTenant = null)} />
		{/key}
	</div>
</section>

<section class="border-t border-line">
	<h2 class="mt-0 mb-0 border-b border-line px-6 py-4 text-entry uppercase">Notifications</h2>
	<ChatWebhookForm hasWebhook={data.hasChatWebhook} masked={data.chatWebhookMasked} />
</section>

<section class="border-t border-line">
	<h2 class="mt-0 mb-0 border-b border-line px-6 py-4 text-entry uppercase">Users</h2>

	<UserTable users={data.appUsers} onEdit={(u) => (editingUser = u)} />

	<div class="border-t border-line">
		<h3 class="mt-0 mb-0 border-b border-line px-6 py-4 text-entry uppercase">
			{editingUser ? `Edit ${editingUser.email}` : 'Grant a role'}
		</h3>
		{#key editingUser?.id ?? 'new'}
			<UserForm editing={editingUser} onDone={() => (editingUser = null)} />
		{/key}
	</div>
</section>
