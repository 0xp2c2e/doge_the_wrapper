<script lang="ts">

  export let doge: string = 'Token';
  export let dogeBalance: string = '0';
  export let onFill: (amount: string) => void;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      onFill(dogeBalance);
    }
  }

  function handleClick() {
    onFill(dogeBalance);
  }
</script>

<style>
  .display-value {
    cursor: pointer;
    display: inline-block;
  }
</style>

<div
  class="display-balance"
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <p>
    <b>{doge.toUpperCase()}</b> :
    <span class="display-value">{dogeBalance}</span>
  </p>
</div>
