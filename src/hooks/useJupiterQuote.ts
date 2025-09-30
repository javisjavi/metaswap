"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QuoteResponse } from "@/types/jupiter";

interface UseJupiterQuoteParams {
  inputMint?: string;
  outputMint?: string;
  amount?: bigint | null;
  enabled?: boolean;
  slippageBps?: number;
}

interface UseJupiterQuoteResult {
  quote: QuoteResponse | null;
  loading: boolean;
  error: string | null;
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
}: UseJupiterQuoteParams): UseJupiterQuoteResult => {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    };
  }, [enabled, inputMint, outputMint, amount, slippageBps]);

  const fetchQuote = useCallback(async () => {
    if (!params) {
      setQuote(null);
      setError(null);
      return;
    }

    const query = new URLSearchParams({
      cluster: "devnet",
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: params.slippageBps.toString(),
    });

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${JUPITER_QUOTE_URL}?${query.toString()}`);
      if (!response.ok) {
        throw new Error("No se pudo obtener la cotización");
      }
      const payload = (await response.json()) as QuoteResponse;
      setQuote(payload);
      setRefreshedAt(Date.now());
    } catch (err) {
      setQuote(null);
      setError((err as Error).message ?? "No se pudo calcular la cotización");
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
