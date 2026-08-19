import express from 'express';
import cors from 'cors';
import { listPosts, getPostBySlug } from './notion';

const app = express();
app.use(cors());
app.use(express.json());

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Diagnostic health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  const token = process.env.NOTION_API_TOKEN?.trim().replace(/^["']|["']$/g, '');
  const dbId = process.env.NOTION_DATABASE_ID?.trim().replace(/^["']|["']$/g, '');
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasNotionToken: Boolean(token),
      tokenPrefix: token ? token.substring(0, 7) + '...' : null,
      hasDatabaseId: Boolean(dbId),
      databaseIdLength: dbId ? dbId.length : 0,
    }
  });
});

app.get(['/api/posts', '/posts'], async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const cacheKey = `posts-${limit || 'all'}`;
    
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('Returning cached posts');
      res.json(cached);
      return;
    }
    
    const posts = await listPosts(limit);
    setCache(cacheKey, posts);
    res.json(posts);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      error: error.message || 'Internal Server Error',
      name: error.name,
      code: error.code,
      status: error.status,
    });
  }
});

app.get(['/api/posts/:slug', '/posts/:slug'], async (req, res) => {
  try {
    const cacheKey = `post-${req.params.slug}`;
    
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`Returning cached post: ${req.params.slug}`);
      res.json(cached);
      return;
    }
    
    const result = await getPostBySlug(req.params.slug);
    if (!result) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    setCache(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      error: error.message || 'Internal Server Error',
      name: error.name,
      code: error.code,
      status: error.status,
    });
  }
});

export default app;
