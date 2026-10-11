import { describe, expect, it } from "vitest";
import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";
import { resolveLanguage } from "./languages";

/** Flattens nested translation objects into dotted keys ("home.hero.line1"). */
function keysOf(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keysOf(child, prefix ? `${prefix}.${key}` : key));
}

describe("locale files", () => {
  it("define the same keys in English and Portuguese", () => {
    expect(keysOf(ptBR).sort()).toEqual(keysOf(en).sort());
  });

  it("keep interpolation placeholders in sync", () => {
    const placeholders = (s: unknown) => (typeof s === "string" ? (s.match(/{{\w+}}|<\d+>/g) ?? []).sort() : []);
    const get = (obj: unknown, key: string) =>
      key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], obj);

    for (const key of keysOf(en)) {
      expect(placeholders(get(ptBR, key)), key).toEqual(placeholders(get(en, key)));
    }
  });
});

describe("resolveLanguage", () => {
  it.each([
    ["en", "en"],
    ["en-US", "en"],
    ["pt-BR", "pt-BR"],
    ["pt-br", "pt-BR"],
    ["pt", "pt-BR"],
    ["fr", "en"],
    [undefined, "en"],
  ])("maps %s to %s", (input, expected) => {
    expect(resolveLanguage(input)).toBe(expected);
  });
});
