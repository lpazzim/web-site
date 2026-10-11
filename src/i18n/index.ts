import { createInstance, type i18n as I18n } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "./languages";

export * from "./languages";

const resources = { en, "pt-BR": ptBR } satisfies Record<SupportedLanguage, unknown>;

// One synchronously initialized instance per language. The language comes from
// the URL, so pages render identically at build time (pre-rendering) and in
// the browser (hydration).
function createI18n(language: SupportedLanguage): I18n {
  const instance = createInstance();
  void instance.use(initReactI18next).init({
    lng: language,
    fallbackLng: "en",
    resources: { en: { translation: resources.en }, "pt-BR": { translation: resources["pt-BR"] } },
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}

const instances = Object.fromEntries(SUPPORTED_LANGUAGES.map((lng) => [lng, createI18n(lng)])) as Record<
  SupportedLanguage,
  I18n
>;

export const getI18n = (language: SupportedLanguage): I18n => instances[language];
