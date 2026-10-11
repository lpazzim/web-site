import { LocaleLink } from "@/i18n/LocaleLink";
import { useTranslation } from "react-i18next";

interface FooterProps {
  variant?: "default" | "echelon";
}

export function Footer({ variant = "default" }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  if (variant === "echelon") {
    return (
      <footer className="border-t border-separator mt-auto bg-background/60 backdrop-blur-sm">
        {/* Main Footer Content */}
        <div className="container-wide py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Location */}
            <div className="space-y-3">
              <p className="text-label">{t("footer.locationLabel")}</p>
              <div className="text-sm text-foreground space-y-1 whitespace-pre-line">{t("footer.locationValue")}</div>
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <p className="text-label">{t("footer.navLabel")}</p>
              <div className="text-sm space-y-1">
                <LocaleLink to="/work" className="block text-foreground hover:text-primary transition-colors">
                  {t("footer.projectsLink")}
                </LocaleLink>
                <LocaleLink to="/about" className="block text-foreground hover:text-primary transition-colors">
                  {t("footer.aboutLink")}
                </LocaleLink>
                <LocaleLink to="/contact" className="block text-foreground hover:text-primary transition-colors">
                  {t("footer.contactLink")}
                </LocaleLink>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <p className="text-label">{t("footer.contactLabel")}</p>
              <div className="text-sm text-foreground space-y-1">
                <a href="mailto:lpazzim@gmail.com" className="block hover:text-primary transition-colors">
                  lpazzim@gmail.com
                </a>
                <a
                  href="https://www.linkedin.com/in/lpazzim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="space-y-3">
              <p className="text-label">{t("footer.legalLabel")}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{t("footer.rights", { year: currentYear })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Large Scrolling Text */}
        <div className="border-t border-separator overflow-hidden py-6 md:py-8">
          <div className="flex w-max whitespace-nowrap animate-marquee">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="font-display text-6xl md:text-8xl lg:text-[10rem] font-bold text-foreground/10 mx-12"
              >
                @LUCASPAZZIM
              </span>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  // Default footer
  return (
    <footer className="border-t border-separator bg-background/60 backdrop-blur-sm">
      <div className="container-wide py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Left */}
          <div className="space-y-4">
            <p className="font-display text-xl font-semibold">Lucas Pazzim</p>
            <p className="text-muted-foreground text-sm">{t("footer.tagline")}</p>
          </div>

          {/* Center */}
          <div className="flex gap-8 text-sm text-muted-foreground">
            <LocaleLink to="/work" className="hover-highlight">
              {t("footer.workLink")}
            </LocaleLink>
            <LocaleLink to="/about" className="hover-highlight">
              {t("footer.aboutLink")}
            </LocaleLink>
            <LocaleLink to="/contact" className="hover-highlight">
              {t("footer.contactLink")}
            </LocaleLink>
          </div>

          {/* Right */}
          <div className="text-sm text-muted-foreground">
            <p>{t("footer.copyright", { year: currentYear })}</p>
            <p className="mt-1">{t("footer.city")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
