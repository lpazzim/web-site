export const SUPPORTED_LANGUAGES = ["en", "pt-BR"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "lp-language";

// Resolve whatever i18next gives us (e.g. "pt-br", "pt-BR", "pt") back to one
// of our explicitly supported codes. Comparisons are case-insensitive and we
// fall back to the primary subtag (e.g. "pt" -> "pt-BR").
export function resolveLanguage(raw?: string): SupportedLanguage {
  if (!raw) return "en";
  const lower = raw.toLowerCase();
  const exact = SUPPORTED_LANGUAGES.find((lng) => lng.toLowerCase() === lower);
  if (exact) return exact;
  const primary = lower.split("-")[0];
  const byPrimary = SUPPORTED_LANGUAGES.find((lng) => lng.toLowerCase().split("-")[0] === primary);
  return byPrimary ?? "en";
}
