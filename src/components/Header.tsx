import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { m, useScroll, useTransform } from "motion/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/theme-context";
import { LocaleLink } from "@/i18n/LocaleLink";
import { useLocalizedPath } from "@/i18n/useLocale";
import { LanguageSwitcher } from "./LanguageSwitcher";

// Both icons render; CSS picks one from the .dark class, so no mount state is needed.
const ThemeIcon = () => (
  <>
    <Sun size={18} className="hidden dark:block" />
    <Moon size={18} className="dark:hidden" />
  </>
);

const NAV_ITEMS = [
  { key: "projects", path: "/work" },
  { key: "about", path: "/about" },
  { key: "blog", path: "/blog" },
  { key: "contact", path: "/contact" },
] as const;

const MOBILE_MENU_ID = "mobile-menu";

interface HeaderProps {
  revealMode?: boolean;
}

export function Header({ revealMode = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pointerNearTop, setPointerNearTop] = useState(false);
  const isVisible = !revealMode || pointerNearTop || isMenuOpen;
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const localize = useLocalizedPath();
  // Motion values update the DOM directly, so scrolling never re-renders the header.
  const { scrollYProgress } = useScroll();
  const scrollPercent = useTransform(scrollYProgress, (value) => String(Math.round(value * 100)).padStart(3, "0"));

  // In reveal mode the header only shows while the pointer is near the top.
  useEffect(() => {
    if (!revealMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPointerNearTop(e.clientY < 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [revealMode]);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const closeMenu = () => setIsMenuOpen(false);

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 text-foreground/60 hover:text-foreground transition-colors"
      aria-label={t("nav.toggleTheme")}
      data-testid="button-theme-toggle"
    >
      <ThemeIcon />
    </button>
  );

  return (
    <header
      className={`site-header fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${
        // No transform while visible: it would make this header the containing block of the fixed mobile menu.
        isVisible ? "opacity-100" : "opacity-0 -translate-y-full pointer-events-none"
      } border-b border-border ${isMenuOpen ? "bg-background" : "bg-background/70 backdrop-blur-md"}`}
    >
      <div className="container-wide relative">
        <div className="flex items-center justify-between h-16 md:h-20">
          <LocaleLink
            to="/"
            onClick={closeMenu}
            className="group flex flex-col leading-tight text-foreground"
            data-testid="link-home"
          >
            <span className="font-display text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
              Lucas Pazzim
            </span>
            <span className="text-hud hidden xl:block">{t("seo.jobTitle")}</span>
          </LocaleLink>

          <nav aria-label="Main" className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {NAV_ITEMS.map((item, index) => (
              <NavLink
                key={item.key}
                to={localize(item.path)}
                viewTransition
                className={({ isActive }) =>
                  `group text-hud flex items-center gap-2 transition-colors duration-300 hover:text-foreground ${
                    isActive ? "text-foreground!" : ""
                  }`
                }
                data-testid={`nav-${item.key}`}
              >
                {({ isActive }) => (
                  <>
                    <span aria-hidden="true" className={isActive ? "text-primary" : "opacity-50"}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {t(`nav.${item.key}`)}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <span aria-hidden="true" className="text-hud hidden xl:inline-flex gap-1.5 tabular-nums">
              {t("nav.scroll")} <m.span>{scrollPercent}</m.span>%
            </span>
            <LanguageSwitcher />
            <span aria-hidden="true" className="h-4 w-px bg-foreground/20" />
            {themeButton}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            {themeButton}
            <button
              type="button"
              className="p-2 -mr-2 text-foreground"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={t("nav.toggleMenu")}
              aria-expanded={isMenuOpen}
              aria-controls={MOBILE_MENU_ID}
              data-testid="button-menu-toggle"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <m.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-primary"
        style={{ scaleX: scrollYProgress }}
      />

      <div
        id={MOBILE_MENU_ID}
        inert={!isMenuOpen}
        className={`md:hidden fixed inset-x-0 top-16 bottom-0 z-99 transition-all duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-background" />
        <nav
          aria-label="Mobile"
          className="container-wide py-12 flex flex-col gap-8 relative z-10 bg-background/80 backdrop-blur-md"
        >
          {NAV_ITEMS.map((item, index) => (
            <LocaleLink
              key={item.key}
              to={item.path}
              onClick={closeMenu}
              className={`flex items-baseline gap-4 text-5xl font-display uppercase tracking-tighter text-foreground text-left transition-all duration-500 hover:text-primary ${
                isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: isMenuOpen ? `${index * 0.1}s` : "0s" }}
            >
              <span aria-hidden="true" className="text-hud">
                {String(index + 1).padStart(2, "0")}
              </span>
              {t(`nav.${item.key}`)}
            </LocaleLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
