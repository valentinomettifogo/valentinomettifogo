import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter(),

			csp: {
				// 'auto': nonce for dynamically rendered pages (all of them here), hash for
				// any prerendered ones. SvelteKit adds the nonce/hash for its own inline
				// hydration script and for inline <script>/<style> from svelte:head itself.
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					// va.vercel-scripts.com: @vercel/analytics loads its debug build from there
					// in dev (`injectAnalytics({ mode: 'development' })` in +layout.svelte); in
					// production it's same-origin (/_vercel/insights/script.js), already covered
					// by 'self'.
					'script-src': ['self', 'https://va.vercel-scripts.com'],
					// 'unsafe-inline' because Vite injects component styles as inline <style>
					// tags in dev — a nonce/hash only covers what's in the SSR'd HTML.
					'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
					'font-src': ['self', 'https://fonts.gstatic.com'],
					// https: (not a fixed allowlist) because published posts can embed
					// author-authored <img src> from any host -- see SANITIZE_OPTIONS in posts.ts.
					'img-src': ['self', 'data:', 'https:'],
					'connect-src': ['self'],
					'frame-ancestors': ['none'],
					'base-uri': ['self'],
					'form-action': ['self'],
					'object-src': ['none']
				}
			}
		})
	]
});
