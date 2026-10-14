import { m, useMotionTemplate, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/content/types";
import { ProjectCover, DraftBadge } from "@/components/ProjectCover";
import { NamePlate } from "@/components/tech/NamePlate";
import { LocaleLink } from "@/i18n/LocaleLink";
import { useLocale } from "@/i18n/useLocale";

// Degrees between two cards on the ring. With a radius of twice the card width
// the neighbours sit half on screen beside the card in focus, curving towards
// the viewer.
const STEP = 30;

// Scroll position (in cards) -> ring position. Each card dwells in the centre
// for the middle half of its scroll span, then the ring turns to the next one.
function settle(x: number) {
  const i = Math.floor(x);
  const k = Math.min(1, Math.max(0, (x - i - 0.25) / 0.5));
  return i + k * k * (3 - 2 * k);
}

interface FeaturedCarouselProps {
  projects: CaseStudy[];
}

/**
 * Featured case studies on a concave 3D ring that turns with the page scroll:
 * the section pins to the viewport for one screen of scrolling per card. The
 * card in focus plays its cover clip; the others show their poster.
 *
 * Pure CSS 3D driven by motion values, so nothing re-renders while scrolling
 * except the active index. At scroll 0 the first card faces the viewer, which
 * is also what the pre-rendered HTML shows.
 */
export function FeaturedCarousel({ projects }: FeaturedCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const count = projects.length;
  const last = Math.max(1, count - 1);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const rotation = useTransform(scrollYProgress, (p) => settle(p * last) * STEP);
  const ring = useMotionTemplate`translateZ(var(--carousel-radius)) rotateY(${rotation}deg)`;
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.round(p * last)));

  // Keyboard users tab into a card that may be turned away: scroll the page to
  // the point where that card faces the viewer.
  const bringIntoFocus = (index: number) => {
    const element = track.current;
    if (!element || index === active) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const span = element.offsetHeight - window.innerHeight;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top + (span * index) / last, behavior: reduce ? "auto" : "smooth" });
  };

  // Sizes derive from --card-w on the same element, so the breakpoint override applies to all of them.
  const stage = {
    "--card-h": "calc(var(--card-w) * 0.625)",
    "--carousel-radius": "calc(var(--card-w) * 2)",
  } as CSSProperties;

  return (
    <div ref={track} className="relative" style={{ height: `${count * 100}vh` }}>
      <div
        className="sticky top-0 h-screen overflow-hidden [--card-w:min(86vw,860px)] md:[--card-w:min(50vw,820px)]"
        style={stage}
      >
        <div className="absolute inset-0 [perspective:calc(var(--card-w)*2.6)]">
          {/* The ring sits translateZ(radius) in front of its cards, so it must not
              catch pointer events meant for them. */}
          <m.ul
            className="pointer-events-none absolute left-[calc(50%-var(--card-w)/2)] top-[calc(50%-var(--card-h)/2)] h-(--card-h) w-(--card-w) [transform-style:preserve-3d]"
            style={{ transform: ring }}
          >
            {projects.map((project, index) => (
              <CarouselCard
                key={project.id}
                project={project}
                index={index}
                rotation={rotation}
                active={index === active}
                onFocus={() => bringIntoFocus(index)}
              />
            ))}
          </m.ul>
        </div>

        {/* HUD: position and the active case's category, like a figure caption. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 container-wide flex items-end justify-between gap-6">
          <div aria-hidden="true">
            <p className="text-hud tabular-nums">
              <span className="text-primary">{String(active + 1).padStart(2, "0")}</span> /{" "}
              {String(count).padStart(2, "0")}
            </p>
            <CategoryCaption project={projects[active]} />
          </div>
          <div className="hidden h-px w-48 bg-separator md:block" aria-hidden="true">
            <m.div className="h-full origin-left bg-primary" style={{ scaleX: scrollYProgress }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCaption({ project }: { project: CaseStudy }) {
  const locale = useLocale();
  return (
    <p className="mt-2 text-2xl md:text-4xl uppercase leading-none tracking-tight text-muted-foreground">
      {project.category[locale]}
    </p>
  );
}

interface CarouselCardProps {
  project: CaseStudy;
  index: number;
  rotation: MotionValue<number>;
  active: boolean;
  onFocus: () => void;
}

function CarouselCard({ project, index, rotation, active, onFocus }: CarouselCardProps) {
  const locale = useLocale();
  // Distance from the centre, in cards: neighbours dim, farther cards vanish
  // (and leave the tab order) so the ring never shows its back.
  const distance = useTransform(rotation, (r) => Math.abs(r / STEP - index));
  const opacity = useTransform(distance, (d) => Math.min(1, Math.max(0, 1.6 - d)));
  const visibility = useTransform(distance, (d) => (d < 1.55 ? "visible" : "hidden"));
  const dim = useTransform(distance, (d) => `brightness(${1 - 0.45 * Math.min(1, d)})`);

  return (
    <m.li
      className="pointer-events-auto absolute inset-0 [backface-visibility:hidden]"
      style={{
        transform: `rotateY(${-index * STEP}deg) translateZ(calc(var(--carousel-radius) * -1))`,
        opacity,
        visibility,
        filter: dim,
      }}
    >
      <LocaleLink
        to={`/work/${project.id}`}
        onFocus={(event) => {
          // Keyboard only: a mouse or touch focus comes with a click that should navigate.
          if (event.currentTarget.matches(":focus-visible")) onFocus();
        }}
        className="group relative block h-full w-full overflow-hidden border border-border"
        data-testid={`card-project-${project.id}`}
      >
        <ProjectCover project={project} bare play="active" active={active} />
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.3em] opacity-70">{project.category[locale]}</p>
              <h3 className="text-3xl md:text-5xl tracking-tight leading-[1.15]">
                <NamePlate accent={project.accent}>{project.title}</NamePlate>
              </h3>
              {project.draft && <DraftBadge className="mt-3" />}
            </div>
            <p className="shrink-0 font-sans text-sm opacity-60">{project.period}</p>
          </div>
        </div>
        <ArrowUpRight
          aria-hidden="true"
          className="absolute right-6 top-6 h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </LocaleLink>
    </m.li>
  );
}
