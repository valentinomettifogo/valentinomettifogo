<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import Seo from '$lib/components/Seo.svelte';

	let { data }: { data: PageData } = $props();
	let post = $derived(data.post);
	let canonicalUrl = $derived(`${page.url.origin}/posts/${post.id}`);
	let ogImage = $derived(`${page.url.origin}/og-image.png`);
</script>

<Seo
	title="{post.title} — Valentino Mettifogo"
	description={post.excerpt}
	url={canonicalUrl}
	image={ogImage}
	type="article"
/>

<svelte:head>
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: post.title,
			datePublished: post.date,
			description: post.excerpt,
			url: canonicalUrl,
			author: { '@type': 'Person', name: 'Valentino Mettifogo' }
		})}
	</script>
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
	<a href="/" class="text-sm font-medium text-accent-green hover:underline">&larr; All posts</a>

	<article class="group mt-8">
		<span
			class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-muted"
		>
			<span class="h-1.5 w-1.5 rounded-full bg-accent-red"></span>
			{post.date}
		</span>

		<h1
			class="mt-2 font-display text-4xl font-bold tracking-tight text-ink underline decoration-accent-green decoration-4 underline-offset-4 sm:text-5xl"
		>
			{post.title}
		</h1>

		<div
			class="prose prose-neutral mt-3 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-ink prose-a:text-accent-green prose-a:no-underline hover:prose-a:underline prose-strong:text-ink"
		>
			{@html post.html}
		</div>
	</article>
</main>
