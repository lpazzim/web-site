import { Client } from '@notionhq/client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  return accessToken;
}

export async function getNotionClient() {
  const accessToken = await getAccessToken();
  return new Client({ auth: accessToken });
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

export async function listPosts(limit?: number): Promise<BlogPost[]> {
  const notion = await getNotionClient();
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID not set');
  }

  const response = await (notion as any).databases.query({
    database_id: databaseId,
    filter: {
      property: 'Published',
      checkbox: {
        equals: true
      }
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending'
      }
    ],
    page_size: limit || 100
  });

  return response.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      title: props.Title?.title?.[0]?.plain_text || 'Untitled',
      slug: props.Slug?.rich_text?.[0]?.plain_text || page.id,
      description: props.Description?.rich_text?.[0]?.plain_text || '',
      date: props.Date?.date?.start || page.last_edited_time?.split('T')[0] || '',
      published: props.Published?.checkbox || false,
      image: props.Image?.url || undefined,
      canonical: props.Canonical?.url || undefined,
      author: props.Author?.people?.[0]?.name || undefined
    };
  });
}

export async function getPostBySlug(slug: string): Promise<{ post: BlogPost; content: string } | null> {
  const notion = await getNotionClient();
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID not set');
  }

  const response = await (notion as any).databases.query({
    database_id: databaseId,
    filter: {
      property: 'Slug',
      rich_text: {
        equals: slug
      }
    }
  });

  if (response.results.length === 0) {
    return null;
  }

  const page: any = response.results[0];
  const props = page.properties;
  
  if (!props.Published?.checkbox) {
    return null;
  }

  const post: BlogPost = {
    id: page.id,
    title: props.Title?.title?.[0]?.plain_text || 'Untitled',
    slug: props.Slug?.rich_text?.[0]?.plain_text || page.id,
    description: props.Description?.rich_text?.[0]?.plain_text || '',
    date: props.Date?.date?.start || page.last_edited_time?.split('T')[0] || '',
    published: props.Published?.checkbox || false,
    image: props.Image?.url || undefined,
    canonical: props.Canonical?.url || undefined,
    author: props.Author?.people?.[0]?.name || undefined
  };

  const blocks = await notion.blocks.children.list({
    block_id: page.id,
    page_size: 100
  });

  const content = blocksToMarkdown(blocks.results);
  
  return { post, content };
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
