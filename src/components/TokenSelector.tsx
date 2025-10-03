"use client";

/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useEffect, useRef, useState } from "react";
import styles from "@/app/page.module.css";
import { TokenInfo } from "@/types/token";
import TokenListModal from "./TokenListModal";
import type { NetworkCluster } from "@/types/network";
import { useLanguage, useTranslations } from "@/context/LanguageContext";
import { getCachedTokenPriceUsd } from "@/utils/priceFeed";
import { getFallbackTokenConfig } from "@/utils/fallbackTokens";
import { formatNumber } from "@/utils/amount";

interface TokenSelectorProps {
  label: string;
  token: TokenInfo | null;
  tokens: TokenInfo[];
  onTokenSelect: (token: TokenInfo) => void;
  network: NetworkCluster;
  amount?: string;
  onAmountChange?: (value: string) => void;
  readOnlyAmount?: boolean;
  placeholder?: string;
  availableAmount?: string;
  onAvailableClick?: () => void;
}

const TokenSelector = ({
  label,
  token,
  tokens,
  onTokenSelect,
  network,
  amount,
  onAmountChange,
  readOnlyAmount = false,
  placeholder,
  availableAmount,
  onAvailableClick,
}: TokenSelectorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const translations = useTranslations();
  const tokenSelectorTexts = translations.tokenSelector;
  const { language } = useLanguage();
  const [availableUsd, setAvailableUsd] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<TokenInfo | null>(token);
  const [outgoingToken, setOutgoingToken] = useState<TokenInfo | null>(null);
  const [isIconAnimating, setIsIconAnimating] = useState(false);
  const iconAnimationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentToken((previousToken) => {
      const previousKey = previousToken?.address ?? previousToken?.symbol ?? null;
      const nextKey = token?.address ?? token?.symbol ?? null;

      if (previousKey === nextKey) {
        return previousToken;
      }

      if (iconAnimationTimeoutRef.current) {
        window.clearTimeout(iconAnimationTimeoutRef.current);
        iconAnimationTimeoutRef.current = null;
      }

      setOutgoingToken(previousToken);
      setIsIconAnimating(true);

      iconAnimationTimeoutRef.current = window.setTimeout(() => {
        setOutgoingToken(null);
        setIsIconAnimating(false);
        iconAnimationTimeoutRef.current = null;
      }, 260);

      return token;
    });
  }, [token]);

  useEffect(() => () => {
    if (iconAnimationTimeoutRef.current) {
      window.clearTimeout(iconAnimationTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const computeUsdValue = async () => {
      if (!token || availableAmount === undefined) {
        setAvailableUsd(null);
        return;
      }

      const parsedAmount = Number(availableAmount);
      if (!Number.isFinite(parsedAmount)) {
        setAvailableUsd(null);
        return;
      }

      if (parsedAmount === 0) {
        setAvailableUsd(formatNumber(0, 2, language));
        return;
      }

      const fallbackToken = getFallbackTokenConfig(network, token.address);
      const priceIds = fallbackToken?.priceIds?.length
        ? fallbackToken.priceIds
        : [token.address];

      let priceUsd: number | null = null;
      for (const id of priceIds) {
        priceUsd = await getCachedTokenPriceUsd(id);
        if (typeof priceUsd === "number" && Number.isFinite(priceUsd) && priceUsd > 0) {
          break;
        }
      }

      if (!priceUsd && fallbackToken) {
        priceUsd = fallbackToken.priceUsd;
      }

      if (!priceUsd || !Number.isFinite(priceUsd) || priceUsd <= 0) {
        setAvailableUsd(null);
        return;
      }

      const usdValue = parsedAmount * priceUsd;
      const fractionDigits = usdValue >= 1 ? 2 : 4;
      const formatted = formatNumber(usdValue, fractionDigits, language);
      if (!cancelled) {
        setAvailableUsd(formatted);
      }
    };

    void computeUsdValue();

    return () => {
      cancelled = true;
    };
  }, [token, availableAmount, network, language]);

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!onAmountChange) return;
    if (value === "" || /^\d*(\.\d*)?$/.test(value)) {
      onAmountChange(value);
    }
  };

  const availableUsdLabel = availableUsd ? `≈ $${availableUsd}` : "≈ —";
  const availableTokenLabel =
    typeof availableAmount === "string" && availableAmount.trim() !== ""
      ? token?.symbol
        ? `${availableAmount} ${token.symbol}`
        : availableAmount
      : null;
  const availableButtonLabel = availableTokenLabel
    ? `${availableUsdLabel} • ${availableTokenLabel}`
    : availableUsdLabel;

  return (
    <div className={styles.selectorWrapper}>
      <div className={styles.selectorHeader}>
        <div className={styles.selectorLabel}>
          <span>{label}</span>
          {availableAmount && onAvailableClick ? (
            <button
              type="button"
              className={styles.availableBalanceButton}
              onClick={onAvailableClick}
              title={tokenSelectorTexts.useAllTitle}
            >
              {availableButtonLabel}
            </button>
          ) : null}
        </div>
        {token ? <span className={styles.tokenBadge}>{token.symbol}</span> : null}
      </div>
      <div className={styles.selectorBody}>
        <button
          type="button"
          className={styles.tokenButton}
          onClick={() => setIsModalOpen(true)}
        >
          <div className={styles.selectorIconWrapper}>
            {outgoingToken ? (
              <img
                key={outgoingToken.address ?? "placeholder-outgoing"}
                className={`${styles.selectorIcon} ${styles.selectorIconOutgoing}`}
                src={outgoingToken.logoURI ?? "/placeholder-token.svg"}
                alt=""
                aria-hidden="true"
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).src = "/placeholder-token.svg";
                }}
              />
            ) : null}
            <img
              key={currentToken?.address ?? "placeholder-current"}
              className={`${styles.selectorIcon} ${
                isIconAnimating ? styles.selectorIconIncoming : styles.selectorIconStable
              }`}
              src={currentToken?.logoURI ?? "/placeholder-token.svg"}
              alt={currentToken?.symbol ?? tokenSelectorTexts.defaultSymbol}
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).src = "/placeholder-token.svg";
              }}
            />
          </div>
          <div className={styles.selectorText}>
            <div className={styles.selectorSymbolRow}>
              <span className={styles.selectorSymbol}>
                {token?.symbol ?? tokenSelectorTexts.selectToken}
              </span>
              {token?.verified ? (
                <span
                  className={styles.verifiedBadge}
                  aria-label={tokenSelectorTexts.verifiedBadge}
                  title={tokenSelectorTexts.verifiedBadge}
                >
                  <img
                    src="/verified-check.svg"
                    alt=""
                    className={styles.verifiedBadgeIcon}
                    aria-hidden="true"
                  />
                </span>
              ) : null}
            </div>
            <div className={styles.selectorNameRow}>
              <span className={styles.selectorName}>
                {token?.name ?? tokenSelectorTexts.chooseToken}
              </span>
            </div>
          </div>
        </button>
        <input
          className={styles.amountInput}
          value={amount ?? ""}
          onChange={handleAmountChange}
          placeholder={placeholder}
          inputMode="decimal"
          readOnly={readOnlyAmount || !onAmountChange}
        />
      </div>
      <TokenListModal
        isOpen={isModalOpen}
        tokens={tokens}
        selectedMint={token?.address}
        onSelect={onTokenSelect}
        onClose={() => setIsModalOpen(false)}
        network={network}
      />
    </div>
  );
};

export default TokenSelector;
