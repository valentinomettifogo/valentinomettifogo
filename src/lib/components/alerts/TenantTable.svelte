<script lang="ts">
	import type { CheckState, KeyCheck, TenantView } from '$lib/types';
	import KeyStatus from './KeyStatus.svelte';

	type Props = {
		tenants: TenantView[];
		/** Omitted for read-only viewers: no Edit button is rendered at all. */
		onEdit?: (tenant: TenantView) => void;
	};

	let { tenants, onEdit }: Props = $props();

	let checks = $state<Record<string, CheckState>>({});
	let verifyingAll = $state(false);

	const check = (id: string): CheckState => checks[id] ?? { state: 'idle' };

	async function verify(tenant: TenantView) {
		checks[tenant.id] = { state: 'loading' };
		try {
			const res = await fetch('/portal/verify', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ id: tenant.id })
			});
			const result: KeyCheck = res.ok
				? await res.json()
				: { ok: false, code: res.status, message: 'Check failed' };
			checks[tenant.id] = { state: 'done', result };
		} catch {
			checks[tenant.id] = {
				state: 'done',
				result: { ok: false, code: 0, message: 'Network unavailable' }
			};
		}
	}

	async function verifyAll() {
		verifyingAll = true;
		// In parallel: slow tenants do not hold up the others.
		await Promise.all(tenants.map(verify));
		verifyingAll = false;
	}

	const rowButton =
		'inline-flex items-center rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40';
</script>

<div class="flex items-center justify-between gap-3 pb-3">
	<span class="text-sm text-neutral-600">
		{tenants.length}
		{tenants.length === 1 ? 'tenant' : 'tenants'} mapped
	</span>

	<button type="button" onclick={verifyAll} disabled={verifyingAll || tenants.length === 0} class={rowButton}>
		{verifyingAll ? 'Checking…' : 'Check all keys'}
	</button>
</div>

{#if tenants.length === 0}
	<p class="rounded-md border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
		No tenants yet. Add one below.
	</p>
{:else}
	<div class="overflow-x-auto rounded-md border border-neutral-200">
		<table class="w-full min-w-3xl border-collapse text-left text-sm">
			<thead class="bg-neutral-50 text-xs text-neutral-500">
				<tr>
					<th class="px-4 py-2.5 font-medium">Client</th>
					<th class="px-3 py-2.5 font-medium">Host</th>
					<th class="px-3 py-2.5 font-medium">Key</th>
					<th class="px-3 py-2.5 font-medium">Status</th>
					<th class="px-4 py-2.5"></th>
				</tr>
			</thead>

			<tbody>
				{#each tenants as tenant (tenant.id)}
					<tr class="border-t border-neutral-200" class:opacity-50={!tenant.active}>
						<td class="px-4 py-3">
							<span class="font-medium text-neutral-900">{tenant.client}</span>
							{#if !tenant.active}
								<span class="ml-2 text-xs text-neutral-500">inactive</span>
							{/if}
							<div class="font-mono text-xs text-neutral-500">?cliente={tenant.slug}</div>
						</td>

						<td class="px-3 py-3 font-mono text-xs text-neutral-600">{tenant.host}</td>
						<td class="px-3 py-3 font-mono text-xs text-neutral-600">{tenant.apiKeyMasked}</td>
						<td class="px-3 py-3"><KeyStatus check={check(tenant.id)} /></td>

						<td class="px-4 py-3">
							<div class="flex justify-end gap-2">
								<button
									type="button"
									onclick={() => verify(tenant)}
									disabled={check(tenant.id).state === 'loading'}
									class={rowButton}
								>
									Check
								</button>
								{#if onEdit}
									<button type="button" onclick={() => onEdit(tenant)} class={rowButton}>Edit</button>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
