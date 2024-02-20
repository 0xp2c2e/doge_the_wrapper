<script lang="ts">
    import {TOKENINFO } from '../../constants/contracts';
    import type { namedProvider } from '../../types/providers'

    export let provider: namedProvider;
    export let doge: string = '';


  async function addToken(provider: namedProvider, doge: string): Promise<boolean> {
      try {
          const tokenInfo = TOKENINFO[doge];
          console.log("tokenInfo", tokenInfo);
          return await provider.instance.request({
              method: 'wallet_watchAsset',
              params: {
                  type: 'ERC20',
                  options: {
                      address: tokenInfo.address,
                      symbol: tokenInfo.symbol,
                      decimals: tokenInfo.decimals,
                  },
              },
          });
      } catch (error) {
          console.error(error);
          return false;
      }
  }

  function handleClick() {
      addToken(provider, doge);
  }

</script>

<style>
    .addTokenButton {
        background: transparent;
        cursor: pointer;
        border: none;
        font-variant: small-caps;
        margin: 0px;
    }
    .optimism-addTokenButton {
        color: var(--gray-brown)
    }
    .base-addTokenButton {
        color: var(--rose);
    }

</style>

<button class="{provider.activeChain}-addTokenButton addTokenButton" id="addTokenButton" on:click={handleClick}>
    (add to wallet)
</button>
