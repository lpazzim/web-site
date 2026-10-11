---
name: add-case-study
description: Add or update a professional case study or work experience on the portfolio, in English and Portuguese, based on the user's LinkedIn. Use when the user wants to add a project, job, case, role or experience to the site.
argument-hint: "[company or project]"
---

Add or update the case study / experience for: $ARGUMENTS

## 1. Gather facts (do not invent)

- Source of truth is linkedin.com/in/lpazzim. LinkedIn blocks automated access: ask the user for a fresh LinkedIn PDF
  export (saved at the repo root, which is gitignored) or for the text, unless they already provided it.
- Collect: company, role, period (month/year), location, what the product does, what they personally did, technical
  decisions, results. Use only stated facts; ask about anything missing. Metrics need a source; otherwise use a
  qualitative result.
- Never copy private contact data (phone, address) into the site.

## 2. Write the data

- Experience: add an entry to `src/content/experience.ts`, keeping the list most recent first. If it is the new current
  role, set `end` on the previous current entry.
- Case study: add an object to `professionalCases` in `src/content/cases.ts` with a unique kebab-case `id`, an HSL
  `accent` distinct from the other cases, `stack`, `context`, `contributions`, optional `decisions`, `results`.
- Decide `featured` (home grid shows at most four); unfeature another case if needed and tell the user.
- English close to the LinkedIn wording; Brazilian Portuguese as a faithful translation. Arrays must have the same
  length in both languages.

## 3. Verify

- `pnpm test` (content and translation tests), `pnpm typecheck`, then `pnpm build` so the new `/work/<id>` and
  `/pt/work/<id>` pages are pre-rendered and added to the sitemap.
- Preview `/work/<id>` and `/pt/work/<id>` in the browser and check the layout and console.
- Summarize what was added and list any facts the user should double-check.
