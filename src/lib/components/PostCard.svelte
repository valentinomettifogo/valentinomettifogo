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

	<p class="mt-2 leading-relaxed text-neutral-600">
		{post.body}
	</p>

	<a
		href={post.link}
		target="_blank"
		rel="noreferrer"
		class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-2"
	>
		{post.linkLabel}
		<span aria-hidden="true">→</span>
	</a>
</article>
