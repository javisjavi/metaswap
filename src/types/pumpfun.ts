export type PumpFunProject = {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  priceUsd: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  bondingProgress: number | null;
  bondingMarketCapTargetUsd: number | null;
  raisedUsd: number | null;
  holders: number | null;
  createdAt: string | null;
  twitter?: string | null;
  telegram?: string | null;
  website?: string | null;
};
