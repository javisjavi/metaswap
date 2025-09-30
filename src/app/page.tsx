"use client";

import { useState, type ReactNode } from "react";

import styles from "./page.module.css";
import SwapForm from "@/components/SwapForm";

type SectionKey = "swap" | "overview" | "support";

type IconProps = {
  className?: string;
};

type SectionDefinition = {
  key: SectionKey;
  label: string;
  description: string;
  Icon: (props: IconProps) => JSX.Element;
};

const SwapIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <path
      d="M7 7h8.6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <path
      d="M14.2 4.6L17.2 7.5 14.2 10.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <path
      d="M7.2 7v5.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M17 17H8.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <path
      d="M9.4 19.4L6.4 16.5 9.4 13.6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <path
      d="M16.8 17v-5.6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
);

const OverviewIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <rect
      x="4.2"
      y="4.2"
      width="7.6"
      height="7.6"
      rx="1.8"
      stroke="currentColor"
      strokeWidth="1.6"
      opacity="0.92"
    />
    <rect
      x="4.2"
      y="13.2"
      width="7.6"
      height="6.6"
      rx="1.8"
      stroke="currentColor"
      strokeWidth="1.6"
      opacity="0.92"
    />
    <path
      d="M13.4 6.2h6.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M13.4 10h6.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.55"
    />
    <path
      d="M13.4 14l2.4 2.4 2.2-3 2.4 4.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.92"
    />
    <circle
      cx="13.5"
      cy="18.2"
      r="0.9"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
);

const SupportIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" opacity="0.92" />
    <circle
      cx="12"
      cy="12"
      r="5.2"
      fill="currentColor"
      opacity="0.16"
    />
    <circle
      cx="12"
      cy="12"
      r="3.4"
      stroke="currentColor"
      strokeWidth="1.6"
      opacity="0.65"
    />
    <path
      d="M12 4.8v1.9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M19.2 12h-1.9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M12 17.3v1.9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M6.7 12H4.8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M7.4 7.4l1.4 1.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M16.6 7.4l-1.4 1.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M16.6 16.6l-1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M8.8 15.2L7.4 16.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

const SECTIONS: SectionDefinition[] = [
  {
    key: "swap",
    label: "Intercambiar",
    description: "Opera tokens al instante",
    Icon: SwapIcon,
  },
  {
    key: "overview",
    label: "Panel",
    description: "Resumen de actividad",
    Icon: OverviewIcon,
  },
  {
    key: "support",
    label: "Soporte",
    description: "Guías y ayuda",
    Icon: SupportIcon,
  },
];

const OverviewPanel = () => (
  <div className={styles.infoSection}>
    <header className={styles.infoHeader}>
      <h1 className={styles.infoTitle}>Panel general</h1>
      <p className={styles.infoSubtitle}>
        Controla tus activos con estadísticas en tiempo real y recomendaciones
        para optimizar cada swap.
      </p>
    </header>

    <div className={styles.infoGrid}>
      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>Estado de la red</h2>
        <p className={styles.infoCardText}>
          Seguimos la salud de Solana y te avisamos cuando conviene operar.
        </p>
        <ul className={styles.infoList}>
          <li>
            Latencia promedio <strong>&lt; 0.5s</strong>
          </li>
          <li>
            Éxito de transacciones <strong>99.2%</strong>
          </li>
          <li>
            Congestión <strong>Baja</strong>
          </li>
        </ul>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>Atajos inteligentes</h2>
        <p className={styles.infoCardText}>
          Guarda tus combinaciones favoritas y lánzalas con un solo clic.
        </p>
        <div className={styles.quickActions}>
          <button type="button">Comprar SOL con USDC</button>
          <button type="button">Vender SOL por USDT</button>
          <button type="button">Enviar a billetera fría</button>
        </div>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>Recordatorios</h2>
        <p className={styles.infoCardText}>
          Configura alertas personalizadas para aprovechar el mejor momento.
        </p>
        <div className={styles.reminders}>
          <div>
            <span className={styles.reminderLabel}>Solana &gt; $150</span>
            <span className={styles.reminderStatus}>Activo</span>
          </div>
          <div>
            <span className={styles.reminderLabel}>USDC disponibilidad</span>
            <span className={styles.reminderStatus}>Sincronizado</span>
          </div>
          <div>
            <span className={styles.reminderLabel}>Actualizar bots</span>
            <span className={styles.reminderStatus}>Pendiente</span>
          </div>
        </div>
      </article>
    </div>
  </div>
);

const SupportPanel = () => (
  <div className={styles.infoSection}>
    <header className={styles.infoHeader}>
      <h1 className={styles.infoTitle}>Centro de soporte</h1>
      <p className={styles.infoSubtitle}>
        Encuentra respuestas rápidas o contacta a nuestro equipo cuando lo
        necesites.
      </p>
    </header>

    <div className={styles.infoGrid}>
      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>Guías destacadas</h2>
        <ul className={styles.infoList}>
          <li>Cómo conectar tu wallet de forma segura</li>
          <li>Configura alertas de precio en menos de 2 minutos</li>
          <li>Buenas prácticas para swaps de alto volumen</li>
        </ul>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>Canales de ayuda</h2>
        <div className={styles.supportChannels}>
          <div>
            <span className={styles.channelLabel}>Chat en vivo</span>
            <span className={styles.channelDetail}>Tiempo de respuesta &lt; 5 min</span>
          </div>
          <div>
            <span className={styles.channelLabel}>Discord</span>
            <span className={styles.channelDetail}>#metaswap-support</span>
          </div>
          <div>
            <span className={styles.channelLabel}>Centro de ayuda</span>
            <span className={styles.channelDetail}>artículos y videotutoriales</span>
          </div>
        </div>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>Estado del servicio</h2>
        <p className={styles.infoCardText}>
          Actualizamos constantemente la estabilidad de la plataforma para que
          puedas operar sin interrupciones.
        </p>
        <div className={styles.statusBadge}>Operativo</div>
      </article>
    </div>
  </div>
);

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionKey>("swap");

  let content: ReactNode;
  switch (activeSection) {
    case "overview":
      content = <OverviewPanel />;
      break;
    case "support":
      content = <SupportPanel />;
      break;
    default:
      content = <SwapForm />;
  }

  return (
    <main className={styles.main}>
      <div className={styles.appShell}>
        <nav
          className={styles.menu}
          aria-label="Navegación principal"
          role="tablist"
          aria-orientation="vertical"
        >
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.key;
            const itemClasses = [styles.menuItem];
            if (isActive) {
              itemClasses.push(styles.menuItemActive);
            }

            return (
              <button
                key={section.key}
                type="button"
                role="tab"
                id={`tab-${section.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${section.key}`}
                className={itemClasses.join(" ")}
                onClick={() => setActiveSection(section.key)}
              >
                <span className={styles.menuIconBadge} aria-hidden="true">
                  <section.Icon className={styles.menuIconGraphic} />
                </span>
                <span className={styles.menuText}>
                  <span className={styles.menuLabel}>{section.label}</span>
                  <span className={styles.menuDescription}>
                    {section.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <section
          key={activeSection}
          role="tabpanel"
          id={`panel-${activeSection}`}
          aria-labelledby={`tab-${activeSection}`}
          className={styles.contentArea}
        >
          {content}
        </section>
      </div>
    </main>
  );
}
