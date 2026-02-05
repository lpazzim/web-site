import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { listPosts, getPostBySlug } from './notion';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const isProduction = process.env.NODE_ENV === 'production';

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

app.get('/api/posts', async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = isProduction ? 5000 : 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
});
