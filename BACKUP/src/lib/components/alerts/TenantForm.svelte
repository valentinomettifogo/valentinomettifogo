<script lang="ts">
	import { enhance } from '$app/forms';
	import type { TenantView } from '$lib/types';

	type Props = {
		/** null = create form. */
		editing: TenantView | null;
		onDone: () => void;
	};

	let { editing, onDone }: Props = $props();

	const field =
		'w-full border border-line bg-transparent px-3 py-2 font-mono text-xs focus:outline-none';
	const label = 'block font-mono text-[11px] font-bold uppercase mb-1.5';
	const hint = 'mt-1.5 mb-0 text-xs opacity-60';
	const clear = 'flex items-center gap-2 mt-1.5 font-mono text-[11px] uppercase';
</script>

<form
	method="POST"
	action="?/saveTenant"
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
		<label class={label} for="client">Client</label>
		<input
			id="client"
			name="client"
			class={field}
			value={editing?.client ?? ''}
			placeholder="Argea"
			required
		/>
		<!-- ?cliente= is the real query parameter already configured on the Qlik
		     tenants, so it stays spelled that way. -->
		<p class={hint}>Becomes the slug of ?cliente= in the webhook URL.</p>
	</div>

	<div>
		<label class={label} for="host">Tenant host</label>
		<input
			id="host"
			name="host"
			class={field}
			value={editing?.host ?? ''}
			placeholder="argea.eu.qlikcloud.com"
			required
		/>
	</div>

	<div>
		<label class={label} for="apiKey">Qlik API key</label>
		<input
			id="apiKey"
			name="apiKey"
			type="password"
			class={field}
			autocomplete="off"
			placeholder={editing?.hasApiKey ? editing.apiKeyMasked : 'eyJhbGciOi…'}
		/>
		<p class={hint}>Write-only: blank leaves the existing one untouched.</p>
		{#if editing?.hasApiKey}
			<label class={clear}>
				<input type="checkbox" name="clear_apiKey" class="size-4" /> Remove the key
			</label>
		{/if}
	</div>

	<div class="sm:col-span-2">
		<label class={label} for="note">Notes</label>
		<input id="note" name="note" class={field} value={editing?.note ?? ''} />
	</div>

	<label class="flex items-center gap-2 font-mono text-[11px] uppercase">
		<input type="checkbox" name="active" checked={editing?.active ?? true} class="size-4" />
		Active
	</label>

	<div class="flex flex-wrap items-center justify-end gap-3">
		{#if editing}
			<!-- formnovalidate: deleting must not trip over the required fields. -->
			<button
				type="submit"
				formaction="?/deleteTenant"
				formnovalidate
				class="cursor-pointer border border-red bg-transparent px-3 py-2 font-mono text-[11px] font-bold text-red uppercase hover:bg-red hover:text-bg"
			>
				Delete
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
			{editing ? 'Save changes' : 'Add tenant'}
		</button>
	</div>
</form>
