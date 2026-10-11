// Build-time access to the blog. The `.server` suffix guarantees this module
// (and the Notion SDK) never ends up in the client bundle.
import { listPosts } from "../../api/_lib/notion";
import type { BlogPost } from "../../shared/blog";

export { getPostBySlug, listPosts } from "../../api/_lib/notion";

const hasNotionCredentials = () => Boolean(process.env.NOTION_API_TOKEN && process.env.NOTION_DATABASE_ID);

/**
 * Lists posts for pre-rendering. Without credentials (local builds, CI) the
 * blog is rendered empty and fetched at runtime instead of failing the build.
 */
export async function listPostsForBuild(): Promise<BlogPost[]> {
  if (!hasNotionCredentials()) {
    console.warn("[build] Notion credentials missing: blog posts will not be pre-rendered.");
    return [];
  }
  return listPosts();
}
