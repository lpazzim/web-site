import { SITE_URL } from "./seo";

/**
 * Validates and normalizes an external or internal link. Only allows http, https,
 * and mailto protocols so untrusted content cannot execute javascript: schemes.
 */
export function safeHref(href: string | null | undefined): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href, SITE_URL);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
