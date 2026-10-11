export const SUPPORTED_LANGUAGES = ["en", "pt-BR"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

/** URL prefix per language. English lives at the root. */
export const LANGUAGE_PREFIX: Record<SupportedLanguage, string> = { en: "", "pt-BR": "/pt" };

// Resolve whatever i18next gives us (e.g. "pt-br", "pt-BR", "pt") back to one
// of our explicitly supported codes. Comparisons are case-insensitive and we
// fall back to the primary subtag (e.g. "pt" -> "pt-BR").
export function resolveLanguage(raw?: string): SupportedLanguage {
  if (!raw) return DEFAULT_LANGUAGE;
  const lower = raw.toLowerCase();
  const exact = SUPPORTED_LANGUAGES.find((lng) => lng.toLowerCase() === lower);
  if (exact) return exact;
  const primary = lower.split("-")[0];
  const byPrimary = SUPPORTED_LANGUAGES.find((lng) => lng.toLowerCase().split("-")[0] === primary);
  return byPrimary ?? DEFAULT_LANGUAGE;
}

/** Language encoded in a pathname ("/pt/about" -> "pt-BR", "/about" -> "en"). */
export function languageFromPath(pathname: string): SupportedLanguage {
  const match = SUPPORTED_LANGUAGES.find((lng) => {
    const prefix = LANGUAGE_PREFIX[lng];
    return prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`));
  });
  return match ?? DEFAULT_LANGUAGE;
}

/** Removes the language prefix: "/pt/about" -> "/about", "/pt" -> "/". */
export function stripLanguage(pathname: string): string {
  const prefix = LANGUAGE_PREFIX[languageFromPath(pathname)];
  return pathname.slice(prefix.length) || "/";
}

/** Adds the language prefix to an app path: ("/about", "pt-BR") -> "/pt/about". */
export function localizePath(path: string, language: SupportedLanguage): string {
  const prefix = LANGUAGE_PREFIX[language];
  if (!prefix) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}
