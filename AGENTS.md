# AGENTS.md

Guide for AI coding agents working on **lpazzim.com**, the portfolio and living CV of Lucas Pazzim (Senior Frontend
Engineer). It is a showcase of frontend craft: code quality, accessibility, performance and SEO matter as much as features.

Area-specific rules live in `.claude/rules/` and load when you touch matching files. Architecture decisions and their
reasons are in `docs/decisions.md`; read it before proposing structural changes.

## Stack (do not swap without being asked)

| Concern   | Choice                                                                                   |
| --------- | ---------------------------------------------------------------------------------------- |
| Framework | React 19 + React Compiler, React Router 8 **framework mode** (`ssr: false` + pre-render) |
| Build     | Vite 8 (Rolldown), TypeScript 6 `strict`, Node 24, pnpm 12                               |
| Styling   | Tailwind CSS v4, CSS-first tokens in `src/index.css`                                     |
| Animation | `motion` (`motion/react`), always honoring reduced motion                                |
| Data      | TanStack Query (client), route `loader`s (build time), Notion API (blog CMS)             |
| i18n      | i18next, English at `/`, Portuguese at `/pt`                                             |
| 3D        | `three` + `@react-three/fiber`, client-only and lazy (`src/components/tech/`)            |
| Icons     | `lucide-react`; brand marks in `src/components/icons/brand.tsx`                          |
| Tests     | Vitest + Testing Library (unit), Playwright (e2e + SEO)                                  |
| Hosting   | Vercel: static files from `build/client` + Vercel Functions in `api/`                    |

## Commands

```sh
pnpm dev            # dev server on :5000, also serves /api/* through vite-plugins/vercel-api.ts
pnpm build          # pre-renders every page into build/client (+ 404.html via scripts/postbuild.ts)
pnpm preview        # serves build/client with the SPA fallback, like Vercel
pnpm typecheck      # react-router typegen && tsc -b (app, API, tests and tooling)
pnpm lint           # ESLint 10 flat config
pnpm format         # Prettier (printWidth 120, LF)
pnpm test           # Vitest: "app" project (jsdom) and "api" project (node)
pnpm test:e2e       # Playwright against the pre-rendered build (desktop + mobile)
pnpm og             # regenerates public/og-image.png from the generative art (needs Chromium + network)
```

**Definition of done** for any change: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test` pass, and
`pnpm test:e2e` passes when routes, rendering, SEO or navigation changed. Run `/verify` (Claude Code) to do all of it.

## Project map

```
api/               Vercel Functions: GET(request: Request): Response. api/_lib = shared, not routed
shared/            Types shared by api/ and src/ (BlogPost, NotionBlock)
src/root.tsx       <html> document, providers, theme script, ErrorBoundary
src/routes.ts      Route table; every page is declared once per language
src/routes/        Route modules: default component + meta (+ loader/clientLoader when needed)
src/content/       CV data (experience, case studies, profile): typed and bilingual
src/i18n/          languages.ts (URL <-> language), LocaleLink, useLocale, locales/*.json (UI strings)
src/lib/           seo.ts (pageMeta), site-paths.ts (pre-render + sitemap list), blog client, *.server.ts
src/components/    Layout, Header, Footer, NotionRenderer, ProjectCover...
src/components/tech/  Visual identity: TechBackground (WebGL), Intro, HudFrame, SectionLabel, PageHeader, Enter, CoverArt
src/theme/         Light/dark provider (default dark, persisted in localStorage "theme")
e2e/               site.spec.ts (behavior), seo.spec.ts (crawls the sitemap and checks raw HTML)
```

## Rules

### Always

- Write TypeScript that passes `strict`. Model data with types; use the official Notion SDK types, never `any`.
- Keep every page **deterministic**: the pre-rendered HTML (Node, no `window`) must equal the first browser render.
  No `window`/`document`/`localStorage`/`Date.now()`/random values during render; read them in effects or event handlers.
- Use `LocaleLink` (or `useLocalizedPath`) for internal links so visitors stay in their language.
- Give every new route a `meta` export built with `pageMeta()` from `src/lib/seo.ts`, and add it to
  `src/lib/site-paths.ts` so it is pre-rendered and listed in the sitemap.
- Add user-facing text to **both** `src/i18n/locales/en.json` and `pt-BR.json` (tests enforce key parity).
- Keep career content truthful: it must match linkedin.com/in/lpazzim. Never invent companies, dates or metrics.
- Prefer semantic HTML and accessible names: one `<h1>` per page, real links for navigation, buttons for actions,
  `aria-*` on custom widgets, visible focus, keyboard support.
- Mount WebGL/canvas code only on the client after hydration and behind `React.lazy` (see `TechBackground`); import
  `three` only from `src/components/tech/BackgroundScene.tsx` so it stays in its own chunk.
- Animate above-the-fold content with CSS (`Enter`, `animate-line-up`), not a motion `initial` state: SSR would hide it
  until hydration and delay the LCP.
- Respect `prefers-reduced-motion` (handled globally by `MotionConfig` and CSS; do not override it).
- Add or update tests with every behavior change; a bug fix needs a test that fails without the fix.
- Match the surrounding code: naming, comment density (explain _why_, not _what_), file layout.

### Never

- Never read, print or commit secrets: `.env*` (except `.env.example`), tokens, `*.pdf` personal exports at the repo root.
- Never expose server code or secrets to the client. Server-only code lives in `api/` or `*.server.ts`, and route
  loaders import it with `await import()` inside the loader (see `.claude/rules/routes.md`). Never use `VITE_` env vars
  for secrets.
- Never return internal error details from `api/`; log them and return a generic message.
- Never add a UI kit, CSS-in-JS, state library or date/i18n library alongside the existing ones.
- Never use `useMemo`/`useCallback`/`memo` for performance: the React Compiler handles memoization.
- Never use `setState` synchronously inside `useEffect` to derive state; derive it during render.
- Never hand-edit generated or vendored output: `build/`, `.react-router/`, `coverage/`, `pnpm-lock.yaml`.
- Never weaken a check to make it pass (no `eslint-disable`, `@ts-ignore`, `.skip`, lowered assertions) without
  explaining why in the code and in your summary.
- Never push, force-push, merge or change `main` directly. Work on a branch and open a PR.

## Conventions

- **Imports**: `@/` alias for `src/`; `import type` for types (`verbatimModuleSyntax` is on). Relative `.js` extensions
  inside `api/` (Node ESM on Vercel).
- **Components**: function components, named exports; route modules use `export default function`.
- **Styling**: Tailwind utilities with design tokens (`bg-background`, `text-muted-foreground`, `border-separator`...).
  Add tokens in `src/index.css` instead of hard-coding colors. Corners are square by design.
- **Text**: UI strings in locale JSON; CV data in `src/content` as `Localized<T>` (`{ en, "pt-BR" }`).
- **Dates**: parse ISO dates with `parseISO` (not `new Date("YYYY-MM-DD")`, which shifts a day in Brazil).
- **Commits**: Conventional Commits in Portuguese (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`, `style:`),
  small and focused; formatting-only changes in their own commit.

## Security checklist for changes

- New input from URLs, Notion or users is validated (see `SLUG_PATTERN` in `api/posts.ts`) and rendered as text.
- External links use `rel="noopener noreferrer"`; links from content go through `safeHref` (http/https/mailto only).
- New third-party scripts, iframes or domains need a reason; iframes get `sandbox` and `loading="lazy"`.
- New dependencies: prefer none. If needed, choose maintained, widely used packages and state why in the PR.
- Security headers live in `vercel.json`; keep them when editing it.
