import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NamePlateProps {
  /** HSL triplet of the company ("0 80% 55%"); falls back to the site primary. */
  accent?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Sets a company name on a block of its accent colour (the `name-plate`
 * utility in index.css). Inline, so a name that wraps keeps the block on every
 * line; pure CSS, so the pre-rendered HTML matches the client render.
 * Use it for large headings only: some accents reach 3:1 against the dark
 * text (enough for large text in WCAG), not 4.5:1 (src/theme/contrast.test.ts).
 */
export function NamePlate({ accent, children, className }: NamePlateProps) {
  const style = accent ? ({ "--name-accent": `hsl(${accent})` } as CSSProperties) : undefined;
  return (
    <span className={cn("name-plate", className)} style={style}>
      {children}
    </span>
  );
}
