import Link from "next/link";
import type { Metadata } from "next";

import styles from "./page.module.css";
import { formatNumber } from "@/utils/amount";

export const metadata: Metadata = {
  title: "Top 10 criptomonedas | MetaSwap",
  description:
    "Consulta las cotizaciones y cambios de las 10 criptomonedas con mayor capitalización de mercado.",
};

interface CoinCapAsset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string | null;
  explorer: string | null;
}

interface CoinCapResponse {
  data: CoinCapAsset[];
  timestamp?: number;
}

interface MarketAsset {
  rank: number;
  name: string;
  symbol: string;
  priceUsd: number | null;
  changePercent24Hr: number | null;
  marketCapUsd: number | null;
  volumeUsd24Hr: number | null;
}

interface MarketDataResult {
  assets: MarketAsset[];
  timestamp: number | null;
}

const COINCAP_URL = "https://api.coincap.io/v2/assets?limit=10";

const parseNullableNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatUsd = (value: number | null): string => {
  if (value === null) {
    return "–";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 6,
  });

  return formatter.format(value);
};

const formatUsdCompact = (value: number | null): string => {
  if (value === null) {
    return "–";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
};

const formatPercent = (value: number | null): string => {
  if (value === null) {
    return "–";
  }

  const formatted = formatNumber(Math.abs(value), 2);
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `-${formatted}%`;
  return `${formatted}%`;
};

const fetchMarketData = async (): Promise<MarketDataResult> => {
  const response = await fetch(COINCAP_URL, {
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new Error("No fue posible obtener las cotizaciones en este momento.");
  }

  const payload = (await response.json()) as CoinCapResponse;
  const assets = payload.data?.map<MarketAsset>((asset) => ({
    rank: Number.parseInt(asset.rank, 10),
    name: asset.name,
    symbol: asset.symbol,
    priceUsd: parseNullableNumber(asset.priceUsd),
    changePercent24Hr: parseNullableNumber(asset.changePercent24Hr),
    marketCapUsd: parseNullableNumber(asset.marketCapUsd),
    volumeUsd24Hr: parseNullableNumber(asset.volumeUsd24Hr),
  }));

  if (!assets?.length) {
    throw new Error("El servicio de mercado no devolvió resultados válidos.");
  }

  const ordered = assets.sort((a, b) => a.rank - b.rank);

  return {
    assets: ordered,
    timestamp: typeof payload.timestamp === "number" ? payload.timestamp : null,
  };
};

const getUpdatedLabel = (timestamp: number | null): string | null => {
  if (!timestamp) return null;
  try {
    return new Date(timestamp).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  } catch {
    return null;
  }
};

const TopTenPage = async () => {
  let marketData: MarketDataResult | null = null;
  let error: string | null = null;

  try {
    marketData = await fetchMarketData();
  } catch (err) {
    error = (err as Error).message ?? "No pudimos obtener la información de mercado.";
  }

  const updatedLabel = getUpdatedLabel(marketData?.timestamp ?? null);

  return (
    <main className={styles.main}>
      <section className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Top 10 criptomonedas</h1>
            <p className={styles.subtitle}>
              Revisa las monedas con mayor capitalización de mercado y sus variaciones en las últimas 24 horas.
            </p>
          </div>
          <Link href="/" className={styles.backLink}>
            <span aria-hidden>←</span>
            <span>Volver al swap</span>
          </Link>
        </header>

        {error ? (
          <div className={styles.errorBanner}>{error}</div>
        ) : (
          <div className={styles.card}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.rank}>#</th>
                    <th>Criptomoneda</th>
                    <th className={styles.priceColumn}>Precio (USD)</th>
                    <th className={styles.changeColumn}>24h</th>
                    <th>Market Cap</th>
                    <th>Volumen 24h</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData?.assets.map((asset) => {
                    let changeClass = styles.changeNeutral;
                    if (asset.changePercent24Hr !== null) {
                      if (asset.changePercent24Hr > 0) {
                        changeClass = styles.changePositive;
                      } else if (asset.changePercent24Hr < 0) {
                        changeClass = styles.changeNegative;
                      }
                    }
                    return (
                      <tr key={asset.symbol}>
                        <td className={styles.rank}>{asset.rank}</td>
                        <td>
                          <div className={styles.assetName}>
                            <span>{asset.name}</span>
                            <span className={styles.assetSymbol}>{asset.symbol}</span>
                          </div>
                        </td>
                        <td className={styles.priceColumn}>{formatUsd(asset.priceUsd)}</td>
                        <td className={`${styles.changeColumn} ${changeClass}`}>
                          {formatPercent(asset.changePercent24Hr)}
                        </td>
                        <td>{formatUsdCompact(asset.marketCapUsd)}</td>
                        <td>{formatUsdCompact(asset.volumeUsd24Hr)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          {updatedLabel && (
            <span className={styles.updatedAt}>Última actualización: {updatedLabel}</span>
          )}
          <span className={styles.disclaimer}>Cotizaciones proporcionadas por CoinCap API.</span>
        </footer>
      </section>
    </main>
  );
};

export default TopTenPage;
