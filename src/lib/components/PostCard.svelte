<script lang="ts">
	import type { Post } from '$lib/types';

	let { post }: { post: Post } = $props();
</script>

<article class="group">
	<span
		class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500"
	>
		<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
		{post.date}
	</span>

	<h2 class="mt-2 text-xl font-semibold text-neutral-900 group-hover:text-teal-700">
		{post.title}
	</h2>

	<div
		class="prose prose-neutral mt-2 max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-900"
	>
		{@html post.html}
	</div>
</article>
