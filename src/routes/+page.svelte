<script lang="ts">

    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    import {
        fetchConnectedAccount,
        fetchConnectedChain,
        connectWallet,
        handleChainChange
    } from '$lib/providers';
    import {
        fetchDogeBalance,
        wrapDoge
    } from '$lib/contracts';

    // stores
    import { providerStore } from '../stores/providerStore';

    // components
    import BalanceDisplay from "$lib/components/BalanceDisplay.svelte";
    import AddTokenButton from "$lib/components/AddTokenButton.svelte";
    import ProviderSidebar from "$lib/components/ProviderSidebar.svelte";

    // types
    import type {
        EIP6963ProviderDetail,
        EIP6963ProviderInfo,
        EIP1193Provider
    } from "../types/eip6963";
    import type { CallError} from "../types/providers"
    type ProviderAnnouncementEvent = CustomEvent<{info: EIP6963ProviderInfo, provider: EIP1193Provider}>;

    let handleProviderAnnouncement: (event: ProviderAnnouncementEvent) => Promise<void>;

    let activeProviders: EIP6963ProviderDetail[] = [];
    let activeProvider: EIP6963ProviderDetail | null = null;

    let statusMessage: string = '';
    let dogeBalance: string = '';
    let wDogeBalance: string = '';
    let doge: string = '';
    let amountToExecute = '';

    let listenerCleanups: Record<string, () => void> = {};

    onMount(() => {

      if (browser) {

        handleProviderAnnouncement = async (event) => {
          providerStore.announceProvider(event);
          const updatedProviderDetail = await handleNewProvider(event.detail);

          if (updatedProviderDetail.account) {
            activeProviders.push(updatedProviderDetail);
            if (!activeProvider) {
              activeProvider = updatedProviderDetail;
            }
          }
        };

        // Add the event listener for the custom event (e.g., "eip6963AnnounceProvider")
        window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement);
        window.dispatchEvent(new Event("eip6963:requestProvider"));
      }
    });

    onDestroy(() => {
      if (browser) {
        window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement);
        Object.values(listenerCleanups).forEach(cleanup => cleanup());
      }
    })

    // update provider with account and chain
    async function handleNewProvider(provider: EIP6963ProviderDetail) {
        const account = await fetchConnectedAccount(provider.provider);
        const chain = await fetchConnectedChain(provider.provider);

        const updatedProviderDetail = {
          account: account,
          chain: chain
        };
        providerStore.updateProvider(provider.info.uuid, updatedProviderDetail);
        if (account) {
          listenerCleanups[provider.info.uuid] = startListeners(provider);
        }
        return { ...provider, ...updatedProviderDetail}
    }

    function startListeners(provider: EIP6963ProviderDetail): () => void {

      if (listenerCleanups[provider.info.uuid]) {
        return listenerCleanups[provider.info.uuid];
      }
      const providerId = provider.info.uuid;

      const onAccountsChanged = async (accounts: string[]) => {

          const updatedProviderDetail = {account: accounts.length === 0 ? accounts[0] : null};
          providerStore.updateProvider(providerId, updatedProviderDetail);

          // User disconnected
          if (accounts.length === 0) {

            listenerCleanups[providerId]();
            delete listenerCleanups[providerId];

            const _index = activeProviders.findIndex(p => p.info.uuid === providerId);
            if (_index !== -1) {
                activeProviders.splice(_index, 1);
               activeProvider = activeProviders.length > 0 ? activeProviders[0] : null;
            }
          } else if (activeProvider?.info.uuid === providerId) {
            activeProvider.account = accounts[0];
          }
      }

      const onChainChanged = async (chainId: string) => {
          const chain = handleChainChange(chainId);
          const updatedProviderDetail = {
            chain: chain
          };
          providerStore.updateProvider(providerId, updatedProviderDetail);
          if (activeProvider?.info.uuid === providerId) {
            activeProvider.chain = chain;
          }
      };

      provider.provider.on('accountsChanged', onAccountsChanged);
      provider.provider.on('chainChanged', onChainChanged);

      // Return a cleanup function that removes the listeners
      return () => {
          provider.provider.removeListener('accountsChanged', onAccountsChanged);
          provider.provider.removeListener('chainChanged', onChainChanged);
      };
    }

    async function fetchBalances() {
      if (!activeProvider) return;
      try {
          dogeBalance = await fetchDogeBalance(activeProvider, false); // Assuming false for regular Doge balance
          wDogeBalance = await fetchDogeBalance(activeProvider, true); // True for wrapped Doge balance
      } catch (error) {
          console.error("Error fetching balances:", error);
      }
  }

    async function handleWalletButton(provider: EIP6963ProviderDetail): Promise<void> {

        if (provider.account) {
            activeProvider = provider;
        }
        else {
          const accounts = await connectWallet(provider);

          if (accounts) {
              const account = accounts[0];

              providerStore.updateProvider(provider.info.uuid, {account})
              activeProvider = { ...provider, account}

              listenerCleanups[provider.info.uuid] = startListeners(provider);
          }
        }
    }

    async function handleWrap(provider: EIP6963ProviderDetail, amount: string, wrap: boolean = true) {
      try {
        const wrapped = await wrapDoge(provider, amount, wrap);
        statusMessage = wrapped ? 'WOOF!' : 'meow';
        clearStatusMessage();
        await fetchBalances();
      } catch(error: unknown) {
        const err = error as CallError;
        if (err.info?.data?.message) {
          statusMessage = err.info.data.message;
          clearStatusMessage(20000);
        } else if (err.reason){
          statusMessage = err.reason;
          clearStatusMessage(20000);
        } else statusMessage = '';
      }
    }

    function clearStatusMessage(delay: number = 10000) {
      setTimeout(() => {
        statusMessage = '';
      }, delay);
    }
    function onFill(newAmount: string) {
      amountToExecute = newAmount;
    }

    $: if (activeProvider) {
      fetchBalances();
    }

    $: backgroundImage = activeProvider?.chain
            ?`var(--${activeProvider?.chain}-bg-image)`
            : `var(--optimism-bg-image)`;
    $: reversedProviders = $providerStore.slice().reverse();

    $: statusMessage = !activeProvider
      ? "Connect a wallet"
      : !activeProvider.account
        ? "Connect an account"
        : !activeProvider.chain
          ? "Unsupported chain"
          : "";

    $: doge = activeProvider?.chain === 'optimism'
      ? 'optidoge'
      : activeProvider?.chain === 'base'
        ? 'basedoge'
        : '';


</script>

<div class={activeProvider?.chain ? activeProvider.chain : 'optimism'}>

  <div class="container">

    <!-- title -->
    <h1>Dog Themed Wrapper Button</h1>

    <ProviderSidebar providers={reversedProviders} {handleWalletButton} />

    {#if activeProvider}

      {#if activeProvider.account}

        <!-- provider and chain display -->
        <div class="connection-info-container">
          <p>{activeProvider?.info.name}</p>

          {#if activeProvider.chain}
            <p>&nbsp;on&nbsp;</p>
            <img
                    class='chain-img' src="{activeProvider.chain}.svg"
                    alt="{activeProvider.chain}"
                    style="width: 100px; height: 40px; padding-left: 10px;"
            />
          {/if}
        </div>

        <!-- display wallet address -->
        <div class="{activeProvider.chain}-active-account" style="padding: 5px;">
          [&nbsp;{activeProvider.account}&nbsp;]
        </div>

        {#if activeProvider.chain}

          <!-- balance display -->
          <div class="balance-container">
            <div class="balance">
              <BalanceDisplay {doge} {dogeBalance} {onFill} />
              <AddTokenButton provider={activeProvider} {doge} />
            </div>

            <div class="balance">
              <BalanceDisplay doge={"w" + doge} dogeBalance={wDogeBalance} {onFill} />
              <AddTokenButton provider={activeProvider} doge={"w" + doge} />
            </div>
          </div>

          <!-- wrap/unwrap buttons -->
          <div class="input-button-group">

            <input class='amount-input' type="text" bind:value={amountToExecute} placeholder="Amount"/>

            <button
              class='{activeProvider.chain}-wrap wrap'
              on:click={() => handleWrap(activeProvider, amountToExecute.toString(), true)}
            >
              wrap
            </button>

            <button
              class='{activeProvider.chain}-wrap wrap'
              on:click={() => handleWrap(activeProvider, amountToExecute.toString(), false)}
            >
              unwrap
            </button>

          </div>

        {/if}
      {/if}
    {/if}

    <div class="logo-div" style="background-image: {backgroundImage}">
      {#if statusMessage}
        <div class="status-message-container"
             style = "font-size: {
             statusMessage.length > 20 ? '3vw'
              : statusMessage.length > 10 ? '5vw'
                : statusMessage.length > 5 ? '8vw'
                  : '15vw'}"
        >
          {statusMessage}
        </div>

      {/if}

    </div>

  </div>
</div>

