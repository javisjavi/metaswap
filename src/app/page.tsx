import styles from "./page.module.css";
import SwapForm from "@/components/SwapForm";

export default function Home() {
  return (
    <main className={styles.main}>
      <SwapForm />
    </main>
  );
}
