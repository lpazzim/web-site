import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CaseLinks } from "./CaseLinks";

// The test setup has no i18n resources, so links are named by their translation keys.
describe("CaseLinks", () => {
  it("renders the live site as the solid call to action and the repo as the secondary one", () => {
    render(<CaseLinks links={{ live: "https://demo.example", repo: "https://github.com/demo/repo" }} />);

    const live = screen.getByRole("link", { name: "project.liveSite" });
    const repo = screen.getByRole("link", { name: "project.sourceCode" });

    expect(live).toHaveAttribute("href", "https://demo.example");
    expect(live).toHaveClass("bg-primary");
    expect(repo).toHaveAttribute("href", "https://github.com/demo/repo");
    expect(repo).not.toHaveClass("bg-primary");
    for (const link of [live, repo]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders only the links the case has", () => {
    render(<CaseLinks links={{ repo: "https://github.com/demo/repo" }} />);
    expect(screen.queryByRole("link", { name: "project.liveSite" })).toBeNull();
    expect(screen.getByRole("link", { name: "project.sourceCode" })).toBeInTheDocument();
  });

  it("renders nothing without links", () => {
    const { container } = render(<CaseLinks links={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
