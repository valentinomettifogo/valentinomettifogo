<script lang="ts">
	import Shell from '$lib/components/site/Shell.svelte';
</script>

<svelte:head><title>Sign-in failed — Valentino Mettifogo</title></svelte:head>

<Shell>
	<div class="border-b border-line px-6 py-10">
		<p class="m-0 font-mono text-meta text-red uppercase">Authentication</p>
		<h1 class="mt-3 mb-0 text-display uppercase">Sign-in<br /><span class="text-red">failed</span></h1>
	</div>

	<div class="flex flex-col gap-5 px-6 py-6">
		<p class="m-0 max-w-[58ch] text-base">
			The exchange with Google did not go through. Trying again usually fixes it; if it
			keeps failing, the link may have expired or already been used.
		</p>

		<div class="flex flex-wrap items-center gap-3">
			<a
				href="/login"
				class="inline-block bg-ink px-3.5 py-2 font-mono text-xs font-bold text-bg uppercase no-underline hover:bg-teal"
			>
				Try again
			</a>
			<a href="/" class="font-mono text-xs font-bold uppercase hover:text-teal">← Home</a>
		</div>
	</div>
</Shell>
