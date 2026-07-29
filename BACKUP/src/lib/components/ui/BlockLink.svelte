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
	class="border-b border-green/25 font-mono text-[11.5px] text-green no-underline before:content-['↳_'] hover:border-green"
>
	{@render children()}
</a>
