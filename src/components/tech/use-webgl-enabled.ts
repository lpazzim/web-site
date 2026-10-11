import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

let webglSupported: boolean | undefined;

function hasWebGL(): boolean {
  webglSupported ??= Boolean(document.createElement("canvas").getContext("webgl2"));
  return webglSupported;
}

function getSnapshot(): boolean {
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches && hasWebGL();
}

// The server (and the first client render, while hydrating) reports `false`, so
// the pre-rendered HTML never contains the canvas and hydration cannot mismatch.
const getServerSnapshot = () => false;

/** True once the browser can and should run the animated WebGL background. */
export function useWebGLEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
