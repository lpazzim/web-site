import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/brand";
import { getI18n, languageFromPath } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import type { Route } from "./+types/contact";

const contactLinks = [
  { href: "mailto:lpazzim@gmail.com", label: "lpazzim@gmail.com", icon: Mail, external: false },
  { href: "https://www.linkedin.com/in/lpazzim", label: "linkedin.com/in/lpazzim", icon: LinkedInIcon, external: true },
  { href: "https://github.com/lpazzim", label: "github.com/lpazzim", icon: GitHubIcon, external: true },
];

export function meta({ location }: Route.MetaArgs) {
  const locale = languageFromPath(location.pathname);
  const { t } = getI18n(locale);
  return pageMeta({
    title: t("seo.contact.title"),
    description: t("seo.contact.description"),
    path: "/contact",
    locale,
  });
}

export default function Contact() {
  const { t } = useTranslation();

  return (
    <Layout showEchelonFooter>
      <section className="container-wide py-16 md:py-24 min-h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-12">
            <div>
              <h1 className="text-display lg:text-[clamp(3rem,6vw,7rem)] mb-6 animate-fade-in-up">
                {t("contact.titleLine1")}
                <br />
                {t("contact.titleLine2")}
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                {t("contact.intro")}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {contactLinks.map(({ href, label, icon: Icon, external }) => (
                <a
                  key={href}
                  href={href}
                  {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  className="flex items-center gap-4 text-lg hover-highlight group"
                >
                  <Icon size={20} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  <span>{label}</span>
                </a>
              ))}
            </div>

            {/* Location */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <p className="text-label mb-2">{t("contact.basedIn")}</p>
              <p className="text-lg">{t("contact.location")}</p>
            </div>
          </div>

          {/* Image */}
          <div className="hidden lg:block">
            <div className="aspect-4/5 bg-secondary overflow-hidden">
              <img
                src="/images/lucas-pazzim-about.jpeg"
                alt="Lucas Pazzim"
                loading="lazy"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
