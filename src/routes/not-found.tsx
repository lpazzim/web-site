import { useTranslation } from "react-i18next";
import { HudFrame } from "@/components/tech/HudFrame";
import { getI18n, languageFromPath } from "@/i18n";
import { LocaleLink } from "@/i18n/LocaleLink";
import { SITE_NAME } from "@/lib/seo";
import type { Route } from "./+types/not-found";

export function meta({ location }: Route.MetaArgs) {
  const { t } = getI18n(languageFromPath(location.pathname));
  return [{ title: `${t("seo.notFound.title")} — ${SITE_NAME}` }, { name: "robots", content: "noindex" }];
}

// Also rendered by the root ErrorBoundary, outside the theme provider and the
// layout, so it only uses CSS: no canvas, no theme hook.
export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 bg-grid">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,var(--glow),transparent_60%)] opacity-40"
      />
      <HudFrame className="relative px-8 py-12 text-center md:px-20 md:py-16">
        <p className="text-hud mb-6">{t("notFound.code")}</p>
        <h1
          data-text="404"
          className="glitch text-[28vw] font-semibold leading-none tracking-tighter md:text-[14rem] glow-text"
        >
          404
        </h1>
        <p className="mt-6 mb-10 text-xl text-muted-foreground">{t("notFound.subtitle")}</p>
        <LocaleLink
          to="/"
          className="text-hud inline-flex items-center gap-3 border border-primary px-5 py-3 text-primary! transition-colors hover:bg-primary hover:text-primary-foreground!"
        >
          {t("notFound.return")}
        </LocaleLink>
      </HudFrame>
    </main>
  );
}
