import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { CaseStudy } from "@/content/types";
import { ProjectListItem } from "./ProjectListItem";

const project = {
  id: "demo",
  title: "Demo case",
  period: "2026",
  stack: ["React", "TypeScript", "Vite", "Node"],
  accent: "190 100% 55%",
} as CaseStudy;

describe("ProjectListItem", () => {
  it("links to the case, shows a zero-padded decorative index and at most three tags", () => {
    render(
      <MemoryRouter>
        <ProjectListItem project={project} index={3} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /demo case/i })).toHaveAttribute("href", "/work/demo");
    expect(screen.getByText("03")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.queryByText("Node")).not.toBeInTheDocument();
  });
});
