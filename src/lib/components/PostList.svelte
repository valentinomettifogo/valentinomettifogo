<script lang="ts">
	import type { Post } from '$lib/types';
	import PostCard from './PostCard.svelte';

	let { posts }: { posts: Post[] } = $props();
</script>

{#if posts.length === 0}
	<p class="py-8 text-neutral-500">No posts yet.</p>
{:else}
	<ul class="divide-y divide-neutral-200">
		{#each posts as post (post.id)}
			<li class="py-8">
				<PostCard {post} />
			</li>
		{/each}
	</ul>
{/if}
