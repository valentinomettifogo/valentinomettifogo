<script lang="ts">
	import { longDate } from '$lib/data/posts';
	import { site } from '$lib/data/site';

	let { updated }: { updated?: string } = $props();
</script>

<footer
	class="mt-auto flex flex-col gap-1.5 border-t border-line px-6 py-5 font-mono text-meta text-muted uppercase sm:flex-row sm:justify-between"
>
	<span>
		{#if updated}
			last updated — {longDate(updated)}
		{/if}
	</span>

	<div class="flex items-center gap-3">
		<a href="/login" class="text-ink no-underline hover:text-green">sign in</a>
		<a href="mailto:{site.email}" class="text-ink no-underline hover:text-green">{site.email}</a>
	</div>
</footer>
