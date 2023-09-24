<script lang="ts">
	// imports

	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page, navigating } from '$app/stores';
	import { Buffer } from 'buffer';

  import bs58 from "bs58";
 	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';

	import Header from '../components/Header.svelte';
	import * as api from '../assets/js/api';

	// vars

	let in_maintenance = false;
	let is_active = true;
	
	let solana_is_verifying = false;
	let solana_verified = false;

	// mount

	onMount(async () => {
		if (browser) {
			window.Buffer = Buffer;
		}

		in_maintenance = in_maintenance && $page.url.searchParams.get(`mode`) !== `dev`;

		if (!in_maintenance) {
			if (!is_active) {
				is_active = true;
			}

			// note: if any `getInitiated()` type function is run here, put `api.checkSesh()` inside some sort of `if (initiated)` condition, to prevent repeatedly reloading page before initilisation
			// await api.setSocket(socket);
			// await api.checkSesh();
		}
	});

	// dynamics
	
	$: if($walletStore.connected && !solana_verified && !solana_is_verifying) {
		signMessage();
	}

	$: if(!$walletStore.connected) {
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

			console.log(`nFailed to sign message`);

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
	}
</script>

<div class="container  stretch--  grow--  col--  col-centre--  layout">
	<Header />

	<slot />
</div>

<style lang="scss">
	@import '../assets/scss/all.scss';

	.layout {
		font-size: 12px;

		@media (min-width: $bp-sm) {
			font-size: 15px;
		}
	}
</style>
