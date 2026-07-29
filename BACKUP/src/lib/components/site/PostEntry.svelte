<script lang="ts">
	import BlockLink from '$lib/components/ui/BlockLink.svelte';
	import type { RenderedPost } from '$lib/types';

	let { post }: { post: RenderedPost } = $props();

	const num = $derived(String(post.number).padStart(2, '0'));
</script>

<article
	class="grid grid-cols-1 gap-3 border-b border-line-soft px-6 py-5 last:border-b-0 even:bg-surface-alt md:grid-cols-[58px_1fr] md:gap-4"
>
	<div class="h-fit w-fit bg-teal-soft px-1.5 py-0.5 text-center font-mono text-[10.5px] font-bold text-teal">
		{num}
	</div>

	<div>
		<h2 class="mt-0 mb-1.5 text-[17px] font-semibold">{post.title}</h2>
		<div class="mb-2.5 font-mono text-[10.5px] text-muted">
			<time datetime={post.date}>{post.displayDate}</time>
		</div>
		<p class="mt-0 mb-2.5 max-w-[52ch] text-sm leading-relaxed text-ink/80">{post.body}</p>

		{#if post.link}
			<BlockLink href={post.link}>{post.linkLabel ?? 'Open'}</BlockLink>
		{/if}
	</div>
</article>
