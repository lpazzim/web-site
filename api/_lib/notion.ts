// Notion data access shared by the serverless functions. Files under a
// leading-underscore folder are not exposed as routes by Vercel.
import { Client, collectPaginatedAPI, isFullBlock, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client";
import type { BlogPost, NotionBlock, PostWithBlocks } from "../../shared/blog.js";

type PageProperty = PageObjectResponse["properties"][string];
type UserLike = { name?: string | null };

// Env values pasted into dashboards sometimes keep surrounding quotes.
function readEnv(name: string): string {
  const value = process.env[name]?.trim().replace(/^["']|["']$/g, "");
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

let client: Client | undefined;
function notion(): Client {
  client ??= new Client({ auth: readEnv("NOTION_API_TOKEN") });
  return client;
}

function userName(user: UserLike | null | undefined): string | undefined {
  return user?.name ?? undefined;
}

function textFrom(prop: PageProperty | undefined): string | undefined {
  if (!prop) return undefined;
  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.plain_text).join("") || undefined;
    case "rich_text":
      return prop.rich_text.map((t) => t.plain_text).join("") || undefined;
    case "date":
      return prop.date?.start;
    case "url":
      return prop.url ?? undefined;
    case "people": {
      const names = prop.people.map((u) => userName(u as UserLike)).filter(Boolean);
      return names.length ? names.join(", ") : undefined;
    }
    case "created_by":
      return userName(prop.created_by as UserLike);
    case "last_edited_by":
      return userName(prop.last_edited_by as UserLike);
    default:
      return undefined;
  }
}

function toPost(page: PageObjectResponse): BlogPost {
  const p = page.properties;
  return {
    id: page.id,
    title: textFrom(p.Title) ?? "Untitled",
    slug: textFrom(p.Slug) ?? page.id.replace(/-/g, ""),
    description: textFrom(p.Description) ?? "",
    date: textFrom(p.Date) ?? "",
    image: textFrom(p.Image),
    canonical: textFrom(p.Canonical),
    author: textFrom(p.Author),
  };
}

const PUBLISHED = { property: "Published", checkbox: { equals: true } } as const;

export async function listPosts(limit = 100): Promise<BlogPost[]> {
  const res = await notion().dataSources.query({
    data_source_id: readEnv("NOTION_DATABASE_ID"),
    filter: PUBLISHED,
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: limit,
  });
  return res.results.filter(isFullPage).map(toPost);
}

export async function getPostBySlug(slug: string): Promise<PostWithBlocks | null> {
  const res = await notion().dataSources.query({
    data_source_id: readEnv("NOTION_DATABASE_ID"),
    filter: { and: [PUBLISHED, { property: "Slug", rich_text: { equals: slug } }] },
    page_size: 1,
  });
  const page = res.results.find(isFullPage);
  if (!page) return null;

  return { post: toPost(page), blocks: await getBlockTree(page.id) };
}

// Child pages and databases are separate documents, not part of the post body.
const STANDALONE_BLOCKS = new Set(["child_page", "child_database"]);

async function getBlockTree(blockId: string): Promise<NotionBlock[]> {
  const results = await collectPaginatedAPI(notion().blocks.children.list, { block_id: blockId, page_size: 100 });
  const blocks = results.filter(isFullBlock);

  return Promise.all(
    blocks.map(async (block): Promise<NotionBlock> => {
      if (!block.has_children || STANDALONE_BLOCKS.has(block.type)) return block;
      return { ...block, children: await getBlockTree(block.id) };
    }),
  );
}
