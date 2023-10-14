<script lang="ts">
	// imports

	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	// import { page, navigating } from '$app/stores';
	import { Buffer } from 'buffer';

	import Placeholder from '../components/Placeholder.svelte';
	import Footer from '../components/Footer.svelte';
	import Header from '../components/Header.svelte';
	import * as api from '../assets/js/api';

	// exports
	// none

	// consts
	
	const IN_MAINTENANCE = false;

	// vars

	// let in_maintenance = false;
	let is_active = true;
	let socket;
	let caches;
	let initiated = false;

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

			if (initiated) {
				await api.checkSesh();
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
