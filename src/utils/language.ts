import { type SupportedLanguage } from "./translations";

const LANGUAGE_TO_INTL_LOCALE: Record<SupportedLanguage, string> = {
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  pt: "pt-BR",
  de: "de-DE",
  ja: "ja-JP",
};

export const getIntlLocale = (language: SupportedLanguage): string =>
  LANGUAGE_TO_INTL_LOCALE[language] ?? LANGUAGE_TO_INTL_LOCALE.en;

const LANGUAGE_TO_TRADING_VIEW_LOCALE: Record<SupportedLanguage, string> = {
  es: "es",
  en: "en",
  fr: "fr",
  pt: "pt",
  de: "de",
  ja: "ja",
};

export const getTradingViewLocale = (language: SupportedLanguage): string =>
  LANGUAGE_TO_TRADING_VIEW_LOCALE[language] ?? LANGUAGE_TO_TRADING_VIEW_LOCALE.en;
