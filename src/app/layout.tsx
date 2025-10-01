import type { Metadata } from "next";
import WalletContextProvider from "@/components/WalletProvider";
import { NetworkProvider } from "@/context/NetworkContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetaSwap | Solana Swap Multired",
  description:
    "Conecta tu wallet Solflare y realiza swaps de tokens en Solana con cotizaciones en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <NetworkProvider>
          <LanguageProvider>
            <WalletContextProvider>{children}</WalletContextProvider>
          </LanguageProvider>
        </NetworkProvider>
      </body>
    </html>
  );
}
