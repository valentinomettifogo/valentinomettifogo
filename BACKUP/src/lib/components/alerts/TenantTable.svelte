<script lang="ts">
	import type { CheckState, KeyCheck, TenantView } from '$lib/types';
	import KeyStatus from './KeyStatus.svelte';

	type Props = {
		tenants: TenantView[];
		/** Omitted on the read-only /alerts list: no Edit button rendered. */
		onEdit?: (tenant: TenantView) => void;
	};

	let { tenants, onEdit }: Props = $props();

	let checks = $state<Record<string, CheckState>>({});
	let verifyingAll = $state(false);

	const check = (id: string): CheckState => checks[id] ?? { state: 'idle' };

	async function verify(tenant: TenantView) {
		checks[tenant.id] = { state: 'loading' };
		try {
			const res = await fetch('/alerts/verify', {
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
</script>

<div class="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
	<span class="font-mono text-meta uppercase">
		{tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'} mapped
	</span>

	<button
		type="button"
		onclick={verifyAll}
		disabled={verifyingAll || tenants.length === 0}
		class="cursor-pointer border border-line bg-transparent px-3 py-1.5 font-mono text-[11px] font-bold uppercase hover:bg-ink hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
	>
		{verifyingAll ? 'Checking…' : 'Check all'}
	</button>
</div>

{#if tenants.length === 0}
	<p class="m-0 px-6 py-8 font-mono text-xs uppercase opacity-60">
		No tenants yet. Add one below.
	</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full min-w-180 border-collapse text-left">
			<thead>
				<tr class="border-b border-line font-mono text-[11px] uppercase">
					<th class="px-6 py-3 font-bold">Client</th>
					<th class="px-3 py-3 font-bold">Host</th>
					<th class="px-3 py-3 font-bold">Key</th>
					<th class="px-3 py-3 font-bold">Status</th>
					<th class="px-6 py-3 font-bold"></th>
				</tr>
			</thead>

			<tbody>
				{#each tenants as tenant (tenant.id)}
					<tr class="border-b border-line last:border-b-0" class:opacity-50={!tenant.active}>
						<td class="px-6 py-3">
							<span class="font-bold">{tenant.client}</span>
							{#if !tenant.active}
								<span class="ml-2 font-mono text-[11px] text-teal uppercase">inactive</span>
							{/if}
							<div class="font-mono text-[11px] opacity-60">?cliente={tenant.slug}</div>
						</td>

						<td class="px-3 py-3 font-mono text-[11px]">{tenant.host}</td>
						<td class="px-3 py-3 font-mono text-[11px]">{tenant.apiKeyMasked}</td>
						<td class="px-3 py-3"><KeyStatus check={check(tenant.id)} /></td>

						<td class="px-6 py-3">
							<div class="flex justify-end gap-2">
								<button
									type="button"
									onclick={() => verify(tenant)}
									disabled={check(tenant.id).state === 'loading'}
									class="cursor-pointer border border-line bg-transparent px-2.5 py-1 font-mono text-[11px] font-bold uppercase hover:bg-ink hover:text-bg disabled:opacity-40"
								>
									Check
								</button>
								{#if onEdit}
									<button
										type="button"
										onclick={() => onEdit(tenant)}
										class="cursor-pointer border border-line bg-transparent px-2.5 py-1 font-mono text-[11px] font-bold uppercase hover:bg-ink hover:text-bg"
									>
										Edit
									</button>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
