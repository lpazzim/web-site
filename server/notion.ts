import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

const DATABASE_ID = (process.env.NOTION_DATABASE_ID ?? (() => {
  throw new Error("NOTION_DATABASE_ID ausente nas variáveis de ambiente");
})()).trim();

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
  try {
    const res = await (notion as any).dataSources.query({
      data_source_id: DATABASE_ID,
      filter: { property: "Published", checkbox: { equals: true } },
      sorts: [{ property: "Date", direction: "descending" }],
      page_size: limit || 100,
    });
    return (res.results as any[]).map(mapPageToPost);
  } catch (error: any) {
    // Fallback to databases.query if dataSources is not available
    if (error.message?.includes('dataSources') || error.code === 'ERR_INVALID_ARG_TYPE') {
      const res = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: { property: "Published", checkbox: { equals: true } },
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: limit || 100,
      });
      return (res.results as any[]).map(mapPageToPost);
    }
    throw error;
  }
}

export async function getPostBySlug(slug: string): Promise<{ post: BlogPost; blocks: any[] } | null> {
  let page: any;
  
  try {
    const res = await (notion as any).dataSources.query({
      data_source_id: DATABASE_ID,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Slug", rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });
    page = (res.results as any[])[0];
  } catch (error: any) {
    const res = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Slug", rich_text: { equals: slug } },
        ],
      },
      page_size: 1,
    });
    page = (res.results as any[])[0];
  }

  if (!page) return null;

  const post = mapPageToPost(page);
  const blocks = await getBlocksWithChildren(page.id);

  return { post, blocks };
}

async function getBlocksWithChildren(blockId: string): Promise<any[]> {
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

function blocksToMarkdown(blocks: any[]): string {
  return blocks.map(block => {
    const type = block.type;
    const data = block[type];

    switch (type) {
      case 'paragraph':
        return richTextToMarkdown(data.rich_text) + '\n';
      case 'heading_1':
        return '# ' + richTextToMarkdown(data.rich_text) + '\n';
      case 'heading_2':
        return '## ' + richTextToMarkdown(data.rich_text) + '\n';
      case 'heading_3':
        return '### ' + richTextToMarkdown(data.rich_text) + '\n';
      case 'bulleted_list_item':
        return '- ' + richTextToMarkdown(data.rich_text) + '\n';
      case 'numbered_list_item':
        return '1. ' + richTextToMarkdown(data.rich_text) + '\n';
      case 'quote':
        return '> ' + richTextToMarkdown(data.rich_text) + '\n';
      case 'code':
        return '```' + (data.language || '') + '\n' + richTextToMarkdown(data.rich_text) + '\n```\n';
      case 'divider':
        return '---\n';
      case 'image':
        const url = data.type === 'external' ? data.external?.url : data.file?.url;
        const caption = data.caption?.[0]?.plain_text || '';
        return `![${caption}](${url})\n`;
      case 'callout':
        const emoji = data.icon?.emoji || '';
        return `> ${emoji} ${richTextToMarkdown(data.rich_text)}\n`;
      default:
        return '';
    }
  }).join('\n');
}

function richTextToMarkdown(richText: any[]): string {
  if (!richText || richText.length === 0) return '';
  
  return richText.map(text => {
    let content = text.plain_text;
    
    if (text.annotations?.bold) content = `**${content}**`;
    if (text.annotations?.italic) content = `*${content}*`;
    if (text.annotations?.strikethrough) content = `~~${content}~~`;
    if (text.annotations?.code) content = `\`${content}\``;
    if (text.href) content = `[${content}](${text.href})`;
    
    return content;
  }).join('');
}
