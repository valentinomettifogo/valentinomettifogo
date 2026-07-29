<script lang="ts">
	import TenantTable from '$lib/components/alerts/TenantTable.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Qlik alerts — Valentino Mettifogo</title></svelte:head>

<header class="border-b border-line px-6 py-10">
	<p class="m-0 font-mono text-meta text-teal uppercase">Panel</p>
	<h1 class="mt-3 mb-0 text-display uppercase">Alert<span class="text-teal">s</span></h1>
</header>

<div class="border-b border-line px-6 py-5">
	<p class="m-0 max-w-[58ch] text-base">
		Qlik Cloud tenants mapped to the webhook. When a reload fails, the server resolves
		the app and space names with the tenant's API key and sends the alert to Google Chat.
	</p>
</div>

<TenantTable tenants={data.tenants} />
