<script lang="ts">
	// imports
	import { onDestroy, onMount } from 'svelte';
	import ConnectButton from '../../components/ConnectButton.svelte';
	import Loader from '../../components/Loader.svelte';
	import Placeholder from '../../components/Placeholder.svelte';
	import * as api from '../../assets/js/api';
	import { goto } from '$app/navigation';

	// exports
	// none

	// consts

	const IN_MAINTENANCE = false;

	// vars

	let is_active = false;
	let data;
	let user;

	// dynamics
	// none

	// mount

	onMount(async () => {
		if (IN_MAINTENANCE) {
			return;
		}
		
		if (!is_active) {
			is_active = true;
		}

		await getData();
	});

	onDestroy(() => {
		try {
			is_active = false;	
		} catch (e) {
			console.log(e);
		}
	});

	// jobs

	let jobs = [`get_data`];

	async function getData() {
		try {
			jobs.push(`get_data`);
			jobs = jobs;

			user = await api.getCurrentUser() || null;

			if (!(user && user.id)) {
				user = null;
				
				// data = await api.restPost({
				// 	url: `load`,
				// 	payload: {
				// 		type: `login_main`,
				// 		obj: {
				// 			user_id: user ? user.id : ``
				// 		}
				// 	}
				// }) || null;
				
				data = `test`;
				
				if (data) {
					// tba: data
				}

				jobs = jobs.filter(j => j !== `get_data`);
			} else {
				jobs = jobs.filter(j => j !== `get_data`);
				
				goto('/settings');
			}

			
		} catch (e) {
			console.log(e);
		}
	}

	// funcs
	// none
</script>

<!-- login -->
<div class="container  stretch--  col--  col-centre--  text  text-black--  login">
	{#if IN_MAINTENANCE}
		<Placeholder
			is_loading={false}
			text="In maintenance."
			colour="red"
		/>
	{:else if jobs.includes(`get_data`)}
		<Placeholder
			is_loading={true}
			text="Loading..."
			colour="white"
		/>
	{:else if user}
		<Placeholder
			is_loading={true}
			text="Redirecting..."
			colour="white"
		/>
	{:else if !data}
		<Placeholder
			is_loading={false}
			text="Error loading."
			colour="red"
		/>
	{:else}
		<!-- button (discord) -->
		<ConnectButton
			platform="discord"
			type="login"
		/>

		<!-- button (solana) -->
		<ConnectButton
			platform="solana"
			type="login"
		/>
	{/if}
</div>

<style lang="scss">
	@import '../../assets/scss/all.scss';

	// login

	.login {

	}
</style>
