<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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

		const redirect_url = $page.url.searchParams.get(`redirect_url`);

		if (!utils.isEmptyObj(user)) {
			goto(redirect_url || `/`);
		} else {
			setTimeout(async () => {
				const fragment = new URLSearchParams(window.location.hash.slice(1));
				const access_token_string = $page.url.searchParams.get(`access_token_string`);
				const user_id = $page.url.searchParams.get(`user_id`);

        let user_login_res = await api.restPost({
          url: `load`,
          payload: {
            type: `user_login_by_access_token`,
            obj: {
              user_id,
              access_token_string
            }
          }
        }) || null;

        if (
					user_login_res &&
					user_login_res.user &&
					user_login_res.user.id
				) {
          api.setCurrentUser(user_login_res.user, true);
        } else {
          error = `error logging in, try again.`;
        }

				jobs = jobs.filter(j => j !== `load`);
			}, 500);
		}
	});
</script>

<!-- callback -->
<div class="container  grow--  col--  col-centre--  col-middle--callback">
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
