import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";

// Vitest blanks CSS imports and jsdom has no file URLs, so read the stylesheet
// from the repo root (where the tests always run).
const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

// WCAG 2.2 AA asks for 4.5:1 on normal text. These checks read the real design
// tokens from index.css, so a palette tweak that breaks contrast fails here.

type Rgb = [number, number, number];

/** Custom properties declared in one block of index.css (":root" or ".dark"). */
function tokensOf(selector: string): Record<string, string> {
  const block = css.match(new RegExp(`${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value]));
}

/** hsl(h s% l%) to sRGB 0-255; alpha is ignored (decorative tokens are not checked). */
function hslToRgb(value: string): Rgb {
  const [h, s, l] = [...value.matchAll(/-?[\d.]+/g)].slice(0, 3).map(([n]) => Number(n));
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [channel(0) * 255, channel(8) * 255, channel(4) * 255];
}

function luminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrast(foreground: string, background: string): number {
  const [a, b] = [luminance(hslToRgb(foreground)), luminance(hslToRgb(background))];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const light = tokensOf(":root");
const dark = { ...light, ...tokensOf(".dark") };

describe.each([
  ["light", light],
  ["dark", dark],
])("%s theme contrast", (_name, tokens) => {
  it.each([
    ["foreground", "background"],
    ["muted-foreground", "background"],
    ["muted-foreground", "muted"],
    ["hud", "background"],
    ["primary", "background"],
    ["primary-foreground", "primary"],
  ])("%s on %s is at least 4.5:1", (foreground, background) => {
    expect(contrast(tokens[foreground], tokens[background]), `${foreground} on ${background}`).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  // Company names sit on their accent colour (NamePlate). NamePlate is only used
  // for headings of 30px and up, which WCAG counts as large text: 3:1.
  it.each(projects.filter((p) => p.accent).map((p) => [p.id, `hsl(${p.accent})`]))(
    "on-accent heading text on the %s accent is at least 3:1",
    (_id, accent) => {
      expect(contrast(tokens["on-accent"], accent)).toBeGreaterThanOrEqual(3);
    },
  );
});
