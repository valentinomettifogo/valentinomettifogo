<script lang="ts">
	import { enhance } from '$app/forms';
	import { ROLES } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	/** Rows being saved, so the select can be disabled while in flight. */
	let saving = $state<Record<string, boolean>>({});

	const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' });

	// Submitting on change keeps the row to one control: no select + Save pair to
	// leave half-used. The <noscript> fallback below covers JS being off.
	function submitOnChange(event: Event) {
		(event.currentTarget as HTMLSelectElement).form?.requestSubmit();
	}
</script>

<svelte:head>
	<title>Users — Side Quest</title>
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-12">
	<h1 class="text-2xl font-semibold tracking-tight text-neutral-900">Users</h1>
	<p class="mt-2 max-w-2xl text-sm text-neutral-600">
		Everyone who has signed in at least once. A row appears here automatically on first
		sign-in, with the <code class="font-mono text-xs">user</code> role.
	</p>

	<dl class="mt-6 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-md border border-neutral-200 p-3">
			<dt class="font-medium text-neutral-900">user</dt>
			<dd class="mt-1 text-neutral-600">The public site only.</dd>
		</div>
		<div class="rounded-md border border-neutral-200 p-3">
			<dt class="font-medium text-neutral-900">author</dt>
			<dd class="mt-1 text-neutral-600">Also writes and publishes posts from /write.</dd>
		</div>
		<div class="rounded-md border border-neutral-200 p-3">
			<dt class="font-medium text-neutral-900">analytics</dt>
			<dd class="mt-1 text-neutral-600">Also reads /portal, without changing it.</dd>
		</div>
		<div class="rounded-md border border-neutral-200 p-3">
			<dt class="font-medium text-neutral-900">admin</dt>
			<dd class="mt-1 text-neutral-600">Also edits tenants, this page, and everyone's posts.</dd>
		</div>
	</dl>

	{#if form?.message}
		<p
			class="mt-6 rounded-md border px-4 py-2.5 text-sm"
			class:border-red-200={!form.success}
			class:bg-red-50={!form.success}
			class:text-red-700={!form.success}
			class:border-neutral-200={form.success}
			class:bg-neutral-50={form.success}
			class:text-neutral-700={form.success}
		>
			{form.message}
		</p>
	{/if}

	<div class="mt-8 overflow-x-auto rounded-md border border-neutral-200">
		<table class="w-full min-w-2xl border-collapse text-left text-sm">
			<thead class="bg-neutral-50 text-xs text-neutral-500">
				<tr>
					<th class="px-4 py-2.5 font-medium">Email</th>
					<th class="px-3 py-2.5 font-medium">Signed up</th>
					<th class="px-4 py-2.5 font-medium">Role</th>
				</tr>
			</thead>

			<tbody>
				{#each data.users as user (user.id)}
					<tr class="border-t border-neutral-200">
						<td class="px-4 py-3">
							<span class="text-neutral-900">{user.email ?? '—'}</span>
							{#if user.isSelf}
								<span class="ml-2 text-xs text-neutral-500">you</span>
							{/if}
						</td>

						<td class="px-3 py-3 text-xs text-neutral-600">
							{dateFormat.format(new Date(user.createdAt))}
						</td>

						<td class="px-4 py-3">
							{#if user.isSelf}
								<!-- Locked on purpose: the last admin demoting themselves would
								     leave no way back except the Supabase table editor. -->
								<span class="text-neutral-500" title="You cannot change your own role">
									{user.role}
								</span>
							{:else}
								<form
									method="POST"
									action="?/setRole"
									use:enhance={() => {
										saving[user.id] = true;
										return async ({ update }) => {
											await update({ reset: false });
											saving[user.id] = false;
										};
									}}
									class="flex items-center gap-2"
								>
									<input type="hidden" name="id" value={user.id} />
									<select
										name="role"
										value={user.role}
										onchange={submitOnChange}
										disabled={saving[user.id]}
										class="rounded-md border border-neutral-300 px-2 py-1 text-sm text-neutral-900 focus:border-teal-600 focus:outline-none disabled:opacity-50"
									>
										{#each ROLES as role (role)}
											<option value={role}>{role}</option>
										{/each}
									</select>
									<noscript>
										<button
											type="submit"
											class="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
										>
											Save
										</button>
									</noscript>
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
