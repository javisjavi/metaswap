import { clusterApiUrl } from "@solana/web3.js";

import type { NetworkCluster } from "@/types/network";

export const HELIUS_MAINNET_ENDPOINT =
  "https://mainnet.helius-rpc.com/?api-key=06c5f6f8-30b3-4326-beff-c27807297023";

const DEFAULT_ENDPOINTS: Record<NetworkCluster, string> = {
  devnet: clusterApiUrl("devnet"),
  testnet: clusterApiUrl("testnet"),
  "mainnet-beta": HELIUS_MAINNET_ENDPOINT,
};

export const resolveMainnetEndpoint = (): string => HELIUS_MAINNET_ENDPOINT;

export const getEndpointForNetwork = (network: NetworkCluster): string => {
  if (network === "mainnet-beta") {
    return HELIUS_MAINNET_ENDPOINT;
  }

  return DEFAULT_ENDPOINTS[network];
};

export const isDefaultMainnetEndpoint = (endpoint: string): boolean =>
  endpoint === HELIUS_MAINNET_ENDPOINT;
