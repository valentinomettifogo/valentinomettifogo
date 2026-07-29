<script lang="ts">
	import { enhance } from '$app/forms';

	let { hasWebhook, masked }: { hasWebhook: boolean; masked: string } = $props();

	const field =
		'w-full border border-line bg-transparent px-3 py-2 font-mono text-xs focus:outline-none';
	const label = 'block font-mono text-[11px] font-bold uppercase mb-1.5';
	const hint = 'mt-1.5 mb-0 text-xs opacity-60';
	const clear = 'flex items-center gap-2 mt-1.5 font-mono text-[11px] uppercase';
</script>

<form method="POST" action="?/saveWebhook" use:enhance class="grid gap-4 px-6 py-6 sm:max-w-140">
	<div>
		<label class={label} for="webhookUrl">Google Chat webhook URL</label>
		<input
			id="webhookUrl"
			name="webhookUrl"
			type="password"
			class={field}
			autocomplete="off"
			placeholder={hasWebhook ? masked : 'https://chat.googleapis.com/v1/spaces/…'}
		/>
		<p class={hint}>
			Write-only: blank leaves the existing one untouched. Every tenant's alert is sent here.
		</p>
		{#if hasWebhook}
			<label class={clear}>
				<input type="checkbox" name="clear_webhookUrl" class="size-4" /> Remove the webhook
			</label>
		{/if}
	</div>

	<div class="flex justify-end">
		<button
			type="submit"
			class="cursor-pointer border-0 bg-ink px-3.5 py-2 font-mono text-xs font-bold text-bg uppercase hover:bg-teal"
		>
			Save
		</button>
	</div>
</form>
