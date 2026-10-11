import type { MetaDescriptor } from "react-router";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, localizePath, type SupportedLanguage } from "@/i18n/languages";

export const SITE_URL = "https://lpazzim.com";
export const SITE_NAME = "Lucas Pazzim";

const DEFAULT_IMAGE = { url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 };
const OG_LOCALE: Record<SupportedLanguage, string> = { en: "en_US", "pt-BR": "pt_BR" };

export const absoluteUrl = (path: string, locale: SupportedLanguage) => `${SITE_URL}${localizePath(path, locale)}`;

interface PageMetaOptions {
  /** Page title without the site name; omit on the home page. */
  title?: string;
  description: string;
  /** App path without the language prefix, e.g. "/work/upx". */
  path: string;
  locale: SupportedLanguage;
  type?: "website" | "article" | "profile";
  /** Overrides the canonical URL (defaults to this page in this language). */
  canonical?: string;
  /** Extra descriptors such as JSON-LD (`{ "script:ld+json": ... }`). */
  extra?: MetaDescriptor[];
}

/** Title, description, canonical, hreflang alternates, Open Graph and Twitter tags for a page. */
export function pageMeta({
  title,
  description,
  path,
  locale,
  type = "website",
  canonical,
  extra = [],
}: PageMetaOptions) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Senior Frontend Engineer`;
  const url = absoluteUrl(path, locale);

  const descriptors: MetaDescriptor[] = [
    { title: fullTitle },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonical ?? url },
    ...SUPPORTED_LANGUAGES.map((lng) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: lng,
      href: absoluteUrl(path, lng),
    })),
    { tagName: "link", rel: "alternate", hrefLang: "x-default", href: absoluteUrl(path, DEFAULT_LANGUAGE) },

    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:url", content: url },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:locale", content: OG_LOCALE[locale] },
    ...SUPPORTED_LANGUAGES.filter((lng) => lng !== locale).map((lng) => ({
      property: "og:locale:alternate",
      content: OG_LOCALE[lng],
    })),
    { property: "og:image", content: DEFAULT_IMAGE.url },
    { property: "og:image:width", content: String(DEFAULT_IMAGE.width) },
    { property: "og:image:height", content: String(DEFAULT_IMAGE.height) },
    { property: "og:image:alt", content: `${SITE_NAME} — Senior Frontend Engineer` },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: DEFAULT_IMAGE.url },
  ];

  return [...descriptors, ...extra];
}

/** schema.org Person, so search engines can connect the site to the professional profiles. */
export function personJsonLd(jobTitle: string): MetaDescriptor {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
      image: `${SITE_URL}/images/lucas-pazzim-about.jpeg`,
      jobTitle,
      email: "mailto:lpazzim@gmail.com",
      address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressCountry: "BR" },
      sameAs: ["https://www.linkedin.com/in/lpazzim", "https://github.com/lpazzim"],
      knowsAbout: ["React", "Next.js", "TypeScript", "Web Performance", "Technical SEO", "Accessibility"],
    },
  };
}
