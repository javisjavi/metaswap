"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/app/page.module.css";

interface CoinCapAsset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  supply: string;
}

interface TopMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COINCAP_ENDPOINT = "https://api.coincap.io/v2/assets?limit=10";

const parseNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: string, fractionDigits: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(parseNumber(value));

const formatCompactNumber = (value: string) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(parseNumber(value));

const formatPercent = (value: string) => {
  const formatted = parseNumber(value);
  return `${formatted > 0 ? "+" : ""}${formatted.toFixed(2)}%`;
};

const TopMarketModal = ({ isOpen, onClose }: TopMarketModalProps) => {
  const [assets, setAssets] = useState<CoinCapAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(COINCAP_ENDPOINT, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("No fue posible obtener las cotizaciones en este momento.");
        }
        const payload = (await response.json()) as { data: CoinCapAsset[] };
        if (!cancelled) {
          setAssets(payload.data);
        }
      } catch (err) {
        if (controller.signal.aborted || cancelled) {
          return;
        }
        setError((err as Error).message ?? "No fue posible obtener las cotizaciones en este momento.");
        setAssets([]);
      } finally {
        if (!controller.signal.aborted && !cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAssets();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isOpen]);

  const formattedRows = useMemo(
    () =>
      assets.map((asset) => ({
        ...asset,
        price: formatCurrency(asset.priceUsd, asset.priceUsd !== "0" ? 2 : 0),
        change: formatPercent(asset.changePercent24Hr),
        marketCap: formatCompactNumber(asset.marketCapUsd),
        volume: formatCompactNumber(asset.volumeUsd24Hr),
        supply: formatCompactNumber(asset.supply),
      })),
    [assets]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.marketModal}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="top-market-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="top-market-modal-title">Top 10 criptomonedas</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className={styles.marketSource}>Cotizaciones proporcionadas por CoinCap API.</div>

        {loading ? (
          <div className={styles.marketStatus}>Cargando cotizaciones…</div>
        ) : error ? (
          <div className={styles.errorBanner}>{error}</div>
        ) : (
          <div className={styles.marketTableWrapper}>
            <table className={styles.marketTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>24h</th>
                  <th>Market cap</th>
                  <th>Volumen 24h</th>
                  <th>Oferta</th>
                </tr>
              </thead>
              <tbody>
                {formattedRows.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.rank}</td>
                    <td>
                      <div className={styles.marketNameCell}>
                        <span className={styles.marketSymbol}>{asset.symbol}</span>
                        <span className={styles.marketName}>{asset.name}</span>
                      </div>
                    </td>
                    <td>{asset.price}</td>
                    <td className={
                      asset.change.startsWith("-")
                        ? styles.marketNegative
                        : styles.marketPositive
                    }>
                      {asset.change}
                    </td>
                    <td>{asset.marketCap}</td>
                    <td>{asset.volume}</td>
                    <td>{asset.supply}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMarketModal;
