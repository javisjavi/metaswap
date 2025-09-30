"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

import { NetworkCluster, useNetwork } from "@/context/NetworkContext";

const walletNetworkMap: Record<NetworkCluster, WalletAdapterNetwork> = {
  devnet: WalletAdapterNetwork.Devnet,
  testnet: WalletAdapterNetwork.Testnet,
  "mainnet-beta": WalletAdapterNetwork.Mainnet,
};

interface WalletProviderProps {
  children: ReactNode;
}

const DEFAULT_ENDPOINTS: Record<NetworkCluster, string> = {
  devnet: clusterApiUrl("devnet"),
  testnet: clusterApiUrl("testnet"),
  "mainnet-beta": clusterApiUrl("mainnet-beta"),
};

const resolveMainnetEndpoint = () => {
  if (typeof process === "undefined") {
    return DEFAULT_ENDPOINTS["mainnet-beta"];
  }

  const candidates = [
    process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC,
    process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL,
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return DEFAULT_ENDPOINTS["mainnet-beta"];
};

const WalletContextProvider = ({ children }: WalletProviderProps) => {
  const { network } = useNetwork();

  const endpoint = useMemo(() => {
    if (network === "mainnet-beta") {
      return resolveMainnetEndpoint();
    }

    return DEFAULT_ENDPOINTS[network];
  }, [network]);

  const wallets = useMemo(
    () => [new SolflareWalletAdapter({ network: walletNetworkMap[network] })],
    [network]
  );

  useEffect(() => {
    console.info(`Conectando a la red ${network}`);
    if (network === "mainnet-beta") {
      const customEndpoint = resolveMainnetEndpoint();
      if (customEndpoint === DEFAULT_ENDPOINTS["mainnet-beta"]) {
        console.warn(
          "No se detectó un endpoint RPC personalizado para mainnet. Se utilizará el endpoint público de Solana."
        );
      }
    }
  }, [network]);

  return (
    <ConnectionProvider
      key={network}
      endpoint={endpoint}
      config={{ commitment: "confirmed" }}
    >
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
