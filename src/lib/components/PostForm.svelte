<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PostRow } from '$lib/types';
	import { marked } from 'marked';

	type Props = {
		/** null = create form. */
		editing: PostRow | null;
		onDone: () => void;
	};

	let { editing, onDone }: Props = $props();

	// The parent remounts this component (via a `{#key}` block) whenever `editing`
	// changes, so capturing its initial value here is intentional, not stale state.
	// svelte-ignore state_referenced_locally
	let bodyMd = $state(editing?.bodyMd ?? '');
	// Rendered in the author's own browser, from their own in-progress draft --
	// unlike listPublishedPosts() this preview is never sanitized or sent to
	// anyone else, so there is nothing to sanitize against.
	let preview = $derived(bodyMd.trim() ? (marked.parse(bodyMd, { async: false }) as string) : '');

	const field =
		'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-teal-600 focus:outline-none';
	const label = 'mb-1.5 block text-xs font-medium text-neutral-700';
</script>

<form
	method="POST"
	action={editing ? '?/updatePost' : '?/createPost'}
	use:enhance={() =>
		async ({ update }) => {
			await update();
			onDone();
		}}
	class="grid gap-4"
>
	{#if editing}
		<input type="hidden" name="id" value={editing.id} />
	{/if}

	<div>
		<label class={label} for="title">Title</label>
		<input
			id="title"
			name="title"
			class={field}
			value={editing?.title ?? ''}
			placeholder="What's new"
			required
		/>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label class={label} for="bodyMd">Body (Markdown)</label>
			<textarea
				id="bodyMd"
				name="bodyMd"
				bind:value={bodyMd}
				rows="14"
				class="{field} font-mono"
				placeholder={'Markdown here. Images: ![alt](https://...)'}
				required
			></textarea>
		</div>

		<div>
			<span class={label}>Preview</span>
			<div
				class="prose prose-sm h-[calc(100%-1.375rem)] min-h-40 max-w-none overflow-y-auto rounded-md border border-neutral-200 px-3 py-2"
			>
				{#if preview}
					{@html preview}
				{:else}
					<p class="text-neutral-400">Nothing to show yet.</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex flex-wrap items-center justify-end gap-3">
		{#if editing}
			<!-- formnovalidate: deleting/(un)publishing must not trip over the required fields. -->
			<button
				type="submit"
				formaction="?/deletePost"
				formnovalidate
				class="inline-flex items-center rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
			>
				Delete
			</button>
			{#if editing.status === 'published'}
				<button
					type="submit"
					formaction="?/unpublishPost"
					formnovalidate
					class="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
				>
					Unpublish
				</button>
			{:else}
				<button
					type="submit"
					formaction="?/publishPost"
					formnovalidate
					class="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
				>
					Publish
				</button>
			{/if}
			<button
				type="button"
				onclick={onDone}
				class="text-sm font-medium text-neutral-600 hover:text-neutral-900"
			>
				Cancel
			</button>
		{/if}

		<button
			type="submit"
			class="inline-flex items-center rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
		>
			{editing ? 'Save changes' : 'Save draft'}
		</button>
	</div>
</form>
