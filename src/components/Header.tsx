import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      } ${isMenuOpen ? "bg-background" : "bg-background/80 backdrop-blur-md"}`}
    >
      <div className="container-wide relative">
        <div className="flex items-center justify-between h-20 md:h-24">
          <LocaleLink
            to="/"
            onClick={closeMenu}
            className="font-display text-lg font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity"
            data-testid="link-home"
          >
            Lucas Pazzim
          </LocaleLink>

          <nav aria-label="Main" className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                to={localize(item.path)}
                className={({ isActive }) =>
                  `text-xs font-sans tracking-widest uppercase transition-all duration-300 hover:tracking-[0.2em] hover:text-foreground ${
                    isActive ? "text-foreground" : "text-foreground/70"
                  }`
                }
                data-testid={`nav-${item.key}`}
              >
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
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

      <div
        id={MOBILE_MENU_ID}
        inert={!isMenuOpen}
        className={`md:hidden fixed inset-x-0 top-20 bottom-0 z-99 transition-all duration-300 ${
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
              className={`text-4xl font-display text-foreground text-left transition-all duration-500 ${
                isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: isMenuOpen ? `${index * 0.1}s` : "0s" }}
            >
              {t(`nav.${item.key}`)}
            </LocaleLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
