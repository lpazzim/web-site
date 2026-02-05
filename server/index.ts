import express from 'express';
import cors from 'cors';
import { listPosts, getPostBySlug } from './notion';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/posts', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const posts = await listPosts(limit);
    res.json(posts);
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const result = await getPostBySlug(req.params.slug);
    if (!result) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
