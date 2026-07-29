<script lang="ts">
	import type { CheckState } from '$lib/types';

	let { check }: { check: CheckState } = $props();
</script>

{#if check.state === 'loading'}
	<span class="text-xs text-neutral-400">Checking…</span>
{:else if check.state === 'done'}
	<span
		class="text-xs font-medium"
		class:text-red-600={!check.result.ok}
		class:text-teal-700={check.result.ok}
		title={check.result.code ? `HTTP ${check.result.code}` : undefined}
	>
		{check.result.ok ? '● ' : '× '}{check.result.message}
	</span>
{:else}
	<span class="text-xs text-neutral-300">—</span>
{/if}
