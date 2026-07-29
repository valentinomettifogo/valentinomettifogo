<script lang="ts">
	let { user }: { user: { id: string; email: string | null } | null } = $props();
</script>

<header class="border-b border-neutral-200">
	<nav class="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
		<a href="/" class="text-sm font-semibold text-neutral-900">Side Quest</a>

		<div class="flex items-center gap-3 text-sm">
			{#if user}
				<a
					href="/portal"
					class="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
				>
					Portal
				</a>
				<form method="POST" action="/auth/logout">
					<button
						type="submit"
						class="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
					>
						Log out
					</button>
				</form>
			{:else}
				<a
					href="/auth/login"
					class="inline-flex items-center rounded-md bg-teal-600 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-teal-700"
				>
					Sign in with Google
				</a>
			{/if}
		</div>
	</nav>
</header>
