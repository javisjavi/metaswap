"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";

import styles from "@/app/page.module.css";
import { useTokenList } from "@/hooks/useTokenList";
import { useJupiterQuote } from "@/hooks/useJupiterQuote";
import { TokenInfo } from "@/types/token";
import { formatLamports, formatNumber, parseAmountToLamports } from "@/utils/amount";
import { SwapResponse } from "@/types/jupiter";
import TokenSelector from "./TokenSelector";
import { useNetwork } from "@/context/NetworkContext";
import { getEndpointForNetwork } from "@/utils/solanaEndpoints";

const NETWORK_OPTIONS = [
  { value: "mainnet-beta", label: "Mainnet" },
  { value: "devnet", label: "Devnet" },
  { value: "testnet", label: "Testnet" },
] as const;

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const AIRDROP_LAMPORTS = LAMPORTS_PER_SOL;

const DEFAULT_SOL_TOKEN: TokenInfo = {
  address: SOL_MINT,
  symbol: "SOL",
  name: "Solana",
  decimals: 9,
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  chainId: 101,
  tags: ["native"],
  verified: true,
};

const DEFAULT_USDC_TOKEN: TokenInfo = {
  address: USDC_MINT,
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  chainId: 101,
  tags: ["stablecoin"],
  verified: true,
};

const decodeTransaction = (encoded: string) =>
  Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));

const SwapForm = () => {
  const { network, setNetwork } = useNetwork();
  const { tokens, loading: tokensLoading, error: tokensError } = useTokenList(network);
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [inputToken, setInputToken] = useState<TokenInfo | null>(DEFAULT_SOL_TOKEN);
  const [outputToken, setOutputToken] = useState<TokenInfo | null>(DEFAULT_USDC_TOKEN);
  const [customTokens, setCustomTokens] = useState<TokenInfo[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [inputTokenBalance, setInputTokenBalance] = useState<string | null>(null);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropMessage, setAirdropMessage] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSignature, setSwapSignature] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const confettiPieces = [
    styles.confettiPiece1,
    styles.confettiPiece2,
    styles.confettiPiece3,
    styles.confettiPiece4,
    styles.confettiPiece5,
    styles.confettiPiece6,
    styles.confettiPiece7,
    styles.confettiPiece8,
    styles.confettiPiece9,
    styles.confettiPiece10,
    styles.confettiPiece11,
    styles.confettiPiece12,
  ];

  useEffect(() => {
    if (!swapSignature) {
      return;
    }

    setShowCelebration(true);
    const timeout = window.setTimeout(() => {
      setShowCelebration(false);
    }, 3600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [swapSignature]);

  const balanceConnection = useMemo(() => {
    const endpoint = getEndpointForNetwork(network);
    return new Connection(endpoint, "confirmed");
  }, [network]);

  useEffect(() => {
    setInputToken(DEFAULT_SOL_TOKEN);
    setOutputToken(DEFAULT_USDC_TOKEN);
    setAmount("");
    setBalance(null);
    setSwapError(null);
    setSwapSignature(null);
    setAirdropMessage(null);
    setCustomTokens([]);
  }, [network]);

  useEffect(() => {
    setCustomTokens((prev) => {
      if (!prev.length) {
        return prev;
      }
      const filtered = prev.filter(
        (candidate) => !tokens.some((token) => token.address === candidate.address)
      );
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [tokens]);

  const tokenOptions = useMemo(() => {
    if (!customTokens.length) {
      return tokens;
    }
    const map = new Map<string, TokenInfo>();
    for (const token of tokens) {
      map.set(token.address, token);
    }
    for (const token of customTokens) {
      map.set(token.address, token);
    }
    return Array.from(map.values());
  }, [tokens, customTokens]);

  useEffect(() => {
    if (!tokens.length) {
      return;
    }

    const baseTokenMap = new Map(tokens.map((token) => [token.address, token] as const));

    const inputIsCustom = inputToken
      ? !baseTokenMap.has(inputToken.address) &&
        customTokens.some((token) => token.address === inputToken.address)
      : false;

    if (!inputToken || (!inputIsCustom && !baseTokenMap.has(inputToken.address))) {
      const fallback =
        baseTokenMap.get(SOL_MINT) ?? tokens[0] ?? null;
      if (fallback && inputToken?.address !== fallback.address) {
        setInputToken(fallback);
      }
    } else if (!inputIsCustom) {
      const registered = baseTokenMap.get(inputToken.address);
      if (registered && inputToken !== registered) {
        setInputToken(registered);
      }
    }

    const currentInputAddress = inputToken?.address;

    const outputIsCustom = outputToken
      ? !baseTokenMap.has(outputToken.address) &&
        customTokens.some((token) => token.address === outputToken.address)
      : false;

    if (!outputToken || (!outputIsCustom && !baseTokenMap.has(outputToken.address))) {
      const preferredByDefault =
        tokens.find(
          (token) => token.address === USDC_MINT && token.address !== currentInputAddress
        ) ?? tokens.find((token) => token.address !== currentInputAddress) ?? null;

      if (preferredByDefault && outputToken?.address !== preferredByDefault.address) {
        setOutputToken(preferredByDefault);
      }
    } else if (!outputIsCustom) {
      const registered = baseTokenMap.get(outputToken.address);
      if (registered && outputToken !== registered) {
        setOutputToken(registered);
      }
    }

    if (inputToken && outputToken && inputToken.address === outputToken.address) {
      const alternative = tokenOptions.find((token) => token.address !== inputToken.address) ?? null;
      if (alternative) {
        setOutputToken(alternative);
      }
    }
  }, [tokens, customTokens, inputToken, outputToken, tokenOptions]);

  const ensureCustomToken = useCallback(
    (token: TokenInfo) => {
      if (tokens.some((candidate) => candidate.address === token.address)) {
        return;
      }
      setCustomTokens((previous) => {
        const exists = previous.some((candidate) => candidate.address === token.address);
        if (exists) {
          return previous.map((candidate) =>
            candidate.address === token.address ? token : candidate
          );
        }
        return [...previous, token];
      });
    },
    [tokens]
  );

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    try {
      setIsFetchingBalance(true);
      const lamports = await balanceConnection.getBalance(publicKey, "confirmed");
      setBalance(formatLamports(BigInt(lamports), 9, 4));
    } catch (error) {
      console.error("Error al leer el saldo", error);
    } finally {
      setIsFetchingBalance(false);
    }
  }, [balanceConnection, publicKey]);

  useEffect(() => {
    if (connected) {
      refreshBalance();
    } else {
      setBalance(null);
    }
  }, [connected, refreshBalance]);

  useEffect(() => {
    if (!inputToken || !publicKey) {
      setInputTokenBalance(null);
      return;
    }

    if (inputToken.address === SOL_MINT) {
      setInputTokenBalance(balance);
      return;
    }

    let cancelled = false;

    const fetchTokenBalance = async () => {
      try {
        const mint = new PublicKey(inputToken.address);
        const response = await balanceConnection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint },
          "confirmed"
        );

        const total = response.value.reduce((sum, account) => {
          const data = account.account.data as ParsedAccountData;
          const amount = data?.parsed?.info?.tokenAmount?.amount as
            | string
            | undefined;
          if (!amount) {
            return sum;
          }
          try {
            return sum + BigInt(amount);
          } catch {
            return sum;
          }
        }, BigInt(0));

        if (!cancelled) {
          setInputTokenBalance(
            formatLamports(total, inputToken.decimals, Math.min(6, inputToken.decimals))
          );
        }
      } catch (error) {
        console.error("Error al leer el saldo del token", error);
        if (!cancelled) {
          setInputTokenBalance(null);
        }
      }
    };

    setInputTokenBalance(null);
    fetchTokenBalance();

    return () => {
      cancelled = true;
    };
  }, [inputToken, publicKey, balanceConnection, balance]);

  const parsedAmount = useMemo(
    () =>
      inputToken ? parseAmountToLamports(amount, inputToken.decimals ?? 0) : null,
    [amount, inputToken]
  );

  const sameTokenSelected =
    inputToken && outputToken && inputToken.address === outputToken.address;

  const canQuote =
    Boolean(
      inputToken &&
        outputToken &&
        parsedAmount &&
        parsedAmount > BigInt(0) &&
        !sameTokenSelected
    );

  const {
    quote,
    loading: quoteLoading,
    error: quoteError,
    refreshedAt,
    refresh: refreshQuote,
  } = useJupiterQuote({
    inputMint: inputToken?.address,
    outputMint: outputToken?.address,
    amount: parsedAmount,
    enabled: canQuote,
    cluster: network,
  });

  useEffect(() => {
    setSwapError(null);
    setSwapSignature(null);
  }, [inputToken?.address, outputToken?.address, amount]);

  const handleAirdrop = useCallback(async () => {
    if (network === "mainnet-beta") {
      setAirdropMessage("Los airdrops solo están disponibles en devnet y testnet.");
      return;
    }
    if (!publicKey) {
      setAirdropMessage("Conecta tu wallet para solicitar SOL de prueba.");
      return;
    }
    try {
      setIsAirdropping(true);
      setAirdropMessage(null);
      const signature = await connection.requestAirdrop(publicKey, AIRDROP_LAMPORTS);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );
      setAirdropMessage("Airdrop completado. El saldo puede tardar unos segundos en actualizarse.");
      await refreshBalance();
    } catch (error) {
      console.error(error);
      setAirdropMessage(
        (error as Error).message ?? "No fue posible solicitar el airdrop en este momento."
      );
    } finally {
      setIsAirdropping(false);
    }
  }, [connection, publicKey, refreshBalance, network]);

  const handleSwapTokens = () => {
    if (!inputToken || !outputToken) return;
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setAmount("");
  };

  const handleSelectInput = (token: TokenInfo) => {
    ensureCustomToken(token);
    setInputToken(token);
    if (outputToken && outputToken.address === token.address) {
      const alternative = tokenOptions.find((candidate) => candidate.address !== token.address);
      setOutputToken(alternative ?? null);
    }
  };

  const handleSelectOutput = (token: TokenInfo) => {
    ensureCustomToken(token);
    setOutputToken(token);
    if (inputToken && inputToken.address === token.address) {
      const alternative = tokenOptions.find((candidate) => candidate.address !== token.address);
      setInputToken(alternative ?? null);
    }
  };

  const estimatedOutput = useMemo(() => {
    if (!quote || !outputToken) return "";
    return formatLamports(quote.outAmount, outputToken.decimals, 6);
  }, [quote, outputToken]);

  const minimumReceived = useMemo(() => {
    if (!quote || !outputToken) return "";
    return formatLamports(quote.otherAmountThreshold, outputToken.decimals, 6);
  }, [quote, outputToken]);

  const priceDisplay = useMemo(() => {
    if (!quote || !inputToken || !outputToken) return null;
    const inputValue = Number(
      formatLamports(quote.inAmount, inputToken.decimals, 10)
    );
    const outputValue = Number(
      formatLamports(quote.outAmount, outputToken.decimals, 10)
    );
    if (!Number.isFinite(inputValue) || !Number.isFinite(outputValue) || inputValue === 0) {
      return null;
    }
    const ratio = outputValue / inputValue;
    return `${formatNumber(ratio, 6)} ${outputToken.symbol}/${inputToken.symbol}`;
  }, [quote, inputToken, outputToken]);

  const priceImpact = quote?.priceImpactPct
    ? formatNumber(parseFloat(quote.priceImpactPct) * 100, 2)
    : null;

  const swapRoutes = quote?.routePlan?.map((route) => route.swapInfo.label).join(" → ");

  const explorerUrl = useMemo(() => {
    if (!swapSignature) return null;
    const base = `https://explorer.solana.com/tx/${swapSignature}`;
    if (network === "mainnet-beta") {
      return base;
    }
    return `${base}?cluster=${network}`;
  }, [network, swapSignature]);

  const handleSwap = useCallback(async () => {
    if (!publicKey || !sendTransaction) {
      setSwapError("Conecta tu wallet Solflare para continuar.");
      return;
    }
    if (!quote || !inputToken || !outputToken || !parsedAmount || parsedAmount <= BigInt(0)) {
      setSwapError("Define un monto válido para cotizar el swap.");
      return;
    }

    try {
      setIsSwapping(true);
      setSwapError(null);
      setSwapSignature(null);

      const swapUrl = new URL("https://quote-api.jup.ag/v6/swap");
      swapUrl.searchParams.set("cluster", network);

      const response = await fetch(swapUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "No fue posible generar la transacción de swap");
      }

      const data = (await response.json()) as SwapResponse;
      const transactionBytes = decodeTransaction(data.swapTransaction);
      const transaction = VersionedTransaction.deserialize(transactionBytes);
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.message.recentBlockhash = latestBlockhash.blockhash;

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
      });

      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );

      setSwapSignature(signature);
      setAmount("");
      await refreshBalance();
      await refreshQuote();
    } catch (error) {
      console.error(error);
      setSwapError(
        (error as Error).message ?? "No se pudo completar el swap. Inténtalo nuevamente."
      );
    } finally {
      setIsSwapping(false);
    }
  }, [
    connection,
    publicKey,
    quote,
    sendTransaction,
    parsedAmount,
    inputToken,
    outputToken,
    refreshBalance,
    refreshQuote,
    network,
  ]);

  const disableSwapButton =
    !connected || !canQuote || quoteLoading || isSwapping || tokensLoading;

  const handleNetworkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value as (typeof NETWORK_OPTIONS)[number]["value"];
    setNetwork(selected);
  };

  const airdropUnavailable = network === "mainnet-beta";

  return (
    <section className={styles.swapSection}>
      {showCelebration && (
        <div className={styles.swapCelebration} aria-hidden="true">
          {confettiPieces.map((pieceClass, index) => (
            <span
              key={index}
              className={`${styles.confettiPiece} ${pieceClass}`}
            />
          ))}
        </div>
      )}
      <header className={styles.swapHeader}>
        <div>
          <h1 className={styles.title}>MetaSwap</h1>
          <p className={styles.subtitle}>
            Fast. Secure. Swaps made simple.
          </p>
        </div>
        <div className={styles.headerActions}>
          <label className={styles.networkSelector}>
            <span>Red</span>
            <div className={styles.networkControl}>
              <select
                className={styles.networkSelect}
                value={network}
                onChange={handleNetworkChange}
              >
                {NETWORK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span aria-hidden className={styles.networkCaret}>▾</span>
            </div>
          </label>
          <WalletMultiButton className={styles.walletButton} />
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.balanceRow}>
          <div>
            <span className={styles.balanceLabel}>Saldo disponible</span>
            <strong className={styles.balanceValue}>
              {connected
                ? balance
                  ? `${balance} SOL`
                  : isFetchingBalance
                  ? "Actualizando…"
                  : "-"
                : "Conecta tu wallet"}
            </strong>
          </div>
          <button
            type="button"
            className={styles.faucetButton}
            onClick={handleAirdrop}
            disabled={!connected || isAirdropping || airdropUnavailable}
          >
            {airdropUnavailable
              ? "Airdrop no disponible"
              : isAirdropping
              ? "Solicitando…"
              : "Recibir 1 SOL"}
          </button>
        </div>
        {airdropMessage && <p className={styles.helperText}>{airdropMessage}</p>}

        {tokensError && <p className={styles.errorBanner}>{tokensError}</p>}

        <div className={styles.selectorsWrapper}>
          <TokenSelector
            label="De"
            token={inputToken}
            tokens={tokenOptions}
            onTokenSelect={handleSelectInput}
            network={network}
            amount={amount}
            onAmountChange={setAmount}
            placeholder="0.0"
            availableAmount={connected ? inputTokenBalance ?? undefined : undefined}
            onAvailableClick={
              connected && inputTokenBalance
                ? () => setAmount(inputTokenBalance)
                : undefined
            }
          />

          <button
            type="button"
            className={styles.switchButton}
            onClick={handleSwapTokens}
          >
            <span className={styles.switchIconHorizontal} aria-hidden>
              ⇄
            </span>
            <span className={styles.switchIconVertical} aria-hidden>
              ⇅
            </span>
            <span className={styles.srOnly}>Cambiar tokens</span>
          </button>

          <TokenSelector
            label="Para"
            token={outputToken}
            tokens={tokenOptions}
            onTokenSelect={handleSelectOutput}
            network={network}
            amount={estimatedOutput}
            readOnlyAmount
            placeholder="0.0"
          />
        </div>

        {sameTokenSelected && (
          <p className={styles.errorBanner}>
            Selecciona tokens diferentes para obtener una cotización válida.
          </p>
        )}

        {quoteError && <p className={styles.errorBanner}>{quoteError}</p>}

        <div className={styles.previewPanel}>
          <div className={styles.previewRow}>
            <span>Recibirás (estimado)</span>
            <strong>{estimatedOutput ? `${estimatedOutput} ${outputToken?.symbol ?? ""}` : "-"}</strong>
          </div>
          <div className={styles.previewRow}>
            <span>Mínimo tras slippage (5%)</span>
            <strong>
              {minimumReceived ? `${minimumReceived} ${outputToken?.symbol ?? ""}` : "-"}
            </strong>
          </div>
          <div className={styles.previewRow}>
            <span>Precio estimado</span>
            <strong>{priceDisplay ?? "-"}</strong>
          </div>
          <div className={styles.previewRow}>
            <span>Impacto en el precio</span>
            <strong>{priceImpact ? `${priceImpact}%` : "< 0.01%"}</strong>
          </div>
          <div className={styles.previewRow}>
            <span>Ruta</span>
            <strong>{swapRoutes ?? "Jupiter"}</strong>
          </div>
          <div className={styles.previewFooter}>
            {quoteLoading ? (
              <span>Actualizando cotización…</span>
            ) : refreshedAt ? (
              <span>
                Última actualización: {new Date(refreshedAt).toLocaleTimeString()} (se renueva
                automáticamente)
              </span>
            ) : (
              <span>Introduce un monto para obtener una cotización en tiempo real.</span>
            )}
          </div>
        </div>

        {swapError && <p className={styles.errorBanner}>{swapError}</p>}
        {swapSignature && explorerUrl && (
          <p className={styles.successBanner}>
            Swap enviado correctamente. Consulta el estado en el
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              &nbsp;Solana Explorer
            </a>
            .
          </p>
        )}

        <button
          type="button"
          className={styles.swapButton}
          onClick={handleSwap}
          disabled={disableSwapButton}
        >
          {isSwapping ? "Firmando…" : "Confirmar swap"}
        </button>
      </div>
    </section>
  );
};

export default SwapForm;
