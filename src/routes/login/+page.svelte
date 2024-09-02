<script lang="ts">
	// imports
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Connect from '../../components/Connect.svelte';
	import Loader from '../../components/Loader.svelte';
	import Placeholder from '../../components/Placeholder.svelte';
	import * as api from '../../assets/js/api';
	import * as utils from '../../assets/js/utils';

	import Input from '../../components/Input.svelte';
	// exports
	// none

	// consts

	const IN_MAINTENANCE = false;

	// vars

	let is_active = false;
	let data;
	let user;
	let caches;
	let redirect_url = ``;
	
	let login_solana_text = `Solana wallet`;

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
		
		redirect_url = $page.url.searchParams.get(`redirect_url`) || ``;

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
					// todo: data
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

	async function getCaches() {
		jobs.push(`get_caches`);
		jobs = jobs;

		caches = await api.restPost({
			url: `init`,
			payload: {}
		});

		jobs = jobs.filter((j) => j !== `get_caches`);
	}

	// execs
	// none

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
		<!-- button (google) -->
		<Connect
			platform="google"
			context="login"
			text="Login with Gmail"
			{redirect_url}
		/>

		{#if false}
			<!-- button (discord) -->
			<Connect
				platform="discord"
				context="login"
				text="Login with Discord"
				{redirect_url}
			/>

			<!-- button (solana) -->
			<Connect
				platform="solana"
				context="login"
				text={login_solana_text}
				{redirect_url}
				is_processing={jobs.includes(`login`)}
				on:connect={async (connect_data) => {
					try {
						if (!jobs.includes(`login`)) {
							jobs.push(`login`);
							jobs = jobs;

							login_solana_text = `Solana wallet.`;

							let address = connect_data.detail;

							if (address !== null && address.length > 0) {
								login_solana_text = `Logging in...`;

								let matching_user = await api.restPost({
									url: `get`,
									payload: {
										type: `user`,
										filters: [
											{
												prop: `connections`,
												value: {
													type: `solana`,
													code: address
												},
												condition: `some`,
												options: []
											}
										]
									}
								});

								await getCaches();

								if (!caches.cache) {
									login_solana_text = `Backend initiating, try again later.`;
								} else if (!utils.isEmptyObj(matching_user)) {
									login_solana_text = `Logging in...`;
									api.setCurrentUser(matching_user, true);
								} else {
									login_solana_text = `Creating new account...`;

									let new_user = await api.restPost({
										url: `add`,
										payload: {
											type: `user`,
											obj: {
												code: `${address.substring(0, 8)}${utils.getRandomNumber(1, 1000)}`,
												name: address.substring(0, 8),
												connections: [
													{
														type: `solana`,
														code: address,
														name: utils.formatAddress(address)
													}
												]
											}
										}
									});

									if (!utils.isEmptyObj(new_user)) {
										api.setCurrentUser(new_user, true);
									} else {
										login_solana_text = `Connected interrupted, try again.`;
									}
								}
							} else {
								login_solana_text = `Connected interrupted, try again.`;
							}

							jobs = jobs.filter(j => j !== `login`);
						}
					} catch (e) {
						console.log(e);
					}
				}}
			/>
		{/if}
	{/if}
</div>

<style lang="scss">
	@import '../../assets/scss/all.scss';

	// login

	.login {

	}
</style>
