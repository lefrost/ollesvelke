// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dns from 'dns';
import inject from '@rollup/plugin-inject';
dns.setDefaultResultOrder('verbatim');

export default defineConfig({
	plugins: [sveltekit()],

	server: {
		port: 3000,
		fs: {
			strict: false
		}
	},

	preview: {
		port: 3000
	},

	vite: {
		define: {
			'process.env.BROWSER': true
		},

		optimizeDeps: {
			include: ['@solana/web3.js', 'buffer']
		},

		build: {
			rollupOptions: {
				plugins: [inject({ Buffer: ['buffer', 'Buffer'] })]
			}
		}
	}
});
