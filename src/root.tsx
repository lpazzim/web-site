import { useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { LazyMotion, MotionConfig } from "motion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  type LinksFunction,
} from "react-router";
import { getI18n } from "@/i18n";
import { resyncScrollPosition } from "@/lib/scroll-resync";
import { useLocale } from "@/i18n/useLocale";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/theme/theme-context";
import NotFound from "@/routes/not-found";
import stylesheet from "./index.css?url";

// Once the features are in, scroll-driven components start following the
// scroll: make them read a position restored by a reload (see scroll-resync.ts).
const loadMotionFeatures = () =>
  import("@/lib/motion-features").then((module) => {
    resyncScrollPosition();
    return module.default;
  });
import type { Route } from "./+types/root";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
  // Self-hosted fonts (declared in index.css): no third-party stylesheet blocks
  // the first paint. Preloading the Latin files lets text render in its final face.
  ...["space-grotesk-latin", "jetbrains-mono-latin"].map((font) => ({
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: `/fonts/${font}.woff2`,
    crossOrigin: "anonymous" as const,
  })),
];

// Applies the saved theme before first paint (dark by default) to avoid a flash.
const themeScript = `try{if(localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})!=="light")document.documentElement.classList.add("dark")}catch{document.documentElement.classList.add("dark")}`;

export function Layout({ children }: { children: ReactNode }) {
  const locale = useLocale();

  return (
    // The theme script adds a class to <html> before React hydrates.
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f0f0f" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const locale = useLocale();
  // One client per browser session; created lazily so pre-rendering gets a fresh one.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <I18nextProvider i18n={getI18n(locale)}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          {/* Honors the OS "reduce motion" setting for every Motion animation. */}
          <MotionConfig reducedMotion="user">
            {/* The animation engine loads as a separate chunk after hydration; `strict`
                makes a stray `motion.*` component (which bundles it) throw. */}
            <LazyMotion features={loadMotionFeatures} strict>
              <Outlet />
            </LazyMotion>
          </MotionConfig>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const locale = useLocale();
  const { pathname } = useLocation();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <I18nextProvider i18n={getI18n(locale)}>
        <NotFound />
      </I18nextProvider>
    );
  }

  console.error(`Unexpected error on ${pathname}`, error);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="text-muted-foreground">Please reload the page or try again later.</p>
    </main>
  );
}
