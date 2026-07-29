<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PostList from '$lib/components/PostList.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Valentino Mettifogo</title>
	<meta name="description" content="Personal feed of small projects and experiments." />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16 sm:py-24 md:grid md:grid-cols-[16rem_1fr] md:gap-12">
	<aside class="md:sticky md:top-16 md:self-start">
		<PageHeader />
	</aside>
	<PostList posts={data.posts} />
</main>
