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
						let discord_user_id = (discord_user[`id`] || ``).trim() || ``;
						let discord_user_name = (discord_user[`username`] || ``).trim() || ``;
						let discord_user_discriminator = (discord_user[`discriminator`] || ``).trim() || ``;
						let discord_user_avatar_hash = (discord_user[`avatar`] || ``).trim() || ``;
						let discord_user_icon_image_url = (discord_user_id && discord_user_avatar_hash) ?
							`https://cdn.discordapp.com/avatars/${discord_user_id}/${discord_user_avatar_hash}.png` :
							``; // note: change extension to default to `.png`

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
							api.setCurrentUser(matching_user, true);
						} else {
							let icon_image_base_64 = (
								discord_user_icon_image_url ?
									await utils.imgUrlToBase64(discord_user_icon_image_url) :
									``
							) || ``;

							let new_user = await api.restPost({
								url: `load`,
								payload: {
									type: `user_add`,
									obj: {
										name: utils.shortenString({
											string: discord_user_name,
											length: 30
										}) || ``,
										icon_image_obj: {
											value: icon_image_base_64 || ``,
											format: `base64`
										},
										timezone: `UTC`,
										connections: [
											{
												type: `discord`,
												code: discord_user_id,
												name: `${discord_user_name}#${discord_user_discriminator}`
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
