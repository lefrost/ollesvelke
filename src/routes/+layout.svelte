<script lang="ts">
	import { onMount } from 'svelte';
	import { Buffer } from 'buffer';

	import Footer from '../components/Footer.svelte';
	import Header from '../components/Header.svelte';

	onMount(async () => {
		window.Buffer = window.Buffer || Buffer;
	});
</script>

<div class="container  stretch--  grow--  col--  col-centre--  layout">
	<Header />

	<slot />

	<Footer />
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
