import { useTranslation } from "react-i18next";
import { resolveLanguage, type SupportedLanguage } from "./languages";

// Active locale, re-rendering on `languageChanged` (bound in i18n/index.ts).
export function useLocale(): SupportedLanguage {
  const { i18n } = useTranslation();
  return resolveLanguage(i18n.resolvedLanguage ?? i18n.language);
}
