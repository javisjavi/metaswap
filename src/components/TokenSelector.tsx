"use client";

/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useState } from "react";
import styles from "@/app/page.module.css";
import { TokenInfo } from "@/types/token";
import TokenListModal from "./TokenListModal";

interface TokenSelectorProps {
  label: string;
  token: TokenInfo | null;
  tokens: TokenInfo[];
  onTokenSelect: (token: TokenInfo) => void;
  amount?: string;
  onAmountChange?: (value: string) => void;
  readOnlyAmount?: boolean;
  placeholder?: string;
}

const TokenSelector = ({
  label,
  token,
  tokens,
  onTokenSelect,
  amount,
  onAmountChange,
  readOnlyAmount = false,
  placeholder,
}: TokenSelectorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!onAmountChange) return;
    if (value === "" || /^\d*(\.\d*)?$/.test(value)) {
      onAmountChange(value);
    }
  };

  return (
    <div className={styles.selectorWrapper}>
      <div className={styles.selectorHeader}>
        <span>{label}</span>
        {token ? <span className={styles.tokenBadge}>{token.symbol}</span> : null}
      </div>
      <div className={styles.selectorBody}>
        <button
          type="button"
          className={styles.tokenButton}
          onClick={() => setIsModalOpen(true)}
        >
          <img
            className={styles.selectorIcon}
            src={token?.logoURI ?? "/placeholder-token.svg"}
            alt={token?.symbol ?? "Token"}
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).src = "/placeholder-token.svg";
            }}
          />
          <div className={styles.selectorText}>
            <span className={styles.selectorSymbol}>{token?.symbol ?? "Seleccionar"}</span>
            <span className={styles.selectorName}>{token?.name ?? "Elegir token"}</span>
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
      />
    </div>
  );
};

export default TokenSelector;
