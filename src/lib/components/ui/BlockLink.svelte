<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		href: string;
		external?: boolean;
		children: Snippet;
	};

	let { href, external = true, children }: Props = $props();
</script>

<a
	{href}
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
	class="inline-block bg-ink px-3.5 py-2 font-mono text-xs font-bold text-bg uppercase no-underline hover:bg-red"
>
	{@render children()}
</a>
