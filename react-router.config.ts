import type { Config } from "@react-router/dev/config";
import { listPostsForBuild } from "./src/lib/notion.server";
import { localizedPaths } from "./src/lib/site-paths";

export default {
  appDirectory: "src",
  // Static site: every page is pre-rendered to HTML at build time and served
  // from the CDN. Paths that are not pre-rendered (blog posts published after
  // the last build) are served by the SPA fallback.
  ssr: false,
  async prerender() {
    const posts = await listPostsForBuild();
    return [...localizedPaths(posts.map((post) => post.slug)), "/sitemap.xml", "/404"];
  },
} satisfies Config;
