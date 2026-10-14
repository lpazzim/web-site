import { lazy, Suspense, useEffect, useState } from "react";
import { useWebGLEnabled } from "./use-webgl-enabled";

// three.js stays out of the main bundle: the chunk loads only in the browser,
// after hydration, and only when WebGL is available and motion is allowed.
const BackgroundScene = lazy(() => import("./BackgroundScene"));

// Visitors who never move, scroll or type still get the scene after this long.
const FALLBACK_MS = 8000;
const INTERACTIONS = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;

/**
 * True after the visitor first interacts with the page (or after FALLBACK_MS),
 * once the browser is idle. Evaluating three.js and building the scene takes
 * ~0.5 s of main thread on a mid-range phone; doing it on the first interaction
 * rather than right after load keeps it out of the loading window, where it
 * delayed the page becoming responsive (Total Blocking Time).
 */
function useDeferredStart(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleHandle: number | undefined;
    const start = () => {
      stopListening();
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(() => setReady(true), { timeout: 1000 });
      } else {
        setReady(true);
      }
    };
    const timer = window.setTimeout(start, FALLBACK_MS);
    const stopListening = () => {
      window.clearTimeout(timer);
      for (const type of INTERACTIONS) window.removeEventListener(type, start);
    };
    for (const type of INTERACTIONS) window.addEventListener(type, start, { once: true, passive: true });
    return () => {
      stopListening();
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
    };
  }, []);

  return ready;
}

/**
 * Fixed full-viewport backdrop. The CSS grid is the pre-rendered fallback (also
 * used with reduced motion or without WebGL); the animated scene mounts on top
 * after the first interaction (see useDeferredStart), so the ~900 KB chunk never competes with the
 * first paint or the hydration work.
 */
export function TechBackground() {
  const webgl = useWebGLEnabled();
  const ready = useDeferredStart();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,var(--glow),transparent_60%)] opacity-40" />
      {webgl && ready && (
        <Suspense fallback={null}>
          <BackgroundScene />
        </Suspense>
      )}
    </div>
  );
}
