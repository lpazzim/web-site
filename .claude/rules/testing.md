---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "e2e/**"
  - "src/test/**"
  - "playwright.config.ts"
  - "vite.config.ts"
---

# Testing

## Where tests go

| Kind                         | Location                                               | Runner / environment                 |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------ |
| Components, hooks, utilities | next to the file: `X.test.tsx`                         | Vitest project `app` (jsdom)         |
| Code that runs at build time | `X.ssr.test.tsx` with `// @vitest-environment node`    | Vitest, no `window`                  |
| API handlers                 | `api/*.test.ts`                                        | Vitest project `api` (node)          |
| Content and translations     | `src/content/content.test.ts`, `src/i18n/i18n.test.ts` | Vitest                               |
| User flows, navigation       | `e2e/site.spec.ts`                                     | Playwright, desktop + mobile         |
| Pre-rendered HTML / SEO      | `e2e/seo.spec.ts`                                      | Playwright `request` (no JavaScript) |

## Practices

- Test behavior through the public surface: Testing Library queries by role/name/text, not CSS classes. Use
  `data-testid` only when there is no accessible handle.
- Mock at module boundaries with `vi.mock` (e.g. `./_lib/notion.js` in API tests); never call real Notion in tests.
- Notion fixtures only fill the fields the renderer reads; cast with `as unknown as NotionBlock`.
- A bug fix includes a test that fails without the fix. For new guards, do a quick mutation check: break the code,
  confirm the test fails, restore.
- e2e runs against the production build (`pnpm build && pnpm preview`, port 4173). Use web-first assertions
  (`toBeVisible`, `toHaveURL`), `filter({ visible: true })` for elements duplicated between desktop and mobile layouts,
  and no fixed timeouts.
- e2e console checks treat any error as a failure; only failures from `/api/` (not served by the static preview) are ignored.
- Do not lower coverage of `content.test.ts`, `i18n.test.ts` or `seo.spec.ts`; they protect the CV and SEO.
