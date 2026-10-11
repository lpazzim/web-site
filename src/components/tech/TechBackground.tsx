import { lazy, Suspense } from "react";
import { useWebGLEnabled } from "./use-webgl-enabled";

// three.js stays out of the main bundle: the chunk loads only in the browser,
// after hydration, and only when WebGL is available and motion is allowed.
const BackgroundScene = lazy(() => import("./BackgroundScene"));

/**
 * Fixed full-viewport backdrop. The CSS grid is the pre-rendered fallback (also
 * used with reduced motion or without WebGL); the animated scene mounts on top.
 */
export function TechBackground() {
  const webgl = useWebGLEnabled();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,var(--glow),transparent_60%)] opacity-40" />
      {webgl && (
        <Suspense fallback={null}>
          <BackgroundScene />
        </Suspense>
      )}
    </div>
  );
}
