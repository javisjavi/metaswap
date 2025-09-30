
/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useState } from "react";
import styles from "@/app/page.module.css";
import { TokenInfo } from "@/types/token";
import TokenListModal from "./TokenListModal";
import { NetworkCluster } from "@/context/NetworkContext";

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
        <div className={styles.selectorLabel}>
          <span>{label}</span>
          {availableAmount && onAvailableClick ? (
            <button
              type="button"
              className={styles.availableBalanceButton}
              onClick={onAvailableClick}
              title="Usar todo el saldo disponible"
            >
              ({availableAmount})
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
          <img
            className={styles.selectorIcon}
            src={token?.logoURI ?? "/placeholder-token.svg"}
            alt={token?.symbol ?? "Token"}
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).src = "/placeholder-token.svg";
            }}
          />
          <div className={styles.selectorText}>
            <div className={styles.selectorSymbolRow}>
              <span className={styles.selectorSymbol}>{token?.symbol ?? "Seleccionar"}</span>
              {token?.verified ? (
                <span
                  className={styles.verifiedBadge}
                  aria-label="Contrato verificado"
                  title="Contrato verificado"
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
        network={network}
      />
    </div>
  );
};

export default TokenSelector;
