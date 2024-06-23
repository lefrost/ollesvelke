<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as api from '../../../assets/js/api';
	import * as utils from '../../../assets/js/utils';
  
	import Loader from '../../../components/Loader.svelte';
  import Placeholder from '../../../components/Placeholder.svelte';

	let user;

	let error = ``;

	let jobs = [`load`];

	onMount(async () => {
		await utils.wait(1); // wait for socket in main +layout.svelte
		user = await api.getCurrentUser();

		if (!utils.isEmptyObj(user)) {
			goto(`/`);
		} else {
			setTimeout(async () => {
				const fragment = new URLSearchParams(window.location.hash.slice(1));
				const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

				if (accessToken && tokenType) {
					let discord_user = await (
						await fetch('https://discord.com/api/users/@me', {
							headers: {
								authorization: `${tokenType} ${accessToken}`
							}
						})
					).json();

					if (!utils.isEmptyObj(discord_user) && discord_user.id) {
						let matching_user = await api.restPost({
							url: `get`,
							payload: {
								type: `user`,
								filters: [
									{
										prop: `connections`,
										value: {
											type: `discord`,
											code: discord_user.id
										},
										condition: `some`,
										options: []
									}
								]
							}
						});

						if (!utils.isEmptyObj(matching_user)) {
							api.setCurrentUser(matching_user, true);
						} else {
							// tba: instead of calling `add(user)`, call `adhoc->addUser()`, in which backend functions can be executed, such as uploading user's icon image to google cloud, retrieving the resulting image url, and setting that image url in mongo
							let new_user = await api.restPost({
								url: `add`,
								payload: {
									type: `user`,
									obj: {
										name: `${discord_user.username}${
											discord_user.discriminator
										}${utils.getRandomNumber(1, 1000)}`,
										connections: [
											{
												type: `discord`,
												code: discord_user.id,
												name: `${discord_user.username}#${discord_user.discriminator}`
											}
										]
									}
								}
							});

							if (!utils.isEmptyObj(new_user)) {
								api.setCurrentUser(new_user, true);
							} else {
								error = `error adding new user.`;
							}
						}
					} else {
						error = `can't get discord user.`;
					}
				} else {
					error = `url params not found.`;
				}

				jobs = jobs.filter(j => j !== `load`);
			}, 500);
		}
	});
</script>

<!-- callback -->
<div class="container  grow--  col--  col-centre--  col-middle--  callback">
	{#if jobs.includes(`load`)}
		<Placeholder
      is_loading={true}
			text="Logging in..."
			colour="white"
		/>
	{:else if error.length > 0}
		<Placeholder
      is_loading={true}
			text={error}
			colour="red"
		/>
	{:else}
		<Placeholder
      is_loading={true}
			text="Logging in..."
			colour="white"
		/>
	{/if}
</div>

<style lang="scss">
	@import '../../../assets/scss/all.scss';

	.callback {
		padding: 1em 0;
		width: calc(100% - $wrapper-gutter);
		max-width: 450px;
	}
</style>
