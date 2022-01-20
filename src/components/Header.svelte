<script>
</script>

<div class="header">
	<a sveltekit:prefetch href="/">
		<div class="header-link  main--">Ollesvelke</div>
	</a>

	<a sveltekit:prefetch href="/meta">
		<div class="header-link">Meta</div>
	</a>
</div>

<button class="menu">
	👾
	<div class="menu__header-links">
		<a sveltekit:prefetch href="/">
			<div class="header-link">Home</div>
		</a>

		<a sveltekit:prefetch href="/meta">
			<div class="header-link">Meta</div>
		</a>
	</div>
</button>

<style lang="scss">
	@import '../assets/scss/all.scss';

	/* --- Header --- */

	.header {
		@include wrapper;
		padding: $wrapper-gutter;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* --- header-link --- */

	.header-link {
		@include clickable;
		margin: 0 20px;
		font-size: 18px;

		&.main-- {
			font-family: $ff-alpha;
			font-size: 20px;
			font-weight: bold;
		}

		&:not(.main--) {
			display: none;
		}
	}

	@media (min-width: $bp-sm) {
		.header-link {
			&.main-- {
				font-size: 24px;
			}

			&:not(.main--) {
				display: block;
			}
		}
	}

	/* --- Menu --- */

	.menu {
		@include swish;
		position: fixed;
		display: flex;
		bottom: $wrapper-gutter;
		right: $wrapper-gutter;
		padding: 10px;
		border-radius: 5px;
		background-color: $white;
		box-shadow: 0 0 20px 0px rgba($black, 0.2);
		z-index: 1;
		border: none;
		transition-property: transform;

		&:focus {
			transform: rotate(-15deg);
			> .menu__header-links {
				bottom: 50px;

				.header-link {
					font-size: 18px;
					opacity: 1;
				}
			}
		}
	}

	.menu__header-links {
		display: flex;
		align-items: flex-end;
		position: absolute;
		flex-direction: column;
		right: 0;
		bottom: 0;
		transition-property: bottom;
		@include swish;

		.header-link {
			@include swish;
			transition-property: font-size, opacity;
			display: block;
			font-size: 0;
			margin: 0;
			opacity: 0;
			font-weight: bold;
		}
	}

	@media (min-width: $bp-sm) {
		.menu {
			display: none;
		}
	}
</style>
