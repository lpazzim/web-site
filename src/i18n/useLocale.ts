import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "./index";

// Resolve whatever i18next gives us (e.g. "pt-br", "pt-BR", "pt") back to one
// of our explicitly supported codes. Comparisons are case-insensitive and we
// fall back to the primary subtag (e.g. "pt" -> "pt-BR").
export function resolveLanguage(raw?: string): SupportedLanguage {
  if (!raw) return "en";
  const lower = raw.toLowerCase();
  const exact = SUPPORTED_LANGUAGES.find((lng) => lng.toLowerCase() === lower);
  if (exact) return exact;
  const primary = lower.split("-")[0];
  const byPrimary = SUPPORTED_LANGUAGES.find(
    (lng) => lng.toLowerCase().split("-")[0] === primary,
  );
  return byPrimary ?? "en";
}

// Active locale, re-rendering on `languageChanged` (bound in i18n/index.ts).
export function useLocale(): SupportedLanguage {
  const { i18n } = useTranslation();
  return resolveLanguage(i18n.resolvedLanguage ?? i18n.language);
}
