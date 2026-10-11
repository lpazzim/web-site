import { Layout } from "@/components/Layout";
import { SectionLabel } from "@/components/tech/SectionLabel";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { listPosts } from "@/lib/blog";
import { LocaleLink } from "@/i18n/LocaleLink";
import { format, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getI18n, languageFromPath } from "@/i18n";
import { useLocale } from "@/i18n/useLocale";
import { pageMeta } from "@/lib/seo";
import type { Route } from "./+types/blog";

// Runs at build time, so the pre-rendered page already lists the posts.
export async function loader() {
  // Imported inside the loader so it is dropped from every client chunk.
  const { listPostsForBuild } = await import("@/lib/notion.server");
  return { posts: await listPostsForBuild() };
}

export function meta({ location }: Route.MetaArgs) {
  const locale = languageFromPath(location.pathname);
  const { t } = getI18n(locale);
  return pageMeta({ title: t("seo.blog.title"), description: t("seo.blog.description"), path: "/blog", locale });
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const dateLocale = useLocale() === "pt-BR" ? ptBR : enUS;

  // Starts from the build-time list and refreshes it in the browser, so posts
  // published after the last deploy still show up.
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: () => listPosts(),
    initialData: loaderData.posts,
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Layout>
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <SectionLabel className="mb-6">{t("blog.label")}</SectionLabel>
            <h1 className="text-5xl md:text-7xl font-semibold uppercase tracking-tighter mb-8">{t("blog.title")}</h1>
            <p className="text-xl text-muted-foreground mb-16">{t("blog.intro")}</p>
          </motion.div>

          {isLoading && <div className="text-muted-foreground">{t("blog.loading")}</div>}

          {error && <div className="text-red-500">{t("blog.error")}</div>}

          {posts && posts.length === 0 && <div className="text-muted-foreground">{t("blog.empty")}</div>}

          <div className="space-y-12">
            {posts?.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <LocaleLink to={`/blog/${post.slug}`} className="block">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8 border-t border-border hover:bg-muted/20 transition-colors -mx-4 px-4">
                    <div className="text-hud">
                      {post.date && format(parseISO(post.date), "MMM dd, yyyy", { locale: dateLocale })}
                      {post.author && <div className="mt-1">{post.author}</div>}
                    </div>
                    <div className="md:col-span-3">
                      <h2 className="text-2xl md:text-3xl mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.description && <p className="text-muted-foreground text-lg mb-4">{post.description}</p>}
                      <span className="inline-flex items-center gap-2 text-sm text-primary">
                        {t("blog.readArticle")}{" "}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </LocaleLink>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
