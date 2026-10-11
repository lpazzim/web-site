import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/tech/PageHeader";
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
      <PageHeader label={t("home.projects.label")} title={t("work.title")} />

      <section className="pb-24">
        {projects.map((project, index) => (
          <ProjectListItem key={project.id} project={project} index={index + 1} />
        ))}
      </section>
    </Layout>
  );
}
