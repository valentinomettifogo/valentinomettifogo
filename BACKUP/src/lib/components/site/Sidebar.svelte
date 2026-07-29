<script lang="ts">
	import { longDate } from '$lib/data/posts';
	import { site } from '$lib/data/site';

	let { updated }: { updated?: string } = $props();
</script>

<div class="border-b border-line md:border-r md:border-b-0">
	<div class="px-6 py-6.5 md:sticky md:top-0">
		<div class="mb-4.5 font-mono text-[10px] uppercase leading-relaxed text-muted">
			{#if updated}
				<b class="font-bold text-teal">rev.</b> {longDate(updated)}<br />
			{/if}
			<b class="font-bold text-teal">role.</b> {site.role[0]} / {site.role[1]}<br />
			<b class="font-bold text-teal">loc.</b> {site.role[2]}
		</div>

		<h1 class="m-0 mb-3 text-[22px] leading-tight font-semibold">
			{site.nameLead}{site.nameRest}<span class="text-teal">{site.nameAccent}</span>
		</h1>

		<p class="m-0 mb-4.5 max-w-[38ch] text-[13.5px] leading-relaxed text-ink/80">
			{site.tagline}
		</p>

		<div class="border-t border-line pt-3.5 font-mono text-[10.5px] text-muted">
			<div class="mb-1.5"><b class="font-bold text-green">stack</b> — {site.tags.join(' / ').toLowerCase()}</div>
			<div><b class="font-bold text-green">base</b> — {site.role[2].toLowerCase()}</div>
		</div>

		<footer class="mt-5 text-[10.5px]">
			<a href="mailto:{site.email}" class="text-muted no-underline hover:text-teal">{site.email}</a>
		</footer>
	</div>
</div>
