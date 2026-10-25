import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-bun';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			adapter: adapter(),

			// Origin checking is done in hooks.server.ts, because the Bun adapter assumes HTTPS
			// and would reject every form post on plain http.
			csrf: { trustedOrigins: ['*'] },

			// Scripts are limited to our own bundle (SvelteKit adds hashes for its inline bootstrap).
			// Styles allow inline because Svelte transitions and bits-ui set style attributes.
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self', 'unsafe-inline'],
					'img-src': ['self', 'data:'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self'],
					'frame-ancestors': ['none']
				}
			}
		}),
		// scale 1 = 1em, so icons follow the font size.
		Icons({ compiler: 'svelte', scale: 1 })
	]
});
