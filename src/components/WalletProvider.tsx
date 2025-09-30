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

const WalletContextProvider = ({ children }: WalletProviderProps) => {
  const { network } = useNetwork();

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new SolflareWalletAdapter({ network: walletNetworkMap[network] })],
    [network]
  );

  useEffect(() => {
    console.info(`Conectando a la red ${network}`);
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
