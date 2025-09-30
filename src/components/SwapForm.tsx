"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  VersionedTransaction,
} from "@solana/web3.js";

import styles from "@/app/page.module.css";
import { useTokenList } from "@/hooks/useTokenList";
import { useJupiterQuote } from "@/hooks/useJupiterQuote";
import { TokenInfo } from "@/types/token";
import { formatLamports, formatNumber, parseAmountToLamports } from "@/utils/amount";
import { SwapResponse } from "@/types/jupiter";
import TokenSelector from "./TokenSelector";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const BONK_MINT = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
const AIRDROP_LAMPORTS = LAMPORTS_PER_SOL;

const decodeTransaction = (encoded: string) =>
  Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));

const SwapForm = () => {
  const { tokens, loading: tokensLoading, error: tokensError } = useTokenList();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [inputToken, setInputToken] = useState<TokenInfo | null>(null);
  const [outputToken, setOutputToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropMessage, setAirdropMessage] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSignature, setSwapSignature] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    if (!tokens.length) {
      return;
    }

    setInputToken((previous) => {
      if (previous) return previous;
      const preferred = tokens.find((token) => token.address === SOL_MINT);
      return preferred ?? tokens[0];
    });

    setOutputToken((previous) => {
      if (previous) return previous;
      const bonk = tokens.find((token) => token.address === BONK_MINT);
      if (bonk && bonk.address !== inputToken?.address) {
        return bonk;
      }
      const alternative = tokens.find((token) => token.address !== inputToken?.address);
      return alternative ?? null;
    });
  }, [tokens, inputToken?.address]);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    try {
      setIsFetchingBalance(true);
      const lamports = await connection.getBalance(publicKey, "confirmed");
      setBalance(formatLamports(BigInt(lamports), 9, 4));
    } catch (error) {
      console.error("Error al leer el saldo", error);
    } finally {
      setIsFetchingBalance(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connected) {
      refreshBalance();
    } else {
      setBalance(null);
    }
  }, [connected, refreshBalance]);

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
  });

  useEffect(() => {
    setSwapError(null);
    setSwapSignature(null);
  }, [inputToken?.address, outputToken?.address, amount]);

  const handleAirdrop = useCallback(async () => {
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
  }, [connection, publicKey, refreshBalance]);

  const handleSwapTokens = () => {
    if (!inputToken || !outputToken) return;
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setAmount("");
  };

  const handleSelectInput = (token: TokenInfo) => {
    setInputToken(token);
    if (outputToken && outputToken.address === token.address) {
      const alternative = tokens.find((candidate) => candidate.address !== token.address);
      setOutputToken(alternative ?? null);
    }
  };

  const handleSelectOutput = (token: TokenInfo) => {
    setOutputToken(token);
    if (inputToken && inputToken.address === token.address) {
      const alternative = tokens.find((candidate) => candidate.address !== token.address);
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

  const explorerUrl = swapSignature
    ? `https://explorer.solana.com/tx/${swapSignature}?cluster=devnet`
    : null;

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

      const response = await fetch("https://quote-api.jup.ag/v6/swap", {
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
  ]);

  const disableSwapButton =
    !connected || !canQuote || quoteLoading || isSwapping || tokensLoading;

  return (
    <section className={styles.swapSection}>
      <header className={styles.swapHeader}>
        <div>
          <h1 className={styles.title}>MetaSwap</h1>
          <p className={styles.subtitle}>
            Intercambia tokens en Solana devnet con la seguridad de Solflare.
          </p>
        </div>
        <WalletMultiButton className={styles.walletButton} />
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
            disabled={!connected || isAirdropping}
          >
            {isAirdropping ? "Solicitando…" : "Recibir 1 SOL"}
          </button>
        </div>
        {airdropMessage && <p className={styles.helperText}>{airdropMessage}</p>}

        {tokensError && <p className={styles.errorBanner}>{tokensError}</p>}

        <div className={styles.selectorsWrapper}>
          <TokenSelector
            label="De"
            token={inputToken}
            tokens={tokens}
            onTokenSelect={handleSelectInput}
            amount={amount}
            onAmountChange={setAmount}
            placeholder="0.0"
          />

          <button
            type="button"
            className={styles.switchButton}
            onClick={handleSwapTokens}
            aria-label="Cambiar tokens"
          >
            ⇅
          </button>

          <TokenSelector
            label="Para"
            token={outputToken}
            tokens={tokens}
            onTokenSelect={handleSelectOutput}
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
