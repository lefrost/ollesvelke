<script lang="ts">
	// imports

	import { onDestroy, onMount } from 'svelte';
	import Loader from '../../components/Loader.svelte';
	import Placeholder from '../../components/Placeholder.svelte';
	import * as api from '../../assets/js/api';

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
			}

			// data = await api.restPost({
			// 	url: `load`,
			// 	payload: {
			// 		type: `sample_main`,
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
		} catch (e) {
			console.log(e);
		}
	}

	// execs
	// none

	// funcs
	// none
</script>

<!-- sample -->
<div
	class="container  grow--  col--  col-centre--  text  text-black--  sample"
>
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
	{:else if !data}
		<Placeholder
			is_loading={false}
			text="Error loading."
			colour="red"
		/>
	{:else}
		Sample page
	{/if}
</div>

<style lang="scss">
	@import '../../assets/scss/all.scss';

  // sample

	.sample {

	}
</style>
