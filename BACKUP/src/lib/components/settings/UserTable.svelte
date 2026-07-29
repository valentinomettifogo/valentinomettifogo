<script lang="ts">
	import type { AppUserView } from '$lib/types';

	type Props = {
		users: AppUserView[];
		onEdit: (user: AppUserView) => void;
	};

	let { users, onEdit }: Props = $props();
</script>

<div class="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
	<span class="font-mono text-meta uppercase">
		{users.length} {users.length === 1 ? 'user' : 'users'}
	</span>
</div>

{#if users.length === 0}
	<p class="m-0 px-6 py-8 font-mono text-xs uppercase opacity-60">
		No users yet. Grant a role below.
	</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full min-w-120 border-collapse text-left">
			<thead>
				<tr class="border-b border-line font-mono text-[11px] uppercase">
					<th class="px-6 py-3 font-bold">Email</th>
					<th class="px-3 py-3 font-bold">Role</th>
					<th class="px-6 py-3 font-bold"></th>
				</tr>
			</thead>

			<tbody>
				{#each users as user (user.id)}
					<tr class="border-b border-line last:border-b-0">
						<td class="px-6 py-3">
							<span class="font-bold">{user.email}</span>
							{#if !user.linked}
								<div class="font-mono text-[11px] opacity-60">not signed in yet</div>
							{/if}
						</td>
						<td class="px-3 py-3 font-mono text-[11px] uppercase">{user.role}</td>
						<td class="px-6 py-3">
							<div class="flex justify-end gap-2">
								<button
									type="button"
									onclick={() => onEdit(user)}
									class="cursor-pointer border border-line bg-transparent px-2.5 py-1 font-mono text-[11px] font-bold uppercase hover:bg-ink hover:text-bg"
								>
									Edit
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
