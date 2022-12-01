<script lang="ts">
</script>

<div class="container  stretch--  row--  row-centre--  text  text-default-black--  header">
	<a href="/" class="header-link  title--">ollesvelke</a>
	<a href="https://github.com/lefrst/ollesvelke" class="text  text-black--  header-link">Github</a>
</div>

<style lang="scss">
	@import '../assets/scss/all.scss';

	/* --- Header --- */

	.header {
		// @include wrapper;
		padding: $wrapper-gutter;
		@include parent-row-right(1em);
	}

	.header-link {
		@include swish;
		font-size: 1.6em;

		&.title-- {
			font-size: 2.4em;
		}

		&:hover {
			opacity: 0.6;
		}
	}
</style>
