<script lang="ts">
	// POST and never GET: a prefetcher hitting a logout link would sign the user out.
	let { label = 'Sign out' }: { label?: string } = $props();
</script>

<form method="POST" action="/auth/signout">
	<button
		type="submit"
		class="cursor-pointer border border-line bg-transparent px-3.5 py-2 font-mono text-xs font-bold uppercase hover:bg-ink hover:text-bg"
	>
		{label}
	</button>
</form>
