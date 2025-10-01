import type { Metadata } from "next";
import WalletContextProvider from "@/components/WalletProvider";
import { NetworkProvider } from "@/context/NetworkContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";
import Footer from "@/components/Footer";

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
            <WalletContextProvider>
              <div className="appContainer">
                <div className="appContent">{children}</div>
                <Footer />
              </div>
            </WalletContextProvider>
          </LanguageProvider>
        </NetworkProvider>
      </body>
    </html>
  );
}
