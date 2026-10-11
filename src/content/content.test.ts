import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { experience } from "./experience";
import { profile } from "./profile";
import { projects } from "./projects";

type Localizable = Record<string, unknown>;

const isLocalized = (value: unknown): value is Localizable =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  SUPPORTED_LANGUAGES.every((lng) => lng in value);

/** Collects every Localized value in a tree together with its path. */
function collectLocalized(value: unknown, path = "$"): [string, Localizable][] {
  if (isLocalized(value)) return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => collectLocalized(item, `${path}[${i}]`));
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) => collectLocalized(child, `${path}.${key}`));
  }
  return [];
}

const isBlank = (value: unknown): boolean =>
  typeof value === "string"
    ? value.trim() === ""
    : Array.isArray(value)
      ? value.length === 0
      : typeof value === "object" && value !== null && Object.values(value).some(isBlank);

describe.each([
  ["projects", projects],
  ["experience", experience],
  ["profile", profile],
])("%s translations", (_, content) => {
  const entries = collectLocalized(content);

  it("has localized fields", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s is filled in every language", (_path, localized) => {
    for (const lng of SUPPORTED_LANGUAGES) expect(isBlank(localized[lng])).toBe(false);
  });

  it.each(entries.filter(([, l]) => Array.isArray(l.en)))("%s has the same number of items per language", (_p, l) => {
    const lengths = SUPPORTED_LANGUAGES.map((lng) => (l[lng] as unknown[]).length);
    expect(new Set(lengths).size).toBe(1);
  });
});

describe("projects", () => {
  it("have unique, URL-safe ids", () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("feature at most four cases on the home page", () => {
    expect(projects.filter((p) => p.featured).length).toBeLessThanOrEqual(4);
  });

  it("use valid HSL accents", () => {
    for (const { accent } of projects) if (accent) expect(accent).toMatch(/^\d{1,3} \d{1,3}% \d{1,3}%$/);
  });
});

describe("experience", () => {
  const DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

  it("uses YYYY or YYYY-MM dates with start before end", () => {
    for (const { company, start, end } of experience) {
      expect(start, company).toMatch(DATE);
      if (end) {
        expect(end, company).toMatch(DATE);
        expect(end >= start, `${company}: ${start} > ${end}`).toBe(true);
      }
    }
  });

  it("is ordered from most recent to oldest", () => {
    const starts = experience.map((e) => e.start);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it("has a single current position", () => {
    expect(experience.filter((e) => !e.end)).toHaveLength(1);
  });
});
