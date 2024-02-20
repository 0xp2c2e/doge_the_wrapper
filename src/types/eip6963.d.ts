// src/types/providers.d.ts
/// <reference types="vite/client" />

declare global{
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent
  }
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns?: string;
  [key: string]: any;
}

// Represents the structure of an Ethereum provider based on the EIP-1193 standard.
export interface EIP1193Provider {
  isStatus?: boolean;
  host?: string;
  on: (event: string, listener: (event: any) => void) => void;
  path?: string;
  removeListener: (event: string, listener: (event: any) => void) => void;
  sendAsync?: (request: { method: string, params?: Array<unknown> }, callback: (error: Error | null, response: unknown) => void) => void
  send?: (request: { method: string, params?: Array<unknown> }, callback: (error: Error | null, response: unknown) => void) => void
  request: (request: { method: string, params?: Array<unknown> }) => Promise<unknown>
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
  account?: string | null;
  chain?: string | null;
}

// This type represents the structure of an event dispatched by a wallet to announce its presence based on EIP-6963.
export type EIP6963AnnounceProviderEvent = {
  detail:{
    info: EIP6963ProviderInfo,
    provider: EIP1193Provider
  }
};
