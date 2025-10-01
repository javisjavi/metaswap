import { TokenInfo } from "@/types/token";

export type NetworkCluster = "devnet" | "testnet" | "mainnet-beta";

const createToken = (token: TokenInfo): TokenInfo => ({ ...token, verified: token.verified ?? true });

const MAINNET_TOKENS: TokenInfo[] = [
  {
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    tags: ["stablecoin"],
    verified: true,
  },
  {
    address: "Es9vMFrzaCERB7TEjeq1eviErNTtHxgc3FPf4c8b1C5K",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERB7TEjeq1eviErNTtHxgc3FPf4c8b1C5K/logo.png",
    tags: ["stablecoin"],
    verified: true,
  },
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "wSOL",
    name: "Wrapped SOL",
    decimals: 9,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    tags: ["wrapped"],
    verified: true,
  },
  {
    address: "mSoLzYCxHdYgdzU16g5Qa2sUt17sz6zBqx7CxcAKqdP",
    symbol: "mSOL",
    name: "Marinade Staked SOL",
    decimals: 9,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5Qa2sUt17sz6zBqx7CxcAKqdP/logo.png",
    tags: ["staking"],
    verified: true,
  },
];

const TESTNET_TOKENS: TokenInfo[] = [
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "wSOL",
    name: "Wrapped SOL",
    decimals: 9,
    chainId: 102,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    tags: ["wrapped"],
    verified: true,
  },
];

const DEVNET_TOKENS: TokenInfo[] = [
  {
    address: "Gh9ZwEmdLJ8DscKNTkT8oA7XgaiX9ktEFWXzrL7zQ7U",
    symbol: "USDC",
    name: "USD Coin (Devnet)",
    decimals: 6,
    chainId: 103,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    tags: ["stablecoin"],
    verified: true,
  },
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "wSOL",
    name: "Wrapped SOL",
    decimals: 9,
    chainId: 103,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    tags: ["wrapped"],
    verified: true,
  },
];

export const FALLBACK_TOKENS_BY_NETWORK: Record<NetworkCluster, TokenInfo[]> = {
  "mainnet-beta": MAINNET_TOKENS.map(createToken),
  testnet: TESTNET_TOKENS.map(createToken),
  devnet: DEVNET_TOKENS.map(createToken),
};
