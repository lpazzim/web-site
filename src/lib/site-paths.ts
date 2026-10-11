import { projects } from "../content/projects";
import { SUPPORTED_LANGUAGES, localizePath } from "../i18n/languages";

/** Every page of the site, without the language prefix. */
export function appPaths(postSlugs: string[]): string[] {
  return [
    "/",
    "/work",
    ...projects.map((project) => `/work/${project.id}`),
    "/about",
    "/contact",
    "/blog",
    ...postSlugs.map((slug) => `/blog/${slug}`),
  ];
}

/** Every page in every language: "/about", "/pt/about", ... */
export const localizedPaths = (postSlugs: string[]): string[] =>
  SUPPORTED_LANGUAGES.flatMap((lng) => appPaths(postSlugs).map((path) => localizePath(path, lng)));
