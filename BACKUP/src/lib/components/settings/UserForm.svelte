<script lang="ts">
	import { enhance } from '$app/forms';
	import type { AppUserView, Role } from '$lib/types';

	type Props = {
		/** null = create form. */
		editing: AppUserView | null;
		onDone: () => void;
	};

	let { editing, onDone }: Props = $props();

	const field =
		'w-full border border-line bg-transparent px-3 py-2 font-mono text-xs focus:outline-none';
	const label = 'block font-mono text-[11px] font-bold uppercase mb-1.5';

	const roles: Role[] = ['none', 'analyzer', 'admin'];
</script>

<form
	method="POST"
	action="?/saveUser"
	use:enhance={() =>
		async ({ update }) => {
			await update();
			onDone();
		}}
	class="grid gap-4 px-6 py-6 sm:grid-cols-2"
>
	{#if editing}
		<input type="hidden" name="id" value={editing.id} />
	{/if}

	<div>
		<label class={label} for="email">Email</label>
		<input
			id="email"
			name="email"
			type="email"
			class={field}
			value={editing?.email ?? ''}
			placeholder="name@example.com"
			required
		/>
	</div>

	<div>
		<label class={label} for="role">Role</label>
		<select id="role" name="role" class={field} value={editing?.role ?? 'analyzer'}>
			{#each roles as role (role)}
				<option value={role}>{role}</option>
			{/each}
		</select>
	</div>

	<div class="flex flex-wrap items-center justify-end gap-3 sm:col-span-2">
		{#if editing}
			<!-- formnovalidate: removing must not trip over the required email field. -->
			<button
				type="submit"
				formaction="?/deleteUser"
				formnovalidate
				class="cursor-pointer border border-red bg-transparent px-3 py-2 font-mono text-[11px] font-bold text-red uppercase hover:bg-red hover:text-bg"
			>
				Remove
			</button>
			<button
				type="button"
				onclick={onDone}
				class="cursor-pointer border-0 bg-transparent font-mono text-[11px] font-bold uppercase hover:opacity-60"
			>
				Cancel
			</button>
		{/if}

		<button
			type="submit"
			class="cursor-pointer border-0 bg-ink px-3.5 py-2 font-mono text-xs font-bold text-bg uppercase hover:bg-teal"
		>
			{editing ? 'Save changes' : 'Grant role'}
		</button>
	</div>
</form>
