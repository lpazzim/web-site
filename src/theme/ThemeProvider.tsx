import { useEffect, useState, type ReactNode } from "react";
import { THEME_STORAGE_KEY, ThemeContext, type Theme } from "./theme-context";

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

// The saved choice is the source of truth. The <html> class is only a fallback:
// React may rewrite the attributes of <html> (when it re-renders the document
// after a hydration error), and reading the theme back from a stripped class
// used to persist "light" over a saved "dark". Dark while pre-rendering.
function readSavedTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(saved)) return saved;
  } catch {
    // Storage can be unavailable (private mode); fall back to the DOM.
  }
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (root.classList.contains("dark") !== (theme === "dark")) root.classList.toggle("dark", theme === "dark");
  if (root.style.colorScheme !== theme) root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readSavedTheme);

  // Only an explicit choice is written to storage, never the state read on mount.
  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies.
    }
  };

  useEffect(() => {
    applyTheme(theme);
    // Put the class back if anything rewrites <html> while this theme is active.
    const observer = new MutationObserver(() => applyTheme(theme));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => observer.disconnect();
  }, [theme]);

  // A change made in another tab applies here too.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) setThemeState(event.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}
