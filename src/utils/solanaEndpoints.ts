import { clusterApiUrl } from "@solana/web3.js";

import { NetworkCluster } from "@/context/NetworkContext";

export const HELIUS_MAINNET_ENDPOINT =
  "https://mainnet.helius-rpc.com/?api-key=06c5f6f8-30b3-4326-beff-c27807297023";

const DEFAULT_ENDPOINTS: Record<NetworkCluster, string> = {
  devnet: clusterApiUrl("devnet"),
  testnet: clusterApiUrl("testnet"),
  "mainnet-beta": HELIUS_MAINNET_ENDPOINT,
};

const FALLBACK_MAINNET_ENDPOINT = clusterApiUrl("mainnet-beta");

export const resolveMainnetEndpoint = (): string => {
  if (typeof process === "undefined") {
    return HELIUS_MAINNET_ENDPOINT;
  }

  const candidates = [
    process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC,
    process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL,
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.trim().length > 0) {
      return candidate;
    }
  }

  if (HELIUS_MAINNET_ENDPOINT && HELIUS_MAINNET_ENDPOINT.trim().length > 0) {
    return HELIUS_MAINNET_ENDPOINT;
  }

  return FALLBACK_MAINNET_ENDPOINT;
};

export const getEndpointForNetwork = (network: NetworkCluster): string => {
  if (network === "mainnet-beta") {
    return resolveMainnetEndpoint();
  }

  return DEFAULT_ENDPOINTS[network];
};

export const isDefaultMainnetEndpoint = (endpoint: string): boolean =>
  endpoint === HELIUS_MAINNET_ENDPOINT;
