"use client";

import { useMemo } from "react";

import { useTheme } from "@/context/ThemeContext";
import { useTranslations } from "@/context/LanguageContext";

import styles from "./ThemeToggle.module.css";

const SunIcon = () => (
  <svg
    className={styles.iconGraphic}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <path
      d="M12 4.5V3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M12 21v-1.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M5.636 5.636L4.575 4.575"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M19.425 19.425L18.364 18.364"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M4.5 12H3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M21 12h-1.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M5.636 18.364L4.575 19.425"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M19.425 4.575L18.364 5.636"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const MoonIcon = () => (
  <svg
    className={styles.iconGraphic}
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <path
      d="M20 14.5A7.5 7.5 0 0110.5 5 6.5 6.5 0 0012 19.5a6.5 6.5 0 008-5z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const translations = useTranslations();

  const { label, active, inactive } = useMemo(() => {
    const themeTranslations = translations.themeToggle;
    return {
      label: themeTranslations.label,
      active: theme === "light" ? themeTranslations.light : themeTranslations.dark,
      inactive: theme === "light" ? themeTranslations.dark : themeTranslations.light,
    };
  }, [theme, translations]);

  const isLight = theme === "light";

  return (
    <button
      type="button"
      className={`${styles.toggle} ${isLight ? styles.toggleActive : ""}`.trim()}
      onClick={toggleTheme}
      aria-pressed={isLight}
      aria-label={isLight ? translations.themeToggle.switchToDark : translations.themeToggle.switchToLight}
    >
      <span className={styles.iconBadge} aria-hidden="true">
        {isLight ? <SunIcon /> : <MoonIcon />}
      </span>
      <span className={styles.textGroup}>
        <span className={styles.label}>{label}</span>
        <span className={styles.state}>{active}</span>
      </span>
      <span className={styles.stateHint}>{inactive}</span>
    </button>
  );
};

export default ThemeToggle;
