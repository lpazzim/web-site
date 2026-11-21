import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkedText } from "./LinkedText";

describe("LinkedText", () => {
  it("renders plain text without links unchanged", () => {
    const { container } = render(<LinkedText text="Plain text without any link." />);
    expect(container.textContent).toBe("Plain text without any link.");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("converts markdown links to safe external links", () => {
    render(
      <LinkedText text="Inspired by [Designed to Scale](https://designed-to-scale.vercel.app/) by [Dilum Sanjaya](https://x.com/DilumSanjaya)." />,
    );

    const projectLink = screen.getByRole("link", { name: "Designed to Scale" });
    expect(projectLink).toHaveAttribute("href", "https://designed-to-scale.vercel.app/");
    expect(projectLink).toHaveAttribute("target", "_blank");
    expect(projectLink).toHaveAttribute("rel", "noopener noreferrer");

    const authorLink = screen.getByRole("link", { name: "Dilum Sanjaya" });
    expect(authorLink).toHaveAttribute("href", "https://x.com/DilumSanjaya");
    expect(authorLink).toHaveAttribute("target", "_blank");
    expect(authorLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("ignores non-http schemes like javascript:", () => {
    const { container } = render(<LinkedText text="Click [evil](javascript:alert) here" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.textContent).toBe("Click evil here");
  });
});
