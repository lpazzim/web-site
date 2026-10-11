import { route, type RouteConfig } from "@react-router/dev/routes";
import { SUPPORTED_LANGUAGES, localizePath } from "./i18n/languages";

// Each page exists once per language ("/about", "/pt/about"). Route ids must be
// unique, so the language is appended to them.
const localizedPages = SUPPORTED_LANGUAGES.flatMap((lng) => {
  const page = (path: string, file: string, name: string) =>
    route(localizePath(path, lng), file, { id: `${name}.${lng}` });

  return [
    page("/", "routes/home.tsx", "home"),
    page("/work", "routes/work.tsx", "work"),
    page("/work/:id", "routes/project.tsx", "project"),
    page("/about", "routes/about.tsx", "about"),
    page("/contact", "routes/contact.tsx", "contact"),
    page("/blog", "routes/blog.tsx", "blog"),
    page("/blog/:slug", "routes/blog-post.tsx", "blog-post"),
  ];
});

export default [
  ...localizedPages,
  route("sitemap.xml", "routes/sitemap.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
