import type { BlogPost, PostWithBlocks } from "../../shared/blog";

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

export async function getPostBySlug(slug: string): Promise<PostWithBlocks | null> {
  try {
    return await getJson<PostWithBlocks>(`/posts/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}
