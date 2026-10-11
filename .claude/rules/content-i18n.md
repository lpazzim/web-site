---
paths:
  - "src/content/**"
  - "src/i18n/**"
---

# CV content and translations

## Source of truth

- Career facts (companies, roles, dates, responsibilities, numbers) come from **linkedin.com/in/lpazzim**. Do not
  invent or embellish. If something is missing, ask the user instead of guessing.
- Metrics must be stated on LinkedIn or confirmed by the user. When there is no number, use a qualitative result
  (`{ value: "SEO", label: "..." }`) rather than a made-up figure.
- Never publish private contact data (phone, address) even if it appears in a LinkedIn export.

## Data model (`src/content/types.ts`)

- Every user-facing field is `Localized<T>` = `{ en: T; "pt-BR": T }`. Write the English text close to the LinkedIn
  wording and translate faithfully to Brazilian Portuguese; both arrays must have the same length.
- `experience.ts`: most recent first; dates `"YYYY-MM"` (or `"YYYY"` when only the year is known); exactly one current
  position (no `end`).
- `cases.ts` / `projects.ts`: unique URL-safe `id`, `accent` as an HSL triplet (`"211 100% 55%"`), at most four
  `featured` cases (home page grid). `draft: true` marks placeholders: visible in dev, filtered out in production.
- `src/content/content.test.ts` enforces all of the above. Keep it passing; extend it when adding fields.

## UI strings (`src/i18n/locales/*.json`)

- Add every key to both `en.json` and `pt-BR.json` with the same interpolations (`{{year}}`) and `<0>` tags;
  `src/i18n/i18n.test.ts` checks key and placeholder parity.
- Language comes from the URL: `/` is English, `/pt` is Portuguese (`languages.ts`). Do not reintroduce
  localStorage/browser language detection; it breaks pre-rendering and SEO.
- Use `useLocale()` for the active language and `LocaleLink`/`useLocalizedPath()` for internal links.
- Adding a language: extend `SUPPORTED_LANGUAGES` and `LANGUAGE_PREFIX`, add a locale JSON, translate `src/content`,
  and update `OG_LOCALE` in `src/lib/seo.ts`. Types and tests will point to every missing piece.
