import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ProjectListItem } from "@/components/ProjectListItem";
import { projects } from "@/content/projects";

const Work = () => {
  const { t } = useTranslation();

  return (
    <Layout showEchelonFooter>
      {/* Header */}
      <section className="container-wide pt-16 md:pt-24 pb-16 md:pb-20">
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight">{t("work.title")}</h1>
      </section>

      {/* Project List */}
      <section className="pb-24">
        {projects.map((project) => (
          <ProjectListItem key={project.id} project={project} />
        ))}
      </section>
    </Layout>
  );
};

export default Work;
