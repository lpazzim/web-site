import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/blog";
import { useParams, Navigate } from "react-router-dom";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="container-wide py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-muted-foreground">
            Loading...
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !data) {
    return <Navigate to="/404" replace />;
  }

  const { post, content } = data;

  return (
    <Layout>
      <article className="container-wide py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">
              {post.date && format(new Date(post.date), 'MMMM dd, yyyy')}
              {post.author && ` • ${post.author}`}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter mb-8 leading-[0.95]">
              {post.title}
            </h1>

            {post.description && (
              <p className="text-xl md:text-2xl text-muted-foreground mb-12">
                {post.description}
              </p>
            )}

            {post.image && (
              <div className="mb-12 -mx-4 md:-mx-8">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-auto grayscale"
                />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-serif prose-headings:tracking-tight prose-headings:uppercase
              prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-blockquote:border-primary prose-blockquote:text-muted-foreground
              prose-li:text-muted-foreground
              prose-img:rounded-sm"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-lg hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to all articles
            </Link>
          </motion.div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
