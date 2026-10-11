import { expect, test } from "@playwright/test";

const SITE_URL = "https://lpazzim.com";

// Checks the raw pre-rendered HTML (what crawlers and link previews see,
// before any JavaScript runs) for every URL listed in the sitemap.
test.describe("pre-rendered SEO", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(({ isMobile }) => isMobile, "HTML output does not depend on the viewport");

  let urls: string[] = [];

  test.beforeAll(async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  });

  test("sitemap lists every page in both languages", () => {
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/pt`);
    expect(urls).toContain(`${SITE_URL}/work/treeunfe`);
    expect(urls).toContain(`${SITE_URL}/pt/about`);
    expect(urls.length % 2).toBe(0);
  });

  test("every page has complete, consistent metadata", async ({ request }) => {
    for (const url of urls) {
      const path = url.slice(SITE_URL.length) || "/";
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);

      const html = await response.text();
      const attr = (pattern: RegExp) => html.match(pattern)?.[1];
      const isPortuguese = path === "/pt" || path.startsWith("/pt/");
      const isBlogPost = /^(\/pt)?\/blog\/[^/]+$/.test(path);

      expect(attr(/<html lang="([^"]+)"/), path).toBe(isPortuguese ? "pt-BR" : "en");
      expect(attr(/<title>([^<]+)<\/title>/), path).toContain("Lucas Pazzim");
      expect(attr(/<meta name="description" content="([^"]+)"/)?.length, path).toBeGreaterThan(20);
      expect(html.match(/<h1[\s>]/g), path).toHaveLength(1);

      // Blog posts are single-language, so both URLs share the English canonical.
      const canonical = attr(/<link rel="canonical" href="([^"]+)"/);
      expect(canonical, path).toBe(isBlogPost ? url.replace(`${SITE_URL}/pt/`, `${SITE_URL}/`) : url);

      expect(html, path).toContain('hrefLang="en"');
      expect(html, path).toContain('hrefLang="pt-BR"');
      expect(attr(/<meta property="og:image" content="([^"]+)"/), path).toMatch(/^https:\/\//);
    }
  });

  test("the not-found page is excluded from indexing", async ({ request }) => {
    const html = await (await request.get("/404.html")).text();
    expect(html).toContain('name="robots" content="noindex"');
  });
});
