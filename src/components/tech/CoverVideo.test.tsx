import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CoverVideo } from "./CoverVideo";

const video = { src: "/videos/demo.mp4", poster: "/videos/demo.jpg" };

let reduceMotion = false;
let reportVisibility: (visible: boolean) => void = () => {};

beforeEach(() => {
  reduceMotion = false;
  reportVisibility = () => {};
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: reduceMotion, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        reportVisibility = (visible) => callback([{ isIntersecting: visible }]);
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockReturnValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CoverVideo", () => {
  it("renders a decorative, muted clip that does not autoplay from the markup", () => {
    const { container } = render(<CoverVideo video={video} />);
    const element = container.querySelector("video")!;

    expect(element).toHaveAttribute("src", video.src);
    expect(element).toHaveAttribute("poster", video.poster);
    expect(element).toHaveAttribute("aria-hidden", "true");
    expect(element).not.toHaveAttribute("autoplay");
    expect(element.muted).toBe(true);
  });

  it("plays only while on screen", () => {
    render(<CoverVideo video={video} />);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    reportVisibility(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    reportVisibility(false);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it("keeps the poster when the browser's data saver is on", () => {
    vi.stubGlobal("navigator", { ...navigator, connection: { saveData: true } });
    render(<CoverVideo video={video} />);

    reportVisibility(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("keeps the poster when the visitor prefers reduced motion", () => {
    reduceMotion = true;
    render(<CoverVideo video={video} />);

    reportVisibility(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  describe("on hover", () => {
    const card = () =>
      render(
        <a href="/work/demo">
          Demo
          <CoverVideo video={video} play="hover" />
        </a>,
      );

    it("stays on the poster while merely on screen", () => {
      card();
      reportVisibility(true);
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });

    it("plays while the pointer is over its card and stops when it leaves", () => {
      card();
      const link = screen.getByRole("link", { name: "Demo" });

      fireEvent.pointerEnter(link);
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

      fireEvent.pointerLeave(link);
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    });

    it("plays while its card has keyboard focus", () => {
      card();
      fireEvent.focusIn(screen.getByRole("link", { name: "Demo" }));
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    });

    it("respects reduced motion", () => {
      reduceMotion = true;
      card();
      fireEvent.pointerEnter(screen.getByRole("link", { name: "Demo" }));
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });
  });
});
