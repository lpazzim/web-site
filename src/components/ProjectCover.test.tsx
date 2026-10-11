import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CaseStudy } from "@/content/types";
import { ProjectCover } from "./ProjectCover";

const project = {
  id: "demo",
  title: "Demo case",
  period: "2026",
  stack: ["React"],
  accent: "190 100% 55%",
} as CaseStudy;

describe("ProjectCover", () => {
  it("draws generative art labelled with the project title", () => {
    const { container } = render(<ProjectCover project={project} />);

    expect(screen.getByRole("img", { name: "Demo case" })).toBeInTheDocument();
    // The artwork itself is decorative; the cover exposes a single image role.
    expect(container.querySelector('svg[aria-hidden="true"] path')).not.toBeNull();
  });

  it("renders the same markup every time so hydration cannot mismatch", () => {
    const first = render(<ProjectCover project={project} />).container.innerHTML;
    const second = render(<ProjectCover project={project} />).container.innerHTML;
    expect(second).toBe(first);
  });

  it("uses the screenshot when the case has one", () => {
    render(<ProjectCover project={{ ...project, cover: "/images/demo.png" }} />);
    expect(screen.getByRole("img", { name: "Demo case" })).toHaveAttribute("src", "/images/demo.png");
  });
});
