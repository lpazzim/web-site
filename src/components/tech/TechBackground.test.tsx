import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TechBackground } from "./TechBackground";

// The real scene needs WebGL; a stand-in is enough to see when it mounts.
vi.mock("./BackgroundScene", () => ({ default: () => <canvas data-testid="scene" /> }));
vi.mock("./use-webgl-enabled", () => ({ useWebGLEnabled: () => true }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("TechBackground", () => {
  it("keeps the WebGL scene out of the page load and mounts it on the first interaction", async () => {
    render(<TechBackground />);
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(screen.queryByTestId("scene")).not.toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new Event("pointermove"));
      await vi.runAllTimersAsync();
    });
    expect(screen.getByTestId("scene")).toBeInTheDocument();
  });

  it("mounts it anyway for visitors who never interact", async () => {
    render(<TechBackground />);
    await act(async () => vi.advanceTimersByTimeAsync(8000));
    expect(screen.getByTestId("scene")).toBeInTheDocument();
  });
});
