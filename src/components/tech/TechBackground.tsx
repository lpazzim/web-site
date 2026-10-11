import { lazy, Suspense, useEffect, useState } from "react";
import { useWebGLEnabled } from "./use-webgl-enabled";

// three.js stays out of the main bundle: the chunk loads only in the browser,
// after hydration, and only when WebGL is available and motion is allowed.
const BackgroundScene = lazy(() => import("./BackgroundScene"));

const IDLE_FALLBACK_MS = 1200;

/** True once the browser is idle (or after a short delay where `requestIdleCallback` is missing). */
function useIdle(): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const start = () => setIdle(true);
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(start, IDLE_FALLBACK_MS);
    return () => window.clearTimeout(handle);
  }, []);

  return idle;
}

/**
 * Fixed full-viewport backdrop. The CSS grid is the pre-rendered fallback (also
 * used with reduced motion or without WebGL); the animated scene mounts on top
 * once the page has settled, so the ~900 KB chunk never competes with the
 * first paint or the hydration work.
 */
export function TechBackground() {
  const webgl = useWebGLEnabled();
  const idle = useIdle();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,var(--glow),transparent_60%)] opacity-40" />
      {webgl && idle && (
        <Suspense fallback={null}>
          <BackgroundScene />
        </Suspense>
      )}
    </div>
  );
}
