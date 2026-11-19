import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { projects } from "@/content/projects";
import { FeaturedCarousel } from "./FeaturedCarousel";

const featured = projects.filter((p) => p.featured && !p.draft);
let played: string[] = [];

beforeEach(() => {
  played = [];
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  // Every clip reports itself on screen; only the card in focus may play.
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {}
      observe() {
        this.callback([{ isIntersecting: true }]);
      }
      disconnect() {}
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    played.push(this.getAttribute("src") ?? "");
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockReturnValue(undefined);
  vi.spyOn(window, "scrollTo").mockReturnValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderCarousel = (list = featured) =>
  render(
    <MemoryRouter>
      <FeaturedCarousel projects={list} />
    </MemoryRouter>,
  );

describe("FeaturedCarousel", () => {
  it("links every featured case, starting with the first one in focus", () => {
    renderCarousel();

    for (const project of featured) {
      expect(screen.getByTestId(`card-project-${project.id}`)).toHaveAttribute("href", `/work/${project.id}`);
    }
    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("plays only the clip of the card in focus", () => {
    const withClips = featured.filter((p) => p.video);
    renderCarousel(withClips);

    expect(played).toEqual([withClips[0].video?.src]);
  });

  it("plays no clip while a screenshot card is in focus", () => {
    const [screenshot] = featured.filter((p) => p.cover && !p.video);
    renderCarousel([screenshot, ...featured.filter((p) => p.video)]);

    expect(played).toEqual([]);
  });

  it("turns a card into focus when it receives keyboard focus", () => {
    renderCarousel();

    const card = screen.getByTestId(`card-project-${featured[2].id}`);
    // jsdom has no keyboard modality, so stand in for :focus-visible.
    vi.spyOn(card, "matches").mockImplementation((selector) => selector === ":focus-visible");
    fireEvent.focus(card);
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it("leaves the page where it is when a card is focused by a click", () => {
    renderCarousel();

    fireEvent.focus(screen.getByTestId(`card-project-${featured[2].id}`));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
