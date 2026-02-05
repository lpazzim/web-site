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

export interface PostWithContent {
  post: BlogPost;
  content: string;
}

const API_BASE = '/api';

export async function listPosts(limit?: number): Promise<BlogPost[]> {
  const url = limit ? `${API_BASE}/posts?limit=${limit}` : `${API_BASE}/posts`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  return response.json();
}

export async function getPostBySlug(slug: string): Promise<PostWithContent | null> {
  const response = await fetch(`${API_BASE}/posts/${slug}`);
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  
  return response.json();
}
