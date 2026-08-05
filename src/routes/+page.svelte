<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import PostList from '$lib/components/PostList.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data }: { data: PageData } = $props();
	let ogImage = $derived(`${page.url.origin}/og-image.png`);
</script>

<Seo
	title="Valentino Mettifogo"
	description="Personal feed of small projects and experiments."
	url={page.url.origin}
	image={ogImage}
/>

<svelte:head>
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Valentino Mettifogo',
			url: page.url.origin
		})}
	</script>
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
	<PostList posts={data.posts} />
</main>
<Footer />
