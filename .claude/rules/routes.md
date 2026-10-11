---
paths:
  - "src/routes/**"
  - "src/routes.ts"
  - "src/root.tsx"
  - "react-router.config.ts"
  - "src/lib/site-paths.ts"
  - "src/lib/seo.ts"
---

# Routes, pre-rendering and SEO

The site uses React Router 8 framework mode with `ssr: false` and `prerender`: every path returned by
`react-router.config.ts` becomes a static HTML file at build time. There is no runtime server.

## Adding or changing a page

1. Create `src/routes/<name>.tsx` with `export default function <Name>()`.
2. Declare it in `src/routes.ts` through the `page()` helper so it exists in **every** language (`/x` and `/pt/x`).
   Route ids must be unique, so the helper appends the language.
3. Add its path to `appPaths()` in `src/lib/site-paths.ts` (pre-render list and sitemap come from there).
4. Export `meta` built with `pageMeta({ title, description, path, locale })`. Get `locale` with
   `languageFromPath(location.pathname)` and strings with `getI18n(locale).t(...)` (hooks are not available in `meta`).
5. Add `seo.<page>.title/description` to both locale files.
6. Run `pnpm build` and `pnpm test:e2e`: `e2e/seo.spec.ts` checks every sitemap URL automatically.

## Route module rules

- Allowed exports: `default`, `meta`, `links`, `loader`, `clientLoader`, `ErrorBoundary`, `HydrateFallback`, `Layout`
  (ESLint enforces it). `action` and `headers` are not allowed with `ssr: false`.
- `loader` runs **only at build time** (Node). Use it for data that should be in the HTML. Import server-only modules
  inside it: `const { listPosts } = await import("@/lib/notion.server")`. A top-level import of a `*.server.ts` module
  fails the build because the client chunk would include it.
- `clientLoader` runs in the browser (client navigation and SPA-fallback pages). Fetch through `src/lib/blog.ts`.
- Throw `data(null, { status: 404 })` for missing data; render `<NotFound />` for unknown ids resolved from static content.
- Data that changes after deploy (blog) should come from the loader **and** refresh on the client (TanStack Query
  `initialData` + `initialDataUpdatedAt: 0`).

## Determinism (hydration)

Pre-rendered HTML must match the first client render, or React throws away the page:

- No `window`, `document`, `localStorage`, `matchMedia`, `navigator`, `Date.now()` or `Math.random()` during render.
- Resolve URLs against `SITE_URL`, not `window.location`.
- Format dates from data (`parseISO`), never "now", except the footer year.
- Theme-dependent UI must be pure CSS (`dark:` variants); the theme is applied by the inline script in `root.tsx`.
- `e2e/site.spec.ts` fails on any console error, including minified React error #418 (hydration mismatch).

## SEO conventions

- Canonical = the page in its own language; blog posts (single-language content) point both URLs to the English one.
- One `<h1>` per page. Titles: `"<Page> — Lucas Pazzim"`; the home page uses the default title.
- Not-found page is `noindex` and is served as `404.html` with a real 404 status (`scripts/postbuild.ts`).
- The SPA fallback (`__spa-fallback.html`) is only used for blog posts published after the last build (`vercel.json`).
