import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "EN",
  "pt-BR": "PT-BR",
};

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const currentLang = (SUPPORTED_LANGUAGES.find((lng) =>
    i18n.resolvedLanguage === lng || i18n.language === lng
  ) ?? "en") as SupportedLanguage;

  const handleChange = (lang: SupportedLanguage) => {
    if (lang === currentLang) return;
    i18n.changeLanguage(lang);
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
