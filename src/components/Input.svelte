<script lang="ts">
  import { onMount } from 'svelte';
	import * as utils from '../assets/js/utils';
	import _ from 'lodash';

	export let self = null;

	export let value;
	export let type = `text`;
	export let user_timezone = `UTC`;
	export let label = ``;
	export let placeholder = ``;
	export let max_length = 0;
	export let font_size = 1;
	export let styles = [];
	export let events = {};
	export let disabled = false;
	export let max_width_px = null;
	export let colour = `white`;
	export let is_utc_input = false;
  
  let internal_value;
	let internal_value_initialised = false;
	let timezone_toggled = false;
	let timezone_search = ``;

	let hours_bar_div;
	// let hours_px_start_x = 0;
	let is_hours_mousedown = false;

  onMount(async () => {
		try {
			if ((type === `timestamp_date`) && value) {
				internal_value = utils.timestampToDatetime({
					timestamp: value,
					datetime_timezone: user_timezone,
					datetime_format: `YYYY-MM-DD`
				});
			} else if ((type === `timestamp_datetime`) && value) {
				internal_value = utils.timestampToDatetime({
					timestamp: value,
					datetime_timezone: user_timezone,
					datetime_format: `YYYY-MM-DDTHH:mm`
				});
			} else if (type === `hours`) {
				if (!value || !Array.isArray(value)) {
					value = [0, 24];
				} else {
					if (!((value[0] >= 0) && (value[0] <= 24))) {
						value[0] = 0;
					}

					if (!((value[1] >= 0) && (value[1] <= 24))) {
						value[1] = 24;
					}
				}
			}
			
			await utils.wait(0.1);
			internal_value_initialised = true;
		} catch (e) {
			console.log(e);
		}
	});

	$: if (internal_value) {
		updateValue();
	}

	async function updateValue() {
		await utils.wait(0);

		if (internal_value_initialised) {
			if ((type === `timestamp_date`) || (type === `timestamp_datetime`)) {
				let internal_value_as_timestamp = utils.datetimeToTimestamp({
					convert_timezone: false,
					datetime_timezone: user_timezone,
					datetime: `${internal_value}${is_utc_input ? `Z` : ``}`
				});

				if (value !== internal_value_as_timestamp) {
					value = internal_value_as_timestamp;
				}
			}
		}
	}

	function hoursPxToHour(px) {
		try {
			return Math.ceil((px || 0) / hours_bar_div.offsetLeft * 24) || 0;
		} catch (e) {
			console.log(e);
			return 0;
		}
	}

	function hoursUpdateHour(e) {
		try {
			// note: click to change `start/end` hour value, depending on how far `left-%` part in the bar was clicked, and whether or not it should be the `start` or the `end` hour value that gets affected, based on their current placements
			let hour = hoursPxToHour(e.clientX) || 0;

			if (hour <= value[0]) {
				value[0] = hour;
			} else if (hour >= value [1]) {
				value[1] = hour;
			}

			if (value[0] === value[1]) {
				if (value[0] <= 0) {
					value[1] = value[0] + 1;
				} else if (value[1] >= 24) {
					value[0] = value[1] - 1;
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
</script>

<!-- input -->
<div
	class="container  col--  input  {styles.map((s) => `${s}--`).join(` `)}"
	class:disabled={disabled}
	style={`${font_size ? `font-size: ${font_size}em;` : ``}  ${
		max_width_px ? `max-width: ${max_width_px}px;` : ``
	}`}
	on:click|stopPropagation={() => {}}
	on:focus={events[`focus`]}
	on:blur={events[`blur`]}
	on:keydown|stopPropagation={events[`keydown`]}
	on:keyup|stopPropagation={events[`keyup`]}
>
	{#if label.length > 0 || max_length > 0}
		<!-- input -> top -->
		<div class="container  grow--  stretch--  row--  row-left--  text  text-{colour}--  i-top">
			{#if label.length > 0}
				<!-- input -> top -> label -->
				<div class="container  grow--   row--  row-left--  i-to__label">
					{label}
				</div>
			{/if}

			{#if max_length > 0}
				<!-- input -> top -> length -->
				<div class="i-to__length">
					{_.toArray((value || ``).trim()).length}-{max_length}
				</div>
			{/if}
		</div>
	{/if}

	{#if type === `text`}
		<input
			bind:this={self}
			bind:value
			type="text"
			{placeholder}
			class="container  grow--  stretch--  text  text-{colour}--  card  {colour}--  i-textbox"
			on:keyup={events[`keyup`]}
			{disabled}
		/>
  {:else if type === `textarea`}
    <textarea
			bind:this={self}
      bind:value
      {placeholder}
      class="container  grow--  stretch--  text  text-{colour}--  card  {colour}--  i-textbox"
			on:keyup={events[`keyup`]}
			{disabled}
    />
  {:else if type === `timestamp_datetime`}
    <input
			bind:this={self}
      bind:value={internal_value}
      type="datetime-local"
      {placeholder}
      class="container  grow--  stretch--  text  text-{colour}--  card  {colour}--  i-textbox"
      on:keyup={() => {
				if (events[`keyup`]) {
					events[`keyup`]();
				}
			}}
			on:change={() => {
				// value = utils.datetimeToTimestamp({
				// 	datetime: internal_value,
				// 	timezone: user_timezone
				// });
			}}
      {disabled}
    />
	{:else if type === `timestamp_date`}
		<input
			bind:this={self}
			bind:value={internal_value}
			type="date"
			{placeholder}
			class="container  grow--  stretch--  text  text-{colour}--  card  {colour}--  i-textbox"
			on:keyup={() => {
				if (events[`keyup`]) {
					events[`keyup`]();
				}
			}}
			on:change={() => {
				// value = utils.datetimeToTimestamp({
				// 	datetime: internal_value,
				// 	timezone: user_timezone
				// });
			}}
			{disabled}
		/>
	{:else if type === `number`}
		<input
			bind:this={self}
			bind:value
			type="number"
			{placeholder}
			class="container  grow--  stretch--  text  text-{colour}--  card  {colour}--  i-textbox"
			on:keyup={events[`keyup`]}
			{disabled}
		/>
	{:else if type === `timezone`}
		<!-- timezone -->
		<div
			bind:this={self}
			class="container  stretch--  col--  text  text-{colour}--  card  {colour}--  i-timezone"
			on:click={() => {
				if (!timezone_toggled) {
					timezone_toggled = true;
				}
			}}
		>
			{#if timezone_toggled}
				<!-- timezone -> top -->
				<div class="container  stretch--  row--  row-left--  row-bottom--  i-ti__top">
					<!-- timezone -> top -> input (search) -->
					<!-- note: also using `i-textbox` styles -->
					<input
						type="text"
						bind:value={timezone_search}
						placeholder="Search eg. Tokyo"
						class="container  text  text-{colour}--  card  {colour}--  i-textbox  i-ti__to-input"
					/>

					<!-- timezone -> top -> button (cancel) -->
					<div
						class="container  grow--  row--  row-centre--  text  text-red--  card  red--  i-ti__to-button"
						on:click|stopPropagation={() => {
							timezone_toggled = false;
						}}
					>
						<div>Cancel</div>
					</div>
				</div>

				<!-- timezone -> items -->
				<div class="container  stretch--  col--  i-ti__items">
					{#if utils.getTimezones().filter(
						t => t.name
							.replaceAll(`_`, ` `)
							.toLowerCase()
							.includes(timezone_search.trim().toLowerCase()) || t.zone
								.toLowerCase()
								.includes(timezone_search.trim().toLowerCase())).length <= 0}
						<!-- timezone -> items -> message (none) -->
						<div class="i-ti__it-message">
							No matching timezones.
						</div>
					{:else}
						{#each utils.getTimezones().filter(
							t => t.name
								.replaceAll(`_`, ` `)
								.toLowerCase()
								.includes(timezone_search.trim().toLowerCase()) || t.zone
									.toLowerCase()
									.includes(timezone_search.trim().toLowerCase())
						).slice(0, 20) as option}
							<!-- item -->
							<div
								class="container  stretch--  row--  text  text-{colour}--  card  {colour}--  i-ti__item"
								class:i-selected--={value === option.name}
								on:click|stopPropagation={() => {
									value = option.name || ``;
									timezone_search = ``;
									timezone_toggled = false;
								}}
							>
								<div class="container  grow--  row--  row-left--">
									{@html
										utils.shortenString({
											string: utils.removeAccents(option.name || `n/a`),
											length: 20
										})
									}
								</div>
								<div>
									{@html
										utils.shortenString({
											string: utils.removeAccents(option.zone || `n/a`),
											length: 10
										})
									}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			{:else}
				<!-- timezone -> label -->
				<div class="i-ti__label">
					Tap to change
				</div>

				<!-- timezone -> name -->
				<div class="i-ti__name">
					{@html value || `UTC`}
				</div>

				<!-- timezone -> code -->
				<div class="i-ti__code">
					{@html utils.getTimezoneZone(value) || `n/a`}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '../assets/scss/all.scss';

  // todo (misc): update existing styles borrowed from ascend to fit in with boilerplate design

	// input

	.input {
		min-width: 0;

		&.disabled-- {
			pointer-events: none;
			opacity: 0.4;
		}

		> textarea {
			height: calc(8em - 0.5em - 0.4em);
			resize: none;
		}
	}

	// top

	.i-top {
		padding-bottom: 0.4em;
	}

	// top -> label

	.i-to__label {
		opacity: 0.5;
		font-size: 0.85em;
		padding-right: 0.3em;
	}

	// top -> length

	.i-to__length {
		white-space: nowrap;
		opacity: 0.25;
		font-size: 0.8em;
	}

	// textbox

	.i-textbox.card {
		@include hover-forward(1.04);
		cursor: url('/images/cursors/input.png'), auto;
		--bg-a1: 0.05;
		--bg-a2: 0.05;
		--bd-r: 0.2em;
		--bd-w: 0.13em;
		--bd-a: 0.1;
		padding: 0.5em 0.7em 0.4em;
		font-size: 1em;
		line-height: 1.3em;
		font-family: $ff-custom;

		&::placeholder {
      color: $white-hex;
			opacity: 0.25;
		}
	}

	// timezone

	.i-timezone.card {
    --bg-a1: 0.05;
    --bg-a2: 0.05;
		--bd-r: 0.2em;
		--bd-w: 0.13em;
		--bd-a: 0.1;
		padding: 0.7em 0.8em;
		position: relative;
		@include clickable;
		@include hover-forward(1.04);
	}

	// timezone -> top
	
	.i-ti__top {
		// none
	}

	.i-ti__to-input.card {
		width: 9em;
		margin-right: 0.5em;
		font-size: 0.9em;
	}

	.i-ti__to-button.card {
    --bg-a1: 0.05;
    --bg-a2: 0.05;
		--bd-r: 0.2em;
		--bd-w: 0.13em;
		--bd-a: 0.1;
		padding: 0.25em 0.6em;
		@include clickable;
		@include hover-forward(1.04);

		> div {
			font-size: 0.95em;
		}
	}

	// timezone -> items

	.i-ti__items {
		margin-top: 0.8em;
		max-height: 8em;
		overflow: auto;
		@include parent-col-bottom(0.6em);
		@include no-scrollbar;
	}

	.i-ti__it-message {
		font-size: 0.85em;
		opacity: 0.5;
	}

	// timezone -> item

	.i-ti__item.card {
    --bg-a1: 0.05;
    --bg-a2: 0.05;
		--bd-r: 0.2em;
		--bd-w: 0.13em;
		--bd-a: 0.1;
		padding: 0.2em 0.5em;
		opacity: 0.5;
		@include clickable;
		
		> div {
			&:nth-of-type(1) {
				font-size: 0.9em;
				padding-right: 0.5em;
			}

			&:nth-of-type(2) {
				font-size: 0.8em;
				opacity: 0.5;
			}
		}

		&.i-selected-- {
			opacity: 1;
		}

		&:hover {
			opacity: 0.8;
		}
	}

	// timezone -> Label

	.i-ti__label {
		position: absolute;
		top: -1.7em;
		right: 0em;
		font-size: 0.75em;
		opacity: 0.3;
	}

	// timezone -> name
	
	.i-ti__name {
		font-size: 1em;
	}

	// timezone -> code

	.i-ti__code {
		font-size: 0.8em;
		opacity: 0.5;
		margin-top: -0.2em;
	}
</style>
