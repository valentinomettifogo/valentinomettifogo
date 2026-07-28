<script lang="ts">
	import { longDate } from '$lib/data/posts';
	import { site } from '$lib/data/site';

	let { updated }: { updated?: string } = $props();
</script>

<footer
	class="mt-auto flex flex-col gap-1.5 border-t-3 border-line px-6 py-5 font-mono text-meta uppercase sm:flex-row sm:justify-between"
>
	<span>
		{#if updated}
			last updated — {longDate(updated)}
		{/if}
	</span>

	<a href="mailto:{site.email}" class="text-ink no-underline hover:text-red">{site.email}</a>
</footer>
