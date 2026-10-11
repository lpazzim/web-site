# lpazzim.com

[![CI](https://github.com/lpazzim/web-site/actions/workflows/ci.yml/badge.svg)](https://github.com/lpazzim/web-site/actions/workflows/ci.yml)

Personal portfolio and living CV of **Lucas Pazzim**, Senior Frontend Engineer based in São Paulo, Brazil.

🌐 **[lpazzim.com](https://lpazzim.com)** · [LinkedIn](https://www.linkedin.com/in/lpazzim) · [GitHub](https://github.com/lpazzim)

## Stack

- **React 19** with the **React Compiler**, **TypeScript** (strict) and **Vite 8** (Rolldown)
- **React Router 8** in framework mode: every page is **pre-rendered** to static HTML at build time
- **Tailwind CSS v4** with CSS-first design tokens
- **Motion** for scroll-driven and reveal animations, honoring `prefers-reduced-motion`
- **TanStack Query** for data fetching and caching
- **i18next** for English / Brazilian Portuguese, with typed bilingual content
- **Notion API** as a headless CMS for the blog, served through **Vercel Functions**
- **Vitest** + **Testing Library** for unit tests, **Playwright** for end-to-end and SEO tests
- **ESLint 10**, **Prettier** and **GitHub Actions** CI

## Project structure

```
api/            Vercel Functions (Notion-backed blog API); api/_lib holds shared code
e2e/            Playwright end-to-end and SEO tests
scripts/        Build helpers
shared/         Types shared by the API and the client
src/
  root.tsx      HTML document, providers and error boundary
  routes.ts     Route table: every page exists in English (/) and Portuguese (/pt)
  routes/       Route modules: page component, meta tags and build-time loaders
  components/   Layout, header, footer, Notion block renderer
  content/      Typed, bilingual CV content: experience, case studies, profile
  i18n/         Language routing helpers and UI strings (en, pt-BR)
  lib/          SEO helpers, blog client and build-time Notion access
  theme/        Light/dark theme provider
vite-plugins/   Dev-only plugin that serves api/ from the dev server
```

Career content lives in `src/content` as typed data. Every field is written once per language, and the test suite fails if a
translation is missing or empty.

## Rendering and SEO

The site is fully static. `pnpm build` pre-renders every page in both languages, the sitemap and the 404 page into
`build/client`, so crawlers and link previews receive complete HTML with per-page titles, descriptions, canonical URLs,
`hreflang` alternates, Open Graph tags and JSON-LD.

- **Languages**: English at `/`, Portuguese under `/pt`. The language comes from the URL, so each version is indexable.
- **Blog**: posts that exist at build time are pre-rendered from Notion. Newer posts are served by the SPA fallback and
  fetched from `/api` until the next deploy.
- **404**: unknown URLs get `404.html` with a real 404 status.

## Getting started

Requires Node.js 24+ and [pnpm](https://pnpm.io).

```sh
pnpm install
cp .env.example .env   # then fill in the Notion credentials
pnpm dev               # http://localhost:5000, also serving /api/* locally
```

### Environment variables

| Variable             | Description                                    |
| -------------------- | ---------------------------------------------- |
| `NOTION_API_TOKEN`   | Notion internal integration token              |
| `NOTION_DATABASE_ID` | ID of the Notion data source holding the posts |

Both are read only on the server and at build time; they never reach the client bundle. Without them the site still
builds, with an empty blog.

### Scripts

| Command              | Description                                         |
| -------------------- | --------------------------------------------------- |
| `pnpm dev`           | Start the dev server (client + API)                 |
| `pnpm build`         | Pre-render the site into `build/client`             |
| `pnpm preview`       | Serve the build locally, with the SPA fallback      |
| `pnpm lint`          | Run ESLint                                          |
| `pnpm typecheck`     | Generate route types and type-check everything      |
| `pnpm format`        | Format with Prettier                                |
| `pnpm test`          | Run unit tests                                      |
| `pnpm test:coverage` | Run unit tests with coverage                        |
| `pnpm test:e2e`      | Run Playwright tests against the pre-rendered build |

## Deployment

Deployed on **Vercel** as static files plus Vercel Functions for `/api` (see `vercel.json`). Notion credentials must be
available at build time so blog posts are pre-rendered. CI runs formatting, lint, type-checking, unit and end-to-end tests
on every push and pull request.
