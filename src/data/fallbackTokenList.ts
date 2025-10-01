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
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    decimals: 5,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
    tags: ["meme"],
    verified: true,
  },
  {
    address: "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
    symbol: "stSOL",
    name: "Lido Staked SOL",
    decimals: 9,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png",
    tags: ["staking"],
    verified: true,
  },
  {
    address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    symbol: "RAY",
    name: "Raydium",
    decimals: 6,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
    tags: ["dex"],
    verified: true,
  },
  {
    address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
    symbol: "ORCA",
    name: "Orca",
    decimals: 6,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png",
    tags: ["dex"],
    verified: true,
  },
  {
    address: "MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey",
    symbol: "MNDE",
    name: "Marinade",
    decimals: 9,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey/logo.png",
    tags: ["staking"],
    verified: true,
  },
  {
    address: "HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p",
    symbol: "LDO",
    name: "Lido DAO",
    decimals: 8,
    chainId: 101,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p/logo.png",
    tags: ["governance"],
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
