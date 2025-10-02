import { NetworkCluster } from "@/types/network";

export type FallbackTokenConfig = {
  symbol: string;
  decimals: number;
  priceUsd: number;
  priceIds?: string[];
};

export type FallbackNetworkConfig = Record<string, FallbackTokenConfig>;

export const FALLBACK_TOKENS: Record<NetworkCluster, FallbackNetworkConfig> = {
  "mainnet-beta": {
    So11111111111111111111111111111111111111112: {
      symbol: "SOL",
      decimals: 9,
      priceUsd: 170,
      priceIds: [
        "So11111111111111111111111111111111111111112",
        "SOL",
      ],
    },
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      symbol: "USDC",
      decimals: 6,
      priceUsd: 1,
      priceIds: [
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "USDC",
      ],
    },
    Es9vMFrzaCERB7TEjeq1eviErNTtHxgc3FPf4c8b1C5K: {
      symbol: "USDT",
      decimals: 6,
      priceUsd: 1,
      priceIds: [
        "Es9vMFrzaCERB7TEjeq1eviErNTtHxgc3FPf4c8b1C5K",
        "USDT",
      ],
    },
    DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
      symbol: "BONK",
      decimals: 5,
      priceUsd: 0.00002,
      priceIds: [
        "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "BONK",
      ],
    },
    "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": {
      symbol: "stSOL",
      decimals: 9,
      priceUsd: 175,
      priceIds: [
        "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
        "stSOL",
      ],
    },
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
      symbol: "RAY",
      decimals: 6,
      priceUsd: 0.2,
      priceIds: [
        "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        "RAY",
      ],
    },
    orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE: {
      symbol: "ORCA",
      decimals: 6,
      priceUsd: 0.8,
      priceIds: [
        "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
        "ORCA",
      ],
    },
    MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey: {
      symbol: "MNDE",
      decimals: 9,
      priceUsd: 0.35,
      priceIds: [
        "MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey",
        "MNDE",
      ],
    },
    HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p: {
      symbol: "LDO",
      decimals: 8,
      priceUsd: 2.25,
      priceIds: [
        "HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p",
        "LDO",
      ],
    },
  },
  devnet: {
    So11111111111111111111111111111111111111112: {
      symbol: "SOL",
      decimals: 9,
      priceUsd: 25,
      priceIds: [
        "So11111111111111111111111111111111111111112",
        "SOL",
      ],
    },
    Gh9ZwEmdLJ8DscKNTkT8oA7XgaiX9ktEFWXzrL7zQ7U: {
      symbol: "USDC",
      decimals: 6,
      priceUsd: 1,
      priceIds: ["Gh9ZwEmdLJ8DscKNTkT8oA7XgaiX9ktEFWXzrL7zQ7U"],
    },
  },
  testnet: {
    So11111111111111111111111111111111111111112: {
      symbol: "SOL",
      decimals: 9,
      priceUsd: 25,
      priceIds: [
        "So11111111111111111111111111111111111111112",
        "SOL",
      ],
    },
  },
};

export const getFallbackTokenConfig = (
  network: NetworkCluster,
  mint: string
): FallbackTokenConfig | null => {
  return FALLBACK_TOKENS[network]?.[mint] ?? null;
};

