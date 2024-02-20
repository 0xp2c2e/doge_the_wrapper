// providers.ts
import type {EIP1193Provider, EIP6963ProviderDetail} from "../types/eip6963";
import { CHAIN_IDS } from "../constants/chainIds";

export async function fetchConnectedAccount(provider: EIP1193Provider): Promise<string | null> {
    try {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        return accounts.length ? accounts[0] : null
    } catch (error) {
        console.error('Error fetching connect account: ', error);
        return null;
    }
}

export async function fetchConnectedChain(provider: EIP1193Provider): Promise<string | null> {
    try {
        const chainId = await provider.request({ method: 'eth_chainId' }) as string;
        return CHAIN_IDS[parseInt(chainId, 16)];
    } catch (error) {
        console.error('Error in fetching chain: ', error);
        return null;
    }
}

export async function connectWallet(provider: EIP6963ProviderDetail): Promise< string[] | undefined > {
    try {
        const accounts = await provider.provider.request({method: 'eth_requestAccounts'}) as string[];
        return accounts
    } catch (error) {
        console.error('Error connecting wallet: ', error);
    }
}

export function handleChainChange(chainId: string | number): string | null {
    let parsedChainId: number;
    if (typeof chainId === 'string') {
        parsedChainId = parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
    } else {
        parsedChainId = chainId;
    }
    const chain = CHAIN_IDS[parsedChainId];
    return chain ? chain : null;
}




