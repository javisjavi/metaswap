"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TokenInfo } from "@/types/token";

const TOKEN_LIST_URL = "https://token.jup.ag/strict";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const ALWAYS_INCLUDED_MINTS = new Set([
  SOL_MINT,
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
]);

const NETWORK_CHAIN_ID: Record<"devnet" | "testnet" | "mainnet-beta", number> = {
  devnet: 103,
  testnet: 102,
  "mainnet-beta": 101,
};

const SOL_TOKEN: TokenInfo = {
  address: SOL_MINT,
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  chainId: 101,
  tags: ["native"],
};

export interface TokenListState {
  tokens: TokenInfo[];
  loading: boolean;
  error: string | null;
  findByMint: (mint: string) => TokenInfo | undefined;
}

export const useTokenList = (network: "devnet" | "testnet" | "mainnet-beta"): TokenListState => {
  const [tokens, setTokens] = useState<TokenInfo[]>([SOL_TOKEN]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch(TOKEN_LIST_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("No se pudo obtener la lista de tokens");
        }
        const payload = (await response.json()) as TokenInfo[];
        const filtered = payload.filter(
          (token) =>
            token.chainId === NETWORK_CHAIN_ID[network] || ALWAYS_INCLUDED_MINTS.has(token.address)
        );

        const map = new Map<string, TokenInfo>();
        [...filtered, SOL_TOKEN].forEach((token) => {
          if (!map.has(token.address)) {
            map.set(token.address, token);
          }
        });

        const sorted = Array.from(map.values()).sort((a, b) =>
          a.symbol.localeCompare(b.symbol)
        );
        setTokens(sorted);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError((err as Error).message ?? "Error inesperado");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadTokens();

    return () => controller.abort();
  }, [network]);

  const findByMint = useCallback(
    (mint: string) => tokens.find((token) => token.address === mint),
    [tokens]
  );

  const value = useMemo(
    () => ({ tokens, loading, error, findByMint }),
    [tokens, loading, error, findByMint]
  );

  return value;
};
