<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div
	class="mx-auto flex min-h-dvh max-w-page flex-col border border-line bg-surface sm:my-10 sm:min-h-0 sm:rounded-2xl sm:shadow-sm"
>
	{@render children()}
</div>
