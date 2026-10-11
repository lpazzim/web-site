import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HudFrame } from "./HudFrame";
import { SectionLabel } from "./SectionLabel";

describe("SectionLabel", () => {
  it("zero-pads the index and keeps the label as readable text", () => {
    const { container } = render(<SectionLabel index={3}>Selected Work</SectionLabel>);

    expect(screen.getByText("Selected Work")).toBeInTheDocument();
    expect(container).toHaveTextContent("03");
    // The number is decorative: it is hidden from assistive technology.
    expect(screen.getByText("03")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("HudFrame", () => {
  it("renders its children inside four decorative corners", () => {
    const { container } = render(<HudFrame>content</HudFrame>);

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(4);
  });
});
