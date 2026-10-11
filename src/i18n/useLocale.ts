import { useLocation } from "react-router";
import { languageFromPath, localizePath, type SupportedLanguage } from "./languages";

/** Active language, derived from the URL ("/pt/..." is Portuguese). */
export function useLocale(): SupportedLanguage {
  return languageFromPath(useLocation().pathname);
}

/** Returns a function that prefixes app paths with the active language. */
export function useLocalizedPath(): (path: string) => string {
  const locale = useLocale();
  return (path) => localizePath(path, locale);
}
