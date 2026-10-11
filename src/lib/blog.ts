import type { BlogPost, NotionBlock, PostWithBlocks } from "../../shared/blog";

export type { BlogPost, NotionBlock, PostWithBlocks } from "../../shared/blog";

const API_BASE = "/api";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    path: string,
  ) {
    super(`Request to ${path} failed with status ${status}`);
    this.name = "HttpError";
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new HttpError(response.status, path);
  return response.json() as Promise<T>;
}

export function listPosts(limit?: number): Promise<BlogPost[]> {
  return getJson(limit ? `/posts?limit=${limit}` : "/posts");
}

const MAX_DESCRIPTION_LENGTH = 160;

/**
 * Summary for search results and link previews: the post's own description
 * or, when it is empty, the opening paragraph cut at a word boundary.
 */
export function postDescription(post: BlogPost, blocks: NotionBlock[]): string {
  if (post.description.trim()) return post.description.trim();

  const paragraphText = (block: NotionBlock) =>
    block.type === "paragraph"
      ? block.paragraph.rich_text
          .map((t) => t.plain_text)
          .join("")
          .trim()
      : "";
  const firstParagraph = blocks.map(paragraphText).find(Boolean);
  if (!firstParagraph) return "";
  if (firstParagraph.length <= MAX_DESCRIPTION_LENGTH) return firstParagraph;

  const cut = firstParagraph.slice(0, MAX_DESCRIPTION_LENGTH - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:]+$/, "")}…`;
}

export async function getPostBySlug(slug: string): Promise<PostWithBlocks | null> {
  try {
    return await getJson<PostWithBlocks>(`/posts/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}
