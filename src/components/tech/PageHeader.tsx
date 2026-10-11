import type { ReactNode } from "react";
import { SectionLabel } from "./SectionLabel";

interface PageHeaderProps {
  /** Small HUD label above the title. */
  label: string;
  /** The page's single <h1>. */
  title: ReactNode;
  intro?: string;
  className?: string;
}

/** Shared page opening: HUD label, large uppercase title and an optional intro. */
export function PageHeader({ label, title, intro, className = "" }: PageHeaderProps) {
  return (
    <header className={`container-wide pt-16 md:pt-24 pb-12 md:pb-16 ${className}`}>
      <SectionLabel className="mb-6">{label}</SectionLabel>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold uppercase tracking-tighter leading-[0.9]">
        {title}
      </h1>
      {intro && <p className="mt-8 max-w-2xl text-xl text-muted-foreground">{intro}</p>}
      <div aria-hidden="true" className="mt-12 h-px bg-linear-to-r from-primary via-separator to-transparent" />
    </header>
  );
}
