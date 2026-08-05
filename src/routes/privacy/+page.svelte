<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { page } from '$app/state';

	let ogImage = $derived(`${page.url.origin}/og-image.png`);
</script>

<Seo
	title="Privacy — Valentino Mettifogo"
	description="What data this site collects and why."
	url="{page.url.origin}/privacy"
	image={ogImage}
/>

<main class="mx-auto max-w-2xl px-6 py-16 sm:py-24">
	<h1 class="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Privacy</h1>
	<p class="mt-3 text-ink-muted">Last updated: 5 August 2026.</p>

	<div class="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-ink prose-a:text-accent-green prose-a:no-underline hover:prose-a:underline prose-strong:text-ink">
		<p>This is a personal site. It collects as little as it can get away with.</p>

		<h2>Sign-in</h2>
		<p>
			Signing in uses Google, via Supabase Auth. That sets a session cookie so the site can
			tell who's signed in and check what they're allowed to do — write a post, manage the
			Qlik tenant list, or assign a role — depending on the role attached to the account. No
			password is ever seen or stored here; Google handles authentication.
		</p>

		<h2>Analytics</h2>
		<p>
			Page views are counted with <a href="https://vercel.com/analytics" target="_blank" rel="noreferrer">Vercel Analytics</a>,
			which is cookieless and doesn't track individuals across sites.
		</p>

		<h2>What isn't here</h2>
		<p>No ads, no third-party trackers, no data sold or shared with anyone.</p>

		<h2>Questions</h2>
		<p>
			Reach out at <a href="mailto:valentino.mettifogo@gmail.com">valentino.mettifogo@gmail.com</a>
			for anything about your data — including deleting your account.
		</p>
	</div>
</main>
