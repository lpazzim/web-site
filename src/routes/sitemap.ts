import { SUPPORTED_LANGUAGES, localizePath } from "@/i18n/languages";
import { listPostsForBuild } from "@/lib/notion.server";
import { SITE_URL, absoluteUrl } from "@/lib/seo";
import { appPaths } from "@/lib/site-paths";

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);

// Pre-rendered to /sitemap.xml at build time. Each URL lists its translations
// so search engines can serve the right language.
export async function loader() {
  const posts = await listPostsForBuild();
  const urls = appPaths(posts.map((post) => post.slug)).flatMap((path) =>
    SUPPORTED_LANGUAGES.map((lng) => {
      const alternates = SUPPORTED_LANGUAGES.map(
        (alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(absoluteUrl(path, alt))}"/>`,
      ).join("\n");
      return `  <url>\n    <loc>${escapeXml(`${SITE_URL}${localizePath(path, lng)}`)}</loc>\n${alternates}\n  </url>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
