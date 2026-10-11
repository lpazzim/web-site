import type { ReactNode } from "react";

interface EnterProps {
  as?: "div" | "aside" | "section" | "header";
  /** Seconds before the animation starts. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Fade-and-rise entrance done in CSS. Unlike a motion `initial` state, it starts
 * on first paint instead of waiting for hydration, so above-the-fold content
 * (the LCP) is not held back by JavaScript.
 */
export function Enter({ as: Tag = "div", delay = 0, className = "", children }: EnterProps) {
  return (
    <Tag className={`animate-fade-in-up ${className}`} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </Tag>
  );
}
