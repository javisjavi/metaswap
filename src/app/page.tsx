"use client";

import { useState, type ReactNode } from "react";

import LanguageToggle from "@/components/LanguageToggle";
import { useTranslations } from "@/context/LanguageContext";
import { type AppTranslation, type SectionKey } from "@/utils/translations";

import styles from "./page.module.css";
import SwapForm from "@/components/SwapForm";

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

const OverviewPanel = ({ content }: { content: AppTranslation["overview"] }) => (
  <div className={styles.infoSection}>
    <header className={styles.infoHeader}>
      <h1 className={styles.infoTitle}>{content.title}</h1>
      <p className={styles.infoSubtitle}>{content.subtitle}</p>
    </header>

    <div className={styles.infoGrid}>
      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.cards.network.title}</h2>
        <p className={styles.infoCardText}>{content.cards.network.description}</p>
        <ul className={styles.infoList}>
          {content.cards.network.stats.map((stat) => (
            <li key={stat.label}>
              {stat.label} <strong>{stat.value}</strong>
            </li>
          ))}
        </ul>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.cards.shortcuts.title}</h2>
        <p className={styles.infoCardText}>{content.cards.shortcuts.description}</p>
        <div className={styles.quickActions}>
          {content.cards.shortcuts.actions.map((action) => (
            <button key={action} type="button">
              {action}
            </button>
          ))}
        </div>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.cards.reminders.title}</h2>
        <p className={styles.infoCardText}>{content.cards.reminders.description}</p>
        <div className={styles.reminders}>
          {content.cards.reminders.reminders.map((reminder) => (
            <div key={reminder.label}>
              <span className={styles.reminderLabel}>{reminder.label}</span>
              <span className={styles.reminderStatus}>{reminder.status}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  </div>
);

const SupportPanel = ({ content }: { content: AppTranslation["support"] }) => (
  <div className={styles.infoSection}>
    <header className={styles.infoHeader}>
      <h1 className={styles.infoTitle}>{content.title}</h1>
      <p className={styles.infoSubtitle}>{content.subtitle}</p>
    </header>

    <div className={styles.infoGrid}>
      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.guides.title}</h2>
        <ul className={styles.infoList}>
          {content.guides.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.channels.title}</h2>
        <div className={styles.supportChannels}>
          {content.channels.options.map((channel) => (
            <a
              key={channel.href}
              className={styles.supportChannelLink}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.channelLabel}>{channel.label}</span>
              <span className={styles.channelDetail}>{channel.detail}</span>
            </a>
          ))}
        </div>
      </article>

      <article className={styles.infoCard}>
        <h2 className={styles.infoCardTitle}>{content.status.title}</h2>
        <p className={styles.infoCardText}>{content.status.description}</p>
        <div className={styles.statusBadge}>{content.status.badge}</div>
      </article>
    </div>
  </div>
);

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionKey>("swap");
  const translations = useTranslations();

  const sections: SectionDefinition[] = [
    {
      key: "swap",
      label: translations.navigation.sections.swap.label,
      description: translations.navigation.sections.swap.description,
      Icon: SwapIcon,
    },
    {
      key: "overview",
      label: translations.navigation.sections.overview.label,
      description: translations.navigation.sections.overview.description,
      Icon: OverviewIcon,
    },
    {
      key: "support",
      label: translations.navigation.sections.support.label,
      description: translations.navigation.sections.support.description,
      Icon: SupportIcon,
    },
  ];

  let content: ReactNode;
  switch (activeSection) {
    case "overview":
      content = <OverviewPanel content={translations.overview} />;
      break;
    case "support":
      content = <SupportPanel content={translations.support} />;
      break;
    default:
      content = <SwapForm />;
  }

  return (
    <main className={styles.main}>
      <div className={styles.appShell}>
        <nav
          className={styles.menu}
          aria-label={translations.navigation.ariaLabel}
          role="tablist"
          aria-orientation="vertical"
        >
          <div className={styles.menuHeader}>
            <LanguageToggle />
          </div>
          {sections.map((section) => {
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
