<script lang="ts">
	import type { Post } from '$lib/types';

	let { post }: { post: Post } = $props();
</script>

<article class="group">
	<span
		class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-muted"
	>
		<span class="h-1.5 w-1.5 rounded-full bg-accent-red"></span>
		{post.date}
	</span>

	<h2 class="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
		<a
			href="/posts/{post.id}"
			class="text-ink underline decoration-accent-green decoration-4 underline-offset-4"
		>
			{post.title}
		</a>
	</h2>

	<div
		class="prose prose-neutral mt-3 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-ink prose-a:text-accent-green prose-a:no-underline hover:prose-a:underline prose-strong:text-ink"
	>
		{@html post.html}
	</div>
</article>
