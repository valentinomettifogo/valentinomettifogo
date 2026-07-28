<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- The two vertical rules run the full height, hence min-h-dvh. -->
<div class="mx-auto flex min-h-dvh max-w-page flex-col border-x-3 border-line">
	{@render children()}
</div>
