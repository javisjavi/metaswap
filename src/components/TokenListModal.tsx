"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import styles from "@/app/page.module.css";
import { TokenInfo } from "@/types/token";
import { SOL_MINT } from "@/utils/tokenConstants";
import { NetworkCluster } from "@/context/NetworkContext";

interface TokenListModalProps {
  isOpen: boolean;
  tokens: TokenInfo[];
  selectedMint?: string;
  onSelect: (token: TokenInfo) => void;
  onClose: () => void;
  network: NetworkCluster;
}

const normalize = (value: string) => value.toLowerCase();

type DexScreenerToken = {
  address: string;
  name?: string;
  symbol?: string;
};

type DexScreenerPair = {
  chainId: string;
  baseToken: DexScreenerToken;
  info?: {
    imageUrl?: string;
  };
  marketCap?: number;
};

type DexScreenerSearchResponse = {
  pairs?: DexScreenerPair[];
};

const fetchMintDecimals = async (connection: Connection, mint: string): Promise<number | null> => {
  try {
    const mintKey = new PublicKey(mint);
    const account = await connection.getParsedAccountInfo(mintKey, "confirmed");
    const data = account.value?.data;

    if (data && typeof data === "object" && "parsed" in data) {
      const parsed = data as ParsedAccountData;
      const decimals = parsed?.parsed?.info?.decimals;
      return typeof decimals === "number" ? decimals : null;
    }

    const raw = account.value?.data as unknown;
    if (raw instanceof Uint8Array) {
      return raw[44] ?? null;
    }

    if (Array.isArray(raw) && raw.length >= 2) {
      const [base64Data] = raw as [string, string];
      if (typeof base64Data === "string") {
        const decoded = globalThis.atob ? globalThis.atob(base64Data) : "";
        if (!decoded) {
          return null;
        }
        const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
        return bytes[44] ?? null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error al obtener los decimales del token", error);
    return null;
  }
};

const sanitizeSymbol = (value?: string | null) => {
  if (!value) return "TOKEN";
  const normalized = value.trim();
  return normalized ? normalized.toUpperCase().slice(0, 16) : "TOKEN";
};

const getSolscanUrl = (mint: string, cluster: NetworkCluster) => {
  const base = `https://solscan.io/token/${mint}`;
  return cluster === "mainnet-beta" ? base : `${base}?cluster=${cluster}`;
};

const TokenListModal = ({
  isOpen,
  tokens,
  selectedMint,
  onSelect,
  onClose,
  network,
}: TokenListModalProps) => {
  const { connection } = useConnection();
  const [searchTerm, setSearchTerm] = useState("");
  const [externalTokens, setExternalTokens] = useState<TokenInfo[]>([]);
  const [searchingExternal, setSearchingExternal] = useState(false);
  const [externalError, setExternalError] = useState<string | null>(null);
  const decimalsCache = useRef(new Map<string, number | null>());
  const metadataCache = useRef(new Map<string, TokenInfo>());

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setExternalTokens([]);
      setExternalError(null);
      setSearchingExternal(false);
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trimmed = searchTerm.trim();

    if (!trimmed) {
      setExternalTokens([]);
      setExternalError(null);
      setSearchingExternal(false);
      return;
    }

    if (network !== "mainnet-beta") {
      setExternalTokens([]);
      setExternalError(null);
      setSearchingExternal(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      const query = encodeURIComponent(trimmed);
      const existingMints = new Set(tokens.map((token) => token.address));
      setSearchingExternal(true);
      setExternalError(null);

      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${query}`);
        if (!response.ok) {
          throw new Error("No se pudo buscar tokens externos");
        }

        const payload = (await response.json()) as DexScreenerSearchResponse;
        const pairs = payload.pairs ?? [];
        const uniqueByMint = new Map<string, DexScreenerPair>();

        for (const pair of pairs) {
          if (pair.chainId !== "solana") {
            continue;
          }
          const mint = pair.baseToken.address;
          if (!mint || existingMints.has(mint) || uniqueByMint.has(mint)) {
            continue;
          }
          uniqueByMint.set(mint, pair);
          if (uniqueByMint.size >= 20) {
            break;
          }
        }

        const additionalTokens: TokenInfo[] = [];

        for (const [mint, pair] of uniqueByMint) {
          if (metadataCache.current.has(mint)) {
            additionalTokens.push(metadataCache.current.get(mint)!);
            continue;
          }

          if (decimalsCache.current.has(mint)) {
            const cached = decimalsCache.current.get(mint);
            if (cached == null) {
              continue;
            }
            const cachedToken = metadataCache.current.get(mint);
            if (cachedToken) {
              additionalTokens.push(cachedToken);
              continue;
            }
          }

          const decimals = await fetchMintDecimals(connection, mint);
          decimalsCache.current.set(mint, decimals);

          if (decimals == null) {
            continue;
          }

          const symbol = sanitizeSymbol(pair.baseToken.symbol);
          const name = pair.baseToken.name?.trim() || symbol;
          const logoURI = pair.info?.imageUrl;

          const tokenInfo: TokenInfo = {
            address: mint,
            symbol,
            name,
            decimals,
            logoURI,
            chainId: 101,
            tags: ["community", "pump.fun"],
            verified: false,
          };

          metadataCache.current.set(mint, tokenInfo);
          additionalTokens.push(tokenInfo);
        }

        if (!cancelled) {
          setExternalTokens(additionalTokens);
        }
      } catch (error) {
        console.error("Error al buscar tokens externos", error);
        if (!cancelled) {
          setExternalTokens([]);
          setExternalError(
            (error as Error).message ?? "No pudimos cargar resultados adicionales en este momento."
          );
        }
      } finally {
        if (!cancelled) {
          setSearchingExternal(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [connection, isOpen, network, searchTerm, tokens]);

  const combinedTokens = useMemo(() => {
    const map = new Map<string, TokenInfo>();
    for (const token of tokens) {
      map.set(token.address, token);
    }
    for (const token of externalTokens) {
      map.set(token.address, token);
    }
    return Array.from(map.values());
  }, [tokens, externalTokens]);

  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) {
      return combinedTokens;
    }

    const term = normalize(searchTerm.trim());
    const filtered = combinedTokens.filter((token) => {
      const haystack = `${token.symbol} ${token.name} ${token.address}`.toLowerCase();
      return haystack.includes(term);
    });

    if (filtered.length === 0) {
      return filtered;
    }

    const shouldPrioritizeSol = term.includes("sol");

    if (!shouldPrioritizeSol) {
      return filtered;
    }

    const solIndex = filtered.findIndex((token) => token.address === SOL_MINT);

    if (solIndex <= 0) {
      return filtered;
    }

    const [solToken] = filtered.splice(solIndex, 1);
    return [solToken, ...filtered];
  }, [searchTerm, combinedTokens]);

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
          {filteredTokens.map((token) => {
            const solscanUrl = getSolscanUrl(token.address, network);
            const isSelected = token.address === selectedMint;
            const truncatedAddress = `${token.address.slice(0, 4)}…${token.address.slice(-4)}`;

            return (
              <div
                key={token.address}
                className={`${styles.tokenRow} ${isSelected ? styles.tokenRowSelected : ""}`}
              >
                <button
                  type="button"
                  className={styles.tokenRowButton}
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
                    <div className={styles.tokenSymbolRow}>
                      <span className={styles.tokenSymbol}>{token.symbol}</span>
                      {token.verified ? (
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
                    <span className={styles.tokenName}>{token.name}</span>
                  </div>
                  <span className={styles.tokenAddress}>{truncatedAddress}</span>
                </button>
                <a
                  href={solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.solscanLink}
                  aria-label={`Ver ${token.symbol} en Solscan`}
                >
                  <img
                    src="/solscan.svg"
                    alt=""
                    className={styles.solscanIcon}
                    aria-hidden="true"
                  />
                </a>
              </div>
            );
          })}
          {filteredTokens.length === 0 && !searchingExternal && !externalError && (
            <p className={styles.emptyState}>No encontramos tokens que coincidan con tu búsqueda.</p>
          )}
          {searchingExternal && (
            <p className={styles.searchStatus}>Buscando nuevos tokens en Pump.fun…</p>
          )}
          {externalError && <p className={styles.searchError}>{externalError}</p>}
        </div>
      </div>
    </div>
  );
};

export default TokenListModal;
