<script lang="ts">
	import type { Role } from '$lib/types';
	import { page } from '$app/state';

	let {
		user,
		role
	}: { user: { id: string; email: string | null } | null; role: Role | null } = $props();

	// Cosmetic only: each page enforces the same rule server-side in its load and in
	// every action. Hiding a link just avoids sending people to a 403.
	const canSeePortal = $derived(role === 'analytics' || role === 'admin');
	const canSeeAdmin = $derived(role === 'admin');
	const canSeeWrite = $derived(role === 'author' || role === 'admin');

	const activePage = 'rounded bg-accent-green px-2 py-1 font-medium text-paper';
	const inactivePage =
		'rounded px-2 py-1 font-medium text-ink-muted underline decoration-2 decoration-ink-muted/40 underline-offset-4 transition-colors hover:text-ink hover:decoration-accent-green';

	/** A navigable page: boxed in solid green when it's the current route, underlined otherwise. */
	function pageLink(href: string) {
		return page.url.pathname === href ? activePage : inactivePage;
	}

	// Sign in / log out are one-off actions, not pages you land on — underlined like the
	// others, but their hover state is a filled box rather than the active-page treatment.
	const actionLink =
		'rounded px-2 py-1 font-medium text-ink-muted underline decoration-2 decoration-ink-muted/40 underline-offset-4 transition-colors hover:bg-accent-green hover:text-paper hover:no-underline';
	const actionLinkDanger =
		'rounded px-2 py-1 font-medium text-ink-muted underline decoration-2 decoration-ink-muted/40 underline-offset-4 transition-colors hover:bg-accent-red hover:text-paper hover:no-underline';
</script>

<!-- Desktop top-right menu; see Sidebar.svelte for the fixed left rail. -->
<nav
	class="fixed top-0 right-0 z-20 hidden flex-col items-end gap-1 pt-10 pr-6 text-right text-sm xl:flex"
>
	<a href="/" class={pageLink('/')}>Home</a>
	{#if user}
		{#if canSeeWrite}
			<a href="/write" class={pageLink('/write')}>Write</a>
		{/if}
		{#if canSeePortal}
			<a href="/portal" class={pageLink('/portal')}>Portal</a>
		{/if}
		{#if canSeeAdmin}
			<a href="/admin" class={pageLink('/admin')}>Users</a>
		{/if}
		<form method="POST" action="/auth/logout">
			<button type="submit" class={actionLinkDanger}>Log out</button>
		</form>
	{:else}
		<a href="/auth/login" class={actionLink}>Sign in</a>
	{/if}
</nav>

<!-- Mobile/tablet fallback: a plain horizontal header, since a fixed vertical rail doesn't
     leave enough width for content below the xl breakpoint. -->
<header class="border-b border-line xl:hidden">
	<div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
		<a href="/" class="font-display text-lg font-bold tracking-wide text-ink">
			Valentino Mettifo<span class="text-accent-green">go</span>
		</a>

		<div class="flex items-center gap-1 text-sm">
			<a href="/" class={pageLink('/')}>Home</a>
			{#if user}
				{#if canSeePortal}
					<a href="/portal" class={pageLink('/portal')}>Portal</a>
				{/if}
				{#if canSeeAdmin}
					<a href="/admin" class={pageLink('/admin')}>Users</a>
				{/if}
				<form method="POST" action="/auth/logout">
					<button type="submit" class={actionLinkDanger}>Log out</button>
				</form>
			{:else}
				<a href="/auth/login" class={actionLink}>Sign in</a>
			{/if}
		</div>
	</div>
</header>
