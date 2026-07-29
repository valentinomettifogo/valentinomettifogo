<script lang="ts">
	import Footer from '$lib/components/site/Footer.svelte';
	import Navbar from '$lib/components/site/Navbar.svelte';
	import PostEntry from '$lib/components/site/PostEntry.svelte';
	import Shell from '$lib/components/site/Shell.svelte';
	import Sidebar from '$lib/components/site/Sidebar.svelte';
	import { lastUpdated, posts } from '$lib/data/posts';
	import { site } from '$lib/data/site';
	import type { Role } from '$lib/types';

	let navRole = $state<Role>('none');
	let navEmail = $state<string | null>(null);

	// The homepage is prerendered and reads no session server-side, so the static
	// markup always starts anonymous; role-aware nav links are filled in from a
	// best-effort client-side check after mount. $effect never runs during SSR,
	// so this never touches the prerendered output.
	$effect(() => {
		fetch('/api/session')
			.then((res) => (res.ok ? res.json() : null))
			.then((data: { role: Role; email: string | null } | null) => {
				if (!data) return;
				navRole = data.role;
				navEmail = data.email;
			})
			.catch(() => {});
	});
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<meta property="og:title" content={site.title} />
	<meta property="og:description" content={site.description} />
	<meta property="og:type" content="website" />
</svelte:head>

<Shell>
	<Navbar role={navRole} email={navEmail} />

	<div class="grid md:grid-cols-[300px_1fr]">
		<Sidebar updated={lastUpdated} />

		<div>
			<div
				class="flex items-center justify-between border-b border-line bg-surface-alt px-6 py-3 font-mono text-[10.5px] text-muted uppercase tracking-wide"
			>
				<span>log</span>
				<span class="font-bold text-teal">{posts.length} entries</span>
			</div>

			{#each posts as post (post.id)}
				<PostEntry {post} />
			{/each}
		</div>
	</div>

	<Footer updated={lastUpdated} />
</Shell>
