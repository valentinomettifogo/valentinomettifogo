<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { me } from '$lib/data/site';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-slate-50 pb-12 font-sans leading-loose text-slate-700 selection:bg-emerald-500 selection:text-white">
	<Navbar name={me.name} />
	{@render children()}
	<SiteFooter name={me.name} />
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
			sans-serif;
	}
</style>
