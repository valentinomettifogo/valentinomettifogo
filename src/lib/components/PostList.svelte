<script lang="ts">
	import type { Post } from '$lib/types';
	import PostCard from './PostCard.svelte';

	let { posts }: { posts: Post[] } = $props();
</script>

{#if posts.length === 0}
	<p class="py-8 text-ink-muted">No posts yet.</p>
{:else}
	<ul class="divide-y divide-line">
		{#each posts as post (post.id)}
			<li class="py-10 first:pt-0">
				<PostCard {post} />
			</li>
		{/each}
	</ul>
{/if}
