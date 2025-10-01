import { QuoteResponse } from "@/types/jupiter";
import { getCachedTokenPriceUsd, setCachedTokenPriceUsd } from "@/utils/priceFeed";

type NetworkCluster = "devnet" | "testnet" | "mainnet-beta";

type QuoteParams = {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: number;
  cluster: NetworkCluster;
  swapMode: "ExactIn" | "ExactOut";
  inputDecimals?: number;
  outputDecimals?: number;
};

type FallbackTokenConfig = {
  symbol: string;
  decimals: number;
  priceUsd: number;
  priceIds?: string[];
};

type FallbackNetworkConfig = Record<string, FallbackTokenConfig>;

const FALLBACK_TOKENS: Record<NetworkCluster, FallbackNetworkConfig> = {
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

const MICRO_USD = BigInt(1_000_000);
const BPS_FACTOR = BigInt(10_000);
const DEXSCREENER_ENDPOINT = "https://api.dexscreener.com/latest/dex/tokens";
const DEXSCREENER_CACHE_TTL = 60_000; // 60 seconds

type DexScreenerPair = {
  baseToken?: { address?: string | null; symbol?: string | null } | null;
  priceUsd?: number | string | null;
  liquidity?: { usd?: number | string | null } | null;
};

type DexScreenerResponse = {
  pairs?: DexScreenerPair[] | null;
};

type DexScreenerPrice = {
  priceUsd: number;
  symbol?: string | null;
  fetchedAt: number;
};

const dexScreenerPriceCache = new Map<string, DexScreenerPrice>();

const toMicroUsd = (priceUsd: number): bigint => {
  return BigInt(Math.round(priceUsd * 1_000_000));
};

const formatMicroUsd = (value: bigint): string => {
  const whole = value / MICRO_USD;
  const fraction = value % MICRO_USD;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionString = fraction.toString().padStart(6, "0").replace(/0+$/, "");
  return fractionString ? `${whole.toString()}.${fractionString}` : whole.toString();
};

const applySlippageDown = (amount: bigint, slippageBps: number): bigint => {
  if (amount === BigInt(0) || slippageBps <= 0) {
    return amount;
  }
  return (amount * (BPS_FACTOR - BigInt(slippageBps))) / BPS_FACTOR;
};

const applySlippageUp = (amount: bigint, slippageBps: number): bigint => {
  if (amount === BigInt(0) || slippageBps <= 0) {
    return amount;
  }
  return roundUpDiv(amount * (BPS_FACTOR + BigInt(slippageBps)), BPS_FACTOR);
};

const roundUpDiv = (numerator: bigint, denominator: bigint): bigint => {
  if (denominator === BigInt(0)) {
    return BigInt(0);
  }
  return (numerator + (denominator - BigInt(1))) / denominator;
};

const getRealtimePrice = async (token: FallbackTokenConfig): Promise<number | null> => {
  if (!token.priceIds || token.priceIds.length === 0) {
    return null;
  }

  const ids = [...token.priceIds];

  for (const id of ids) {
    const price = await getCachedTokenPriceUsd(id);
    if (typeof price === "number" && Number.isFinite(price) && price > 0) {
      for (const alias of ids) {
        setCachedTokenPriceUsd(alias, price);
      }
      return price;
    }
  }

  return null;
};

const parsePositiveNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const numeric = Number.parseFloat(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }
  }
  return null;
};

const fetchDexScreenerPrice = async (
  mint: string,
): Promise<{ priceUsd: number; symbol?: string | null } | null> => {
  const cached = dexScreenerPriceCache.get(mint);
  const now = Date.now();

  if (cached && now - cached.fetchedAt <= DEXSCREENER_CACHE_TTL) {
    return { priceUsd: cached.priceUsd, symbol: cached.symbol };
  }

  try {
    const response = await fetch(`${DEXSCREENER_ENDPOINT}/${mint}`, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      if (cached) {
        return { priceUsd: cached.priceUsd, symbol: cached.symbol };
      }
      return null;
    }

    const payload = (await response.json()) as DexScreenerResponse;
    const pairs = payload.pairs ?? [];
    const normalizedMint = mint.toLowerCase();

    let bestPair: DexScreenerPair | null = null;
    let bestLiquidity = 0;

    for (const pair of pairs) {
      const baseAddress = pair.baseToken?.address?.toLowerCase();
      if (!baseAddress || baseAddress !== normalizedMint) {
        continue;
      }

      const price = parsePositiveNumber(pair.priceUsd);
      if (price == null) {
        continue;
      }

      const liquidity = parsePositiveNumber(pair.liquidity?.usd) ?? 0;
      if (!bestPair || liquidity > bestLiquidity) {
        bestPair = pair;
        bestLiquidity = liquidity;
      }
    }

    if (!bestPair) {
      if (cached) {
        return { priceUsd: cached.priceUsd, symbol: cached.symbol };
      }
      return null;
    }

    const result = {
      priceUsd: parsePositiveNumber(bestPair.priceUsd)!,
      symbol: bestPair.baseToken?.symbol ?? cached?.symbol ?? null,
    };

    dexScreenerPriceCache.set(mint, {
      priceUsd: result.priceUsd,
      symbol: result.symbol,
      fetchedAt: now,
    });

    return result;
  } catch (error) {
    if (cached) {
      return { priceUsd: cached.priceUsd, symbol: cached.symbol };
    }
    console.error("Error fetching DexScreener price", error);
    return null;
  }
};

type QuoteTokenContext = {
  decimals: number;
  priceMicroUsd: bigint;
};

const resolveTokenContext = async (
  mint: string,
  fallbackToken: FallbackTokenConfig | undefined,
  decimalsHint: number | undefined,
  allowDynamicPricing: boolean,
): Promise<QuoteTokenContext | null> => {
  if (fallbackToken) {
    const realtimePrice = await getRealtimePrice(fallbackToken);
    const priceMicroUsd = toPriceBigInt(realtimePrice, fallbackToken.priceUsd);
    return { decimals: fallbackToken.decimals, priceMicroUsd };
  }

  if (!allowDynamicPricing) {
    return null;
  }

  if (typeof decimalsHint !== "number" || !Number.isFinite(decimalsHint)) {
    return null;
  }

  const dexPrice = await fetchDexScreenerPrice(mint);
  if (!dexPrice) {
    return null;
  }

  return {
    decimals: decimalsHint,
    priceMicroUsd: toMicroUsd(dexPrice.priceUsd),
  };
};

const toPriceBigInt = (value: number | null, fallback: number): bigint => {
  const price = typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
  return toMicroUsd(price);
};

export const buildFallbackQuote = async (
  params: QuoteParams,
): Promise<QuoteResponse | null> => {
  const networkConfig = FALLBACK_TOKENS[params.cluster];
  if (!networkConfig) {
    return null;
  }

  const allowDynamicPricing = params.cluster === "mainnet-beta";

  const inputTokenContext = await resolveTokenContext(
    params.inputMint,
    networkConfig[params.inputMint],
    params.inputDecimals,
    allowDynamicPricing,
  );

  const outputTokenContext = await resolveTokenContext(
    params.outputMint,
    networkConfig[params.outputMint],
    params.outputDecimals,
    allowDynamicPricing,
  );

  if (!inputTokenContext || !outputTokenContext) {
    return null;
  }

  const inputAmount = BigInt(params.amount);
  if (inputAmount <= BigInt(0)) {
    return null;
  }

  const inputFactor = BigInt(10) ** BigInt(inputTokenContext.decimals);
  const outputFactor = BigInt(10) ** BigInt(outputTokenContext.decimals);
  const inputPrice = inputTokenContext.priceMicroUsd;
  const outputPrice = outputTokenContext.priceMicroUsd;

  if (inputPrice === BigInt(0) || outputPrice === BigInt(0)) {
    return null;
  }

  let inAmount = inputAmount;
  let outAmount = inputAmount;
  let valueMicroUsd = BigInt(0);

  if (params.swapMode === "ExactIn") {
    valueMicroUsd = (inputAmount * inputPrice) / inputFactor;
    outAmount = valueMicroUsd === BigInt(0)
      ? BigInt(0)
      : (valueMicroUsd * outputFactor) / outputPrice;
  } else {
    valueMicroUsd = roundUpDiv(inputAmount * outputPrice, outputFactor);
    inAmount = valueMicroUsd === BigInt(0)
      ? BigInt(0)
      : roundUpDiv(valueMicroUsd * inputFactor, inputPrice);
    outAmount = inputAmount;
  }

  const otherAmountThreshold =
    params.swapMode === "ExactIn"
      ? applySlippageDown(outAmount, params.slippageBps)
      : applySlippageUp(inAmount, params.slippageBps);

  const quote: QuoteResponse = {
    inputMint: params.inputMint,
    inAmount: inAmount.toString(),
    outputMint: params.outputMint,
    outAmount: outAmount.toString(),
    otherAmountThreshold: otherAmountThreshold.toString(),
    swapMode: params.swapMode,
    slippageBps: params.slippageBps,
    priceImpactPct: "0",
    routePlan: [
      {
        swapInfo: {
          ammKey: "fallback",
          label: "Fallback",
          inputMint: params.inputMint,
          outputMint: params.outputMint,
          inAmount: inAmount.toString(),
          outAmount: outAmount.toString(),
          feeAmount: "0",
          feeMint: params.inputMint,
        },
        percent: 100,
        bps: 0,
      },
    ],
    swapUsdValue: formatMicroUsd(valueMicroUsd),
  };

  return quote;
};

export type { QuoteParams };
