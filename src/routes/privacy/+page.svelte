<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { page } from '$app/state';

	const CONTACT_EMAIL = 'valentino.mettifogo@gmail.com';

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
	<p class="mt-3 text-ink-muted">Last updated: 12 October 2026.</p>

	<div class="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-ink prose-a:text-accent-green prose-a:no-underline hover:prose-a:underline prose-strong:text-ink">
		<p>This is a personal site. It collects as little as it can get away with.</p>

		<h2>Who is responsible</h2>
		<p>
			The data controller is Valentino Mettifogo, reachable at
			<a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
		</p>

		<h2>Reading the site</h2>
		<p>
			You can read every post without an account. Like any web server, the hosting provider
			processes your IP address and browser details to deliver the page and keep the site
			secure, and keeps them briefly in technical logs. Fonts are served from this site, not
			from Google.
		</p>
		<p>
			Page views are counted with <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noreferrer">Vercel Analytics</a>,
			which sets no cookies and doesn't track individuals across sites: visitors are told apart
			by a hash that resets every 24 hours.
		</p>
		<p>
			A post may include an image hosted on another website. When it does, your browser loads
			it from that website, which then sees your IP address.
		</p>

		<h2>Signing in</h2>
		<p>
			Signing in uses Google, via Supabase Auth. Google shares your email address, name and
			profile picture; the site stores them with your account, along with a role that decides
			what you're allowed to do: write posts, manage the Qlik tenant list, or assign roles. If
			you write posts, they are stored with your account too. No password is ever seen or
			stored here.
		</p>
		<p>
			Signing in sets a session cookie. It is strictly necessary for staying signed in, so it
			needs no consent, and it is the only cookie this site sets.
		</p>

		<h2>Why, and on what basis</h2>
		<ul>
			<li>
				<strong>Your account</strong>: to provide the sign-in and the features you use
				(Art. 6(1)(b) GDPR).
			</li>
			<li>
				<strong>Technical logs and page-view counts</strong>: the legitimate interest in running
				a secure site and knowing which posts are read (Art. 6(1)(f) GDPR).
			</li>
		</ul>

		<h2>Who processes it</h2>
		<ul>
			<li><strong>Vercel</strong>: hosting and analytics, based in the United States.</li>
			<li><strong>Supabase</strong>: database and sign-in, with data stored in the EU.</li>
			<li><strong>Google</strong>: sign-in, when you choose it, based in the United States.</li>
		</ul>
		<p>
			Transfers to the United States rely on the EU-US Data Privacy Framework and the European
			Commission's Standard Contractual Clauses. Nothing is sold or shared for advertising, and
			there are no ads.
		</p>

		<h2>How long it's kept</h2>
		<p>
			Account data is kept until you ask for the account to be deleted. Posts are kept until
			their author or an admin deletes them. Technical logs are kept only as long as the
			hosting provider's retention period.
		</p>

		<h2>Your rights</h2>
		<p>
			You can ask to access, correct, export or delete your data, to restrict its processing,
			or object to it, by writing to <a href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>.
			You can also lodge a complaint with the Italian data protection authority, the
			<a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer">Garante per la protezione dei dati personali</a>,
			or with the authority where you live.
		</p>
	</div>
</main>
