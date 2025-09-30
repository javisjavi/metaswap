import type { Metadata } from "next";
import WalletContextProvider from "@/components/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetaSwap | Solana Devnet",
  description:
    "Conecta tu wallet Solflare y realiza swaps de tokens en la devnet de Solana con cotizaciones en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
