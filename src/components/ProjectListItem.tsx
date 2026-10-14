import { LocaleLink } from "@/i18n/LocaleLink";
import type { CaseStudy } from "@/content/types";
import { ProjectCover, DraftBadge } from "@/components/ProjectCover";

interface ProjectListItemProps {
  project: CaseStudy;
  /** 1-based position in the list, shown as "01". */
  index: number;
}

// Hover styling is pure CSS (`group-hover`); the cover preview uses the same
// group, so the row needs no state and renders identically on the server.
export function ProjectListItem({ project, index }: ProjectListItemProps) {
  const { id, title, stack, period } = project;

  return (
    <LocaleLink
      to={`/work/${id}`}
      className="group relative block border-b border-separator transition-colors duration-300 hover:bg-primary/10"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100"
      />
      <div className="container-wide py-5 md:py-6">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          <span aria-hidden="true" className="text-hud w-6 shrink-0 transition-colors group-hover:text-primary">
            {String(index).padStart(2, "0")}
          </span>

          <h3 className="flex-1 text-lg md:text-xl lg:text-2xl font-medium uppercase tracking-wide text-foreground transition-colors duration-300 group-hover:text-primary">
            {title}
            {project.draft && <DraftBadge className="ml-3 align-middle" />}
          </h3>

          <div className="hidden sm:flex items-center gap-2">
            {stack.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-hud border border-separator px-3 py-1 transition-colors duration-300 group-hover:border-primary/60 group-hover:text-primary"
              >
                {tag}
              </span>
            ))}
          </div>

          <span className="text-hud transition-colors duration-300 group-hover:text-primary">{period}</span>

          {/* Cover preview, only visible while the row is hovered. */}
          <div className="pointer-events-none fixed right-8 top-1/2 z-40 aspect-3/4 w-64 -translate-y-1/2 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 lg:right-32 lg:w-80">
            <ProjectCover project={project} play="hover" />
          </div>
        </div>
      </div>
    </LocaleLink>
  );
}
