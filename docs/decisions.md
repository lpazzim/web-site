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
  micro-labels, plus decorative utilities (`bg-grid`, `scanlines`, `noise`, `text-hud`, `glow-text`) driven by tokens.
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

## 11. Generative covers and a scripted social image

- **Decision**: cases without a screenshot get line art generated from their id (`src/lib/cover-art.ts`: mesh, waves,
  circuits or node graph, seeded PRNG), drawn as SVG by `CoverArt`. `pnpm og` renders `public/og-image.png` from the same
  generator with Playwright; the PNG is committed.
- **Why**: consistent, license-free imagery that reads as technology. Pure seeded functions keep pre-rendered HTML and
  hydration identical (no `Math.random()`), numbers are rounded to one decimal, and the generator is shared with the
  script so the social card and the site cannot drift apart.

## 12. Page transitions with the View Transitions API

- **Decision**: `LocaleLink` and the header `NavLink` pass `viewTransition` to React Router. The CSS in `index.css`
  dims the old page and wipes the new one in from the top; the header has its own `view-transition-name` so it stays
  put. Reduced motion disables the animations, and browsers without the API navigate instantly.
- **Why**: native, zero-dependency transitions that fit the scan/HUD language. The background canvas is deliberately not
  given its own name: named groups paint above the page snapshot and would draw the animated lines over the content.

## 13. Accessibility and performance budget for the redesign

- **Decision**: contrast of the design tokens is a unit test (`src/theme/contrast.test.ts`, 4.5:1 in both themes); a
  global `:focus-visible` ring, a "skip to content" link and a focus trap on the intro dialog cover keyboard use;
  above-the-fold entrances are CSS (`Enter`, `animate-line-up`); the WebGL chunk loads only when the browser is idle.
- **Why**: a motion `initial` state is serialized into the pre-rendered HTML, so content stayed hidden until hydration.
  Measured on the production build (Pixel 7 profile, CPU 4x slower, simulated 4G), the home page LCP went from 5.1 s to
  2.1 s (0.35 s on desktop) with CLS 0. The remaining main-thread cost is three.js evaluating after idle; it is the
  price of the signature background and is kept off the critical path rather than removed.
