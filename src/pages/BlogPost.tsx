import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/blog";
import { useParams, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { NotionRenderer } from "@/components/NotionRenderer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage === "pt-BR" ? ptBR : enUS;
  
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
            {t("blogPost.loading")}
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !data) {
    return <Navigate to="/404" replace />;
  }

  const { post, blocks } = data;

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
              {t("blogPost.back")}
            </Link>

            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">
              {post.date && format(new Date(post.date), 'MMMM dd, yyyy', { locale: dateLocale })}
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
          >
            <NotionRenderer blocks={blocks} />
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
              {t("blogPost.backAll")}
            </Link>
          </motion.div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
