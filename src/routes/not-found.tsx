import { useTranslation } from "react-i18next";
import { getI18n, languageFromPath } from "@/i18n";
import { LocaleLink } from "@/i18n/LocaleLink";
import { SITE_NAME } from "@/lib/seo";
import type { Route } from "./+types/not-found";

export function meta({ location }: Route.MetaArgs) {
  const { t } = getI18n(languageFromPath(location.pathname));
  return [{ title: `${t("seo.notFound.title")} — ${SITE_NAME}` }, { name: "robots", content: "noindex" }];
}

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.subtitle")}</p>
        <LocaleLink to="/" className="text-primary underline hover:text-primary/90">
          {t("notFound.return")}
        </LocaleLink>
      </div>
    </main>
  );
}
