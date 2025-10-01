import { QuoteResponse } from "@/types/jupiter";

type NetworkCluster = "devnet" | "testnet" | "mainnet-beta";

type QuoteParams = {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: number;
  cluster: NetworkCluster;
  swapMode: "ExactIn" | "ExactOut";
};

type FallbackTokenConfig = {
  symbol: string;
  decimals: number;
  priceUsd: number;
};

type FallbackNetworkConfig = Record<string, FallbackTokenConfig>;

const FALLBACK_TOKENS: Record<NetworkCluster, FallbackNetworkConfig> = {
  "mainnet-beta": {
    So11111111111111111111111111111111111111112: {
      symbol: "SOL",
      decimals: 9,
      priceUsd: 170,
    },
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      symbol: "USDC",
      decimals: 6,
      priceUsd: 1,
    },
    Es9vMFrzaCERB7TEjeq1eviErNTtHxgc3FPf4c8b1C5K: {
      symbol: "USDT",
      decimals: 6,
      priceUsd: 1,
    },
    DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
      symbol: "BONK",
      decimals: 5,
      priceUsd: 0.00002,
    },
    "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": {
      symbol: "stSOL",
      decimals: 9,
      priceUsd: 175,
    },
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
      symbol: "RAY",
      decimals: 6,
      priceUsd: 0.2,
    },
    orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE: {
      symbol: "ORCA",
      decimals: 6,
      priceUsd: 0.8,
    },
    MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey: {
      symbol: "MNDE",
      decimals: 9,
      priceUsd: 0.35,
    },
    HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p: {
      symbol: "LDO",
      decimals: 8,
      priceUsd: 2.25,
    },
  },
  devnet: {
    So11111111111111111111111111111111111111112: {
      symbol: "SOL",
      decimals: 9,
      priceUsd: 25,
    },
    Gh9ZwEmdLJ8DscKNTkT8oA7XgaiX9ktEFWXzrL7zQ7U: {
      symbol: "USDC",
      decimals: 6,
      priceUsd: 1,
    },
  },
  testnet: {
    So11111111111111111111111111111111111111112: {
      symbol: "SOL",
      decimals: 9,
      priceUsd: 25,
    },
  },
};

const MICRO_USD = BigInt(1_000_000);
const BPS_FACTOR = BigInt(10_000);

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

export const buildFallbackQuote = (params: QuoteParams): QuoteResponse | null => {
  const networkConfig = FALLBACK_TOKENS[params.cluster];
  if (!networkConfig) {
    return null;
  }

  const inputToken = networkConfig[params.inputMint];
  const outputToken = networkConfig[params.outputMint];
  if (!inputToken || !outputToken) {
    return null;
  }

  const inputAmount = BigInt(params.amount);
  if (inputAmount <= BigInt(0)) {
    return null;
  }

  const inputFactor = BigInt(10) ** BigInt(inputToken.decimals);
  const outputFactor = BigInt(10) ** BigInt(outputToken.decimals);
  const inputPrice = toMicroUsd(inputToken.priceUsd);
  const outputPrice = toMicroUsd(outputToken.priceUsd);

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
