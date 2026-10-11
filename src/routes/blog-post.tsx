import { Layout } from "@/components/Layout";
import { motion } from "motion/react";
import { data } from "react-router";
import { format, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NotionRenderer } from "@/components/NotionRenderer";
import { getI18n, languageFromPath } from "@/i18n";
import { LocaleLink } from "@/i18n/LocaleLink";
import { useLocale } from "@/i18n/useLocale";
import { getPostBySlug as fetchPost, postDescription } from "@/lib/blog";
import { absoluteUrl, pageMeta } from "@/lib/seo";
import type { Route } from "./+types/blog-post";

// Build time: pre-renders every post that exists when the site is deployed.
export async function loader({ params }: Route.LoaderArgs) {
  // Imported inside the loader so it is dropped from every client chunk.
  const { getPostForBuild } = await import("@/lib/notion.server");
  const result = await getPostForBuild(params.slug);
  if (!result) throw data(null, { status: 404 });
  return result;
}

// Browser: client-side navigation and posts published after the last deploy
// (served by the SPA fallback) are fetched from the API.
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const result = await fetchPost(params.slug);
  if (!result) throw data(null, { status: 404 });
  return result;
}

export function HydrateFallback() {
  const { t } = useTranslation();
  return (
    <Layout>
      <section className="container-wide py-16 md:py-24">
        <p className="max-w-3xl mx-auto text-muted-foreground" role="status">
          {t("blogPost.loading")}
        </p>
      </section>
    </Layout>
  );
}

export function meta({ loaderData, location }: Route.MetaArgs) {
  const locale = languageFromPath(location.pathname);
  if (!loaderData) return [{ title: getI18n(locale).t("seo.notFound.title") }];

  const { post, blocks } = loaderData;
  const path = `/blog/${post.slug}`;
  return pageMeta({
    title: post.title,
    description: postDescription(post, blocks) || getI18n(locale).t("seo.blog.description"),
    path,
    locale,
    type: "article",
    // Posts are written in a single language; both URLs point to one canonical.
    canonical: post.canonical ?? absoluteUrl(path, "en"),
  });
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const dateLocale = useLocale() === "pt-BR" ? ptBR : enUS;
  const { post, blocks } = loaderData;

  return (
    <Layout>
      <article className="container-wide py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <LocaleLink
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("blogPost.back")}
            </LocaleLink>

            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">
              {post.date && format(parseISO(post.date), "MMMM dd, yyyy", { locale: dateLocale })}
              {post.author && ` • ${post.author}`}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter mb-8 leading-[0.95]">
              {post.title}
            </h1>

            {post.description && <p className="text-xl md:text-2xl text-muted-foreground mb-12">{post.description}</p>}

            {post.image && (
              <div className="mb-12 -mx-4 md:-mx-8">
                <img src={post.image} alt={post.title} className="w-full h-auto grayscale" />
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
            <LocaleLink
              to="/blog"
              className="inline-flex items-center gap-2 text-lg hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {t("blogPost.backAll")}
            </LocaleLink>
          </motion.div>
        </div>
      </article>
    </Layout>
  );
}
