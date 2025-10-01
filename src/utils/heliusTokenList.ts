import { TokenInfo } from "@/types/token";
import { FALLBACK_TOKENS_BY_NETWORK } from "@/data/fallbackTokenList";

type Network = "devnet" | "testnet" | "mainnet-beta";

const HELIUS_ENDPOINTS: Record<Network, string | null> = {
  "mainnet-beta":
    "https://mainnet.helius-rpc.com/?api-key=06c5f6f8-30b3-4326-beff-c27807297023",
  devnet: null,
  testnet: null,
};

interface HeliusAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
    } | null;
    links?: {
      image?: string;
    } | null;
  } | null;
  token_info?: {
    symbol?: string;
    decimals?: number;
  } | null;
}

const CHUNK_SIZE = 50;

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const mapAssetToTokenInfo = (
  asset: HeliusAsset,
  fallback: Map<string, TokenInfo>
): TokenInfo | null => {
  if (!asset || !asset.id) {
    return null;
  }

  const fallbackToken = fallback.get(asset.id);
  const symbol =
    asset.token_info?.symbol ??
    asset.content?.metadata?.symbol ??
    fallbackToken?.symbol;
  const name =
    asset.content?.metadata?.name ?? fallbackToken?.name ?? symbol ?? asset.id;
  const decimals =
    asset.token_info?.decimals ?? fallbackToken?.decimals ?? 0;
  const logoURI =
    asset.content?.links?.image ?? fallbackToken?.logoURI ?? undefined;
  const chainId = fallbackToken?.chainId ?? 101;
  const tags = fallbackToken?.tags;

  if (!symbol || name == null) {
    return fallbackToken ?? null;
  }

  return {
    address: asset.id,
    symbol,
    name,
    decimals,
    logoURI,
    chainId,
    tags,
    verified: true,
  };
};

const fetchHeliusAssets = async (
  endpoint: string,
  mints: string[],
  fallback: Map<string, TokenInfo>
) => {
  const collected = new Map<string, TokenInfo>();

  for (const batch of chunkArray(mints, CHUNK_SIZE)) {
    const requestBody = {
      jsonrpc: "2.0" as const,
      id: `token-list-${Date.now()}`,
      method: "getAssets" as const,
      params: {
        ids: batch,
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Helius responded with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      result?: (HeliusAsset | null)[] | null;
      error?: { message?: string } | null;
    };

    if (payload.error?.message) {
      throw new Error(payload.error.message);
    }

    for (const asset of payload.result ?? []) {
      const token = asset ? mapAssetToTokenInfo(asset, fallback) : null;
      if (token) {
        collected.set(token.address, token);
      }
    }
  }

  for (const [mint, token] of fallback.entries()) {
    if (!collected.has(mint)) {
      collected.set(mint, token);
    }
  }

  return Array.from(collected.values());
};

export const fetchTokenListFromHelius = async (
  network: Network,
  additionalMints: string[] = []
): Promise<TokenInfo[]> => {
  const endpoint = HELIUS_ENDPOINTS[network];

  if (!endpoint) {
    return [];
  }

  const fallbackTokens = FALLBACK_TOKENS_BY_NETWORK[network] ?? [];
  const fallbackMap = new Map<string, TokenInfo>(
    fallbackTokens.map((token) => [token.address, token])
  );

  const mints = Array.from(
    new Set([...fallbackMap.keys(), ...additionalMints])
  );

  if (!mints.length) {
    return [];
  }

  return fetchHeliusAssets(endpoint, mints, fallbackMap);
};
