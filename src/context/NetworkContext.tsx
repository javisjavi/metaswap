"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type NetworkCluster = "devnet" | "testnet" | "mainnet-beta";

interface NetworkContextValue {
  network: NetworkCluster;
  setNetwork: (network: NetworkCluster) => void;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider = ({ children }: NetworkProviderProps) => {
  const [network, setNetwork] = useState<NetworkCluster>("mainnet-beta");

  const value = useMemo(() => ({ network, setNetwork }), [network]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = (): NetworkContextValue => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork debe usarse dentro de un NetworkProvider");
  }
  return context;
};
