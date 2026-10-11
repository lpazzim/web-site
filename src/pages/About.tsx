import type { ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import { format, parse } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { experience } from "@/content/experience";
import { profile } from "@/content/profile";
import { DraftBadge } from "@/components/ProjectCover";
import { useLocale } from "@/i18n/useLocale";

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay },
});

const Eyebrow = ({ as: Tag = "h2", children }: { as?: "h2" | "h3"; children: ReactNode }) => (
  <Tag className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">{children}</Tag>
);

const socialLinks = [
  { href: "https://www.linkedin.com/in/lpazzim", label: "LinkedIn" },
  { href: "https://github.com/lpazzim", label: "GitHub" },
];

const About = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const dateLocale = locale === "pt-BR" ? ptBR : enUS;

  // Experience dates are "YYYY-MM", or "YYYY" when LinkedIn only lists the year.
  const formatDate = (value: string) =>
    value.length === 4 ? value : format(parse(value, "yyyy-MM", new Date()), "MMM yyyy", { locale: dateLocale });

  return (
    <Layout showEchelonFooter>
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-4xl">
          <motion.div {...fadeIn()}>
            <Eyebrow as="h3">{t("about.label")}</Eyebrow>
            <h1 className="text-5xl md:text-7xl uppercase tracking-tighter mb-8">{t("about.name")}</h1>
            <img
              src="/images/lucas-pazzim-about.jpeg"
              alt="Lucas Pazzim"
              className="w-full max-w-md h-auto grayscale object-cover rounded-sm mb-16"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div {...fadeIn(0.1)} className="lg:col-span-2 space-y-8">
              <p className="text-2xl md:text-3xl leading-relaxed">
                <Trans i18nKey="about.tagline" components={[<span className="text-primary" />]} />
              </p>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>{t("about.para1")}</p>
                <p>{t("about.para2")}</p>
                <p>{t("about.para3")}</p>
              </div>
            </motion.div>

            <motion.aside {...fadeIn(0.2)} className="space-y-12">
              <div>
                <Eyebrow as="h3">{t("about.locationLabel")}</Eyebrow>
                <p className="text-lg whitespace-pre-line">{t("about.locationValue")}</p>
              </div>

              <div>
                <Eyebrow as="h3">{t("about.educationLabel")}</Eyebrow>
                <ul className="space-y-4">
                  {profile.education.map((edu) => (
                    <li key={edu.institution}>
                      <p className="text-lg leading-snug">{edu.institution}</p>
                      <p className="text-sm text-muted-foreground font-sans">
                        {edu.course[locale]} · {edu.period}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Eyebrow as="h3">{t("about.languagesLabel")}</Eyebrow>
                <ul className="space-y-1">
                  {profile.languages.map((language) => (
                    <li key={language.name.en} className="text-lg">
                      {language.name[locale]}{" "}
                      <span className="text-sm text-muted-foreground font-sans">· {language.level[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Eyebrow as="h3">{t("about.contactLabel")}</Eyebrow>
                <ul className="space-y-2">
                  {socialLinks.map(({ href, label }) => (
                    <li key={href}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg hover:text-primary transition-colors"
                      >
                        {label} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.aside>
          </div>

          {experience.length > 0 && (
            <motion.section {...fadeIn(0.3)} className="mt-24 pt-16 border-t border-border">
              <Eyebrow>{t("about.experienceLabel")}</Eyebrow>
              <ol className="relative border-l border-border ml-1 mt-12 space-y-16">
                {experience.map((exp) => (
                  <li key={exp.company + exp.start} className="relative pl-8 md:pl-12">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full ${
                        exp.end ? "bg-border" : "bg-primary ring-4 ring-primary/20"
                      }`}
                    />
                    <p className="text-sm text-muted-foreground font-sans mb-2">
                      <time dateTime={exp.start}>{formatDate(exp.start)}</time>
                      {" — "}
                      {exp.end ? <time dateTime={exp.end}>{formatDate(exp.end)}</time> : t("about.currentRole")}
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
                        <li
                          key={tech}
                          className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 font-sans text-muted-foreground"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </motion.section>
          )}

          <motion.section {...fadeIn(0.4)} className="mt-24 pt-16 border-t border-border">
            <Eyebrow>{t("about.techStackLabel")}</Eyebrow>
            <ul className="flex flex-wrap gap-3 mt-8">
              {profile.skills.map((skill) => (
                <li
                  key={skill}
                  className="text-sm border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section {...fadeIn(0.5)} className="mt-24 pt-16 border-t border-border">
            <Eyebrow>{t("about.certificationsLabel")}</Eyebrow>
            <ul className="mt-8 divide-y divide-border border-y border-border">
              {profile.certifications.map((certification) => (
                <li key={certification} className="py-4 text-lg">
                  {certification}
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
      </section>
    </Layout>
  );
};

export default About;
