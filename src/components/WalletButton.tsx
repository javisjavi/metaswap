"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal, WalletIcon } from "@solana/wallet-adapter-react-ui";

import { useTranslations } from "@/context/LanguageContext";

import styles from "@/app/page.module.css";

type WalletButtonProps = {
  className?: string;
  onExplorerNavigate?: () => void;
};

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Select Wallet",
} as const;

const WalletButton = ({ className, onExplorerNavigate }: WalletButtonProps) => {
  const translations = useTranslations();
  const explorerLabel = translations.walletMenu.openExplorer;
  const { setVisible: setModalVisible } = useWalletModal();
  const { connect, disconnect, connected, connecting, publicKey, wallet } = useWallet();

  const walletIcon = wallet?.adapter.icon;
  const walletName = wallet?.adapter.name;

  const buttonState = useMemo(() => {
    if (!wallet) {
      return "no-wallet" as const;
    }

    if (connecting) {
      return "connecting" as const;
    }

    if (connected) {
      return "connected" as const;
    }

    return "has-wallet" as const;
  }, [wallet, connecting, connected]);

  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent | TouchEvent) => {
      const node = menuRef.current;
      if (!node || node.contains(event.target as Node)) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("touchstart", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("touchstart", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (!connected) {
      setMenuOpen(false);
    }
  }, [connected]);

  const content = useMemo(() => {
    if (publicKey) {
      const base58 = publicKey.toBase58();
      return `${base58.slice(0, 4)}..${base58.slice(-4)}`;
    }

    if (buttonState === "connecting" || buttonState === "has-wallet") {
      return LABELS[buttonState];
    }

    return LABELS["no-wallet"];
  }, [buttonState, publicKey]);

  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Wallet disconnect failed", error);
    } finally {
      setMenuOpen(false);
    }
  }, [disconnect]);

  const handleButtonClick = () => {
    switch (buttonState) {
      case "no-wallet":
        setModalVisible(true);
        break;
      case "has-wallet":
        handleConnect();
        break;
      case "connected":
        setMenuOpen(true);
        break;
    }
  };

  const handleCopyAddress = async (event: ReactMouseEvent<HTMLLIElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!publicKey) {
      return;
    }

    await navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 400);
  };

  const handleExplorerClick = () => {
    if (onExplorerNavigate) {
      onExplorerNavigate();
    }
    setMenuOpen(false);
  };

  const dropdownClasses = ["wallet-adapter-dropdown-list"];
  if (menuOpen) {
    dropdownClasses.push("wallet-adapter-dropdown-list-active");
  }

  return (
    <div className="wallet-adapter-dropdown">
      <button
        type="button"
        aria-expanded={menuOpen}
        className={[
          "wallet-adapter-button",
          "wallet-adapter-button-trigger",
          className ?? styles.walletButton,
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={buttonState === "connecting"}
        onClick={handleButtonClick}
        style={menuOpen ? { pointerEvents: "none" } : undefined}
      >
        {wallet && walletIcon && walletName ? (
          <i className="wallet-adapter-button-start-icon" aria-hidden="true">
            <WalletIcon wallet={wallet} />
          </i>
        ) : null}
        {content}
      </button>
      <ul
        aria-label="dropdown-list"
        className={dropdownClasses.join(" ")}
        ref={menuRef}
        role="menu"
      >
        {publicKey ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={handleCopyAddress}
            role="menuitem"
          >
            {copied ? LABELS["copied"] : LABELS["copy-address"]}
          </li>
        ) : null}
        <li
          className="wallet-adapter-dropdown-list-item"
          onClick={() => {
            setModalVisible(true);
            setMenuOpen(false);
          }}
          role="menuitem"
        >
          {LABELS["change-wallet"]}
        </li>
        {connected && publicKey && onExplorerNavigate ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={handleExplorerClick}
            role="menuitem"
          >
            {explorerLabel}
          </li>
        ) : null}
        {connected ? (
          <li
            className="wallet-adapter-dropdown-list-item"
            onClick={handleDisconnect}
            role="menuitem"
          >
            {LABELS["disconnect"]}
          </li>
        ) : null}
      </ul>
    </div>
  );
};

export default WalletButton;
