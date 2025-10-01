"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import Image from "next/image";

import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage, useTranslations } from "@/context/LanguageContext";
import { type PumpFunProject } from "@/types/pumpfun";
import { type AppTranslation, type SectionKey } from "@/utils/translations";

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
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${MARKET_PAGE_SIZE}&page=${page}&sparkline=false&price_change_percentage=24h`;

type MarketAsset = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
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

  const locale = language === "es" ? "es-ES" : "en-US";

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

  const locale = language === "es" ? "es-ES" : "en-US";

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
        <nav
          className={styles.menu}
          aria-label={translations.navigation.ariaLabel}
          role="tablist"
          aria-orientation="horizontal"
        >
          <div className={styles.menuHeader}>
            <LanguageToggle />
          </div>
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
