import type { Screenshot } from "@/content/types";
import { useLocale } from "@/i18n/useLocale";
import { cn } from "@/lib/utils";

interface CaseGalleryProps {
  screenshots: Screenshot[];
}

/**
 * Screenshots of a case on a two-column grid. With an odd count the first one
 * spans both columns, so the grid never ends with a gap.
 */
export function CaseGallery({ screenshots }: CaseGalleryProps) {
  const locale = useLocale();
  const leadSpans = screenshots.length % 2 === 1;

  return (
    <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
      {screenshots.map((shot, index) => (
        <li key={shot.src} className={cn(leadSpans && index === 0 && "md:col-span-2")}>
          <figure>
            <div className="border border-border bg-muted/30">
              <img
                src={shot.src}
                alt={shot.title[locale]}
                width={shot.width}
                height={shot.height}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </div>
            <figcaption className="mt-4 flex gap-4">
              <span aria-hidden="true" className="text-hud tabular-nums text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block text-lg">{shot.title[locale]}</span>
                <span className="mt-1 block text-muted-foreground leading-relaxed">{shot.caption[locale]}</span>
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
