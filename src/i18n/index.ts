import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";

export const SUPPORTED_LANGUAGES = ["en", "pt-BR"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "lp-language";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Register resources under every common variant of the language code so
    // i18next finds them regardless of how the code is normalized internally
    // (pt-BR, pt-br, pt).
    resources: {
      en: { translation: en },
      "pt-BR": { translation: ptBR },
      "pt-br": { translation: ptBR },
      pt: { translation: ptBR },
    },
    // English is the explicit default. Only localStorage is consulted so the
    // browser's preferred language never overrides EN on first visit.
    fallbackLng: "en",
    supportedLngs: ["en", "pt-BR", "pt-br", "pt"],
    lowerCaseLng: false,
    cleanCode: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    returnObjects: false,
    react: {
      // Re-render bound components on these i18next events
      bindI18n: "languageChanged loaded",
      bindI18nStore: "added removed",
      useSuspense: false,
    },
  });

export default i18n;
