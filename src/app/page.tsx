"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import Image from "next/image";

import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import WalletButton from "@/components/WalletButton";
import { useLanguage, useTranslations } from "@/context/LanguageContext";
import { useNetwork } from "@/context/NetworkContext";
import { type PumpFunProject } from "@/types/pumpfun";
import { type ExplorerApiResponse, type ExplorerResult } from "@/types/explorer";
import { type AppTranslation, type SectionKey } from "@/utils/translations";
import { getIntlLocale } from "@/utils/language";
import { useTokenList } from "@/hooks/useTokenList";

import styles from "./page.module.css";
import SwapForm from "@/components/SwapForm";

type IconProps = {
  className?: string;
};

type SectionDefinition = {
  key: SectionKey;
  label: string;
  description: string;
  Icon: (props: IconProps) => JSX.Element;
};

const SwapIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <path
      d="M7 7h8.6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <path
      d="M14.2 4.6L17.2 7.5 14.2 10.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <path
      d="M7.2 7v5.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M17 17H8.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <path
      d="M9.4 19.4L6.4 16.5 9.4 13.6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <path
      d="M16.8 17v-5.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
);

const OverviewIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <rect
      x="4.2"
      y="4.2"
      width="7.6"
      height="7.6"
      rx="1.8"
      stroke="currentColor"
      strokeWidth="1.6"
      opacity="0.92"
    />
    <rect
      x="4.2"
      y="13.2"
      width="7.6"
      height="6.6"
      rx="1.8"
      stroke="currentColor"
      strokeWidth="1.6"
      opacity="0.92"
    />
    <path
      d="M13.4 6.2h6.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M13.4 10h6.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M13.4 14l2.4 2.4 2.2-3 2.4 4.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <circle
      cx="13.5"
      cy="18.2"
      r="0.9"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);

const MarketIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <path
      d="M4.5 19.5h15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.45"
    />
    <rect
      x="5.2"
      y="11.2"
      width="2.9"
      height="6.1"
      rx="1.2"
      fill="currentColor"
      opacity="0.82"
    />
    <rect
      x="10.2"
      y="7.4"
      width="2.9"
      height="9.9"
      rx="1.2"
      fill="currentColor"
      opacity="0.65"
    />
    <rect
      x="15.2"
      y="4.4"
      width="2.9"
      height="12.9"
      rx="1.2"
      fill="currentColor"
      opacity="0.52"
    />
    <path
      d="M5.2 11.3l3.5-3.5 3.3 2.7 4.2-5.2 2.6 2.4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
  </svg>
);

const ExplorerIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <circle
      cx="11"
      cy="11"
      r="6"
      stroke="currentColor"
      strokeWidth="1.6"
      opacity="0.9"
    />
    <path
      d="M15.5 15.5l3.1 3.1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M11 8.2a2.8 2.8 0 0 0-2.8 2.8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.6"
    />
    <circle cx="11" cy="11" r="1" fill="currentColor" opacity="0.7" />
  </svg>
);

const PumpFunIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <path
      d="M12 3c-2.5 2.05-4.2 4.35-4.2 7.1 0 2.03 1.27 3.7 4.2 5.9 2.93-2.2 4.2-3.87 4.2-5.9 0-2.75-1.7-5.05-4.2-7.1z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      opacity="0.85"
    />
    <circle cx="12" cy="10.5" r="1.8" fill="currentColor" opacity="0.75" />
    <path
      d="M9.6 16.2 12 21l2.4-4.8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.85"
    />
  </svg>
);

const SupportIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" opacity="0.92" />
    <circle
      cx="12"
      cy="12"
      r="5.2"
      fill="currentColor"
      opacity="0.16"
    />
    <circle
      cx="12"
      cy="12"
      r="3.4"
      stroke="currentColor"
      strokeWidth="1.6"
      opacity="0.65"
    />
    <path
      d="M12 4.8v1.9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M19.2 12h-1.9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M12 17.3v1.9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M6.7 12H4.8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M7.4 7.4l1.4 1.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M16.6 7.4l-1.4 1.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M16.6 16.6l-1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M8.8 15.2L7.4 16.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

const LAMPORTS_PER_SOL = 1_000_000_000;

const MARKET_PAGE_SIZE = 100;
const FAVORITES_LIMIT = 5;
const FAVORITES_STORAGE_KEY_PREFIX = "metaswap:favorites:";

const FavoriteStar = ({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 3.3l2.3 4.7 5.2.76-3.8 3.68.9 5.19L12 15.95l-4.6 2.42.9-5.19L4.5 8.76l5.2-.76L12 3.3z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.6}
      strokeLinejoin="round"
    />
  </svg>
);

const getMarketApiUrl = (page: number) =>
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${MARKET_PAGE_SIZE}&page=${page}&sparkline=true&price_change_percentage=24h`;

type MarketAsset = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  sparkline: number[];
};

const SparklineChart = ({
  data,
  trend,
}: {
  data: number[];
  trend: "up" | "down" | "flat";
}) => {
  const sanitized = data.filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );

  const colorClass =
    trend === "up"
      ? styles.marketSparklinePositive
      : trend === "down"
        ? styles.marketSparklineNegative
        : styles.marketSparklineNeutral;

  if (sanitized.length < 2) {
    return (
      <div
        className={`${styles.marketSparklinePlaceholder} ${colorClass}`}
        aria-hidden="true"
      />
    );
  }

  const width = 120;
  const height = 40;
  const padding = 4;
  const min = Math.min(...sanitized);
  const max = Math.max(...sanitized);
  const range = max - min || 1;

  const points = sanitized.map((value, index) => {
    const x =
      padding + (index / (sanitized.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);

    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1][0].toFixed(2)} ${
    height - padding
  } L ${points[0][0].toFixed(2)} ${height - padding} Z`;

  return (
    <svg
      className={`${styles.marketSparklineChart} ${colorClass}`}
      viewBox={`0 0 ${width} ${height}`}
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <path className={styles.marketSparklineArea} d={areaPath} />
      <path className={styles.marketSparklinePath} d={linePath} />
    </svg>
  );
};

const MarketPanel = ({
  content,
  favorites,
  walletAddress,
  onToggleFavorite,
}: {
  content: AppTranslation["market"];
  favorites: string[];
  walletAddress: string | null;
  onToggleFavorite: (assetId: string) => void;
}) => {
  const { language } = useLanguage();
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const locale = getIntlLocale(language);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const compactCurrencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const percentageFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const loadMarketData = useCallback(
    async (page: number, signal?: AbortSignal) => {
      if (!signal?.aborted) {
        setIsLoading(true);
        setHasError(false);
      }

      try {
        const response = await fetch(getMarketApiUrl(page), {
          signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch market data: ${response.status}`);
        }

        const data: Array<{
          id: string;
          symbol: string;
          name: string;
          image: string | null;
          current_price: number;
          market_cap: number | null;
          total_volume: number | null;
          price_change_percentage_24h: number | null;
          sparkline_in_7d: { price: Array<number | null> } | null;
        }> = await response.json();

        if (signal?.aborted) {
          return;
        }

        const normalized = data.map<MarketAsset>((coin) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image ?? "",
          currentPrice: coin.current_price,
          marketCap: coin.market_cap ?? 0,
          volume24h: coin.total_volume ?? 0,
          change24h:
            typeof coin.price_change_percentage_24h === "number"
              ? coin.price_change_percentage_24h
              : 0,
          sparkline: Array.isArray(coin.sparkline_in_7d?.price)
            ? coin.sparkline_in_7d!.price.filter(
                (value): value is number =>
                  typeof value === "number" && Number.isFinite(value),
              )
            : [],
        }));

        setAssets(normalized);
        setLastUpdated(new Date());
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (!signal?.aborted) {
          setHasError(true);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadMarketData(currentPage, controller.signal);

    return () => {
      controller.abort();
    };
  }, [currentPage, loadMarketData]);

  const handleRetry = useCallback(() => {
    void loadMarketData(currentPage);
  }, [currentPage, loadMarketData]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((previous) => previous + 1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((previous) => Math.max(1, previous - 1));
  }, []);

  const pageStartIndex = useMemo(
    () => (currentPage - 1) * MARKET_PAGE_SIZE + 1,
    [currentPage],
  );

  const pageEndIndex = useMemo(
    () => pageStartIndex + Math.max(assets.length - 1, 0),
    [assets.length, pageStartIndex],
  );

  const canGoPrevious = currentPage > 1;
  const canGoNext = assets.length === MARKET_PAGE_SIZE;

  return (
    <div className={styles.infoSection}>
      <header className={styles.infoHeader}>
        <h1 className={styles.infoTitle}>{content.title}</h1>
        <p className={styles.infoSubtitle}>{content.subtitle}</p>
      </header>

      {isLoading ? (
        <div className={styles.marketStatus} role="status">
          {content.status.loading}
        </div>
      ) : hasError ? (
        <div className={styles.marketStatus} role="alert">
          <span>{content.status.error}</span>
          <button
            type="button"
            className={styles.marketRetryButton}
            onClick={handleRetry}
          >
            {content.status.retry}
          </button>
        </div>
      ) : (
        <div className={styles.marketTableWrapper}>
            <div className={styles.marketTable}>
              <div className={styles.marketHeaderRow}>
                <span className={styles.marketHeaderCell}>{content.columns.rank}</span>
                <span className={styles.marketHeaderCell}>{content.columns.name}</span>
                <span className={styles.marketHeaderCell}>{content.columns.price}</span>
                <span className={styles.marketHeaderCell}>{content.columns.marketCap}</span>
                <span className={styles.marketHeaderCell}>{content.columns.volume24h}</span>
                <span className={styles.marketHeaderCell}>{content.columns.change24h}</span>
                <span className={styles.marketHeaderCell}>{content.columns.sparkline}</span>
              </div>

              {assets.map((asset, index) => {
                const formattedChange = `${asset.change24h >= 0 ? "+" : ""}${percentageFormatter.format(asset.change24h / 100)}`;
                const changeClassName =
                  asset.change24h >= 0
                    ? styles.marketChangePositive
                    : styles.marketChangeNegative;
                const isFavorite = favorites.includes(asset.id);
                const disableFavoriteButton =
                  !walletAddress || (!isFavorite && favorites.length >= FAVORITES_LIMIT);
                const favoriteLabel = isFavorite
                  ? content.favorites.remove(asset.name)
                  : content.favorites.add(asset.name);
                const favoriteTitle = !walletAddress
                  ? content.favorites.connectWallet
                  : !isFavorite && favorites.length >= FAVORITES_LIMIT
                    ? content.favorites.limitReached
                    : favoriteLabel;
                const changeTrend =
                  asset.change24h > 0
                    ? "up"
                    : asset.change24h < 0
                      ? "down"
                      : "flat";

                return (
                  <div key={asset.id} className={styles.marketRow}>
                  <div
                    className={`${styles.marketCell} ${styles.marketRankCell}`}
                    data-label={content.columns.rank}
                  >
                    <span className={styles.marketRank}>
                      {pageStartIndex + index}
                    </span>
                  </div>
                  <div
                    className={`${styles.marketCell} ${styles.marketCoinCell}`}
                    data-label={content.columns.name}
                  >
                    <div className={styles.marketCoin}>
                      <button
                        type="button"
                        className={`${styles.favoriteButton} ${
                          isFavorite ? styles.favoriteButtonActive : ""
                        }`}
                        onClick={() => onToggleFavorite(asset.id)}
                        aria-label={favoriteLabel}
                        aria-pressed={isFavorite}
                        disabled={disableFavoriteButton}
                        title={favoriteTitle}
                      >
                        <FavoriteStar
                          filled={isFavorite}
                          className={styles.favoriteIcon}
                        />
                      </button>
                      {asset.image ? (
                        <Image
                          src={asset.image}
                          alt={`${asset.name} logo`}
                          width={40}
                          height={40}
                          className={styles.marketCoinImage}
                          loading="lazy"
                          sizes="40px"
                        />
                      ) : (
                        <div className={styles.marketCoinFallback} aria-hidden="true">
                          {asset.symbol.slice(0, 2)}
                        </div>
                      )}
                      <div className={styles.marketCoinInfo}>
                        <span className={styles.marketCoinName}>{asset.name}</span>
                        <span className={styles.marketCoinSymbol}>{asset.symbol}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.marketCell} data-label={content.columns.price}>
                    <span className={styles.marketValue}>
                      {currencyFormatter.format(asset.currentPrice)}
                    </span>
                  </div>
                  <div className={styles.marketCell} data-label={content.columns.marketCap}>
                    <span className={styles.marketValue}>
                      {compactCurrencyFormatter.format(asset.marketCap)}
                    </span>
                  </div>
                  <div className={styles.marketCell} data-label={content.columns.volume24h}>
                    <span className={styles.marketValue}>
                      {compactCurrencyFormatter.format(asset.volume24h)}
                    </span>
                  </div>
                  <div className={styles.marketCell} data-label={content.columns.change24h}>
                    <span className={`${styles.marketValue} ${changeClassName}`}>
                      {formattedChange}
                    </span>
                  </div>
                  <div
                    className={`${styles.marketCell} ${styles.marketSparklineCell}`}
                    data-label={content.columns.sparkline}
                  >
                    <div className={styles.marketSparklineWrapper}>
                      <SparklineChart data={asset.sparkline} trend={changeTrend} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <nav
            className={styles.marketPagination}
            aria-label={content.pagination.ariaLabel}
          >
            <span className={styles.marketPaginationInfo} aria-live="polite">
              {assets.length > 0
                ? content.pagination.showing(pageStartIndex, pageEndIndex)
                : content.pagination.empty}
            </span>
            <div className={styles.marketPaginationControls}>
              <button
                type="button"
                className={styles.marketPaginationButton}
                onClick={handlePreviousPage}
                disabled={!canGoPrevious || isLoading}
              >
                {content.pagination.previous}
              </button>
              <span className={styles.marketPaginationLabel}>
                {content.pagination.pageLabel(currentPage)}
              </span>
              <button
                type="button"
                className={styles.marketPaginationButton}
                onClick={handleNextPage}
                disabled={!canGoNext || isLoading}
              >
                {content.pagination.next}
              </button>
            </div>
          </nav>
        </div>
      )}

      {!isLoading && !hasError && lastUpdated ? (
        <p className={styles.marketUpdatedAt}>
          {content.status.updatedAt(dateTimeFormatter.format(lastUpdated))}
        </p>
      ) : null}
    </div>
  );
};

type ExplorerStatus = "idle" | "loading" | "invalid" | "not-found" | "error" | "success";

const formatTokenAmount = (rawAmount: string, decimals: number) => {
  try {
    const base = BigInt(10) ** BigInt(decimals);
    const value = BigInt(rawAmount);
    const whole = value / base;
    const fraction = value % base;

    if (fraction === BigInt(0)) {
      return whole.toString();
    }

    const fractionString = fraction
      .toString()
      .padStart(decimals, "0")
      .replace(/0+$/, "");

    return fractionString.length > 0
      ? `${whole.toString()}.${fractionString}`
      : whole.toString();
  } catch {
    return rawAmount;
  }
};

const ExplorerPanel = ({ content }: { content: AppTranslation["explorer"] }) => {
  const { language } = useLanguage();
  const locale = getIntlLocale(language);
  const { network } = useNetwork();
  const { findByMint } = useTokenList(network);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ExplorerStatus>("idle");
  const [result, setResult] = useState<ExplorerResult | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lamportFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const solFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 9,
        minimumFractionDigits: 0,
      }),
    [locale],
  );
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const formatBoolean = useCallback(
    (value: boolean) => (value ? content.boolean.yes : content.boolean.no),
    [content.boolean],
  );

  const handleCopy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopiedValue(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy value", error);
    }
  }, []);

  const handleQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    if (!value.trim()) {
      setStatus("idle");
      setResult(null);
    }
  }, []);

  const handleSearch = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = query.trim();

      if (!trimmed) {
        setStatus("invalid");
        setResult(null);
        return;
      }

      setStatus("loading");
      setResult(null);

      try {
        const response = await fetch("/api/explorer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        });

        if (response.status === 400) {
          setStatus("invalid");
          setResult(null);
          return;
        }

        if (response.status === 404) {
          setStatus("not-found");
          setResult(null);
          return;
        }

        if (!response.ok) {
          setStatus("error");
          setResult(null);
          return;
        }

        const data = (await response.json()) as ExplorerApiResponse;
        setResult(data.result);
        setStatus("success");
      } catch (error) {
        console.error("Explorer search failed", error);
        setStatus("error");
        setResult(null);
      }
    },
    [query],
  );

  const statusMessage = useMemo(() => {
    switch (status) {
      case "idle":
        return content.status.initial;
      case "loading":
        return content.status.loading;
      case "invalid":
        return content.status.invalid;
      case "not-found":
        return content.status.notFound;
      case "error":
        return content.status.error;
      default:
        return null;
    }
  }, [content.status, status]);

  const renderAccount = (
    account: Extract<ExplorerResult, { kind: "account" }>,
  ) => {
    const solBalance = account.lamports / LAMPORTS_PER_SOL;
    const accountTypeLabel =
      content.account.accountTypes[account.accountType] ?? content.account.accountTypes.unknown;
    const badgeKey =
      account.accountType === "wallet"
        ? "wallet"
        : account.accountType === "program"
          ? "program"
          : account.accountType === "tokenMint"
            ? "tokenMint"
            : account.accountType === "tokenAccount"
              ? "tokenAccount"
              : "generic";
    const badgeLabel = content.account.badges[badgeKey] ?? content.account.badges.generic;

    const tokenMintSection = account.tokenMintInfo ? (
      <div className={styles.explorerSubSection}>
        <h3 className={styles.explorerSectionTitle}>{content.account.badges.tokenMint}</h3>
        <dl className={styles.explorerKeyValueList}>
          <div>
            <dt>{content.account.tokenMintFields.supply}</dt>
            <dd>
              {formatTokenAmount(
                account.tokenMintInfo.supply,
                account.tokenMintInfo.decimals,
              )}
            </dd>
          </div>
          <div>
            <dt>{content.account.tokenMintFields.decimals}</dt>
            <dd>{account.tokenMintInfo.decimals}</dd>
          </div>
          <div>
            <dt>{content.account.tokenMintFields.mintAuthority}</dt>
            <dd>{account.tokenMintInfo.mintAuthority ?? "—"}</dd>
          </div>
          <div>
            <dt>{content.account.tokenMintFields.freezeAuthority}</dt>
            <dd>{account.tokenMintInfo.freezeAuthority ?? "—"}</dd>
          </div>
          <div>
            <dt>{content.account.tokenMintFields.isInitialized}</dt>
            <dd>{formatBoolean(account.tokenMintInfo.isInitialized)}</dd>
          </div>
        </dl>
      </div>
    ) : null;

    const tokenAccountSection = account.tokenAccountInfo ? (
      <div className={styles.explorerSubSection}>
        <h3 className={styles.explorerSectionTitle}>{content.account.badges.tokenAccount}</h3>
        <dl className={styles.explorerKeyValueList}>
          <div>
            <dt>{content.account.tokenAccountFields.mint}</dt>
            <dd>{account.tokenAccountInfo.mint}</dd>
          </div>
          <div>
            <dt>{content.account.tokenAccountFields.owner}</dt>
            <dd>{account.tokenAccountInfo.owner}</dd>
          </div>
          <div>
            <dt>{content.account.tokenAccountFields.amount}</dt>
            <dd>
              {account.tokenAccountInfo.uiAmountString &&
              account.tokenAccountInfo.uiAmountString.length > 0
                ? account.tokenAccountInfo.uiAmountString
                : formatTokenAmount(
                    account.tokenAccountInfo.amount,
                    account.tokenAccountInfo.decimals,
                  )}
            </dd>
          </div>
          <div>
            <dt>{content.account.tokenAccountFields.decimals}</dt>
            <dd>{account.tokenAccountInfo.decimals}</dd>
          </div>
          <div>
            <dt>{content.account.tokenAccountFields.delegate}</dt>
            <dd>{account.tokenAccountInfo.delegate ?? "—"}</dd>
          </div>
          <div>
            <dt>{content.account.tokenAccountFields.state}</dt>
            <dd>{account.tokenAccountInfo.state}</dd>
          </div>
        </dl>
      </div>
    ) : null;

    const sortedHoldings = account.tokenHoldings
      .slice()
      .sort((a, b) => {
        try {
          const amountA = BigInt(a.amount);
          const amountB = BigInt(b.amount);
          if (amountA === amountB) {
            return a.mint.localeCompare(b.mint);
          }
          return amountA < amountB ? 1 : -1;
        } catch {
          return 0;
        }
      });

    const tokenHoldingsSection = account.accountType === "wallet" ? (
      <div className={styles.explorerSubSection}>
        <h3 className={styles.explorerSectionTitle}>{content.account.tokenHoldings.title}</h3>
        {sortedHoldings.length > 0 ? (
          <ul className={styles.explorerTokenList}>
            {sortedHoldings.map((holding) => {
              const tokenInfo = findByMint(holding.mint);
              const truncatedMint =
                holding.mint.length <= 10
                  ? holding.mint
                  : `${holding.mint.slice(0, 4)}…${holding.mint.slice(-4)}`;
              const displaySymbol = tokenInfo?.symbol ?? truncatedMint;
              const displayName = tokenInfo?.name ?? truncatedMint;
              const displayAmount =
                holding.uiAmountString && holding.uiAmountString.length > 0
                  ? holding.uiAmountString
                  : formatTokenAmount(holding.amount, holding.decimals);
              const fallbackInitial = displaySymbol.slice(0, 2).toUpperCase();

              return (
                <li key={holding.tokenAccount} className={styles.explorerTokenRow}>
                  <div className={styles.explorerTokenInfo}>
                    {tokenInfo?.logoURI ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tokenInfo.logoURI}
                        alt={`${displaySymbol} logo`}
                        className={styles.explorerTokenLogo}
                        onError={(event) => {
                          event.currentTarget.src = "/placeholder-token.svg";
                        }}
                      />
                    ) : (
                      <div className={styles.explorerTokenFallback} aria-hidden="true">
                        {fallbackInitial}
                      </div>
                    )}
                    <div className={styles.explorerTokenMeta}>
                      <span className={styles.explorerTokenSymbol}>{displaySymbol}</span>
                      <span className={styles.explorerTokenName}>{displayName}</span>
                    </div>
                  </div>
                  <div className={styles.explorerTokenAmountGroup}>
                    <span className={styles.explorerTokenAmount}>{displayAmount}</span>
                    <span className={styles.explorerTokenAmountSymbol}>{displaySymbol}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.explorerEmptyState}>{content.account.tokenHoldings.empty}</p>
        )}
      </div>
    ) : null;

    return (
      <section className={styles.explorerResultCard} aria-live="polite">
        <header className={styles.explorerResultHeader}>
          <div className={styles.explorerResultTitleGroup}>
            <h2 className={styles.explorerResultTitle}>{content.account.sectionTitle}</h2>
            <p className={styles.explorerResultValue}>{account.address}</p>
          </div>
          <div className={styles.explorerResultActions}>
            <span className={styles.explorerBadge}>{badgeLabel}</span>
            <button
              type="button"
              className={styles.explorerCopyButton}
              onClick={() => handleCopy(account.address)}
            >
              {copiedValue === account.address
                ? content.copyAction.copied
                : content.copyAction.copy}
            </button>
          </div>
        </header>

        <dl className={styles.explorerKeyValueList}>
          <div>
            <dt>{content.account.fields.address}</dt>
            <dd>{account.address}</dd>
          </div>
          <div>
            <dt>{content.account.fields.owner}</dt>
            <dd>{account.owner}</dd>
          </div>
          <div>
            <dt>{content.account.fields.accountType}</dt>
            <dd>{accountTypeLabel}</dd>
          </div>
          <div>
            <dt>{content.account.fields.lamports}</dt>
            <dd>{lamportFormatter.format(account.lamports)}</dd>
          </div>
          <div>
            <dt>{content.account.fields.solBalance}</dt>
            <dd>{solFormatter.format(solBalance)}</dd>
          </div>
          <div>
            <dt>{content.account.fields.executable}</dt>
            <dd>{formatBoolean(account.executable)}</dd>
          </div>
          <div>
            <dt>{content.account.fields.rentEpoch}</dt>
            <dd>{lamportFormatter.format(account.rentEpoch)}</dd>
          </div>
          <div>
            <dt>{content.account.fields.dataLength}</dt>
            <dd>{account.dataLength !== null ? lamportFormatter.format(account.dataLength) : "—"}</dd>
          </div>
        </dl>

        {tokenHoldingsSection}
        {tokenMintSection}
        {tokenAccountSection}
      </section>
    );
  };

  const renderTransaction = (
    transaction: Extract<ExplorerResult, { kind: "transaction" }>,
  ) => {
    const blockTime =
      transaction.blockTime !== null
        ? dateTimeFormatter.format(new Date(transaction.blockTime * 1000))
        : "—";
    const statusLabel = transaction.success
      ? content.transaction.badges.success
      : content.transaction.badges.failed;
    const fee = transaction.fee !== null ? lamportFormatter.format(transaction.fee) : "—";
    const computeUnits =
      transaction.computeUnitsConsumed !== null
        ? lamportFormatter.format(transaction.computeUnitsConsumed)
        : "—";
    const instructionCount = lamportFormatter.format(transaction.instructions.length);
    const signers = transaction.signers.length > 0 ? transaction.signers.join(", ") : "—";

    return (
      <>
        <section className={styles.explorerResultCard} aria-live="polite">
          <header className={styles.explorerResultHeader}>
            <div className={styles.explorerResultTitleGroup}>
              <h2 className={styles.explorerResultTitle}>{content.transaction.sectionTitle}</h2>
              <p className={styles.explorerResultValue}>{transaction.signature}</p>
            </div>
            <div className={styles.explorerResultActions}>
              <span className={styles.explorerBadge}>{content.transaction.badges.transaction}</span>
              <span
                className={`${styles.explorerBadge} ${
                  transaction.success
                    ? styles.explorerBadgeSuccess
                    : styles.explorerBadgeError
                }`}
              >
                {statusLabel}
              </span>
              <button
                type="button"
                className={styles.explorerCopyButton}
                onClick={() => handleCopy(transaction.signature)}
              >
                {copiedValue === transaction.signature
                  ? content.copyAction.copied
                  : content.copyAction.copy}
              </button>
            </div>
          </header>

          <dl className={styles.explorerKeyValueList}>
            <div>
              <dt>{content.transaction.fields.signature}</dt>
              <dd>{transaction.signature}</dd>
            </div>
            <div>
              <dt>{content.transaction.fields.slot}</dt>
              <dd>{lamportFormatter.format(transaction.slot)}</dd>
            </div>
            <div>
              <dt>{content.transaction.fields.blockTime}</dt>
              <dd>{blockTime}</dd>
            </div>
            <div>
              <dt>{content.transaction.fields.status}</dt>
              <dd>
                {statusLabel}
                {transaction.error ? (
                  <span className={styles.explorerErrorDetail}>{transaction.error}</span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>{content.transaction.fields.fee}</dt>
              <dd>{fee}</dd>
            </div>
            <div>
              <dt>{content.transaction.fields.computeUnits}</dt>
              <dd>{computeUnits}</dd>
            </div>
            <div>
              <dt>{content.transaction.fields.instructionCount}</dt>
              <dd>{instructionCount}</dd>
            </div>
            <div>
              <dt>{content.transaction.fields.signers}</dt>
              <dd>{signers}</dd>
            </div>
          </dl>
        </section>

        {transaction.instructions.length > 0 ? (
          <section className={styles.explorerResultCard}>
            <h3 className={styles.explorerSectionTitle}>
              {content.transaction.instructions.title}
            </h3>
            <ol className={styles.explorerInstructionList}>
              {transaction.instructions.map((instruction, index) => (
                <li key={`${instruction.programId}-${index}`}>
                  <dl className={styles.explorerKeyValueList}>
                    <div>
                      <dt>{content.transaction.instructions.program}</dt>
                      <dd>{instruction.programId}</dd>
                    </div>
                    <div>
                      <dt>{content.transaction.instructions.accounts}</dt>
                      <dd>
                        {instruction.accounts.length > 0
                          ? instruction.accounts.join(", ")
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>{content.transaction.instructions.dataLength}</dt>
                      <dd>{lamportFormatter.format(instruction.dataLength)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {transaction.logMessages && transaction.logMessages.length > 0 ? (
          <section className={styles.explorerResultCard}>
            <h3 className={styles.explorerSectionTitle}>
              {content.transaction.fields.logMessages}
            </h3>
            <pre className={styles.explorerLogs}>
              {transaction.logMessages.join("\n")}
            </pre>
          </section>
        ) : null}
      </>
    );
  };

  return (
    <div className={styles.infoSection}>
      <header className={styles.infoHeader}>
        <h1 className={styles.infoTitle}>{content.title}</h1>
        <p className={styles.infoSubtitle}>{content.subtitle}</p>
      </header>

      <form className={styles.explorerForm} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.explorerInput}
          placeholder={content.searchPlaceholder}
          aria-label={content.searchPlaceholder}
          value={query}
          onChange={handleQueryChange}
          autoComplete="off"
        />
        <button type="submit" className={styles.explorerButton} disabled={status === "loading"}>
          {content.searchButton}
        </button>
      </form>

      {statusMessage ? (
        <p className={styles.explorerStatus} role="status">
          {statusMessage}
        </p>
      ) : null}

      <ul className={styles.explorerHints}>
        {content.hints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>

      <div className={styles.explorerResults}>
        {result?.kind === "account" ? renderAccount(result) : null}
        {result?.kind === "transaction" ? renderTransaction(result) : null}
      </div>
    </div>
  );
};

const OverviewPanel = ({ content }: { content: AppTranslation["overview"] }) => (
  <div className={styles.infoSection}>
    <header className={styles.infoHeader}>
      <h1 className={styles.infoTitle}>{content.title}</h1>
      <p className={styles.infoSubtitle}>{content.subtitle}</p>
    </header>

    <div className={styles.infoGrid}>
      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.cards.network.title}</h2>
        <p className={styles.infoCardText}>{content.cards.network.description}</p>
        <ul className={styles.infoList}>
          {content.cards.network.stats.map((stat) => (
            <li key={stat.label}>
              {stat.label} <strong>{stat.value}</strong>
            </li>
          ))}
        </ul>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.cards.shortcuts.title}</h2>
        <p className={styles.infoCardText}>{content.cards.shortcuts.description}</p>
        <div className={styles.quickActions}>
          {content.cards.shortcuts.actions.map((action) => (
            <button key={action} type="button">
              {action}
            </button>
          ))}
        </div>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.cards.reminders.title}</h2>
        <p className={styles.infoCardText}>{content.cards.reminders.description}</p>
        <div className={styles.reminders}>
          {content.cards.reminders.reminders.map((reminder) => (
            <div key={reminder.label}>
              <span className={styles.reminderLabel}>{reminder.label}</span>
              <span className={styles.reminderStatus}>{reminder.status}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  </div>
);

type PumpFunApiResponse = {
  projects: PumpFunProject[];
  source: "remote" | "fallback";
  error?: string | null;
};

const PUMP_FUN_LIMIT = 20;

const PumpFunPanel = ({ content }: { content: AppTranslation["pumpFun"] }) => {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<PumpFunProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [source, setSource] = useState<"remote" | "fallback" | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const locale = getIntlLocale(language);

  const compactCurrencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const formatPrice = useCallback(
    (value: number | null) => {
      if (value === null) {
        return "—";
      }

      const fractionDigits = value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);
    },
    [locale],
  );

  const formatCurrency = useCallback(
    (value: number | null) => {
      if (value === null) {
        return "—";
      }

      return compactCurrencyFormatter.format(value);
    },
    [compactCurrencyFormatter],
  );

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/pumpfun/incoming", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = (await response.json()) as PumpFunApiResponse;
      setProjects(data.projects);
      setSource(data.source);
      setStatusMessage(data.error ?? null);
      setLastUpdated(new Date());
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : content.status.error;
      setError(message);
      setStatusMessage(null);
      setSource(null);
      setProjects([]);
      setLastUpdated(null);
    } finally {
      setIsLoading(false);
    }
  }, [content.status.error]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const handleRetry = useCallback(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const displayedCount = projects.length
    ? Math.min(projects.length, PUMP_FUN_LIMIT)
    : PUMP_FUN_LIMIT;

  return (
    <section className={styles.pumpPanel} aria-labelledby="pumpfun-heading">
      <header className={styles.pumpHeader}>
        <div>
          <h1 id="pumpfun-heading" className={styles.pumpTitle}>
            {content.title}
          </h1>
          <p className={styles.pumpSubtitle}>{content.subtitle}</p>
          <p className={styles.pumpLimitNotice}>{content.limitNotice(displayedCount)}</p>
        </div>
        <div className={styles.pumpHeaderMeta}>
          {lastUpdated ? (
            <span className={styles.pumpMetaText}>
              {content.status.updatedAt(dateTimeFormatter.format(lastUpdated))}
            </span>
          ) : null}
          <button
            type="button"
            className={styles.pumpRetryButton}
            onClick={handleRetry}
            disabled={isLoading}
          >
            {content.status.retry}
          </button>
        </div>
      </header>

      {source ? (
        <div className={styles.pumpSourceRow} role="status">
          <span
            className={
              source === "remote" ? styles.pumpBadge : styles.pumpBadgeFallback
            }
          >
            {source === "remote" ? content.status.remote : content.status.fallback}
          </span>
          {source === "fallback" ? (
            <span className={styles.pumpHint}>{content.status.credentialsHint}</span>
          ) : null}
          {statusMessage ? (
            <span className={styles.pumpHint}>{statusMessage}</span>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className={styles.pumpStatus} role="status">
          {content.status.loading}
        </div>
      ) : error ? (
        <div className={styles.pumpStatus} role="alert">
          <span>{content.status.error}</span>
          <button
            type="button"
            className={styles.pumpRetryInline}
            onClick={handleRetry}
          >
            {content.status.retry}
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.pumpStatus} role="status">
          {content.status.empty}
        </div>
      ) : (
        <div className={styles.pumpTableWrapper}>
          <table className={styles.pumpTable}>
            <thead>
              <tr>
                <th scope="col">{content.table.columns.rank}</th>
                <th scope="col">{content.table.columns.project}</th>
                <th scope="col">{content.table.columns.price}</th>
                <th scope="col">{content.table.columns.marketCap}</th>
                <th scope="col">{content.table.columns.raised}</th>
                <th scope="col">{content.table.columns.progress}</th>
                <th scope="col">{content.table.columns.launched}</th>
                <th scope="col">{content.table.columns.holders}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => {
                const progressValue = project.bondingProgress ?? 0;
                const progressPercent = Math.max(0, Math.min(progressValue, 1)) * 100;
                const raisedValue =
                  project.raisedUsd ?? project.marketCapUsd ?? project.liquidityUsd;
                const targetValue = project.bondingMarketCapTargetUsd;
                const progressSummary = content.table.progressTarget(
                  raisedValue !== null ? formatCurrency(raisedValue) : "—",
                  targetValue !== null ? formatCurrency(targetValue) : null,
                );

                const createdAt = project.createdAt ? new Date(project.createdAt) : null;
                const formattedDate =
                  createdAt && !Number.isNaN(createdAt.getTime())
                    ? dateTimeFormatter.format(createdAt)
                    : "—";

                return (
                  <tr key={project.id}>
                    <td className={styles.pumpRankCell}>{index + 1}</td>
                    <td>
                      <div className={styles.pumpProjectCell}>
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={`${project.name} logo`}
                            width={40}
                            height={40}
                            className={styles.pumpProjectAvatar}
                            loading="lazy"
                            sizes="40px"
                          />
                        ) : (
                          <div className={styles.pumpProjectFallback} aria-hidden="true">
                            {project.symbol.slice(0, 2).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className={styles.pumpProjectInfo}>
                          <span className={styles.pumpProjectName}>{project.name}</span>
                          <span className={styles.pumpProjectSymbol}>{project.symbol}</span>
                          <div className={styles.pumpLinks}>
                            {project.twitter ? (
                              <a
                                href={project.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.pumpSocialLink}
                              >
                                Twitter
                              </a>
                            ) : null}
                            {project.telegram ? (
                              <a
                                href={project.telegram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.pumpSocialLink}
                              >
                                Telegram
                              </a>
                            ) : null}
                            {project.website ? (
                              <a
                                href={project.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.pumpSocialLink}
                              >
                                Web
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.pumpNumberCell}>{formatPrice(project.priceUsd)}</td>
                    <td className={styles.pumpNumberCell}>{formatCurrency(project.marketCapUsd)}</td>
                    <td className={styles.pumpNumberCell}>{formatCurrency(project.raisedUsd)}</td>
                    <td>
                      <div className={styles.pumpProgressCell}>
                        <div className={styles.pumpProgressBar} aria-hidden="true">
                          <div
                            className={styles.pumpProgressFill}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className={styles.pumpProgressValue}>
                          {`${progressPercent.toFixed(1)}%`}
                        </span>
                        <span className={styles.pumpProgressSummary}>{progressSummary}</span>
                      </div>
                    </td>
                    <td className={styles.pumpDateCell}>{formattedDate}</td>
                    <td className={styles.pumpNumberCell}>
                      {project.holders !== null
                        ? numberFormatter.format(project.holders)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const SupportPanel = ({ content }: { content: AppTranslation["support"] }) => (
  <div className={styles.infoSection}>
    <header className={styles.infoHeader}>
      <h1 className={styles.infoTitle}>{content.title}</h1>
      <p className={styles.infoSubtitle}>{content.subtitle}</p>
    </header>

    <div className={styles.infoGrid}>
      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.guides.title}</h2>
        <ul className={styles.infoList}>
          {content.guides.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.channels.title}</h2>
        <div className={styles.supportChannels}>
          {content.channels.options.map((channel) => (
            <a
              key={channel.href}
              className={styles.supportChannelLink}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.channelLabel}>{channel.label}</span>
              <span className={styles.channelDetail}>{channel.detail}</span>
            </a>
          ))}
        </div>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.status.title}</h2>
        <p className={styles.infoCardText}>{content.status.description}</p>
        <div className={styles.statusBadge}>{content.status.badge}</div>
      </article>
    </div>
  </div>
);

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionKey>("swap");
  const translations = useTranslations();
  const { publicKey } = useWallet();
  const walletAddress = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const favoritesStorageKey = useMemo(
    () => `${FAVORITES_STORAGE_KEY_PREFIX}${walletAddress ?? "guest"}`,
    [walletAddress],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(favoritesStorageKey);

      if (!stored) {
        setFavorites([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setFavorites(parsed.filter((value): value is string => typeof value === "string"));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Failed to load favorites", error);
      setFavorites([]);
    }
  }, [favoritesStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to persist favorites", error);
    }
  }, [favorites, favoritesStorageKey]);

  const handleToggleFavorite = useCallback(
    (assetId: string) => {
      if (!walletAddress) {
        return;
      }

      setFavorites((previous) => {
        if (previous.includes(assetId)) {
          return previous.filter((id) => id !== assetId);
        }

        if (previous.length >= FAVORITES_LIMIT) {
          return previous;
        }

        return [...previous, assetId];
      });
    },
    [walletAddress],
  );

  const sections: SectionDefinition[] = [
    {
      key: "swap",
      label: translations.navigation.sections.swap.label,
      description: translations.navigation.sections.swap.description,
      Icon: SwapIcon,
    },
    {
      key: "overview",
      label: translations.navigation.sections.overview.label,
      description: translations.navigation.sections.overview.description,
      Icon: OverviewIcon,
    },
    {
      key: "market",
      label: translations.navigation.sections.market.label,
      description: translations.navigation.sections.market.description,
      Icon: MarketIcon,
    },
    {
      key: "explorer",
      label: translations.navigation.sections.explorer.label,
      description: translations.navigation.sections.explorer.description,
      Icon: ExplorerIcon,
    },
    {
      key: "pumpFun",
      label: translations.navigation.sections.pumpFun.label,
      description: translations.navigation.sections.pumpFun.description,
      Icon: PumpFunIcon,
    },
    {
      key: "support",
      label: translations.navigation.sections.support.label,
      description: translations.navigation.sections.support.description,
      Icon: SupportIcon,
    },
  ];

  let content: ReactNode;
  switch (activeSection) {
    case "overview":
      content = <OverviewPanel content={translations.overview} />;
      break;
    case "market":
      content = (
        <MarketPanel
          content={translations.market}
          favorites={favorites}
          walletAddress={walletAddress}
          onToggleFavorite={handleToggleFavorite}
        />
      );
      break;
    case "explorer":
      content = <ExplorerPanel content={translations.explorer} />;
      break;
    case "pumpFun":
      content = <PumpFunPanel content={translations.pumpFun} />;
      break;
    case "support":
      content = <SupportPanel content={translations.support} />;
      break;
    default:
      content = <SwapForm />;
  }

  return (
    <main className={styles.main}>
      <div className={styles.appShell}>
        <div className={styles.menuControls}>
          <div className={styles.menuControlsLeft}>
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <div className={styles.menuControlsRight}>
            <WalletButton />
          </div>
        </div>
        <nav
          className={styles.menu}
          aria-label={translations.navigation.ariaLabel}
          role="tablist"
          aria-orientation="horizontal"
        >
          <div className={styles.menuHeader}>
            <div className={styles.menuBrand}>
              <span className={styles.menuBadge}>{translations.navigation.badge}</span>
              <h2 className={styles.menuTitle}>{translations.navigation.title}</h2>
              <p className={styles.menuSubtitle}>{translations.navigation.subtitle}</p>
            </div>
          </div>
          <div className={styles.menuDivider} aria-hidden="true" />
          <div className={styles.menuItems}>
            {sections.map((section) => {
              const isActive = activeSection === section.key;
              const itemClasses = [styles.menuItem];
              if (isActive) {
                itemClasses.push(styles.menuItemActive);
              }

              return (
                <button
                  key={section.key}
                  type="button"
                  role="tab"
                  id={`tab-${section.key}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${section.key}`}
                  className={itemClasses.join(" ")}
                  onClick={() => setActiveSection(section.key)}
                >
                  <span className={styles.menuIconBadge} aria-hidden="true">
                    <section.Icon className={styles.menuIconGraphic} />
                  </span>
                  <span className={styles.menuText}>
                    <span className={styles.menuLabel}>{section.label}</span>
                    <span className={styles.menuDescription}>
                      {section.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <section
          key={activeSection}
          role="tabpanel"
          id={`panel-${activeSection}`}
          aria-labelledby={`tab-${activeSection}`}
          className={styles.contentArea}
        >
          {content}
        </section>
      </div>
    </main>
  );
}
