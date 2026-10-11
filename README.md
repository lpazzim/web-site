# lpazzim.com

[![CI](https://github.com/lpazzim/web-site/actions/workflows/ci.yml/badge.svg)](https://github.com/lpazzim/web-site/actions/workflows/ci.yml)

Personal portfolio and living CV of **Lucas Pazzim**, Senior Frontend Engineer based in São Paulo, Brazil.

🌐 **[lpazzim.com](https://lpazzim.com)** · [LinkedIn](https://www.linkedin.com/in/lpazzim) · [GitHub](https://github.com/lpazzim)

## Stack

- **React 19** with the **React Compiler**, **TypeScript** (strict) and **Vite 8** (Rolldown)
- **Tailwind CSS v4** with CSS-first design tokens
- **Motion** for scroll-driven and reveal animations, honoring `prefers-reduced-motion`
- **TanStack Query** for data fetching and caching
- **i18next** for English / Brazilian Portuguese, with typed bilingual content
- **Notion API** as a headless CMS for the blog, served through **Vercel Functions**
- **Vitest** + **Testing Library** for unit tests, **Playwright** for end-to-end tests
- **ESLint 10**, **Prettier** and **GitHub Actions** CI

## Project structure

```
api/            Vercel Functions (Notion-backed blog API); api/_lib holds shared code
e2e/            Playwright end-to-end tests
shared/         Types shared by the API and the client
src/
  components/   Layout, header, footer, Notion block renderer
  content/      Typed, bilingual CV content: experience, case studies, profile
  i18n/         i18next setup and UI strings (en, pt-BR)
  lib/          Blog API client and utilities
  pages/        Route components (lazy-loaded, except the home page)
  theme/        Light/dark theme provider
vite-plugins/   Dev-only plugin that serves api/ from the Vite dev server
```

Career content lives in `src/content` as typed data. Every field is written once per language, and the test suite fails if a
translation is missing or empty.

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

Both are read only on the server; they never reach the client bundle.

### Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | Start the dev server (client + API)               |
| `pnpm build`         | Production build into `dist/`                     |
| `pnpm preview`       | Preview the production build                      |
| `pnpm lint`          | Run ESLint                                        |
| `pnpm typecheck`     | Type-check app, API, tests and tooling            |
| `pnpm format`        | Format with Prettier                              |
| `pnpm test`          | Run unit tests                                    |
| `pnpm test:coverage` | Run unit tests with coverage                      |
| `pnpm test:e2e`      | Run Playwright tests against the production build |

## Deployment

Deployed on **Vercel**. Routes under `/api` run as Vercel Functions; every other path is rewritten to the SPA (see
`vercel.json`). CI runs formatting, lint, type-checking, unit and end-to-end tests on every push and pull request.
