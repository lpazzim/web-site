import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, localizePath, stripLanguage, type SupportedLanguage } from "@/i18n";
import { useLocale } from "@/i18n/useLocale";

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "EN",
  "pt-BR": "PT-BR",
};

interface LanguageSwitcherProps {
  className?: string;
}

/** Links to the current page in each language, so both versions are crawlable. */
export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const currentLang = useLocale();
  const { pathname, search, hash } = useLocation();
  const appPath = stripLanguage(pathname);

  return (
    <nav
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
            <Link
              to={`${localizePath(appPath, lang)}${search}${hash}`}
              hrefLang={lang}
              lang={lang}
              aria-current={isActive ? "true" : undefined}
              preventScrollReset
              className={`transition-colors duration-300 hover:text-foreground ${
                isActive ? "text-foreground" : "text-foreground/50"
              }`}
              data-testid={`button-lang-${lang.toLowerCase()}`}
            >
              {LANGUAGE_LABELS[lang]}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
