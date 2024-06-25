<script lang="ts">
	/*
		note: getting `Could not install @sveltejs/adapter-vercel` issue when deploying to vercel?
		- if not already, install to devDependencies: sveltejs/adapter-vercel@1.0.2
		- https://github.com/sveltejs/kit/issues/8530#issuecomment-1383015259
		- updated as of dec 2023
	*/

	/*
		note: migrating from sveltekit 1 to 2
		- rm -r node_modules
		- migrate from svelte 3 to 4: https://svelte.dev/docs/v4-migration-guide
		- migrate from eslint-plugin-svelte3 to eslint-plugin-svelte: https://github.com/sveltejs/kit/issues/10242#issuecomment-1610798405 (use --force if needed)
		- migrate from sveltekit 1 to 2: https://kit.svelte.dev/docs/migrating-to-sveltekit-2
		- if you have @sveltejs/adapter-vercel devDependency in package.json, remove it from package.json, and do npm i @sveltejs/adapter-auto (use --force if needed)
		- make sure to update `svelte.config.js`, `vite.config.js`, `package.json`, and `app.html` to be consistent with the ollesvelke version
		- npm i, npm run dev
		- when deploying to vercel, make sure project's node version is 20.x or higher
		- updated as of may 2024
	*/
	
	// imports

	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	// import { page, navigating } from '$app/stores';
	import { Buffer } from 'buffer';

	import Placeholder from '../components/Placeholder.svelte';
	import Footer from '../components/Footer.svelte';
	import Header from '../components/Header.svelte';
	import * as api from '../assets/js/api';
	// import io from 'socket.io-client';

	// exports
	// none

	// consts
	
	const IN_MAINTENANCE = false;

	// const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
	// const socket = io(API_ENDPOINT, {
	// 	extraHeaders: {
	// 		x_api_key: import.meta.env.VITE_API_KEY
	// 	}
	// });
	
	// vars

	// let in_maintenance = false;
	let is_active = true;
	let caches;
	let initiated = false;
	let user;

	// dynamics
	// none

	// mount

	onMount(async () => {
		try {
			if (browser) {
				window.Buffer = Buffer;
			}

			// in_maintenance = in_maintenance && $page.url.searchParams.get(`mode`) !== `dev`;

			if (IN_MAINTENANCE) {
				return;
			}

			if (!is_active) {
				is_active = true;
			}

			// note: if any `getInitiated()` type function is run here, put `api.checkSesh()` inside some sort of `if (initiated)` condition, to prevent repeatedly reloading page before initilisation
			// await api.setSocket(socket);
			// await api.checkSesh();
			await getCaches();

			if (caches && caches.cache && initiated) {
				await api.checkSesh();
				user = await api.getCurrentUser();

				if (user && user.id) {
					// tba (misc): call api.restPost->`/enter`
				}
			}
		} catch (e) {
			console.log(e);
		}
	});

	onDestroy(() => {
		try {
			is_active = false;	
		} catch (e) {
			console.log(e);
		}
	});

	// jobs

	let jobs = [`get_caches`];
	
	async function getCaches() {
		try {
			jobs.push(`get_caches`);
			jobs = jobs;
			
			caches = await api.restPost({
				// socket,
				url: `init`,
				payload: {},
				skip_intiation_check: true
			}) || null;

			if (caches) {
				initiated = caches.cache;
			} else {
				initiated = false;
			}

			jobs = jobs.filter(j => j !== `get_caches`);
		} catch (e) {
			console.log(e);
		}
	}

	// execs
	// none

	// funcs
	// none
</script>

<div class="container  stretch--  grow--  col--  col-centre--  layout">
	{#if IN_MAINTENANCE}
		<Placeholder
			is_loading={false}
			text="In maintenance."
			colour="red"
		/>
	{:else if jobs.includes(`get_caches`)}
		<Placeholder
			is_loading={true}
			text="Loading..."
			colour="white"
		/>
	{:else if !caches}
		<Placeholder
			is_loading={false}
			text="Error loading."
			colour="red"
		/>
	{:else if !caches.cache}
		<Placeholder
			is_loading={false}
			text="Backend loading. Try again in a few minutes."
			colour="red"
		/>
	{:else}
		<Header />
		<slot />
		<Footer />
	{/if}
</div>

<style lang="scss">
	@import '../assets/scss/all.scss';

	// layout

	.layout {
		font-size: 12px;

		@media (min-width: $bp-sm) {
			font-size: 15px;
		}
	}
</style>
