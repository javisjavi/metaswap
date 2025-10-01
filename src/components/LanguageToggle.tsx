"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LANGUAGE_METADATA, SUPPORTED_LANGUAGES } from "@/utils/translations";
import { useLanguage, useTranslations } from "@/context/LanguageContext";
import styles from "@/app/page.module.css";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const translations = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((focusTrigger = false) => {
    setIsOpen(false);
    if (focusTrigger) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [closeMenu, isOpen]);

  const handleOptionSelect = useCallback(
    (option: (typeof SUPPORTED_LANGUAGES)[number]) => {
      setLanguage(option);
      closeMenu(true);
    },
    [closeMenu, setLanguage],
  );

  const activeMetadata = LANGUAGE_METADATA[language];
  const listClasses = [styles.languageMenuList];
  if (isOpen) {
    listClasses.push(styles.languageMenuListOpen);
  }

  return (
    <div className={styles.languageMenu} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.languageMenuTrigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.languageMenuTriggerLabel}>{translations.languageToggleLabel}</span>
        <span className={styles.languageMenuValue} aria-hidden="true">
          {activeMetadata.short}
        </span>
        <span className={styles.languageMenuIcon} aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3.5 6L8 10.5L12.5 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <ul
        className={listClasses.join(" ")}
        role="listbox"
        aria-label={translations.languageToggleLabel}
      >
        {SUPPORTED_LANGUAGES.map((option) => {
          const metadata = LANGUAGE_METADATA[option];
          const isActive = option === language;
          const optionClasses = [styles.languageMenuOption];
          if (isActive) {
            optionClasses.push(styles.languageMenuOptionActive);
          }

          return (
            <li key={option} role="none">
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                className={optionClasses.join(" ")}
                onClick={() => handleOptionSelect(option)}
              >
                <span className={styles.languageMenuOptionName}>{metadata.name}</span>
                <span className={styles.languageMenuOptionBadge} aria-hidden="true">
                  {metadata.short}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LanguageToggle;
