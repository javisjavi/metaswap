"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
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
const SLIPPAGE_PRESETS = [0.1, 0.5, 1, 2] as const;
const QUICK_AMOUNT_PERCENTAGES = [25, 50, 75, 100] as const;

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

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const SwapForm = () => {
  const { network, setNetwork } = useNetwork();
  const { tokens, loading: tokensLoading, error: tokensError } = useTokenList(network);
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [inputToken, setInputToken] = useState<TokenInfo | null>(DEFAULT_SOL_TOKEN);
  const [outputToken, setOutputToken] = useState<TokenInfo | null>(DEFAULT_USDC_TOKEN);
  const [customTokens, setCustomTokens] = useState<TokenInfo[]>([]);
  const [amountMode, setAmountMode] = useState<"in" | "out">("in");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [outputAmount, setOutputAmount] = useState<string>("");
  const [balance, setBalance] = useState<string | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [inputTokenBalance, setInputTokenBalance] = useState<string | null>(null);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropMessage, setAirdropMessage] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSignature, setSwapSignature] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [inputAmountDisplay, setInputAmountDisplay] = useState("");
  const [outputAmountDisplay, setOutputAmountDisplay] = useState("");
  const [slippageBps, setSlippageBps] = useState(50);
  const [slippageInput, setSlippageInput] = useState("0.5");

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

  const clampSlippagePercent = useCallback(
    (value: number) => Math.min(50, Math.max(0, value)),
    []
  );

  const formatSlippagePercent = useCallback((value: number) => {
    if (Number.isNaN(value)) {
      return "0";
    }
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }, []);

  const applySlippagePercent = useCallback(
    (percent: number) => {
      const clamped = clampSlippagePercent(percent);
      setSlippageBps(Math.round(clamped * 100));
      setSlippageInput(formatSlippagePercent(clamped));
    },
    [clampSlippagePercent, formatSlippagePercent]
  );

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
    setAmountMode("in");
    setInputAmount("");
    setOutputAmount("");
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

  const parsedInputAmount = useMemo(
    () =>
      inputToken
        ? parseAmountToLamports(inputAmount, inputToken.decimals ?? 0)
        : null,
    [inputAmount, inputToken]
  );

  const parsedOutputAmount = useMemo(
    () =>
      outputToken
        ? parseAmountToLamports(outputAmount, outputToken.decimals ?? 0)
        : null,
    [outputAmount, outputToken]
  );

  const quoteAmount = amountMode === "in" ? parsedInputAmount : parsedOutputAmount;

  const sameTokenSelected =
    inputToken && outputToken && inputToken.address === outputToken.address;

  const canQuote =
    Boolean(
      inputToken &&
        outputToken &&
        quoteAmount &&
        quoteAmount > BigInt(0) &&
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
    amount: quoteAmount,
    enabled: canQuote,
    slippageBps,
    cluster: network,
    swapMode: amountMode === "in" ? "ExactIn" : "ExactOut",
  });

  useEffect(() => {
    setSwapError(null);
    setSwapSignature(null);
  }, [inputToken?.address, outputToken?.address, inputAmount, outputAmount, amountMode]);

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
    setAmountMode("in");
    setInputAmount("");
    setOutputAmount("");
  };

  const handleInputAmountChange = useCallback(
    (value: string) => {
      setAmountMode("in");
      setInputAmount(value);
      setOutputAmount("");
    },
    [setAmountMode, setInputAmount, setOutputAmount]
  );

  const handleQuickAmountSelect = useCallback(
    (percentage: number) => {
      if (!inputTokenBalance || !inputToken) {
        return;
      }
      const decimals = inputToken.decimals ?? 0;
      const balanceLamports = parseAmountToLamports(
        inputTokenBalance,
        decimals
      );
      if (balanceLamports === null) {
        return;
      }
      const amountLamports =
        (balanceLamports * BigInt(percentage)) / BigInt(100);
      const formatted = formatLamports(
        amountLamports,
        decimals,
        Math.min(6, decimals)
      );
      handleInputAmountChange(formatted);
    },
    [handleInputAmountChange, inputTokenBalance, inputToken]
  );

  const handleOutputAmountChange = useCallback(
    (value: string) => {
      setAmountMode("out");
      setOutputAmount(value);
      setInputAmount("");
    },
    [setAmountMode, setOutputAmount, setInputAmount]
  );

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

  const formattedQuoteInputAmount = useMemo(() => {
    if (!quote || !inputToken) return "";
    return formatLamports(
      quote.inAmount,
      inputToken.decimals,
      Math.min(6, inputToken.decimals)
    );
  }, [quote, inputToken]);

  const formattedQuoteOutputAmount = useMemo(() => {
    if (!quote || !outputToken) return "";
    return formatLamports(
      quote.outAmount,
      outputToken.decimals,
      Math.min(6, outputToken.decimals)
    );
  }, [quote, outputToken]);

  useEffect(() => {
    if (amountMode === "in") {
      setInputAmountDisplay(inputAmount);
      if (inputAmount === "") {
        setOutputAmountDisplay("");
      }
    }
  }, [amountMode, inputAmount]);

  useEffect(() => {
    if (amountMode === "out") {
      setOutputAmountDisplay(outputAmount);
      if (outputAmount === "") {
        setInputAmountDisplay("");
      }
    }
  }, [amountMode, outputAmount]);

  useEffect(() => {
    if (amountMode === "in") {
      if (formattedQuoteOutputAmount) {
        setOutputAmountDisplay(formattedQuoteOutputAmount);
      } else if (inputAmount === "") {
        setOutputAmountDisplay("");
      }
      return;
    }

    if (formattedQuoteInputAmount) {
      setInputAmountDisplay(formattedQuoteInputAmount);
    } else if (outputAmount === "") {
      setInputAmountDisplay("");
    }
  }, [
    amountMode,
    formattedQuoteInputAmount,
    formattedQuoteOutputAmount,
    inputAmount,
    outputAmount,
  ]);

  const quoteThresholdAmount = useMemo(() => {
    if (!quote) return "";
    if (quote.swapMode === "ExactOut") {
      if (!inputToken) return "";
      return formatLamports(
        quote.otherAmountThreshold,
        inputToken.decimals,
        Math.min(6, inputToken.decimals)
      );
    }
    if (!outputToken) return "";
    return formatLamports(
      quote.otherAmountThreshold,
      outputToken.decimals,
      Math.min(6, outputToken.decimals)
    );
  }, [quote, inputToken, outputToken]);

  const slippagePercentDisplay = useMemo(
    () => formatSlippagePercent(slippageBps / 100),
    [formatSlippagePercent, slippageBps]
  );

  const thresholdLabel =
    quote?.swapMode === "ExactOut"
      ? `Máximo a enviar (${slippagePercentDisplay}%)`
      : `Mínimo tras slippage (${slippagePercentDisplay}%)`;

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
    if (
      !quote ||
      !inputToken ||
      !outputToken ||
      !quoteAmount ||
      quoteAmount <= BigInt(0)
    ) {
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
      setAmountMode("in");
      setInputAmount("");
      setOutputAmount("");
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
    quoteAmount,
    inputToken,
    outputToken,
    refreshBalance,
    refreshQuote,
    network,
  ]);

  const disableSwapButton =
    !connected || !canQuote || quoteLoading || isSwapping || tokensLoading || !quote;

  const handleNetworkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value as (typeof NETWORK_OPTIONS)[number]["value"];
    setNetwork(selected);
  };

  const handleSlippageInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (!/^\d*(\.\d{0,2})?$/.test(value)) {
        return;
      }
      setSlippageInput(value);
      if (value === "") {
        return;
      }
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        const clamped = clampSlippagePercent(parsed);
        setSlippageBps(Math.round(clamped * 100));
      }
    },
    [clampSlippagePercent]
  );

  const handleSlippageBlur = useCallback(() => {
    if (slippageInput === "") {
      applySlippagePercent(0);
      return;
    }
    const parsed = Number(slippageInput);
    if (Number.isNaN(parsed)) {
      applySlippagePercent(slippageBps / 100);
      return;
    }
    applySlippagePercent(parsed);
  }, [applySlippagePercent, slippageInput, slippageBps]);

  const handleSlippagePreset = useCallback(
    (value: number) => {
      applySlippagePercent(value);
    },
    [applySlippagePercent]
  );

  const airdropUnavailable = network === "mainnet-beta";
  const quickAmountsDisabled = !connected || !inputTokenBalance || !inputToken;

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
              {connected ? (
                balance ? (
                  <span className={styles.balanceValueContent}>
                    {balance}
                    <span className={styles.balanceToken}>
                      <span aria-hidden className={styles.balanceTokenIcon} />
                      SOL
                    </span>
                  </span>
                ) : isFetchingBalance ? (
                  "Actualizando…"
                ) : (
                  "-"
                )
              ) : (
                "Conecta tu wallet"
              )}
            </strong>
          </div>
          {!airdropUnavailable ? (
            <button
              type="button"
              className={styles.faucetButton}
              onClick={handleAirdrop}
              disabled={!connected || isAirdropping}
            >
              {isAirdropping ? "Solicitando…" : "Recibir 1 SOL"}
            </button>
          ) : null}
        </div>
        {!airdropUnavailable && airdropMessage ? (
          <p className={styles.helperText}>{airdropMessage}</p>
        ) : null}

        {tokensError && <p className={styles.errorBanner}>{tokensError}</p>}

        <div className={styles.selectorsWrapper}>
          <div className={styles.selectorStack}>
            <TokenSelector
              label="De"
              token={inputToken}
              tokens={tokenOptions}
              onTokenSelect={handleSelectInput}
              network={network}
              amount={inputAmountDisplay}
              onAmountChange={handleInputAmountChange}
              placeholder="0.0"
              availableAmount={connected ? inputTokenBalance ?? undefined : undefined}
              onAvailableClick={
                connected && inputTokenBalance
                  ? () => handleInputAmountChange(inputTokenBalance)
                  : undefined
              }
            />
            <div className={styles.quickAmountRow}>
              {QUICK_AMOUNT_PERCENTAGES.map((percentage) => (
                <button
                  key={percentage}
                  type="button"
                  className={styles.quickAmountButton}
                  onClick={() => handleQuickAmountSelect(percentage)}
                  disabled={quickAmountsDisabled}
                >
                  {percentage}%
                </button>
              ))}
            </div>
          </div>

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
            amount={outputAmountDisplay}
            onAmountChange={handleOutputAmountChange}
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
            <strong>
              {outputAmountDisplay
                ? `${outputAmountDisplay} ${outputToken?.symbol ?? ""}`
                : "-"}
            </strong>
          </div>
          <div className={styles.previewRow}>
            <span>{thresholdLabel}</span>
            <strong>
              {quoteThresholdAmount
                ? `${quoteThresholdAmount} ${
                    quote?.swapMode === "ExactOut"
                      ? inputToken?.symbol ?? ""
                      : outputToken?.symbol ?? ""
                  }`
                : "-"}
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
            <div className={styles.slippageControl}>
              <div className={styles.slippageHeader}>
                <span>Slippage máximo</span>
                <div className={styles.slippagePresets}>
                  {SLIPPAGE_PRESETS.map((preset) => {
                    const presetBps = Math.round(preset * 100);
                    const isActive = presetBps === slippageBps;
                    return (
                      <button
                        key={preset}
                        type="button"
                        className={`${styles.slippagePresetButton} ${
                          isActive ? styles.slippagePresetButtonActive : ""
                        }`}
                        onClick={() => handleSlippagePreset(preset)}
                        aria-pressed={isActive}
                      >
                        {formatSlippagePercent(preset)}%
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={styles.slippageInputGroup}>
                <input
                  id="slippage-input"
                  className={styles.slippageInput}
                  type="text"
                  inputMode="decimal"
                  value={slippageInput}
                  onChange={handleSlippageInputChange}
                  onBlur={handleSlippageBlur}
                  placeholder="0.5"
                  aria-describedby="slippage-help"
                />
                <span className={styles.slippageSuffix}>%</span>
              </div>
              <p id="slippage-help" className={styles.slippageHelper}>
                Ajusta la tolerancia de precio para tus swaps.
              </p>
            </div>
            <div className={styles.previewFooterStatus}>
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
