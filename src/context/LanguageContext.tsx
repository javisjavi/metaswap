"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { TRANSLATIONS, type AppTranslation, type SupportedLanguage } from "@/utils/translations";

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  translations: AppTranslation;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<SupportedLanguage>("es");

  const handleSetLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    setLanguage((current) => (current === nextLanguage ? current : nextLanguage));
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage: handleSetLanguage,
      translations: TRANSLATIONS[language],
    };
  }, [language, handleSetLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const useTranslations = (): AppTranslation => {
  const { translations } = useLanguage();
  return translations;
};
