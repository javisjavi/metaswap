"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TokenInfo } from "@/types/token";
import { FALLBACK_TOKENS_BY_NETWORK } from "@/data/fallbackTokenList";
import { SOL_MINT } from "@/utils/tokenConstants";

const TOKEN_LIST_URL = "https://token.jup.ag/strict";
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
  verified: true,
};

const mergeTokenLists = (...lists: TokenInfo[][]): TokenInfo[] => {
  const map = new Map<string, TokenInfo>();

  lists
    .flat()
    .filter(Boolean)
    .forEach((token) => {
      if (!map.has(token.address)) {
        map.set(token.address, { ...token, verified: token.verified ?? true });
      }
    });

  return Array.from(map.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
};

export type TokenListError = "fetchFailed" | "unexpected";

export interface TokenListState {
  tokens: TokenInfo[];
  loading: boolean;
  error: TokenListError | null;
  findByMint: (mint: string) => TokenInfo | undefined;
}

export const useTokenList = (network: "devnet" | "testnet" | "mainnet-beta"): TokenListState => {
  const [tokens, setTokens] = useState<TokenInfo[]>([SOL_TOKEN]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<TokenListError | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch(TOKEN_LIST_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("FETCH_FAILED");
        }
        const payload = (await response.json()) as TokenInfo[];
        const enriched = payload.map((token) => ({ ...token, verified: true }));
        const filtered = enriched.filter(
          (token) =>
            token.chainId === NETWORK_CHAIN_ID[network] || ALWAYS_INCLUDED_MINTS.has(token.address)
        );

        setTokens(mergeTokenLists(filtered, [SOL_TOKEN]));
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to load token list", err);
        const fallbackTokens = FALLBACK_TOKENS_BY_NETWORK[network] ?? [];
        if (fallbackTokens.length) {
          setTokens(mergeTokenLists(fallbackTokens, [SOL_TOKEN]));
        }
        const message = (err as Error).message ?? "";
        const normalized = message.toLowerCase();
        const networkFailed =
          message === "FETCH_FAILED" ||
          normalized.includes("fetch") ||
          normalized.includes("network") ||
          normalized.includes("dns");
        setError(networkFailed ? "fetchFailed" : "unexpected");
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
