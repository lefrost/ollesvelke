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

		if (utils.isEmptyObj(user)) {
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
						let discord_user_id = (discord_user[`id`] || ``).trim() || ``;
						let discord_user_name = (discord_user[`username`] || ``).trim() || ``;
						let discord_user_discriminator = (discord_user[`discriminator`] || ``).trim() || ``;

						let matching_user = await api.restPost({
							url: `get`,
							payload: {
								type: `user`,
								filters: [
									{
										prop: `connections`,
										value: {
											type: `discord`,
											code: discord_user_id
										},
										condition: `some`,
										options: []
									}
								]
							}
						});

						if (!utils.isEmptyObj(matching_user)) {
							error = `this discord account is already connected with another user.`;
						} else {
							let updated_user = await api.restPost({
								url: `edit`,
								payload: {
									type: `user`,
									obj: {
										id: user.id,
										connections: [
											...user.connections,
											{
												type: `discord`,
												code: discord_user_id,
												name: `${discord_user_name}#${discord_user_discriminator}`
											}
										]
									}
								}
							});

							if (!utils.isEmptyObj(updated_user)) {
								await api.setCurrentUser(updated_user, false);
								goto(`/settings`);
							} else {
								error = `error updating user.`;
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

<div class="container  grow--  stretch--  col--  col-centre--  col-middle--  callback">
	{#if jobs.includes(`load`)}
		<Placeholder
			is_loading={true}
			text="Linking..."
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
			text="Linking..."
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
