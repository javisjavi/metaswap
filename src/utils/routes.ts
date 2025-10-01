import { QuoteRoutePlan } from "@/types/jupiter";

export interface RoutePlatformSummary {
  label: string;
  percent: number;
  icon: string;
}

export type RouteSummary = RoutePlatformSummary[][];

const DEFAULT_PLATFORM_ICON = "/platform-icons/default.svg";

const PLATFORM_ICON_MAP: Record<string, string> = {
  Jupiter: "/platform-icons/jupiter.svg",
  Orca: "/platform-icons/orca.svg",
  "Orca Whirlpool": "/platform-icons/orca-whirlpool.svg",
  Raydium: "/platform-icons/raydium.svg",
  Meteora: "/platform-icons/meteora.svg",
  "Meteora DLMM": "/platform-icons/meteora.svg",
  Lifinity: "/platform-icons/lifinity.svg",
  Crema: "/platform-icons/crema.svg",
  Saber: "/platform-icons/saber.svg",
  OpenBook: "/platform-icons/openbook.svg",
  Phoenix: "/platform-icons/phoenix.svg",
  Whirlpool: "/platform-icons/orca-whirlpool.svg",
};

const PLATFORM_ALIAS_MAP: Record<string, string> = {
  "Raydium CLMM": "Raydium",
  "Raydium AMM": "Raydium",
  "Raydium Standard": "Raydium",
  "Meteora Dynamic": "Meteora",
  "Orca (Whirlpool)": "Orca Whirlpool",
  "Orca V2": "Orca",
  "Orca AMM": "Orca",
  "Meteora (DLMM)": "Meteora DLMM",
  "Open Book": "OpenBook",
};

const normalizeRoutePlan = (
  routePlan: QuoteRoutePlan[][] | QuoteRoutePlan[]
): QuoteRoutePlan[][] => {
  if (!routePlan.length) {
    return [];
  }

  const first = routePlan[0] as QuoteRoutePlan | QuoteRoutePlan[];
  if (Array.isArray(first)) {
    return routePlan as QuoteRoutePlan[][];
  }

  return (routePlan as QuoteRoutePlan[]).map((step) => [step]);
};

const resolvePlatformIcon = (label: string): string => {
  const trimmedLabel = label.trim();
  const alias = PLATFORM_ALIAS_MAP[trimmedLabel] ?? trimmedLabel;
  return PLATFORM_ICON_MAP[alias] ?? DEFAULT_PLATFORM_ICON;
};

const resolvePlatformLabel = (routeStep: QuoteRoutePlan): string => {
  const rawLabel = routeStep.swapInfo.label?.trim();
  if (!rawLabel || rawLabel.toLowerCase() === "fallback") {
    return "Jupiter";
  }
  return rawLabel;
};

export const buildRouteSummary = (
  routePlan?: QuoteRoutePlan[][] | QuoteRoutePlan[] | null
): RouteSummary => {
  if (!routePlan || !routePlan.length) {
    return [];
  }

  const normalized = normalizeRoutePlan(routePlan);

  return normalized
    .map((stage) =>
      stage.reduce<RoutePlatformSummary[]>((accumulator, step) => {
        const label = resolvePlatformLabel(step);
        const percent = Number.isFinite(step.percent)
          ? step.percent
          : 0;
        const existing = accumulator.find((item) => item.label === label);

        if (existing) {
          existing.percent += percent;
          return accumulator;
        }

        return [
          ...accumulator,
          {
            label,
            percent,
            icon: resolvePlatformIcon(label),
          },
        ];
      }, [])
    )
    .filter((stage) => stage.length > 0);
};

const shortenMint = (mint: string): string =>
  `${mint.slice(0, 4)}…${mint.slice(-4)}`;

type TokenSymbolLookup = (mint: string) => string | undefined;

const resolveTokenSymbol = (
  mint: string,
  lookup?: TokenSymbolLookup
): string => lookup?.(mint) ?? shortenMint(mint);

export const buildRoutePath = (
  routePlan?: QuoteRoutePlan[][] | QuoteRoutePlan[] | null,
  lookup?: TokenSymbolLookup
): string[][] => {
  if (!routePlan || !routePlan.length) {
    return [];
  }

  const normalized = normalizeRoutePlan(routePlan);

  return normalized
    .map((stage) => {
      if (!stage.length) {
        return [];
      }

      return stage.reduce<string[]>((path, step, index) => {
        const inputSymbol = resolveTokenSymbol(
          step.swapInfo.inputMint,
          lookup
        );
        const outputSymbol = resolveTokenSymbol(
          step.swapInfo.outputMint,
          lookup
        );

        if (index === 0) {
          path.push(inputSymbol);
        }

        if (path[path.length - 1] !== outputSymbol) {
          path.push(outputSymbol);
        }

        return path;
      }, []);
    })
    .filter((stage) => stage.length > 0);
};

export const getPlatformIcon = (label: string): string =>
  resolvePlatformIcon(label);

export { DEFAULT_PLATFORM_ICON };
