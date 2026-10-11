// Types shared by the serverless API (api/) and the client (src/).
import type { BlockObjectResponse } from "@notionhq/client";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  /** ISO date (YYYY-MM-DD) or an empty string when unset. */
  date: string;
  image?: string;
  canonical?: string;
  author?: string;
}

/** A Notion block with its nested children already resolved. */
export type NotionBlock = BlockObjectResponse & { children?: NotionBlock[] };

export interface PostWithBlocks {
  post: BlogPost;
  blocks: NotionBlock[];
}
