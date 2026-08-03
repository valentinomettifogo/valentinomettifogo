<script lang="ts">
	import type { PageData } from './$types';
	import PostList from '$lib/components/PostList.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Valentino Mettifogo</title>
	<meta name="description" content="Personal feed of small projects and experiments." />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
	<PostList posts={data.posts} />
</main>
