import { existsSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

type Handler = (request: Request) => Response | Promise<Response>;

// Mirrors the rewrite in vercel.json: /api/posts/:slug -> /api/posts?slug=:slug
function resolveRoute(url: URL): { file: string; url: URL } | null {
  const match = url.pathname.match(/^\/api\/posts\/([^/]+)$/);
  if (match) {
    url.searchParams.set("slug", decodeURIComponent(match[1]));
    return { file: "/api/posts.ts", url };
  }
  const name = url.pathname.match(/^\/api\/([a-z-]+)$/)?.[1];
  return name ? { file: `/api/${name}.ts`, url } : null;
}

function toRequest(req: IncomingMessage, url: URL): Request {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(key, item);
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

async function sendResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

/**
 * Runs the Vercel Functions in api/ inside the Vite dev server, so local
 * development uses the exact same handlers as production.
 */
export function vercelApi(): Plugin {
  return {
    name: "vercel-api",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        const route = resolveRoute(new URL(req.url, `http://${req.headers.host ?? "localhost"}`));
        if (!route || !existsSync(join(server.config.root, route.file))) {
          res.statusCode = 404;
          return res.end();
        }

        try {
          const mod = (await server.ssrLoadModule(route.file)) as Partial<Record<string, Handler>>;
          const handler = mod[req.method ?? "GET"];
          if (!handler) {
            res.statusCode = 405;
            return res.end();
          }
          await sendResponse(res, await handler(toRequest(req, route.url)));
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          next(error);
        }
      });
    },
  };
}
