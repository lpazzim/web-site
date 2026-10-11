import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Client } from "@notionhq/client";

function sanitizeEnv(val: string | undefined): string | undefined {
  if (!val) return undefined;
  return val.trim().replace(/^["']|["']$/g, "");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const token = sanitizeEnv(process.env.NOTION_API_TOKEN);
  const databaseId = sanitizeEnv(process.env.NOTION_DATABASE_ID);

  if (!token) {
    res.status(500).json({ error: "NOTION_API_TOKEN ausente nas variáveis de ambiente da Vercel" });
    return;
  }
  if (!databaseId) {
    res.status(500).json({ error: "NOTION_DATABASE_ID ausente nas variáveis de ambiente da Vercel" });
    return;
  }

  const notion = new Client({ auth: token });
  const { slug, limit } = req.query;

  try {
    if (slug) {
      const queryRes = await (notion as any).dataSources.query({
        data_source_id: databaseId,
        filter: {
          and: [
            { property: "Published", checkbox: { equals: true } },
            { property: "Slug", rich_text: { equals: String(slug) } },
          ],
        },
        page_size: 1,
      });

      const page = (queryRes.results as any[])[0];
      if (!page) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      const post = mapPageToPost(page);
      const blocks = await getBlocksWithChildren(notion, page.id);
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
      res.status(200).json({ post, blocks });
      return;
    }

    const limitNum = limit ? parseInt(String(limit)) : 100;
    const queryRes = await (notion as any).dataSources.query({
      data_source_id: databaseId,
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: limitNum,
    });

    const posts = (queryRes.results as any[]).map(mapPageToPost);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(posts);
  } catch (error: any) {
    console.error("Error querying Notion:", error);
    res.status(500).json({
      error: error.message || "Internal Server Error",
      name: error.name,
      code: error.code,
    });
  }
}

function textFrom(prop: any): string | undefined {
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

function mapPageToPost(page: any) {
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
