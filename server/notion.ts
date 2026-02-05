const NOTION_API_BASE = 'https://api.notion.com/v1';

async function notionFetch(endpoint: string, options: RequestInit = {}) {
  const accessToken = process.env.NOTION_API_TOKEN;
  
  if (!accessToken) {
    throw new Error('NOTION_API_TOKEN not configured');
  }
  
  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Notion API error: ${response.status} - ${error.message || 'Unknown error'}`);
  }
  
  return response.json();
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
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID not set');
  }

  const response = await notionFetch(`/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify({
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
    })
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
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID not set');
  }

  const response = await notionFetch(`/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slug
        }
      }
    })
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

  const blocksResponse = await notionFetch(`/blocks/${page.id}/children?page_size=100`, {
    method: 'GET'
  });

  const content = blocksToMarkdown(blocksResponse.results);
  
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
