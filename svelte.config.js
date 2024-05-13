import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
// import inject from '@rollup/plugin-inject';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	onwarn: (warning, handler) => {
		if ([
			`css-unused-selector`,
			`a11y-click-events-have-key-events`,
			`a11y-no-static-element-interactions`,
			`unused-export-let`
		].includes(warning.code)) return;
		handler(warning);
	},
	
	kit: {
		adapter: adapter()

		// hydrate the <div id="svelte"> element in src/app.html
		// target: '#svelte'
	}
};

export default config;
