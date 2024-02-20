<script lang="ts">

    import type { EIP6963ProviderDetail} from "../../types/eip6963";

    export let providers: EIP6963ProviderDetail[] = [];
    export let handleWalletButton: (provider: EIP6963ProviderDetail) => Promise<void>;

</script>

<style>
    .provider-button-container {
        position: fixed;
        right: 10px;
        top: 5%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .provider-button {
        display: flex;
        background: transparent;
        border: none;
        align-items: center;
    }


    .provider-img {
        width: 40px;
        height: 40px;
        margin: 20px;
    }
</style>

<!-- Wallet buttons -->
    <div class="provider-button-container">
        {#if providers.length === 0}
            <p>Please Install a Wallet</p>
        {/if}
        {#each providers as provider}
            <button class='provider-button' on:click={() => handleWalletButton(provider)}>
              <img
                      class='provider-img'
                      src="{provider.info.icon}"
                      alt="{provider.info.name}"
                      style="opacity: {provider.account ? 1 : 0.4}"
              />
            </button>
        {/each}
    </div>