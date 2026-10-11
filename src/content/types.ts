import type { SupportedLanguage } from "@/i18n";

/** A value written once per supported language. */
export type Localized<T = string> = Record<SupportedLanguage, T>;

export interface Metric {
  /** Short, scannable figure: "-40%", "3x", "120k". */
  value: string;
  label: string;
}

export interface Decision {
  title: string;
  body: string;
}

export interface CaseStudy {
  /** URL slug: /work/:id */
  id: string;
  title: string;
  /** Company or context, e.g. "Acme Inc." or "Personal project". */
  company: string;
  /** Display period, e.g. "2024" or "2023 — 2024". */
  period: string;
  role: Localized;
  category: Localized;
  /** One or two sentences used on cards and as the case intro. */
  summary: Localized;
  stack: string[];

  /** The problem or situation before you got involved. */
  context: Localized;
  /** What you personally did. */
  contributions: Localized<string[]>;
  /** The technical decisions worth explaining (and their trade-offs). */
  decisions: Localized<Decision[]>;
  /** Measurable outcomes. Keep them honest and verifiable. */
  results: Localized<Metric[]>;
  /** What you would do differently / what you took away. */
  learnings?: Localized;

  links?: { live?: string; repo?: string };
  /** Optional screenshot; a typographic cover is generated when absent. */
  cover?: string;
  /** HSL triplet ("211 100% 50%") tinting the generated cover. */
  accent?: string;
  /** Shown on the home page. */
  featured?: boolean;
  /** Placeholder content: visible in dev with a badge, never in production. */
  draft?: boolean;
}

export interface Experience {
  company: string;
  role: Localized;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM"; omit for the current position. */
  end?: string;
  location?: string;
  summary: Localized;
  highlights: Localized<string[]>;
  stack: string[];
  draft?: boolean;
}
