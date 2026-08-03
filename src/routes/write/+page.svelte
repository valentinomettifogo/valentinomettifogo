<script lang="ts">
	import PostForm from '$lib/components/PostForm.svelte';
	import type { PostRow } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state<PostRow | null>(null);
	let modalOpen = $state(false);
	let dialogEl: HTMLDialogElement | undefined = $state();

	function openNew(): void {
		editing = null;
		modalOpen = true;
	}

	function openEdit(post: PostRow): void {
		editing = post;
		modalOpen = true;
	}

	function closeModal(): void {
		modalOpen = false;
	}

	$effect(() => {
		if (modalOpen) {
			dialogEl?.showModal();
		} else {
			dialogEl?.close();
		}
	});

	const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' });
</script>

<svelte:head>
	<title>Write — Side Quest</title>
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-12">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight text-neutral-900">Write</h1>
			<p class="mt-2 max-w-2xl text-sm text-neutral-600">
				{#if data.isAdmin}
					Every draft and published post, from every author.
				{:else}
					Your drafts and published posts. Publishing makes a post visible on the homepage.
				{/if}
			</p>
		</div>

		<button
			type="button"
			onclick={openNew}
			class="inline-flex shrink-0 items-center rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
		>
			New post
		</button>
	</div>

	{#if form?.message}
		<p class="mt-6 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700">
			{form.message}
		</p>
	{/if}

	<div class="mt-8 overflow-x-auto rounded-md border border-neutral-200">
		<table class="w-full min-w-2xl border-collapse text-left text-sm">
			<thead class="bg-neutral-50 text-xs text-neutral-500">
				<tr>
					<th class="px-4 py-2.5 font-medium">Title</th>
					<th class="px-3 py-2.5 font-medium">Status</th>
					{#if data.isAdmin}
						<th class="px-3 py-2.5 font-medium">Author</th>
					{/if}
					<th class="px-3 py-2.5 font-medium">Updated</th>
					<th class="px-4 py-2.5 font-medium"></th>
				</tr>
			</thead>

			<tbody>
				{#each data.posts as post (post.id)}
					<tr class="border-t border-neutral-200">
						<td class="px-4 py-3 text-neutral-900">{post.title}</td>
						<td class="px-3 py-3">
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium"
								class:bg-teal-50={post.status === 'published'}
								class:text-teal-700={post.status === 'published'}
								class:bg-neutral-100={post.status === 'draft'}
								class:text-neutral-600={post.status === 'draft'}
							>
								{post.status}
							</span>
						</td>
						{#if data.isAdmin}
							<td class="px-3 py-3 text-xs text-neutral-600">
								{post.authorEmail ?? '—'}{post.isOwn ? ' (you)' : ''}
							</td>
						{/if}
						<td class="px-3 py-3 text-xs text-neutral-600">
							{dateFormat.format(new Date(post.updatedAt))}
						</td>
						<td class="px-4 py-3 text-right">
							<button
								type="button"
								onclick={() => openEdit(post)}
								class="text-xs font-medium text-teal-700 hover:text-teal-900"
							>
								Edit
							</button>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan={data.isAdmin ? 5 : 4} class="px-4 py-6 text-center text-neutral-500">
							No posts yet.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>

<dialog
	bind:this={dialogEl}
	onclose={closeModal}
	onclick={(e) => {
		if (e.target === dialogEl) dialogEl?.close();
	}}
	class="fixed inset-0 m-auto w-full max-w-3xl rounded-md border border-neutral-200 bg-white p-6 shadow-lg backdrop:bg-neutral-900/40"
>
	<div class="flex items-center justify-between gap-4">
		<h2 class="text-sm font-semibold text-neutral-900">
			{editing ? `Edit "${editing.title}"` : 'New post'}
		</h2>
		<button
			type="button"
			onclick={closeModal}
			aria-label="Close"
			class="text-neutral-400 hover:text-neutral-700"
		>
			✕
		</button>
	</div>

	<div class="mt-5">
		<!-- The key remounts the form when the row changes, so fields do not carry over
		     values from the previously edited post. -->
		{#key editing?.id ?? 'new'}
			<PostForm {editing} onDone={closeModal} />
		{/key}
	</div>
</dialog>
