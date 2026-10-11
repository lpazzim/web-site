# lpazzim.com

Personal portfolio and living CV of **Lucas Pazzim**, Senior Frontend Engineer based in São Paulo, Brazil.

🌐 **[lpazzim.com](https://lpazzim.com)** · [LinkedIn](https://www.linkedin.com/in/lpazzim) · [GitHub](https://github.com/lpazzim)

## Stack

- **React 18** + **TypeScript**, bundled with **Vite**
- **Tailwind CSS** with Radix-based primitives from **shadcn/ui**
- **Framer Motion** for scroll-driven and reveal animations
- **TanStack Query** for data fetching and caching
- **i18next** for English / Brazilian Portuguese content
- **Notion API** as a headless CMS for the blog, served through **Vercel Serverless Functions**

## Project structure

```
api/            Vercel Functions (Notion-backed blog API); api/_lib holds shared code
shared/         Types shared by the API and the client
vite-plugins/   Dev-only plugin that serves api/ from the Vite dev server
public/         Static assets (favicons, Open Graph image, photos)
src/
  components/   Layout, header, footer, Notion block renderer
  data/         Portfolio projects
  i18n/         i18next setup and locale files (en, pt-BR)
  lib/          Blog API client and utilities
  pages/        Route components
```

## Getting started

Requires Node.js 20+ and [pnpm](https://pnpm.io).

```sh
pnpm install
cp .env.example .env   # then fill in the Notion credentials
pnpm dev               # Vite on :5000, also serving /api/* locally
```

### Environment variables

| Variable             | Description                                    |
| -------------------- | ---------------------------------------------- |
| `NOTION_API_TOKEN`   | Notion internal integration token              |
| `NOTION_DATABASE_ID` | ID of the Notion data source holding the posts |

### Scripts

| Command        | Description                         |
| -------------- | ----------------------------------- |
| `pnpm dev`     | Start the dev server (client + API) |
| `pnpm build`   | Production build into `dist/`       |
| `pnpm preview` | Preview the production build        |
| `pnpm lint`    | Run ESLint                          |

## Deployment

Deployed on **Vercel**. Routes under `/api` run as Serverless Functions; every other path is rewritten to the SPA (see `vercel.json`).
