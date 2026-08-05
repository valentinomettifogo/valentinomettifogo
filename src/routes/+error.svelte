<script lang="ts">
	import { page } from '$app/state';

	let message = $derived(page.status === 404 ? 'Page not found' : 'Something went wrong');
</script>

<svelte:head>
	<title>{page.status} — Valentino Mettifogo</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-6 py-16 sm:py-24">
	<span class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
		<span class="h-1.5 w-1.5 rounded-full bg-accent-red"></span>
		Error {page.status}
	</span>

	<h1 class="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
		{message}
	</h1>

	<p class="mt-3 text-ink-muted">
		{page.error?.message ?? 'Please try again, or head back to the homepage.'}
	</p>

	<a href="/" class="mt-6 inline-block text-sm font-medium text-accent-green hover:underline">
		&larr; Back home
	</a>
</main>
