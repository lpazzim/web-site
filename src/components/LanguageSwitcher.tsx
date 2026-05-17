import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "EN",
  "pt-BR": "PT-BR",
};

// Resolve whatever i18next gives us (e.g. "pt-br", "pt-BR", "pt") back to one
// of our explicitly supported codes. Comparisons are case-insensitive and we
// fall back to the primary subtag (e.g. "pt" -> "pt-BR").
function resolveLanguage(raw?: string): SupportedLanguage {
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

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  // Track the active language as local state so we always re-render when
  // i18next fires `languageChanged`, regardless of how the code is normalized
  // internally (pt-BR / pt-br / pt).
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() =>
    resolveLanguage(i18n.resolvedLanguage ?? i18n.language),
  );

  useEffect(() => {
    const onChange = (lng: string) => setCurrentLang(resolveLanguage(lng));
    i18n.on("languageChanged", onChange);
    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, [i18n]);

  const handleChange = (lang: SupportedLanguage) => {
    if (lang === currentLang) return;
    void i18n.changeLanguage(lang);
  };

  return (
    <div
      role="group"
      aria-label={t("nav.toggleLanguage")}
      className={`flex items-center text-[11px] font-sans tracking-widest uppercase select-none ${className}`}
      data-testid="language-switcher"
    >
      {SUPPORTED_LANGUAGES.map((lang, index) => {
        const isActive = currentLang === lang;
        return (
          <span key={lang} className="flex items-center">
            {index > 0 && (
              <span aria-hidden="true" className="mx-1.5 text-foreground/30">
                /
              </span>
            )}
            <button
              type="button"
              onClick={() => handleChange(lang)}
              aria-pressed={isActive}
              className={`transition-colors duration-300 hover:text-foreground ${
                isActive ? "text-foreground" : "text-foreground/50"
              }`}
              data-testid={`button-lang-${lang.toLowerCase()}`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          </span>
        );
      })}
    </div>
  );
}
