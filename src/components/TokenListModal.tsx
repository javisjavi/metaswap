"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import { TokenInfo } from "@/types/token";

interface TokenListModalProps {
  isOpen: boolean;
  tokens: TokenInfo[];
  selectedMint?: string;
  onSelect: (token: TokenInfo) => void;
  onClose: () => void;
}

const normalize = (value: string) => value.toLowerCase();

const TokenListModal = ({
  isOpen,
  tokens,
  selectedMint,
  onSelect,
  onClose,
}: TokenListModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) {
      return tokens;
    }
    const term = normalize(searchTerm.trim());
    return tokens.filter((token) => {
      const haystack = `${token.symbol} ${token.name} ${token.address}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [tokens, searchTerm]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Selecciona un token</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <input
          className={styles.searchInput}
          placeholder="Buscar por nombre, símbolo o dirección"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          autoFocus
        />
        <div className={styles.tokenList}>
          {filteredTokens.map((token) => (
            <button
              type="button"
              key={token.address}
              className={`${styles.tokenRow} ${
                token.address === selectedMint ? styles.tokenRowSelected : ""
              }`}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
            >
              <img
                className={styles.tokenIcon}
                src={token.logoURI ?? "/placeholder-token.svg"}
                alt={token.symbol}
                loading="lazy"
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).src = "/placeholder-token.svg";
                }}
              />
              <div className={styles.tokenInfo}>
                <span className={styles.tokenSymbol}>{token.symbol}</span>
                <span className={styles.tokenName}>{token.name}</span>
              </div>
              <span className={styles.tokenAddress}>
                {`${token.address.slice(0, 4)}…${token.address.slice(-4)}`}
              </span>
            </button>
          ))}
          {filteredTokens.length === 0 && (
            <p className={styles.emptyState}>No encontramos tokens que coincidan con tu búsqueda.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenListModal;
