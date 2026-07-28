<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const supabase = $derived(data.supabase);
	const session = $derived(data.session);

	// $effect never runs during SSR, so no isBrowser guard is needed.
	$effect(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) invalidate('supabase:auth');
		});

		return () => subscription.unsubscribe();
	});
</script>

{@render children()}
