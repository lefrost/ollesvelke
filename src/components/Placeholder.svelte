<script lang="ts">
  import Loader from './Loader.svelte';

  export let text = ``;
  export let colour = `white`;
  export let is_loading = false;
  export let styles = [];
</script>

<!-- placeholder -->
<div class="container  row--  row-left--  text-{colour}--  card  {colour}--  placeholder  {styles.map((s) => `${s}--`).join(` `)}">
  {#if is_loading}
    <!-- loader -->
    <Loader font_size={1} />
  {/if}

  <!-- text -->
  <div class="p-text">
    {@html text || ``}
  </div>
</div>

<style lang="scss">
	@import '../assets/scss/all.scss';

  .placeholder.card {
    padding: 0.4em 1em;

    > :global(.loader) {
      margin-right: 0.8em;
    }
  }

  .p-text {
    font-size: 0.75em;
    opacity: 0.6;
  }
</style>