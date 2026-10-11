import { renderToString } from "react-dom/server";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function mockEnvironment({ reducedMotion, webgl }: { reducedMotion: boolean; webgl: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches: reducedMotion, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue((webgl ? {} : null) as never);
}

// The support check is cached per module, so each case loads a fresh copy.
async function loadHook() {
  vi.resetModules();
  return (await import("./use-webgl-enabled")).useWebGLEnabled;
}

describe("useWebGLEnabled", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("is enabled when WebGL works and motion is allowed", async () => {
    mockEnvironment({ reducedMotion: false, webgl: true });
    const useWebGLEnabled = await loadHook();
    expect(renderHook(() => useWebGLEnabled()).result.current).toBe(true);
  });

  it("stays off when the visitor prefers reduced motion", async () => {
    mockEnvironment({ reducedMotion: true, webgl: true });
    const useWebGLEnabled = await loadHook();
    expect(renderHook(() => useWebGLEnabled()).result.current).toBe(false);
  });

  it("stays off without WebGL support", async () => {
    mockEnvironment({ reducedMotion: false, webgl: false });
    const useWebGLEnabled = await loadHook();
    expect(renderHook(() => useWebGLEnabled()).result.current).toBe(false);
  });

  it("renders as off on the server so pre-rendered HTML has no canvas", async () => {
    mockEnvironment({ reducedMotion: false, webgl: true });
    const useWebGLEnabled = await loadHook();
    const Probe = () => <span>{String(useWebGLEnabled())}</span>;
    expect(renderToString(<Probe />)).toContain("false");
  });
});
