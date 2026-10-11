# Architecture decisions

Short records of decisions that shape the codebase. Read before proposing structural changes; if a decision no longer
holds, add a new entry that supersedes it instead of silently reverting it.

## 1. Static pre-rendering with React Router framework mode

- **Decision**: React Router 8 framework mode with `ssr: false` and `prerender` for every page and language.
- **Why**: a pure SPA served the same empty HTML (and title) for every URL, hurting SEO and link previews (LinkedIn,
  WhatsApp). Pre-rendering gives complete HTML per page while keeping a static, serverless deployment on Vercel and the
  existing React + Vite codebase. Astro and Next.js were considered; both meant rewriting the app.
- **Consequences**: no runtime server (no `action`/`headers` exports); page output must be deterministic (see
  `.claude/rules/routes.md`); content changes ship with a deploy.

## 2. Language in the URL

- **Decision**: English at `/`, Portuguese at `/pt`, `hreflang` alternates on every page.
- **Why**: the language used to live in `localStorage`, so the Portuguese version was invisible to search engines and
  could not be shared. URL-based languages are indexable and work with pre-rendering.
- **Consequences**: one i18next instance per language, synchronous init; internal links go through `LocaleLink`.

## 3. Typed, bilingual content in the repository

- **Decision**: CV data lives in `src/content` as TypeScript objects with `Localized<T>` fields; UI strings in locale JSON.
- **Why**: missing translations become test failures, content is reviewable in PRs, and the same data can generate
  other formats (e.g. a PDF résumé) later.
- **Consequences**: LinkedIn is the source of truth; content changes are code changes.

## 4. Notion as the blog CMS, accessed only on the server

- **Decision**: Notion data source queried by Vercel Functions (`api/`) and build-time loaders; the client never sees
  the token. Posts known at build time are pre-rendered; newer ones use the SPA fallback + `/api`.
- **Why**: writing happens where the author already takes notes, with no extra CMS to host.
- **Consequences**: a rebuild is needed for new posts to be pre-rendered (a Vercel Deploy Hook can automate it).

## 5. Same handlers in development and production

- **Decision**: `vite-plugins/vercel-api.ts` runs the `api/` handlers inside the dev server.
- **Why**: the previous Express dev server duplicated the API logic and drifted from production.

## 6. Small dependency surface

- **Decision**: no UI kit; shadcn components are added only when used (`components.json` is kept for the CLI). Own
  theme provider instead of `next-themes`; own brand icons instead of an icon pack.
- **Why**: fewer dependencies mean a smaller bundle, fewer supply-chain risks and easier upgrades. `next-themes`
  injected a `<script>` that React 19 rejects in client renders; `lucide-react` v1 removed brand icons.

## 7. React Compiler instead of manual memoization

- **Decision**: `babel-plugin-react-compiler` via `@rolldown/plugin-babel`; no `useMemo`/`useCallback`/`memo`.
- **Why**: consistent memoization without noise; `eslint-plugin-react-hooks` v7 flags code the compiler cannot optimize.

## 8. Quality gates in CI

- **Decision**: GitHub Actions runs format check, lint, typecheck, unit tests with coverage, build and Playwright e2e
  (including an SEO crawl of the sitemap) on every push and PR.
- **Why**: the site is a professional showcase; regressions in SEO, accessibility or hydration must not reach production.

## 9. Tech visual direction (redesign inspired by composites.archi)

- **Decision**: near-black default theme with an electric cyan accent, Space Grotesk for text and JetBrains Mono for HUD
  micro-labels, plus decorative utilities (`bg-grid`, `scanlines`, `noise`, `text-hud`, `text-glow`) driven by tokens.
  The redesign ships in small steps, one PR each; WebGL arrives later, client-only and lazy-loaded.
- **Why**: the site is a frontend showcase, so the look should read as technology and modernity. Tokens and CSS-only
  utilities keep the pre-rendered HTML identical to the first browser render. `font-serif` stays as the class name for
  headings and body to avoid touching every component; it now maps to the geometric sans.

## 10. WebGL background with three.js, client-only and lazy

- **Decision**: `three` + `@react-three/fiber` draw one fixed canvas of animated contour lines (`TechBackground`).
  The scene is a lazy chunk mounted only after hydration, when WebGL 2 exists and `prefers-reduced-motion` is off
  (`useWebGLEnabled`, a `useSyncExternalStore` whose server snapshot is `false`). The CSS grid underneath is the
  pre-rendered fallback.
- **Why**: it is the signature visual of the reference and shows frontend craft, but it must not cost the
  pre-rendered pages anything: the HTML never contains the canvas, so hydration cannot mismatch, and the ~900 KB
  chunk is not referenced by the HTML. The geometry is static; motion happens in the vertex shader (no per-frame
  allocations) and the pixel ratio is capped at 1.5.
