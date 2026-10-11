---
paths:
  - "api/**"
  - "shared/**"
  - "src/lib/*.server.ts"
  - "vite-plugins/**"
  - "vercel.json"
---

# Serverless API and security

## Vercel Functions (`api/`)

- Every `.ts` file directly in `api/` becomes a public endpoint. Shared code goes in `api/_lib/` (underscore folders
  are not routed). Tests (`*.test.ts`) are excluded from deploys by `.vercelignore`.
- Use the Web signature: `export async function GET(request: Request): Promise<Response>`. Other methods are not
  supported by the site; do not add `POST` without validation, rate limiting and a clear reason.
- Relative imports use `.js` extensions (`./_lib/notion.js`), required by Node ESM on Vercel.
- The same handlers run in development through `vite-plugins/vercel-api.ts`; keep its route mapping in sync with the
  rewrites in `vercel.json`.

## Input and output

- Validate every input before using it (allow-list patterns such as `SLUG_PATTERN`, integer ranges with caps such as
  `MAX_LIMIT`). Reject with `400` and a short message.
- Errors: `console.error` the details, respond with a generic message (`{ error: "Failed to load posts" }`) and the
  right status. Never return `error.message`, stack traces, tokens or upstream responses.
- Successful public responses set `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`; errors are not cached.
- No CORS headers: the API is same-origin only.

## Secrets

- `NOTION_API_TOKEN` and `NOTION_DATABASE_ID` are read only on the server (`api/`, `*.server.ts`, build-time loaders).
  Never prefix secrets with `VITE_`, log them, include them in responses, or reveal even a prefix (health checks
  report booleans only).
- Local values live in `.env` (gitignored, never read by agents). `.env.example` documents the variables without values.
- After build changes, confirm nothing leaked: `grep -rE "api\.notion\.com|NOTION_API_TOKEN" build/client` must be empty.

## Notion data

- Use the official SDK types (`PageObjectResponse`, `BlockObjectResponse`, `isFullPage`, `isFullBlock`,
  `collectPaginatedAPI`). No `any`.
- Rendered content is untrusted: `NotionRenderer` allows only http/https/mailto links (`safeHref`), sandboxes iframes
  and never uses `dangerouslySetInnerHTML`.

## Deployment config (`vercel.json`)

- Static output in `build/client`; keep the security headers (`X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`) and immutable caching for `/assets/*`.
- Only blog-post paths rewrite to the SPA fallback; everything else that has no file must return the real 404 page.
