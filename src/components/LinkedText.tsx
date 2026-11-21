import type { ReactNode } from "react";
import { safeHref } from "@/lib/safe-href";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

interface LinkedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with inline Markdown links ([label](https://...)) converted to
 * safe external links with target="_blank" and rel="noopener noreferrer".
 */
export function LinkedText({ text, className }: LinkedTextProps) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    const safe = safeHref(href);
    if (safe) {
      parts.push(
        <a
          key={`${match.index}-${safe}`}
          href={safe}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-primary"
        >
          {label}
        </a>,
      );
    } else {
      parts.push(label);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts.length > 0 ? parts : text}</span>;
}
