"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QuoteResponse } from "@/types/jupiter";

interface UseJupiterQuoteParams {
  inputMint?: string;
  outputMint?: string;
  amount?: bigint | null;
  enabled?: boolean;
  slippageBps?: number;
  cluster?: "devnet" | "testnet" | "mainnet-beta";
  swapMode?: "ExactIn" | "ExactOut";
}

export type QuoteError = "fetchFailed" | "unexpected";

interface UseJupiterQuoteResult {
  quote: QuoteResponse | null;
  loading: boolean;
  error: QuoteError | null;
  refreshedAt: number | null;
  refresh: () => Promise<void>;
}

const JUPITER_QUOTE_URL = "https://quote-api.jup.ag/v6/quote";

export const useJupiterQuote = ({
  inputMint,
  outputMint,
  amount,
  enabled = true,
  slippageBps = 50,
  cluster = "devnet",
  swapMode = "ExactIn",
}: UseJupiterQuoteParams): UseJupiterQuoteResult => {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<QuoteError | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);

  const params = useMemo(() => {
    if (!enabled || !inputMint || !outputMint || !amount || amount <= BigInt(0)) {
      return null;
    }
    return {
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps,
      cluster,
      swapMode,
    };
  }, [enabled, inputMint, outputMint, amount, slippageBps, cluster, swapMode]);

  const fetchQuote = useCallback(async () => {
    if (!params) {
      setQuote(null);
      setError(null);
      return;
    }

    const query = new URLSearchParams({
      cluster: params.cluster,
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps.toString(),
      swapMode: params.swapMode,
    });

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${JUPITER_QUOTE_URL}?${query.toString()}`);
      if (!response.ok) {
        throw new Error("FETCH_FAILED");
      }
      const payload = (await response.json()) as QuoteResponse;
      setQuote(payload);
      setRefreshedAt(Date.now());
    } catch (err) {
      setQuote(null);
      const message = (err as Error).message;
      setError(message === "FETCH_FAILED" ? "fetchFailed" : "unexpected");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    fetchQuote();

    if (params) {
      interval = setInterval(fetchQuote, 20_000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchQuote, params]);

  return { quote, loading, error, refreshedAt, refresh: fetchQuote };
};
