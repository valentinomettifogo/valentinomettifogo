<script lang="ts">
	import type { Role } from '$lib/types';
	import { page } from '$app/state';

	let {
		user,
		role
	}: { user: { id: string; email: string | null } | null; role: Role | null } = $props();

	let menuOpen = $state(false);
	let menuEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (menuOpen) menuEl?.showModal();
		else menuEl?.close();
	});

	function closeMenu() {
		menuOpen = false;
	}

	// Cosmetic only: each page enforces the same rule server-side in its load and in
	// every action. Hiding a link just avoids sending people to a 403.
	const canSeePortal = $derived(role === 'analytics' || role === 'admin');
	const canSeeAdmin = $derived(role === 'admin');
	const canSeeWrite = $derived(role === 'author' || role === 'admin');

	/** `lg` widens padding/text for comfortable touch targets in the mobile menu overlay. */
	function sizing(size: 'sm' | 'lg') {
		return size === 'lg' ? 'block w-full px-3 py-3 text-base' : 'px-2 py-1';
	}

	/** A navigable page: boxed in solid green when it's the current route, underlined otherwise. */
	function pageLink(href: string, size: 'sm' | 'lg' = 'sm') {
		return page.url.pathname === href
			? `rounded bg-accent-green font-medium text-paper ${sizing(size)}`
			: `rounded font-medium text-ink-muted underline decoration-2 decoration-ink-muted/40 underline-offset-4 transition-colors hover:text-ink hover:decoration-accent-green ${sizing(size)}`;
	}

	// Sign in / log out are one-off actions, not pages you land on — underlined like the
	// others, but their hover state is a filled box rather than the active-page treatment.
	function actionLink(size: 'sm' | 'lg' = 'sm', danger = false) {
		const hoverBg = danger ? 'hover:bg-accent-red' : 'hover:bg-accent-green';
		return `rounded font-medium text-ink-muted underline decoration-2 decoration-ink-muted/40 underline-offset-4 transition-colors ${hoverBg} hover:text-paper hover:no-underline ${sizing(size)}`;
	}
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
			<button type="submit" class={actionLink('sm', true)}>Log out</button>
		</form>
	{:else}
		<a href="/auth/login" class={actionLink()}>Sign in</a>
	{/if}
</nav>

<!-- Mobile/tablet fallback: a plain horizontal header, since a fixed vertical rail doesn't
     leave enough width for content below the xl breakpoint. A hamburger opens a full-screen
     overlay instead of squeezing every link into the header row. -->
<header class="border-b border-line xl:hidden">
	<div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
		<a href="/" class="font-display text-lg font-bold tracking-wide text-ink">
			Valentino Mettifo<span class="text-accent-green">go</span>
		</a>

		<button
			type="button"
			aria-label="Apri menu"
			aria-expanded={menuOpen}
			aria-controls="mobile-menu"
			onclick={() => (menuOpen = true)}
			class="text-xl text-ink-muted hover:text-ink"
		>
			☰
		</button>
	</div>
</header>

<dialog
	id="mobile-menu"
	bind:this={menuEl}
	onclose={closeMenu}
	onclick={(e) => {
		if (e.target === menuEl) menuEl?.close();
	}}
	class="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-paper p-6 backdrop:bg-ink/40"
>
	<div class="flex items-center justify-between">
		<span class="font-display text-lg font-bold text-ink">Menu</span>
		<button
			type="button"
			aria-label="Chiudi menu"
			onclick={() => menuEl?.close()}
			class="text-xl text-ink-muted hover:text-ink"
		>
			✕
		</button>
	</div>

	<nav class="mt-10 flex flex-col items-start gap-2 text-base">
		<a href="/" class={pageLink('/', 'lg')} onclick={closeMenu}>Home</a>
		{#if user}
			{#if canSeeWrite}
				<a href="/write" class={pageLink('/write', 'lg')} onclick={closeMenu}>Write</a>
			{/if}
			{#if canSeePortal}
				<a href="/portal" class={pageLink('/portal', 'lg')} onclick={closeMenu}>Portal</a>
			{/if}
			{#if canSeeAdmin}
				<a href="/admin" class={pageLink('/admin', 'lg')} onclick={closeMenu}>Users</a>
			{/if}
			<form method="POST" action="/auth/logout" class="w-full">
				<button type="submit" class={actionLink('lg', true)} onclick={closeMenu}>Log out</button>
			</form>
		{:else}
			<a href="/auth/login" class={actionLink('lg')} onclick={closeMenu}>Sign in</a>
		{/if}
	</nav>
</dialog>

<style>
	/* Fade + slide for the native dialog's open/close, since showModal()/close() otherwise
	   toggle it instantly. @starting-style covers the entry transition (from display: none),
	   allow-discrete covers the exit one (back to display: none). */
	dialog#mobile-menu {
		opacity: 0;
		transform: translateY(-0.75rem);
		transition:
			opacity 200ms ease,
			transform 200ms ease,
			overlay 200ms ease allow-discrete,
			display 200ms ease allow-discrete;
	}

	dialog#mobile-menu[open] {
		opacity: 1;
		transform: translateY(0);
	}

	@starting-style {
		dialog#mobile-menu[open] {
			opacity: 0;
			transform: translateY(-0.75rem);
		}
	}

	dialog#mobile-menu::backdrop {
		opacity: 0;
		transition:
			opacity 200ms ease,
			overlay 200ms ease allow-discrete,
			display 200ms ease allow-discrete;
	}

	dialog#mobile-menu[open]::backdrop {
		opacity: 1;
	}

	@starting-style {
		dialog#mobile-menu[open]::backdrop {
			opacity: 0;
		}
	}
</style>
