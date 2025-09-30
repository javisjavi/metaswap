"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import styles from "@/app/page.module.css";

type MarketCoin = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
  price_change_percentage_24h: number | null;
};

const REFRESH_INTERVAL = 60_000;

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPercentageChange = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "–";
  }

  const formatted = Math.abs(value).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = value > 0 ? "+" : value < 0 ? "-" : "";

  return `${sign}${formatted}%`;
};

const TopCryptoTable = () => {
  const [markets, setMarkets] = useState<MarketCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async (isInitialLoad: boolean) => {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h",
          {
            headers: {
              accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`Unexpected response: ${response.status}`);
        }

        const payload = (await response.json()) as MarketCoin[];

        if (ignore) {
          return;
        }

        setMarkets(payload);
        setLastUpdated(new Date());
        setError(null);
      } catch (requestError) {
        console.error("Error fetching top cryptocurrencies", requestError);
        if (!ignore) {
          setError(
            "No se pudo actualizar la tabla en este momento. Inténtalo nuevamente más tarde."
          );
        }
      } finally {
        if (ignore) {
          return;
        }

        if (isInitialLoad) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    };

    load(true);

    const intervalId = setInterval(() => {
      load(false);
    }, REFRESH_INTERVAL);

    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, []);

  const formattedUpdateTime = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }

    return lastUpdated.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [lastUpdated]);

  return (
    <section className={styles.swapSection}>
      <header className={styles.rankingHeader}>
        <div>
          <h1 className={styles.title}>Top 10 criptomonedas</h1>
          <p className={styles.subtitle}>
            Actualizamos la información automáticamente cada 60 segundos.
          </p>
        </div>
        {isRefreshing && !isLoading ? (
          <span className={styles.refreshBadge}>Actualizando…</span>
        ) : null}
      </header>

      <div className={styles.card}>
        {error ? <p className={styles.errorBanner}>{error}</p> : null}

        {isLoading ? (
          <p className={styles.helperText}>Cargando datos del mercado…</p>
        ) : markets.length ? (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.rankingTable}>
                <thead>
                  <tr>
                    <th>Posición</th>
                    <th>Activo</th>
                    <th>Precio</th>
                    <th>24h</th>
                  </tr>
                </thead>
                <tbody>
                  {markets.map((coin) => {
                    const position =
                      typeof coin.market_cap_rank === "number" &&
                      Number.isFinite(coin.market_cap_rank)
                        ? coin.market_cap_rank
                        : "-";
                    const change =
                      typeof coin.price_change_percentage_24h === "number" &&
                      Number.isFinite(coin.price_change_percentage_24h)
                        ? coin.price_change_percentage_24h
                        : null;
                    const changeClass =
                      change === null
                        ? undefined
                        : change >= 0
                        ? styles.pricePositive
                        : styles.priceNegative;

                    return (
                      <tr key={coin.id}>
                        <td>{position}</td>
                        <td>
                          <div className={styles.rankName}>
                            <Image
                              src={coin.image}
                              alt={`Logotipo de ${coin.name}`}
                              width={36}
                              height={36}
                              className={styles.rankIcon}
                              sizes="36px"
                            />
                            <div>
                              <span className={styles.rankCoinName}>{coin.name}</span>
                              <span className={styles.rankCoinSymbol}>
                                {coin.symbol.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{currencyFormatter.format(coin.current_price)}</td>
                        <td>
                          <span className={changeClass}>{formatPercentageChange(change)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {formattedUpdateTime ? (
              <p className={styles.updateTime}>
                Última actualización: {formattedUpdateTime}
              </p>
            ) : null}
          </>
        ) : (
          <p className={styles.emptyState}>
            No hay información disponible en este momento. Intenta nuevamente
            más tarde.
          </p>
        )}
      </div>
    </section>
  );
};

export default TopCryptoTable;
