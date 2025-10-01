"use client";

import dynamic from "next/dynamic";

import styles from "@/app/page.module.css";

type WalletButtonProps = {
  className?: string;
};

const DynamicWalletMultiButton = dynamic(
  async () => {
    const mod = await import("@solana/wallet-adapter-react-ui");
    return mod.WalletMultiButton;
  },
  { ssr: false }
);

const WalletButton = ({ className }: WalletButtonProps) => {
  return <DynamicWalletMultiButton className={className ?? styles.walletButton} />;
};

export default WalletButton;
