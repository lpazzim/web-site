import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { listPosts, BlogPost } from "@/lib/blog";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

const Blog = () => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: () => listPosts(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Layout>
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">Blog</div>
            <h1 className="text-5xl md:text-7xl uppercase tracking-tighter mb-8">Articles</h1>
            <p className="text-xl text-muted-foreground mb-16">
              Thoughts on frontend development, React, and building great user experiences.
            </p>
          </motion.div>

          {isLoading && (
            <div className="text-muted-foreground">Loading posts...</div>
          )}

          {error && (
            <div className="text-red-500">Failed to load posts. Please try again later.</div>
          )}

          {posts && posts.length === 0 && (
            <div className="text-muted-foreground">No posts yet.</div>
          )}

          <div className="space-y-12">
            {posts?.map((post: BlogPost, index: number) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8 border-t border-border hover:bg-muted/20 transition-colors -mx-4 px-4">
                    <div className="text-sm text-muted-foreground font-sans">
                      {post.date && format(new Date(post.date), 'MMM dd, yyyy')}
                      {post.author && <div className="mt-1">{post.author}</div>}
                    </div>
                    <div className="md:col-span-3">
                      <h2 className="text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.description && (
                        <p className="text-muted-foreground text-lg mb-4">
                          {post.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-sm text-primary">
                        Read article <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
