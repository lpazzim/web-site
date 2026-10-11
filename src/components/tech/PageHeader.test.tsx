import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";
import { SectionLabel } from "./SectionLabel";

describe("PageHeader", () => {
  it("renders the page's single h1 with its label and intro", () => {
    render(<PageHeader label="Selected Work" title="Projects" intro="What I built." />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText("Selected Work")).toBeInTheDocument();
    expect(screen.getByText("What I built.")).toBeInTheDocument();
  });

  it("omits the intro when there is none", () => {
    const { container } = render(<PageHeader label="Blog" title="Articles" />);
    expect(container.querySelector("p")).toBeNull();
  });
});

describe("SectionLabel without an index", () => {
  it("shows a decorative // marker instead of a number", () => {
    render(<SectionLabel>Blog</SectionLabel>);
    expect(screen.getByText("//")).toHaveAttribute("aria-hidden", "true");
  });
});
