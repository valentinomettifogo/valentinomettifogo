<script lang="ts">
	import Footer from '$lib/components/site/Footer.svelte';
	import Header from '$lib/components/site/Header.svelte';
	import PostEntry from '$lib/components/site/PostEntry.svelte';
	import Shell from '$lib/components/site/Shell.svelte';
	import Subhead from '$lib/components/site/Subhead.svelte';
	import { lastUpdated, posts } from '$lib/data/posts';
	import { site } from '$lib/data/site';
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<meta property="og:title" content={site.title} />
	<meta property="og:description" content={site.description} />
	<meta property="og:type" content="website" />
</svelte:head>

<Shell>
	<Header />
	<Subhead />

	<div>
		{#each posts as post (post.id)}
			<PostEntry {post} />
		{/each}
	</div>

	<Footer updated={lastUpdated} />
</Shell>
