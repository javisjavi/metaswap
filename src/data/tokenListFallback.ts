import { TokenInfo } from "@/types/token";

type Network = "devnet" | "testnet" | "mainnet-beta";

export const FALLBACK_TOKENS: Record<Network, TokenInfo[]> = {
  devnet: [
    {
      address: "So11111111111111111111111111111111111111112",
      symbol: "SOL",
      name: "Solana",
      decimals: 9,
      chainId: 103,
      logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
      tags: ["native"],
      verified: true,
    },
  ],
  testnet: [
    {
      address: "So11111111111111111111111111111111111111112",
      symbol: "SOL",
      name: "Solana",
      decimals: 9,
      chainId: 102,
      logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
      tags: ["native"],
      verified: true,
    },
  ],
  "mainnet-beta": [
    {
      address: "So11111111111111111111111111111111111111112",
      symbol: "SOL",
      name: "Solana",
      decimals: 9,
      chainId: 101,
      logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
      tags: ["native"],
      verified: true,
    },
    {
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 101,
      logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      tags: ["stablecoin"],
      verified: true,
    },
    {
      address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      symbol: "BONK",
      name: "Bonk",
      decimals: 5,
      chainId: 101,
      logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
      tags: ["community"],
      verified: true,
    },
  ],
};
