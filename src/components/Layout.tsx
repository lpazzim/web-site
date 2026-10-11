import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TechBackground } from "./tech/TechBackground";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  noPadding?: boolean;
  showEchelonFooter?: boolean;
  headerRevealMode?: boolean;
}

export function Layout({
  children,
  hideFooter = false,
  noPadding = false,
  showEchelonFooter = false,
  headerRevealMode = false,
}: LayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-300 focus:bg-background focus:px-4 focus:py-3 text-hud focus:text-primary! focus:border focus:border-primary"
      >
        {t("nav.skip")}
      </a>
      <TechBackground />
      <Header revealMode={headerRevealMode} />
      <main id="main" tabIndex={-1} className={`flex-1 focus:outline-none ${noPadding ? "" : "pt-20 md:pt-24"}`}>
        {children}
      </main>
      {!hideFooter && <Footer variant={showEchelonFooter ? "echelon" : "default"} />}
    </div>
  );
}
