<script lang="ts">
	// imports

	import { clusterApiUrl } from '@solana/web3.js';
	import {
			workSpace,
			WalletProvider,
			ConnectionProvider,
			WalletMultiButton,
	} from "@svelte-on-solana/wallet-adapter-ui";
	import {
		PhantomWalletAdapter,
		BackpackWalletAdapter,
		LedgerWalletAdapter,
		SolflareWalletAdapter,
		SolletExtensionWalletAdapter,
	} from "@solana/wallet-adapter-wallets";

	// consts

	const wallets = [
		new PhantomWalletAdapter(),
		new BackpackWalletAdapter(),
		new SolflareWalletAdapter(),
		new SolletExtensionWalletAdapter(),
		new LedgerWalletAdapter(),
	];
	const localStorageKey = "walletAdapter";
	const network = clusterApiUrl("mainnet-beta");
</script>

<WalletProvider
	{localStorageKey}
	{wallets}
	autoConnect={false}
/>

<ConnectionProvider
	{network}
/>

<div class="container  stretch--  row--  row-centre--  text  text-black--  header">
	<WalletMultiButton>
			Connect Wallet
	</WalletMultiButton>
</div>

<style lang="scss">
	@import '../assets/scss/all.scss';

	/* --- Header --- */

	.header {
		// @include wrapper;
		padding: $wrapper-gutter;
		// @include parent-row-right(1em);
	}
</style>
