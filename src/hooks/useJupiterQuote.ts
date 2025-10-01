"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuoteResponse } from "@/types/jupiter";
import { buildFallbackQuote, QuoteParams } from "@/utils/fallbackQuote";

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
  isFallback: boolean;
}

const isValidQuoteResponse = (value: unknown): value is QuoteResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  const requiredStringFields: (keyof QuoteResponse)[] = [
    "inputMint",
    "inAmount",
    "outputMint",
    "outAmount",
    "otherAmountThreshold",
  ];

  if (!requiredStringFields.every((field) => typeof data[field] === "string")) {
    return false;
  }

  if (data.swapMode !== "ExactIn" && data.swapMode !== "ExactOut") {
    return false;
  }

  if (typeof data.slippageBps !== "number") {
    return false;
  }

  if (!Array.isArray(data.routePlan)) {
    return false;
  }

  return true;
};

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
  const [isFallback, setIsFallback] = useState(false);
  const latestRequestId = useRef(0);

  const params = useMemo<QuoteParams | null>(() => {
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
      latestRequestId.current += 1;
      setQuote(null);
      setError(null);
      setRefreshedAt(null);
      setLoading(false);
      setIsFallback(false);
      return;
    }

    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;

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
      const response = await fetch(`/api/jupiter/quote?${query.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("FETCH_FAILED");
      }
      const payload = (await response.json()) as QuoteResponse;
      if (!isValidQuoteResponse(payload)) {
        throw new Error("FETCH_FAILED");
      }
      if (requestId !== latestRequestId.current) {
        return;
      }
      setQuote(payload);
      setRefreshedAt(Date.now());
      setIsFallback(false);
    } catch (err) {
      if (requestId !== latestRequestId.current) {
        return;
      }
      if (params) {
        const fallbackQuote = buildFallbackQuote(params);
        if (fallbackQuote) {
          setQuote(fallbackQuote);
          setRefreshedAt(Date.now());
          setError(null);
          setIsFallback(true);
          return;
        }
      }
      setQuote(null);
      const message = (err as Error).message;
      setError(message === "FETCH_FAILED" ? "fetchFailed" : "unexpected");
      setIsFallback(false);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
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

  return { quote, loading, error, refreshedAt, refresh: fetchQuote, isFallback };
};
