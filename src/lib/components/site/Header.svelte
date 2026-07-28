<script lang="ts">
	import { site } from '$lib/data/site';
</script>

<header class="grid gap-4 border-b-3 border-line px-6 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
	<h1 class="m-0 text-display uppercase">
		{site.nameLead}<br />{site.nameRest}<span class="text-red">{site.nameAccent}</span>
	</h1>

	<div class="font-mono text-meta uppercase sm:text-right">
		{#each site.role as line (line)}
			{line}<br />
		{/each}
	</div>
</header>
