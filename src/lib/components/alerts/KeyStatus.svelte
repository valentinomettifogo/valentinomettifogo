<script lang="ts">
	import type { CheckState } from '$lib/types';

	let { check }: { check: CheckState } = $props();
</script>

{#if check.state === 'loading'}
	<span class="font-mono text-[11px] uppercase opacity-60">checking…</span>
{:else if check.state === 'done'}
	<span
		class="font-mono text-[11px] font-bold uppercase"
		class:text-red={!check.result.ok}
		title={check.result.code ? `HTTP ${check.result.code}` : undefined}
	>
		{check.result.ok ? '● ' : '× '}{check.result.message}
	</span>
{:else}
	<span class="font-mono text-[11px] uppercase opacity-40">—</span>
{/if}
