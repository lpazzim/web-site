import { Client } from "@notionhq/client";

function sanitizeEnv(val: string | undefined): string | undefined {
  if (!val) return undefined;
  return val.trim().replace(/^["']|["']$/g, '');
}

export function getNotionClient(): Client {
  const token = sanitizeEnv(process.env.NOTION_API_TOKEN);
  if (!token) {
    throw new Error("NOTION_API_TOKEN ausente nas variáveis de ambiente");
  }
  return new Client({ auth: token });
}

export function getDatabaseId(): string {
  const dbId = sanitizeEnv(process.env.NOTION_DATABASE_ID);
  if (!dbId) {
    throw new Error("NOTION_DATABASE_ID ausente nas variáveis de ambiente");
  }
  return dbId;
}

type AnyProp = any;

function textFrom(prop: AnyProp): string | undefined {
  if (!prop) return undefined;

  switch (prop.type) {
    case "title":
      return (prop.title ?? []).map((t: any) => t.plain_text).join("") || undefined;
    case "rich_text":
      return (prop.rich_text ?? []).map((t: any) => t.plain_text).join("") || undefined;
    case "date":
      return prop.date?.start;
    case "url":
      return prop.url || undefined;
    case "people": {
      const names = (prop.people ?? []).map((u: any) => u?.name).filter(Boolean);
      return names.length ? names.join(", ") : undefined;
    }
    case "created_by":
      return prop.created_by?.name || undefined;
    case "last_edited_by":
      return prop.last_edited_by?.name || undefined;
    default:
      return undefined;
  }
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  published: boolean;
  image?: string;
  canonical?: string;
  author?: string;
}

function mapPageToPost(page: any): BlogPost {
  const p = page.properties ?? {};
  return {
    id: page.id,
    title: textFrom(p.Title) ?? "Sem título",
    slug: textFrom(p.Slug) ?? page.id.replace(/-/g, ""),
    description: textFrom(p.Description) ?? "",
    date: textFrom(p.Date) ?? "",
    published: p.Published?.checkbox ?? false,
    image: textFrom(p.Image),
    canonical: textFrom(p.Canonical),
    author: textFrom(p.Author),
  };
}

export async function listPosts(limit?: number): Promise<BlogPost[]> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  const res = await (notion as any).dataSources.query({
    data_source_id: databaseId,
    filter: { property: "Published", checkbox: { equals: true } },
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: limit || 100,
  });

  return (res.results as any[]).map(mapPageToPost);
}

export async function getPostBySlug(slug: string): Promise<{ post: BlogPost; blocks: any[] } | null> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  const res = await (notion as any).dataSources.query({
    data_source_id: databaseId,
    filter: {
      and: [
        { property: "Published", checkbox: { equals: true } },
        { property: "Slug", rich_text: { equals: slug } },
      ],
    },
    page_size: 1,
  });

  const page = (res.results as any[])[0];
  if (!page) return null;

  const post = mapPageToPost(page);
  const blocks = await getBlocksWithChildren(notion, page.id);

  return { post, blocks };
}

async function getBlocksWithChildren(notion: Client, blockId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    blocks.push(...res.results);
    cursor = res.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}
