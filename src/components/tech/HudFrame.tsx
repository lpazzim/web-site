import type { ReactNode } from "react";

const CORNERS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
] as const;

/** Wraps content in four corner brackets, like a camera or HUD viewfinder. */
export function HudFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {CORNERS.map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={`pointer-events-none absolute size-3 border-primary/70 ${position}`}
        />
      ))}
      {children}
    </div>
  );
}
