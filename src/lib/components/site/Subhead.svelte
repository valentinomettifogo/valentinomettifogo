<script lang="ts">
	import { site } from '$lib/data/site';

	const [lead, ...rest] = site.tags;
</script>

<div class="grid gap-5 border-b-3 border-line px-6 py-5.5 sm:grid-cols-2">
	<p class="m-0 max-w-[40ch] text-[17px] font-medium">{site.tagline}</p>

	<div class="font-mono text-xs uppercase sm:self-end sm:text-right">
		<b class="text-red">{lead}</b>{#each rest as tag (tag)}&nbsp;— {tag}{/each}
	</div>
</div>
