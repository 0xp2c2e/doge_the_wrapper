// src/stores/providersStore.ts

import { writable } from 'svelte/store';
import type {
    EIP6963ProviderDetail,
    EIP6963ProviderInfo,
    EIP1193Provider
} from '../types/eip6963';

export function createProviderStore() {
    const { subscribe, update } = writable<EIP6963ProviderDetail[]>([]);

    function announceProvider(
        event: CustomEvent<{
            info: EIP6963ProviderInfo, provider: EIP1193Provider}>
    ) {
      update(providers => {
        if (providers.some(p => p.info.uuid === event.detail.info.uuid)) {
            console.log("prSt update returning existing providers : ", providers)
            return providers;
        } else {
            console.log("providerStore.update adding new provider: ", [...providers, event.detail])
          return [...providers, event.detail];
        }
      });
    }

    function updateProvider(providerId: string, providerDetail: Partial<EIP6963ProviderDetail> ) {
        update(providers => {
            return providers.map(provider => {
                if (provider.info.uuid === providerId) {
                    // Update the matching provider with new details
                    console.log("UpdateProvide returning: ", { ...provider, ...providerDetail })
                    return { ...provider, ...providerDetail };
                }
                return provider;
            });
        });
    }

    return {
        subscribe,
        announceProvider,
        updateProvider,
    };
}

export const providerStore = createProviderStore();