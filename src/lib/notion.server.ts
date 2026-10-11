// Build-time access to the blog. The `.server` suffix guarantees this module
// (and the Notion SDK) never ends up in the client bundle.
import { getPostBySlug, listPosts } from "../../api/_lib/notion";
import type { BlogPost, NotionBlock, PostWithBlocks } from "../../shared/blog";

export { getPostBySlug, listPosts } from "../../api/_lib/notion";

const hasNotionCredentials = () => Boolean(process.env.NOTION_API_TOKEN && process.env.NOTION_DATABASE_ID);

// Stand-in for builds without credentials (CI, forks). The post route has a
// build-time `loader`, and React Router rejects such a route when no
// pre-rendered path matches it, so the build needs at least one post. The
// production deploy always has credentials and never ships this one.
const SAMPLE_POST: PostWithBlocks = {
  post: {
    id: "sample-post",
    title: "Sample post",
    slug: "sample-post",
    description: "Placeholder post used when the build has no Notion credentials.",
    date: "2026-01-01",
  },
  blocks: [
    {
      object: "block",
      id: "sample-post-body",
      type: "paragraph",
      has_children: false,
      paragraph: {
        color: "default",
        rich_text: [
          {
            type: "text",
            plain_text: "This post only exists in builds without Notion credentials.",
            href: null,
            text: { content: "This post only exists in builds without Notion credentials.", link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
          },
        ],
      },
    } as unknown as NotionBlock,
  ],
};

/**
 * Lists posts for pre-rendering. Without credentials the sample post is used
 * instead of failing the build.
 */
export async function listPostsForBuild(): Promise<BlogPost[]> {
  if (!hasNotionCredentials()) {
    console.warn("[build] Notion credentials missing: pre-rendering the sample post only.");
    return [SAMPLE_POST.post];
  }
  return listPosts();
}

/** Loads one post for pre-rendering, mirroring `listPostsForBuild`. */
export async function getPostForBuild(slug: string): Promise<PostWithBlocks | null> {
  if (!hasNotionCredentials()) return slug === SAMPLE_POST.post.slug ? SAMPLE_POST : null;
  return getPostBySlug(slug);
}
