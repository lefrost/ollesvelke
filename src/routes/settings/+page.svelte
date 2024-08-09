<script lang="ts">
	// imports
	import { onDestroy, onMount } from 'svelte';
	// import Connect from '../../components/Connect.svelte';
	// import Input from '../../components/Input.svelte';
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
        
				jobs = jobs.filter(j => j !== `get_data`);
				
				goto('/login');
			} else {
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
			}

			
		} catch (e) {
			console.log(e);
		}
	}

	// execs
	// none

	// funcs
	// none
</script>

<!-- settings -->
<div class="container  stretch--  col--  col-centre--  text  text-white--settings">
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
	{:else if !user}
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
		Account<br /><br />
		Logged in as {user.name}<br /><br />

		<div
			class="container  row--  row-centre--  text  text-white--  card  white--  s-logout"
			on:click={async () => {
				try {
					if (!jobs.includes(`logout`)) {
						jobs.push(`logout`);
						await api.logout();
					}
				} catch (e) {
					console.log(e);
				}
			}}
		>
			<div>
				{#if jobs.includes(`logout`)}
					<Loader />
				{:else}
					Logout
				{/if}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	@import '../../assets/scss/all.scss';

	// settings

	.settings {

	}

	// logout

  .s-logout.card {
    padding: 0.4em 0.8em 0.35em;
    @include clickable;
    @include hover-forward(1.04);
    --bd-a: 0.2;
    --bd-w: 0.13em;

    > div {
      font-size: 0.9em;
    }
  }
</style>
