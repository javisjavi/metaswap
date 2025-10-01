"use client";

import { LANGUAGE_METADATA, SUPPORTED_LANGUAGES } from "@/utils/translations";
import { useLanguage, useTranslations } from "@/context/LanguageContext";
import styles from "@/app/page.module.css";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const translations = useTranslations();

  return (
    <div className={styles.languageToggle} role="group" aria-label={translations.languageToggleLabel}>
      {SUPPORTED_LANGUAGES.map((option) => {
        const metadata = LANGUAGE_METADATA[option];
        const isActive = option === language;
        return (
          <button
            key={option}
            type="button"
            className={`${styles.languageOption} ${isActive ? styles.languageOptionActive : ""}`.trim()}
            onClick={() => setLanguage(option)}
            aria-pressed={isActive}
          >
            {metadata.short}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
