import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ProjectListItem } from "@/components/ProjectListItem";
import { projects } from "@/content/projects";
import { getI18n, languageFromPath } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import type { Route } from "./+types/work";

export function meta({ location }: Route.MetaArgs) {
  const locale = languageFromPath(location.pathname);
  const { t } = getI18n(locale);
  return pageMeta({ title: t("seo.work.title"), description: t("seo.work.description"), path: "/work", locale });
}

export default function Work() {
  const { t } = useTranslation();

  return (
    <Layout showEchelonFooter>
      <section className="container-wide pt-16 md:pt-24 pb-16 md:pb-20">
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight">{t("work.title")}</h1>
      </section>

      <section className="pb-24">
        {projects.map((project) => (
          <ProjectListItem key={project.id} project={project} />
        ))}
      </section>
    </Layout>
  );
}
