import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { format, parse } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { experience } from "@/content/experience";
import { DraftBadge } from "@/components/ProjectCover";
import { useLocale } from "@/i18n/useLocale";

const skills = [
  "React",
  "TypeScript",
  "JavaScript",
  "Vite",
  "Docker",
  "Styled Components",
  "HTML/CSS",
  "SCSS",
  "pnpm",
  "Vitest"
];

const About = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const dateLocale = locale === "pt-BR" ? ptBR : enUS;
  const formatMonth = (yearMonth: string) =>
    format(parse(yearMonth, "yyyy-MM", new Date()), "MMM yyyy", { locale: dateLocale });

  return (
    <Layout showEchelonFooter>
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">{t("about.label")}</div>
            <h1 className="text-5xl md:text-7xl uppercase tracking-tighter mb-8">{t("about.name")}</h1>
            
            <div className="mb-16">
              <img 
                src="/images/lucas-pazzim-about.jpeg" 
                alt="Lucas Pazzim" 
                className="w-full max-w-md h-auto grayscale object-cover rounded-sm"
              />
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="lg:col-span-2 space-y-8"
            >
              <p className="text-2xl md:text-3xl leading-relaxed">
                <Trans i18nKey="about.tagline">
                  Senior Frontend Engineer based in <span className="text-primary">São Paulo, Brazil</span>, 
                  specialized in React, TypeScript, and JavaScript.
                </Trans>
              </p>
              
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>{t("about.para1")}</p>
                <p>{t("about.para2")}</p>
                <p>{t("about.para3")}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-12"
            >
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">{t("about.locationLabel")}</div>
                <p className="text-lg whitespace-pre-line">{t("about.locationValue")}</p>
              </div>
              
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">{t("about.educationLabel")}</div>
                <p className="text-lg">{t("about.educationValue")}</p>
              </div>
              
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">{t("about.contactLabel")}</div>
                <div className="space-y-2">
                  <a 
                    href="https://www.linkedin.com/in/lpazzim" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-lg hover:text-primary transition-colors"
                    data-testid="link-linkedin-about"
                  >
                    LinkedIn →
                  </a>
                  <a 
                    href="https://github.com/lpazzim" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-lg hover:text-primary transition-colors"
                    data-testid="link-github-about"
                  >
                    GitHub →
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {experience.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-24 pt-16 border-t border-border"
            >
              <h2 className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-12 font-sans">{t("about.experienceLabel")}</h2>
              <ol className="relative border-l border-border ml-1 space-y-16">
                {experience.map((exp) => (
                  <li key={exp.company + exp.start} className="relative pl-8 md:pl-12">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full ${exp.end ? "bg-border" : "bg-primary ring-4 ring-primary/20"}`}
                    />
                    <p className="text-sm text-muted-foreground font-sans mb-2">
                      <time dateTime={exp.start}>{formatMonth(exp.start)}</time>
                      {" — "}
                      {exp.end ? <time dateTime={exp.end}>{formatMonth(exp.end)}</time> : t("about.currentRole")}
                      {exp.location && <span className="ml-3 opacity-60">{exp.location}</span>}
                    </p>
                    <h3 className="text-2xl md:text-3xl mb-1">
                      {exp.role[locale]}
                      {exp.draft && <DraftBadge className="ml-3 align-middle" />}
                    </h3>
                    <p className="text-primary mb-4">{exp.company}</p>
                    <p className="text-muted-foreground mb-4">{exp.summary[locale]}</p>
                    <ul className="space-y-2 mb-6">
                      {exp.highlights[locale].map((item) => (
                        <li key={item} className="flex gap-3 text-muted-foreground">
                          <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <ul className="flex flex-wrap gap-2">
                      {exp.stack.map((tech) => (
                        <li key={tech} className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 font-sans text-muted-foreground">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-24 pt-16 border-t border-border"
          >
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8 font-sans">{t("about.techStackLabel")}</div>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors"
                  data-testid={`badge-skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
