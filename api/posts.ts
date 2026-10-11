import { getPostBySlug, listPosts } from "./_lib/notion.js";

// Served from the edge cache for 5 minutes, then revalidated in the background.
const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=86400";
const SLUG_PATTERN = /^[a-z0-9-]{1,200}$/i;
const MAX_LIMIT = 100;

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: status === 200 ? { "Cache-Control": CACHE_CONTROL } : undefined,
  });
}

// GET /api/posts?limit=N lists published posts.
// GET /api/posts/:slug (rewritten to ?slug=) returns one post with its blocks.
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const slug = params.get("slug");

  try {
    if (slug !== null) {
      if (!SLUG_PATTERN.test(slug)) return json({ error: "Invalid slug" }, 400);
      const result = await getPostBySlug(slug);
      return result ? json(result) : json({ error: "Post not found" }, 404);
    }

    const limit = Number(params.get("limit") ?? MAX_LIMIT);
    if (!Number.isInteger(limit) || limit < 1) return json({ error: "Invalid limit" }, 400);
    return json(await listPosts(Math.min(limit, MAX_LIMIT)));
  } catch (error) {
    console.error("Failed to load posts from Notion", error);
    return json({ error: "Failed to load posts" }, 500);
  }
}
