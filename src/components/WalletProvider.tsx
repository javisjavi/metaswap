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

const QUICKNODE_MAINNET_ENDPOINT = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL ?? null;

interface WalletProviderProps {
  children: ReactNode;
}

const DEFAULT_ENDPOINTS: Record<NetworkCluster, string> = {
  devnet: clusterApiUrl("devnet"),
  testnet: clusterApiUrl("testnet"),
  "mainnet-beta": "https://mainnet.helius-rpc.com/?api-key=06c5f6f8-30b3-4326-beff-c27807297023",
};

const customMainnetEndpoint =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC
    : undefined;

const WalletContextProvider = ({ children }: WalletProviderProps) => {
  const { network } = useNetwork();

  const endpoint = useMemo(() => {
    if (network === "mainnet-beta") {
      return customMainnetEndpoint ?? DEFAULT_ENDPOINTS[network];
    }

    return DEFAULT_ENDPOINTS[network];
  }, [network]);

  const wallets = useMemo(
    () => [new SolflareWalletAdapter({ network: walletNetworkMap[network] })],
    [network]
  );

  useEffect(() => {
    console.info(`Conectando a la red ${network}`);
    if (network === "mainnet-beta" && !QUICKNODE_MAINNET_ENDPOINT) {
      console.warn(
        "NEXT_PUBLIC_QUICKNODE_RPC_URL no está configurado. Se utilizará el endpoint público de Solana."
      );
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
