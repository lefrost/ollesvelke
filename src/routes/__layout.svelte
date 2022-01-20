<script lang="ts">
	import Footer from '../components/Footer.svelte';
	import Header from '../components/Header.svelte';
</script>

<Header />

<div class="container  col--  col-centre--  stretch--  grow--">
	<!-- <main> -->
	<slot />
	<!-- </main> -->
</div>

<Footer />

<style lang="scss">
	@import '../assets/scss/all.scss';

	.container {
		font-size: 18px;
	}

	@media (min-width: $bp-sm) {
		.container {
			font-size: 22px;
		}
	}
</style>
