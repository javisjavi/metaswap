"use client";

import { useState } from "react";
import styles from "./page.module.css";
import SwapForm from "@/components/SwapForm";
import TopCryptoTable from "@/components/TopCryptoTable";

type ViewKey = "swap" | "ranking";

const MENU_ITEMS: { key: ViewKey; label: string }[] = [
  { key: "swap", label: "Intercambiar" },
  { key: "ranking", label: "Top 10 criptomonedas" },
];

export default function Home() {
  const [activeView, setActiveView] = useState<ViewKey>("swap");

  return (
    <main className={styles.main}>
      <div className={styles.appShell}>
        <nav className={styles.topNav} aria-label="Secciones principales">
          {MENU_ITEMS.map((item) => {
            const buttonClasses = [styles.navButton];
            if (activeView === item.key) {
              buttonClasses.push(styles.navButtonActive);
            }

            return (
              <button
                key={item.key}
                type="button"
                className={buttonClasses.join(" ")}
                onClick={() => setActiveView(item.key)}
                aria-pressed={activeView === item.key}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className={styles.viewContainer}>
          {activeView === "swap" ? <SwapForm /> : <TopCryptoTable />}
        </div>
      </div>
    </main>
  );
}
