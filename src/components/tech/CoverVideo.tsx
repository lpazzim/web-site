import { useEffect, useRef } from "react";
import type { CaseVideo } from "@/content/types";

// Not in TypeScript's DOM lib yet (Network Information API, Chromium only).
type WithConnection = Navigator & { connection?: { saveData?: boolean } };

/**
 * When the clip runs: whenever it is on screen ("visible"), only while its card
 * is hovered or focused ("hover"), or while the caller marks it `active` and it
 * is on screen ("active", e.g. the card in focus in a carousel).
 */
export type CoverVideoPlay = "visible" | "hover" | "active";

interface CoverVideoProps {
  video: CaseVideo;
  play?: CoverVideoPlay;
  /** Only read with play="active". */
  active?: boolean;
}

/**
 * Looping, muted background clip for a project cover. It never autoplays from
 * the markup: playback starts after hydration, without `prefers-reduced-motion`
 * and without the browser's data saver; otherwise the poster stays put.
 *
 * - "visible" (project pages): plays while the clip is on screen.
 * - "hover" (cards and lists): plays while the pointer is over the enclosing
 *   link, or the link has keyboard focus, and rewinds to the poster frame when
 *   it leaves. Nothing is downloaded until the first hover.
 * - "active" (carousel): plays while `active` and on screen; rewinds otherwise.
 */
export function CoverVideo({ video, play = "visible", active = false }: CoverVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // Each clip is 1-2.5 MB; visitors who asked to save data only get the poster.
    if ((navigator as WithConnection).connection?.saveData) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let running = false;

    const sync = () => {
      if (running && !reducedMotion.matches) {
        // Rejects when the browser blocks playback (e.g. power saving); the poster covers it.
        element.play().catch(() => {});
      } else {
        element.pause();
      }
    };
    reducedMotion.addEventListener("change", sync);
    const stopWatchingMotion = () => reducedMotion.removeEventListener("change", sync);

    if (play !== "hover") {
      const observer = new IntersectionObserver(([entry]) => {
        running = entry.isIntersecting && (play === "visible" || active);
        sync();
        if (!running && play === "active" && element.readyState > 0) element.currentTime = 0;
      });
      observer.observe(element);
      return () => {
        observer.disconnect();
        stopWatchingMotion();
      };
    }

    const trigger = element.closest("a") ?? element.parentElement;
    if (!trigger) return stopWatchingMotion;
    const start = () => {
      running = true;
      sync();
    };
    const stop = () => {
      running = false;
      sync();
      // Back to the first frame, which is also the poster.
      if (element.readyState > 0) element.currentTime = 0;
    };
    const leaveFocus = (event: FocusEvent) => {
      if (!trigger.contains(event.relatedTarget as Node | null)) stop();
    };
    trigger.addEventListener("pointerenter", start);
    trigger.addEventListener("pointerleave", stop);
    trigger.addEventListener("focusin", start);
    trigger.addEventListener("focusout", leaveFocus);
    return () => {
      trigger.removeEventListener("pointerenter", start);
      trigger.removeEventListener("pointerleave", stop);
      trigger.removeEventListener("focusin", start);
      trigger.removeEventListener("focusout", leaveFocus);
      stopWatchingMotion();
    };
  }, [play, active]);

  return (
    <video
      ref={ref}
      aria-hidden="true"
      src={video.src}
      poster={video.poster}
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
