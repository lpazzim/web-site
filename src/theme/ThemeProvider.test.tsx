import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { THEME_STORAGE_KEY, useTheme } from "./theme-context";

function ThemeProbe() {
  const { theme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme}
    </button>
  );
}

const html = document.documentElement;

afterEach(() => {
  localStorage.clear();
  html.className = "";
  html.removeAttribute("style");
});

describe("ThemeProvider", () => {
  it("trusts the saved choice over a stale <html> class, and does not overwrite it on mount", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    // e.g. React rewrote <html> attributes after a hydration error
    html.className = "";

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button")).toHaveTextContent("dark");
    expect(html).toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("saves an explicit change", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    act(() => screen.getByRole("button").click());

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(html).not.toHaveClass("dark");
  });

  it("puts the class back if something strips it from <html>", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    html.classList.remove("dark");

    await waitFor(() => expect(html).toHaveClass("dark"));
  });

  it("follows a change made in another tab", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "light" }));
    });

    expect(screen.getByRole("button")).toHaveTextContent("light");
  });
});
