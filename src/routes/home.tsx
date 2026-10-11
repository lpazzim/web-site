import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Enter } from "@/components/tech/Enter";
import { HudFrame } from "@/components/tech/HudFrame";
import { Intro } from "@/components/tech/Intro";
import { ParallaxText, TextReveal } from "@/components/tech/Reveal";
import { ScrollCue } from "@/components/tech/ScrollCue";
import { SectionLabel } from "@/components/tech/SectionLabel";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { ProjectCover, DraftBadge } from "@/components/ProjectCover";
import { useLocale } from "@/i18n/useLocale";
import { getI18n, languageFromPath } from "@/i18n";
import { pageMeta, personJsonLd } from "@/lib/seo";
import type { Route } from "./+types/home";
import { LocaleLink } from "@/i18n/LocaleLink";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listPosts } from "@/lib/blog";
import { format, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

const HERO_LINES = [
  { key: "line1", className: "" },
  { key: "line2", className: "text-primary" },
  { key: "line3", className: "text-muted-foreground" },
  { key: "line4", className: "text-muted-foreground" },
] as const;

export function meta({ location }: Route.MetaArgs) {
  const locale = languageFromPath(location.pathname);
  const { t } = getI18n(locale);
  return pageMeta({
    description: t("seo.home.description"),
    path: "/",
    locale,
    type: "profile",
    extra: [personJsonLd(t("seo.jobTitle"))],
  });
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const locale = useLocale();
  const dateLocale = locale === "pt-BR" ? ptBR : enUS;
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);
  const keywords = t("home.keywords", { returnObjects: true }) as string[];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  // The hero stays sticky behind the page; once faded out it must not swallow clicks.
  const heroPointerEvents = useTransform(heroOpacity, (opacity) => (opacity < 0.05 ? "none" : "auto"));

  const { data: latestPosts } = useQuery({
    queryKey: ["latestPosts"],
    queryFn: () => listPosts(3),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Layout hideFooter noPadding>
      <Intro />
      <div ref={containerRef}>
        {/* Hero Section - Full Screen */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale, pointerEvents: heroPointerEvents }}
          className="min-h-screen flex flex-col justify-between pt-24 pb-12 container-wide sticky top-0 z-10"
        >
          <div className="flex-1 flex flex-col justify-start pt-6 md:pt-10">
            {/* One heading for the page; each line slides up on its own. */}
            <h1 className="text-[14vw] md:text-[11vw] lg:text-[9vw] leading-[0.85] font-semibold tracking-tighter uppercase glow-text">
              {HERO_LINES.map(({ key, className }, index) => (
                <span key={key} className={`block overflow-hidden ${index === 2 ? "mt-4" : ""}`}>
                  {/* CSS animation, not motion: it runs on first paint instead of waiting for hydration (LCP). */}
                  <span
                    className={`block animate-line-up ${className}`}
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    {t(`home.hero.${key}`)}
                  </span>
                </span>
              ))}
            </h1>
          </div>

          <Enter
            delay={0.3}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-12 -mx-6 px-6 md:-mx-12 md:px-12 lg:-mx-20 lg:px-20 bg-linear-to-t from-background via-background/80 to-transparent"
          >
            <p className="text-lg md:text-xl max-w-md text-muted-foreground leading-relaxed">{t("home.hero.intro")}</p>
            <div className="flex items-end gap-8">
              <ScrollCue label={t("home.hero.scroll")} className="hidden md:flex" />
              <HudFrame className="px-4 py-3 text-hud">
                {t("home.hero.yearsLabel", { year: new Date().getFullYear() })}
                <br />
                {t("home.hero.yearsSubtitle")}
              </HudFrame>
            </div>
          </Enter>
        </motion.section>

        {/* Spacer for sticky hero */}
        <div className="h-[50vh]" />

        {/* Marquee Section */}
        <section className="py-20 border-y border-border overflow-hidden">
          <ParallaxText baseVelocity={1}>{t("home.marquee")}</ParallaxText>
        </section>

        {/* Video/Statement Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid border-y border-border">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="container-wide py-32 flex flex-col items-center"
          >
            <SectionLabel index={1} className="mb-12">
              {t("home.approach.label")}
            </SectionLabel>
            <HudFrame className="px-6 py-10 md:px-16 md:py-16 text-center">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold uppercase tracking-tighter leading-[0.95]">
                {t("home.approach.title1")}
                <br />
                <span className="text-primary glow-text">{t("home.approach.title2")}</span>
                <br />
                {t("home.approach.title3")}
              </h2>
            </HudFrame>
            <p className="mt-12 text-lg md:text-xl text-muted-foreground max-w-2xl text-center">
              {t("home.approach.quote")}
            </p>
          </motion.div>
        </section>

        {/* Philosophy Section */}
        <section className="py-32 md:py-48 container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
            <div>
              <TextReveal>
                <SectionLabel index={2} className="mb-8">
                  {t("home.philosophy.label")}
                </SectionLabel>
              </TextReveal>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95]">
                  {t("home.philosophy.line1")}
                </h2>
              </TextReveal>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95] text-primary">
                  {t("home.philosophy.line2")}
                </h2>
              </TextReveal>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95]">
                  {t("home.philosophy.line3")}
                </h2>
              </TextReveal>
            </div>
            <div className="flex flex-col justify-end">
              <TextReveal>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12">
                  {t("home.philosophy.description")}
                </p>
              </TextReveal>
              <TextReveal>
                <LocaleLink
                  to="/about"
                  className="inline-flex items-center gap-3 group text-lg border-b border-foreground pb-2 text-foreground transition-all hover:gap-5 relative z-20"
                  data-testid="link-about-story"
                >
                  {t("home.philosophy.cta")}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </LocaleLink>
              </TextReveal>
            </div>
          </div>
        </section>

        {/* Keywords Section */}
        <section className="py-20 border-y border-border overflow-hidden bg-muted/30">
          <div className="container-wide">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {keywords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="text-2xl md:text-4xl tracking-tight text-muted-foreground hover:text-foreground transition-colors cursor-default"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section id="projects" className="py-32 scroll-mt-24">
          <div className="container-wide mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <TextReveal>
                <SectionLabel index={3} className="mb-4">
                  {t("home.projects.label")}
                </SectionLabel>
              </TextReveal>
              <TextReveal>
                <h2 className="text-5xl md:text-7xl uppercase tracking-tighter">{t("home.projects.title")}</h2>
              </TextReveal>
            </div>
            <LocaleLink
              to="/work"
              className="text-sm uppercase tracking-[0.2em] hover:text-primary transition-colors font-sans flex items-center gap-2 group"
              data-testid="link-view-all-projects"
            >
              {t("home.projects.viewAll")}
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </LocaleLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group relative aspect-4/3 overflow-hidden border-b border-r border-border"
              >
                <LocaleLink
                  to={`/work/${project.id}`}
                  className="block h-full w-full"
                  data-testid={`card-project-${project.id}`}
                >
                  <ProjectCover
                    project={project}
                    bare
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Strong gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                    <div className="flex justify-between items-end">
                      <div>
                        <motion.div
                          className="text-xs uppercase tracking-[0.3em] mb-4 opacity-70 font-sans"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 0.7, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                        >
                          {project.category[locale]}
                        </motion.div>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl tracking-tight leading-none">
                          {project.title}
                        </h3>
                        {project.draft && <DraftBadge className="mt-3" />}
                      </div>
                      <div className="text-sm font-sans opacity-50">{project.period}</div>
                    </div>
                  </div>

                  {/* Hover arrow indicator */}
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-8 h-8 text-white" />
                  </div>
                </LocaleLink>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Big Statement Section */}
        <section className="py-32 md:py-48 overflow-hidden">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <SectionLabel index={4} className="mb-12 justify-center">
                {t("home.vision.label")}
              </SectionLabel>
              <h2 className="text-[10vw] md:text-[8vw] lg:text-[6vw] uppercase tracking-tighter leading-[0.85]">
                {t("home.vision.line1")}
              </h2>
              <h2 className="text-[10vw] md:text-[8vw] lg:text-[6vw] uppercase tracking-tighter leading-[0.85] text-primary">
                {t("home.vision.line2")}
              </h2>
              <h2 className="text-[10vw] md:text-[8vw] lg:text-[6vw] uppercase tracking-tighter leading-[0.85] text-muted-foreground">
                {t("home.vision.line3")}
              </h2>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 md:py-48 container-wide border-t border-border scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
            <div>
              <TextReveal>
                <SectionLabel index={5} className="mb-8">
                  {t("home.about.label")}
                </SectionLabel>
              </TextReveal>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95] mb-8">
                  {t("about.name")}
                </h2>
              </TextReveal>
              <TextReveal>
                <div className="mb-8">
                  <img
                    src="/images/lucas-pazzim-about.jpeg"
                    alt="Lucas Pazzim"
                    className="w-full max-w-sm h-auto grayscale object-cover rounded-sm"
                  />
                </div>
              </TextReveal>
              <TextReveal>
                <p className="text-2xl md:text-3xl leading-relaxed">
                  <Trans i18nKey="about.tagline" components={[<span className="text-primary" />]} />
                </p>
              </TextReveal>
            </div>
            <div className="flex flex-col justify-center">
              <TextReveal>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">{t("about.para1")}</p>
              </TextReveal>
              <TextReveal>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">{t("about.para2")}</p>
              </TextReveal>
              <TextReveal>
                <div className="flex flex-wrap gap-3 mt-4">
                  {profile.skills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="text-sm border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </TextReveal>
            </div>
          </div>
        </section>

        {/* Scrolling Marquee Bottom */}
        <section className="py-12 border-t border-border overflow-hidden">
          <ParallaxText baseVelocity={-1}>
            React • TypeScript • Vite • Docker • Styled Components • JavaScript •
          </ParallaxText>
        </section>

        {/* Latest Posts Section */}
        {latestPosts && latestPosts.length > 0 && (
          <section className="py-32 md:py-48 container-wide border-t border-border">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-20">
              <div>
                <TextReveal>
                  <SectionLabel index={6} className="mb-4">
                    {t("home.latestArticles.label")}
                  </SectionLabel>
                </TextReveal>
                <TextReveal>
                  <h2 className="text-3xl md:text-4xl uppercase tracking-tighter leading-[0.95]">
                    {t("home.latestArticles.title")}
                  </h2>
                </TextReveal>
              </div>
              <div className="lg:col-span-3 space-y-8">
                {latestPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <LocaleLink to={`/blog/${post.slug}`} className="group block">
                      <div className="py-6 border-b border-border hover:bg-muted/20 transition-colors -mx-4 px-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                          <div className="text-sm text-muted-foreground font-sans min-w-[100px]">
                            {post.date && format(parseISO(post.date), "MMM dd, yyyy", { locale: dateLocale })}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl group-hover:text-primary transition-colors mb-2">
                              {post.title}
                            </h3>
                            {post.description && (
                              <p className="text-muted-foreground line-clamp-2">{post.description}</p>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2 hidden md:block" />
                        </div>
                      </div>
                    </LocaleLink>
                  </motion.article>
                ))}
                <TextReveal>
                  <LocaleLink to="/blog" className="inline-flex items-center gap-3 text-lg group mt-8 relative z-20">
                    <span className="border-b border-foreground pb-1 transition-colors group-hover:border-primary group-hover:text-primary">
                      {t("home.latestArticles.viewAll")}
                    </span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </LocaleLink>
                </TextReveal>
              </div>
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <section id="contact" className="py-32 container-wide border-t border-border scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95] mb-8">
                  {t("home.cta.title")}
                </h2>
              </TextReveal>
            </div>
            <div className="flex flex-col justify-end">
              <TextReveal>
                <p className="text-xl text-muted-foreground mb-8">{t("home.cta.description")}</p>
              </TextReveal>
              <TextReveal>
                <a
                  href="mailto:lpazzim@gmail.com"
                  className="inline-flex items-center gap-3 text-2xl group relative z-20"
                  data-testid="link-contact-cta"
                >
                  <span className="border-b-2 border-foreground pb-1 transition-colors group-hover:border-primary group-hover:text-primary">
                    {t("home.cta.button")}
                  </span>
                  <ArrowUpRight className="w-6 h-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              </TextReveal>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 container-wide border-t border-border relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="text-sm text-muted-foreground font-sans">
              {t("home.footer.copyright", { year: new Date().getFullYear() })}
            </div>
            <div className="flex gap-8 text-sm font-sans relative z-20">
              <a
                href="https://www.linkedin.com/in/lpazzim"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                data-testid="link-linkedin"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/lpazzim"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                data-testid="link-github"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
