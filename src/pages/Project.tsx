import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ProjectCover, DraftBadge } from "@/components/ProjectCover";
import { projects } from "@/content/projects";
import { useLocale } from "@/i18n/useLocale";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
} as const;

// Literal class names so Tailwind can detect them.
const RESULT_COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
};

const Section =({ label, children }: { label: string; children: ReactNode }) => (
  <motion.section {...reveal} className="container-wide py-20 md:py-28 border-t">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
      <h2 className="lg:col-span-4 text-label">{label}</h2>
      <div className="lg:col-span-8">{children}</div>
    </div>
  </motion.section>
);

const Project = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const locale = useLocale();
  const project = projects.find((p) => p.id === id);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length];
  const { links } = project;
  const results = project.results[locale];

  return (
    <Layout noPadding headerRevealMode showEchelonFooter>
      <div ref={containerRef} className="bg-background">
        {/* Hero */}
        <section className="relative h-screen overflow-hidden">
          <motion.div style={{ y: heroY, scale: 1.1 }} className="absolute inset-0">
            <ProjectCover project={project} bare />
          </motion.div>
          <div className="absolute inset-0 bg-background/30" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 px-4">
            {project.draft && <DraftBadge />}
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-display text-center"
            >
              {project.title}
            </motion.h1>
          </div>

          <div className="absolute bottom-8 left-0 right-0 z-10 container-wide">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-end border-t border-foreground/20 pt-8">
              <div className="text-label text-foreground">
                {project.period} — {project.category[locale]}
              </div>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li key={tech} className="text-[10px] uppercase tracking-widest border border-foreground/30 px-3 py-1">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="container-wide py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
            <dl className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-10 content-start">
              <div>
                <dt className="text-label mb-3">{t("project.role")}</dt>
                <dd className="text-xl">{project.role[locale]}</dd>
              </div>
              <div>
                <dt className="text-label mb-3">{t("project.company")}</dt>
                <dd className="text-xl">{project.company}</dd>
              </div>
              <div>
                <dt className="text-label mb-3">{t("project.period")}</dt>
                <dd className="text-xl">{project.period}</dd>
              </div>
              {links && (links.live || links.repo) && (
                <div>
                  <dt className="text-label mb-3">{t("project.links")}</dt>
                  <dd className="space-y-2 font-sans text-sm uppercase tracking-widest">
                    {links.live && (
                      <a href={links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                        {t("project.liveSite")} <ArrowUpRight size={14} />
                      </a>
                    )}
                    {links.repo && (
                      <a href={links.repo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                        {t("project.sourceCode")} <ArrowUpRight size={14} />
                      </a>
                    )}
                  </dd>
                </div>
              )}
            </dl>
            <p className="lg:col-span-8 text-3xl md:text-5xl leading-[1.1] tracking-tight">
              {project.summary[locale]}
            </p>
          </div>
        </section>

        <Section label={t("project.context")}>
          <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground">{project.context[locale]}</p>
        </Section>

        <Section label={t("project.contributions")}>
          <ul className="space-y-6">
            {project.contributions[locale].map((item) => (
              <li key={item} className="flex gap-6 text-lg md:text-xl leading-relaxed">
                <span aria-hidden="true" className="mt-3 h-px w-8 shrink-0 bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {project.decisions && (
          <Section label={t("project.decisions")}>
            <ol className="space-y-14">
              {project.decisions[locale].map((decision, index) => (
                <li key={decision.title} className="grid grid-cols-[3rem_1fr] gap-4">
                  <span className="font-sans text-sm text-muted-foreground tabular-nums pt-2">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-2xl md:text-3xl mb-4">{decision.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">{decision.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        <Section label={t("project.results")}>
          <dl className={`grid grid-cols-1 gap-px bg-border border ${RESULT_COLUMNS[results.length] ?? "sm:grid-cols-3"}`}>
            {results.map((metric) => (
              <div key={metric.label} className="bg-background p-8 flex flex-col gap-3">
                <dt className="order-2 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">{metric.label}</dt>
                <dd
                  className={`order-1 tracking-tighter text-primary tabular-nums ${
                    metric.value.length > 4 ? "text-5xl md:text-6xl" : "text-6xl md:text-7xl"
                  }`}
                >
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {project.learnings && (
          <Section label={t("project.learnings")}>
            <blockquote className="text-2xl md:text-4xl leading-snug italic">
              “{project.learnings[locale]}”
            </blockquote>
          </Section>
        )}

        {/* Next Project Navigation */}
        {nextProject !== project && (
          <section className="py-40 md:py-60 border-t bg-muted/30">
            <Link to={`/work/${nextProject.id}`} className="group block text-center container-wide">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-12">{t("project.nextProject")}</div>
                <h2 className="text-display group-hover:text-primary transition-all duration-500 transform group-hover:scale-[1.02]">
                  {nextProject.title}
                </h2>
                <div className="mt-16 inline-flex items-center gap-4 text-xl border-b border-foreground pb-2">
                  {t("project.viewCaseStudy")} <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-3" />
                </div>
              </motion.div>
            </Link>
          </section>
        )}

        <section className="container-wide py-12 border-t flex justify-between items-center">
          <Link to="/work" className="inline-flex items-center gap-3 text-sm uppercase tracking-widest hover:text-primary transition-colors group">
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-2" />
            {t("project.backToArchive")}
          </Link>
          <div className="text-[10px] uppercase tracking-widest opacity-30">
            {t("project.copyright", { year: new Date().getFullYear() })}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Project;
