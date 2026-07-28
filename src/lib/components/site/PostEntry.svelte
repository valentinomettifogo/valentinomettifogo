<script lang="ts">
	import BlockLink from '$lib/components/ui/BlockLink.svelte';
	import type { RenderedPost } from '$lib/types';

	let { post }: { post: RenderedPost } = $props();

	const num = $derived(String(post.number).padStart(2, '0'));
</script>

<article class="grid grid-cols-[44px_1fr] border-b-3 border-line last:border-b-0 sm:grid-cols-[90px_1fr]">
	<div
		class="rail flex items-start justify-center gap-2.5 border-r-3 border-line px-1.5 py-4 font-mono text-[11px] font-bold text-red sm:px-3 sm:py-6 sm:text-[13px]"
	>
		{num} / <time datetime={post.date}>{post.displayDate}</time>
	</div>

	<div class="px-4 pt-4.5 pb-5.5 sm:px-6 sm:pt-6 sm:pb-7">
		<h2 class="mt-0 mb-2.5 text-entry uppercase">{post.title}</h2>
		<p class="mt-0 mb-3.5 max-w-[58ch] text-base">{post.body}</p>

		{#if post.link}
			<BlockLink href={post.link}>{post.linkLabel ?? 'Open'}</BlockLink>
		{/if}
	</div>
</article>
