<script lang="ts">
  // imports
	import { createEventDispatcher, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as api from '../assets/js/api';

  import bs58 from "bs58";
 	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';

  import * as web3 from '@solana/web3.js';
	import {
			workSpace,
			WalletProvider,
			ConnectionProvider,
			WalletMultiButton,
	} from "@svelte-on-solana/wallet-adapter-ui";
	import {
		PhantomWalletAdapter,
		BackpackWalletAdapter,
		SolflareWalletAdapter,
		LedgerWalletAdapter,
	} from "@solana/wallet-adapter-wallets";

  // consts

  const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
	const DISCORD_LOGIN_REDIRECT_URI = import.meta.env.VITE_DISCORD_LOGIN_REDIRECT_URI;
	const DISCORD_ADD_REDIRECT_URI = import.meta.env.VITE_DISCORD_ADD_REDIRECT_URI;
	const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
	const VITE_GOOGLE_LOGIN_REDIRECT_URI = import.meta.env.VITE_GOOGLE_LOGIN_REDIRECT_URI;

	const DISCORD_LOGIN_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
		DISCORD_LOGIN_REDIRECT_URI
	)}&response_type=token&scope=identify%20guilds`;

	const DISCORD_ADD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
		DISCORD_ADD_REDIRECT_URI
	)}&response_type=token&scope=identify%20guilds`;
	
	const wallets = [
		new PhantomWalletAdapter(),
		new BackpackWalletAdapter(),
		new SolflareWalletAdapter(),
		new LedgerWalletAdapter(),
	];
	const localStorageKey = `walletAdapter`;
	const network = web3.clusterApiUrl(`mainnet-beta`);
	const connection = new web3.Connection(network);
  
	const dispatch = createEventDispatcher();

  // exports

	export let is_processing = false;
  export let platform = `solana`; // discord, solana
  export let type = `login`; // add, login
  export let text = `Solana wallet`;
	export let font_size_em = 1;
	
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
  ) {
		signMessage();
	}

	$: if (!$walletStore.connected) {
		solana_verified = false;
		solana_is_verifying = false;
	}

  // solana funcs

  const getMessage = async () => {
		const response = await fetch("/api/solana/message");
		const { data : message } = await response.json();
		// console.log(`Received message to sign: "${message}"`);
		return message;
	}

	const signMessage = async () => {
		solana_is_verifying = true;
		const message = await getMessage();
		const encodedMessage = new TextEncoder().encode(message);

		if(!$walletStore.signMessage) {
			console.log(`Wallet not supported`);
			solana_is_verifying = false;
			return;
		}

		const signedMessage = await $walletStore?.signMessage(encodedMessage);
		const base58Signature = bs58.encode(signedMessage);
		// console.log(`Public Key: ${$walletStore.publicKey?.toBase58()}`);
		// console.log(`Signed message: ${base58Signature}`);

		if(!signedMessage) {
			// console.log(`nFailed to sign message`);
			solana_is_verifying = false;
			return;
		}

		// console.log(`Verifying signature...`);
		const response = await fetch(`/api/solana/message/verify`, {
			method : "POST",
			body : JSON.stringify({
				message: message,
				signature: base58Signature,
				publicKey: $walletStore.publicKey?.toBase58(),
			}),
		});

		if(response.status !== 200) {
			// console.log(`Signature verification failed`);
			$walletStore.disconnect();
			solana_is_verifying = false;
			return;
		}

		// console.log(`Signature verification success ✅`);
		solana_is_verifying = false;
		solana_verified = true;

    if (solana_verified) {
      let wallet_address = $walletStore.publicKey?.toBase58();
      dispatch(`connect`, wallet_address);
    }

		if ([`add`].includes(type)) {
			$walletStore.disconnect();
		}
	}

	// onMount(async () => {
	// 	// await api.setIsGoogleProcessing(false);
	// 	console.log(await api.getIsGoogleProcessing());
	// });
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

{#if platform === `discord`}
  <!-- connect (discord) -->
  <a
		href={(type === `add`) ? DISCORD_ADD_ENDPOINT : DISCORD_LOGIN_ENDPOINT} class="container  row--  row-centre--  text  text-white--  card  white--  connect"
		style="font-size: {font_size_em}em;"
	>
    <div>
      {(type === `add`) ? `Add Discord account` : `Discord account`}
    </div>
  </a>
{:else if platform === `google`}
	<!-- tba: change google login button to a link with a GOOGLE_LOGIN_ENDPOINT url instead, similar to the discord add/login button, whereby the url is derived from samples of other sites' google login url format --- this allows the proper styling of this button -->

	<!-- connect (google) -->
	<div
		id="g_id_onload"
		data-client_id={GOOGLE_CLIENT_ID}
		data-login_uri={VITE_GOOGLE_LOGIN_REDIRECT_URI}
		data-auto_prompt="false"
	/>

	<div
		class="g_id_signin"
		class:c-toggled--={is_google_toggled}
		data-type="standard"
		data-size="medium"
		data-theme="outline"
		data-text="sign_in_with"
		data-shape="rectangular"
		data-logo_alignment="left"
		on:click={() => {
			try {
				is_google_toggled = true;
			} catch (e) {
				console.log(e);
			}
		}}
	/>
{:else if platform === `solana`}
	<!-- connect (solana) -->
  <div
		class="container  row--  row-centre--  text  text-white--  card  white--  connect"
		class:disabled={is_processing}
		style="font-size: {font_size_em}em;"
	>
    <WalletMultiButton>
      {@html text || `Solana wallet`}
    </WalletMultiButton>
  </div>
{/if}

<style lang="scss">
  @import '../assets/scss/all.scss';

  // connect

  .connect.card {
		--bg-a1: 0.05;
		--bg-a2: 0.05;
		opacity: 0.8;
		padding: 0.8em 1.4em;
		@include clickable;
		z-index: 2;

		&:hover {
			opacity: 1;
		}
		
		> div {
			font-size: 1.3em;
		}

		> :global(.wallet-adapter-button) {
			all: unset;
			font-size: 1.3em;
			display: flex;
		}

		> :global(.wallet-adapter-button .wallet-adapter-button-start-icon) {
			// display: none;
			margin-top: -0.1em;
		}

		> :global(.wallet-adapter-dropdown .wallet-adapter-button) {
			all: unset;
			font-size: 1.3em;
			display: flex;
		}

		> :global(.wallet-adapter-dropdown .wallet-adapter-button-start-icon) {
			// display: none;
			margin-top: -0.1em;
		}
  }

	.g_id_signin {
    // display: none;
		@include swish;
		@include hover-forward(1.04);
		@include clickable;

		&.c-toggled-- {
			pointer-events: none;
			opacity: 0.3;
		}
	}
</style>
  