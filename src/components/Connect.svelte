<script lang="ts">
  // imports
	import { createEventDispatcher, onMount } from 'svelte';

  import bs58 from "bs58";
 	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';

  import * as web3 from '@solana/web3.js';
	import {
			WalletProvider,
			ConnectionProvider,
			WalletMultiButton,
	} from "@svelte-on-solana/wallet-adapter-ui";
	import {
		PhantomWalletAdapter,
		BackpackWalletAdapter,
		BraveWalletAdapter,
		ExodusWalletAdapter,
		GlowWalletAdapter,
		LedgerWalletAdapter,
		SolflareWalletAdapter,
		SlopeWalletAdapter,
		SolletWalletAdapter,
		TorusWalletAdapter,
	} from "@solana/wallet-adapter-wallets";

  // consts (solana)
	
	const wallets = [
		new PhantomWalletAdapter(),
		new BackpackWalletAdapter(),
		new BraveWalletAdapter(),
		new ExodusWalletAdapter(),
		new GlowWalletAdapter(),
		new LedgerWalletAdapter(),
		new SolflareWalletAdapter(),
		new SlopeWalletAdapter(),
		new SolletWalletAdapter(),
		new TorusWalletAdapter(),
	];
	const localStorageKey = `walletAdapter`;
	const network = web3.clusterApiUrl(`mainnet-beta`);
	const connection = new web3.Connection(network);

  // consts (discord)
  
  // todo: (env) config `.env` file with required vars
	const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
	const DISCORD_LOGIN_REDIRECT_URI = import.meta.env.VITE_DISCORD_LOGIN_REDIRECT_URI;
	const DISCORD_ADD_REDIRECT_URI = import.meta.env.VITE_DISCORD_ADD_REDIRECT_URI;

	const DISCORD_LOGIN_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
		DISCORD_LOGIN_REDIRECT_URI
	)}&response_type=token&scope=identify%20guilds`;

	const DISCORD_ADD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
		DISCORD_ADD_REDIRECT_URI
	)}&response_type=token&scope=identify%20guilds`;

  // consts (google)

	const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
	const GOOGLE_LOGIN_REDIRECT_URI = import.meta.env.VITE_GOOGLE_LOGIN_REDIRECT_URI;

  // const GOOGLE_LOGIN_ENDPOINT = `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=${GOOGLE_CLIENT_ID}&scope=openid%20email%20profile&response_type=code&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}&state=9yk-MqRGZGqFfFqIcppE598vLptz74TRjCcdWG_Srjk&code_challenge=ZXpefnlSuo2zwwmkhqPzlDi3JqrodL3NRjOoLerjOrM&code_challenge_method=S256&service=lso&o2v=2&ddm=0&flowName=GeneralOAuthFlow`;

  // consts
  
	const dispatch = createEventDispatcher();

  // exports

	export let is_processing = false;
  export let platform = `google`; // <`google`, `solana`, `discord`>
  export let context = `login`; // <`login`, `add`>
  export let text = `Connect`;

  // google vars

	let is_google_toggled;

  // solana vars
  
  let solana_is_verifying = false;
  let solana_verified = false;

  // solana dynamics
  
  $: if (
    $walletStore.connected
    && !solana_verified
    && !solana_is_verifying
		&& (platform === `solana`)
  ) {
		signMessage();
	}

	$: if (
		!$walletStore.connected &&
		(platform === `solana`)
	) {
		solana_verified = false;
		solana_is_verifying = false;
	}

  // solana funcs

  const getMessage = async () => {
		const response = await fetch("/api/solana/message");
		
		const { data : message } = await response.json();

		console.log(`Received message to sign: "${message}"`);

		// logs = [
		// 	...logs,
		// 	`\n\n\nReceived message to sign: "${message}"`
		// ];

		return message;
	}

	const signMessage = async () => {
		solana_is_verifying = true;

		const message = await getMessage();

		const encodedMessage = new TextEncoder().encode(message);

		if(!$walletStore.signMessage) {
			// logs = [
			// 	...logs,
			// 	`\n\n\nWallet not supported`
			// ];

			console.log(`Wallet not supported`);

			solana_is_verifying = false;

			return;
		}

		const signedMessage = await $walletStore?.signMessage(encodedMessage);

		const base58Signature = bs58.encode(signedMessage);

		// logs = [
		// 	...logs,
		// 	`\n\n\nPublic Key: ${$walletStore.publicKey?.toBase58()}`
		// ];

		console.log(`Public Key: ${$walletStore.publicKey?.toBase58()}`);

		// logs = [
		// 	...logs,
		// 	`\n\n\nSigned message: ${base58Signature}`
		// ];

		console.log(`Signed message: ${base58Signature}`);

		if(!signedMessage) {
			// logs = [
			// 	...logs,
			// 	`\n\n\nFailed to sign message`
			// ];

			console.log(`\nFailed to sign message`);

			solana_is_verifying = false;

			return;
		}

		// logs = [
		// 	...logs,
		// 	`\n\n\nVerifying signature...`
		// ];

		console.log(`Verifying signature...`);

		const response = await fetch(`/api/solana/message/verify`, {
			method : "POST",
			body : JSON.stringify({
				message: message,
				signature: base58Signature,
				publicKey: $walletStore.publicKey?.toBase58(),
			}),
		});

		if(response.status !== 200) {
			// logs = [
			// 	...logs,
			// 	`\n\n\nSignature verification failed`
			// ];

			console.log(`Signature verification failed`);

			$walletStore.disconnect();

			solana_is_verifying = false;

			return;
		}

		// logs = [
		// 	...logs,
		// 	`\n\n\nSignature verification success ✅`
		// ];

		console.log(`Signature verification success ✅`);

		solana_is_verifying = false;
		solana_verified = true;

    if (solana_verified) {
      let wallet_address = $walletStore.publicKey?.toBase58();

      dispatch(`connect`, wallet_address);
    }

		// if ([`account_page`].includes(type)) {
		// 	$walletStore.disconnect();
		// }
	}
</script>

<svelte:head>
	<script src="https://accounts.google.com/gsi/client" async></script>
</svelte:head>

<WalletProvider
	{localStorageKey}
	{wallets}
	autoConnect={false}
/>

<ConnectionProvider
	{network}
/>

{#if platform === `solana`}
  {#if context === `login`}
    <!-- login (solana) -->
    <div
      class="container  grow--  row--  row-centre--  text  text-green--  card  green--  connect-login  c-solana--"
      class:disabled={is_processing}
    >
      <WalletMultiButton maxNumberOfWallets={15}>
        {@html text || `Solana`}
      </WalletMultiButton>
    </div>
  {:else if context === `add`}
    <!-- add (solana) -->
    <div
      class="container  stretch--  row--  row-left--  text  text-mint--  card  mint--  connect-login  c-add--  c-solana--"
      class:disabled={is_processing}
    >
      <WalletMultiButton maxNumberOfWallets={15}>
        {@html text || `Tap to add`}
      </WalletMultiButton>
    </div>
  {/if}
{:else if platform === `discord`}
  {#if context === `login`}
    <!-- login (disocrd) -->
    <a
      href={DISCORD_LOGIN_ENDPOINT}
      class="container  grow--  row--  row-centre--  text  text-blue--  card  blue--  connect-login  c-discord--"
      class:disabled={is_processing}
    >
      <div>{text}</div>
    </a>
  {:else if context === `add`}
    <!-- add (discord) -->
    <a
      href={DISCORD_ADD_ENDPOINT}
      class="container  stretch--  row--  row-centre--  text  text-turquoise--  card  turquoise--  connect-login  c-add--  c-discord--"
      class:disabled={is_processing}
    >
      <div>{text}</div>
    </a>
  {/if}
{:else if platform === `google`}
  {#if context === `login`}
    <!-- todo (gmail): change google login button to a link with a GOOGLE_LOGIN_ENDPOINT url instead, similar to the discord add/login button, whereby the url is derived from samples of other sites' google login url format --- this allows the proper styling of this button -->

    <!-- connect (google) -->
    <!-- <a
      href={(type === `add`) ? DISCORD_ADD_ENDPOINT : DISCORD_LOGIN_ENDPOINT} class="container  row--  row-centre--  text  text-white--  card  white--  connect"
      style="font-size: {font_size_em}em;"
    >
      <div>
        {(type === `add`) ? `Add Discord account` : `Discord account`}
      </div>
    </a> -->

    <div
      id="g_id_onload"
      data-client_id={GOOGLE_CLIENT_ID}
      data-login_uri={GOOGLE_LOGIN_REDIRECT_URI}
      data-auto_prompt="false"
    />
    <!-- data-ux_mode="redirect" -->

    <!-- https://accounts.google.com/gsi/select?client_id=25996729794-paml5qmvd50dvr1f4de62r0f2m7d5lb9.apps.googleusercontent.com&ux_mode=redirect&login_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback%2Flogin_google&ui_mode=card&as=BsUhU1s2DAC4BxSqwzrtpw&g_csrf_token=7fe16fd7b0c66f96&origin=http%3A%2F%2Flocalhost%3A3000

    https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=25996729794-paml5qmvd50dvr1f4de62r0f2m7d5lb9.apps.googleusercontent.com&&scope=openid%20email%20profile&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback%2Flogin_google&state=miVGLQl1HWmbflDiF9BHnFFJSq9oX9_dmw9Dy81_AUw&code_challenge=pe2ypFUGvxXi7TJ2RUR8nav7yJEUcbfNRzt5jMEbvmI&code_challenge_method=S256&service=lso&o2v=2&ddm=0&flowName=GeneralOAuthFlow -->

    <div
      class="g_id_signin"
      class:c-toggled--={is_google_toggled}
      data-type="standard"
      data-size="medium"
      data-theme="outline"
      data-text="sign_in_with"
      data-shape="rectangular"
      data-logo_alignment="left"
      data-redirect-uri={GOOGLE_LOGIN_REDIRECT_URI}
      on:click={() => {
        try {
          is_google_toggled = true;
        } catch (e) {
          console.log(e);
        }
      }}
    />
  {:else if context === `add`}
    <!-- todo -->
  {/if}
{/if}
  
<style lang="scss">
  @import '../assets/scss/all.scss';

	.connect-login.card {
		@include clickable;
		@include hover-forward(1.04);
		--bd-a: 0.3;

		&.c-solana-- {
			@include connect-button;
			z-index: 1;
		}

		&:not(.c-solana--) {
			padding: 0.6em 0.8em;

			> div {
				font-size: 1.1em;
			}
		}

		&.c-add-- {
      // todo
		}
	}

	.g_id_signin {
		@include swish;
		@include clickable;
		@include hover-forward(1.04);
	}
</style>
