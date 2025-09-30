"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import "@solana/wallet-adapter-react-ui/styles.css";

import { NetworkCluster, useNetwork } from "@/context/NetworkContext";
import {
  getEndpointForNetwork,
  isDefaultMainnetEndpoint,
  resolveMainnetEndpoint,
} from "@/utils/solanaEndpoints";

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

  const endpoint = useMemo(() => {
    return getEndpointForNetwork(network);
  }, [network]);

  const wallets = useMemo(
    () => [new SolflareWalletAdapter({ network: walletNetworkMap[network] })],
    [network]
  );

  useEffect(() => {
    console.info(`Conectando a la red ${network}`);
    if (network === "mainnet-beta") {
      const customEndpoint = resolveMainnetEndpoint();
      if (isDefaultMainnetEndpoint(customEndpoint)) {
        console.info(
          "Usando el endpoint predeterminado de Helius para la red mainnet."
        );
      } else {
        console.info("Usando un endpoint RPC personalizado para la red mainnet.");
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
