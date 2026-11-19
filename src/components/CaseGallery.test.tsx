import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Screenshot } from "@/content/types";
import { CaseGallery } from "./CaseGallery";

vi.mock("@/i18n/useLocale", () => ({ useLocale: () => "pt-BR" }));

const shot = (name: string): Screenshot => ({
  src: `/images/projects/demo/${name}.webp`,
  width: 1920,
  height: 1080,
  title: { en: `${name} screen`, "pt-BR": `Tela ${name}` },
  caption: { en: `The ${name}.`, "pt-BR": `A ${name}.` },
});

describe("CaseGallery", () => {
  it("labels each screenshot in the active language and reserves its size", () => {
    render(<CaseGallery screenshots={[shot("menu"), shot("loja")]} />);

    const image = screen.getByRole("img", { name: "Tela menu" });
    expect(image).toHaveAttribute("src", "/images/projects/demo/menu.webp");
    expect(image).toHaveAttribute("width", "1920");
    expect(image).toHaveAttribute("height", "1080");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(screen.getByText("A loja.")).toBeInTheDocument();
  });

  it("lets the first screenshot span both columns only when the count is odd", () => {
    const { rerender } = render(<CaseGallery screenshots={[shot("a"), shot("b"), shot("c")]} />);
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("md:col-span-2");

    rerender(<CaseGallery screenshots={[shot("a"), shot("b")]} />);
    expect(screen.getAllByRole("listitem")[0]).not.toHaveClass("md:col-span-2");
  });
});
