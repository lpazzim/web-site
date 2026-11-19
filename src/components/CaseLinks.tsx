import { ArrowUpRight, Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CaseStudy } from "@/content/types";
import { cn } from "@/lib/utils";

interface CaseLinksProps {
  links: CaseStudy["links"];
  className?: string;
}

const BASE =
  "inline-flex items-center justify-center gap-3 px-6 py-4 font-sans text-sm font-semibold uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

/**
 * Calls to action for a case: the running project as a solid button (the main
 * thing a recruiter wants to open) and the source code as an outlined one.
 */
export function CaseLinks({ links, className }: CaseLinksProps) {
  const { t } = useTranslation();
  if (!links?.live && !links?.repo) return null;

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {links.live && (
        <a
          href={links.live}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(BASE, "group bg-primary text-primary-foreground hover:bg-foreground hover:text-background")}
        >
          {t("project.liveSite")}
          <ArrowUpRight
            aria-hidden="true"
            size={18}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      )}
      {links.repo && (
        <a
          href={links.repo}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            BASE,
            "border border-foreground/40 bg-background/70 text-foreground backdrop-blur-sm hover:border-primary hover:text-primary",
          )}
        >
          <Code2 aria-hidden="true" size={18} />
          {t("project.sourceCode")}
        </a>
      )}
    </div>
  );
}
