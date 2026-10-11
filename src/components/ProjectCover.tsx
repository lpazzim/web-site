import type { CSSProperties } from "react";
import type { CaseStudy } from "@/content/types";
import { CoverArt } from "@/components/tech/CoverArt";
import { cn } from "@/lib/utils";

interface ProjectCoverProps {
  project: CaseStudy;
  /** Hide the inner typography when the caller overlays its own title. */
  bare?: boolean;
  className?: string;
}

// Uses the project's screenshot when there is one; otherwise draws a
// generative cover (see lib/cover-art.ts) tinted by the project's accent color.
export function ProjectCover({ project, bare = false, className }: ProjectCoverProps) {
  if (project.cover) {
    return <img src={project.cover} alt={project.title} className={cn("h-full w-full object-cover", className)} />;
  }

  const accent = project.accent ? `hsl(${project.accent})` : "var(--primary)";
  const style = {
    "--cover-accent": accent,
    backgroundColor: "hsl(0 0% 6%)",
    backgroundImage: [
      "radial-gradient(120% 90% at 85% 10%, color-mix(in oklab, var(--cover-accent) 55%, transparent), transparent 60%)",
      "radial-gradient(80% 70% at 0% 100%, color-mix(in oklab, var(--cover-accent) 25%, transparent), transparent 70%)",
      "linear-gradient(hsl(0 0% 100% / 0.04) 1px, transparent 1px)",
      "linear-gradient(90deg, hsl(0 0% 100% / 0.04) 1px, transparent 1px)",
    ].join(","),
    backgroundSize: "auto, auto, 48px 48px, 48px 48px",
  } as CSSProperties;

  return (
    <div
      role="img"
      aria-label={project.title}
      style={style}
      className={cn("group scanlines relative h-full w-full overflow-hidden text-white", className)}
    >
      <CoverArt seed={project.id} />
      {/* Scan line sweeping the cover while the card is hovered. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-(--cover-accent) opacity-0 shadow-[0_0_14px_var(--cover-accent)] group-hover:animate-scan group-hover:opacity-100"
      />
      {!bare && (
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/60">{project.period}</span>
          <div>
            <p className="font-serif text-4xl md:text-6xl uppercase leading-[0.9] tracking-tighter">{project.title}</p>
            <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.25em] text-white/50">
              {project.stack.slice(0, 4).join(" · ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function DraftBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block bg-yellow-400 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-black",
        className,
      )}
    >
      Draft
    </span>
  );
}
