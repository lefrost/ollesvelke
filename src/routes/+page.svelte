<script lang="ts">
	let items = [
		{
			colour: `default-black`,
			text_colour: `default-black`,
			text: `A Sveltekit boilerplate by Léfrost.`
		},
		{
			colour: `default-black`,
			text_colour: `default-black`,
			text: `Comes with TS & SCSS support.`
		},
		{
			colour: `default-black`,
			text_colour: `default-black`,
			text: `Also includes assets, middleware, stores, and styles to get started off with.`
		}
	];
</script>

<!-- landing -->
<div
	class="container  grow--  col--  col-centre--  col-middle--  text  text-default-black--  landing"
>
	<!-- landing -> items -->
	<div class="container  stretch--  row--  row-top--  row-centre--  row-wrap--  landing-items">
		{#each items as item}
			<!-- item -->
			<div class="text  text-{item.text_colour}--  card  {item.colour}--  landing-item">
				<!-- item -> text -->
				<div class="landing-item__text">
					{item.text}
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@import '../assets/scss/all.scss';

	.landing {
		width: calc(100% - $wrapper-gutter * 2);
		max-width: 1000px;
	}

	.landing-items {
		// @include parent-row-right(1em);
	}

	.landing-item.card {
		--bg-a1: 0;
		--bg-a2: 0.05;
		--bd-w: 0.1em;
		--bd-a: 0.01;
		padding: 0.8em 1.4em;
		margin: 1em;
		width: 200px;
		@include hover-forward(1.04);
	}

	.landing-item__text {
		font-size: 1.5em;
		line-height: 0.8em;
		text-align: left;
	}
</style>
