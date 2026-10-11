import { createContext, useContext } from "react";

export type Theme = "light" | "dark";

/** Must match the inline script in index.html. */
export const THEME_STORAGE_KEY = "theme";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
