import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NotionBlock } from "@/lib/blog";
import { NotionRenderer } from "./NotionRenderer";

// Minimal fixtures shaped like Notion API responses; only the fields the
// renderer reads are filled in.
const text = (content: string, overrides: { href?: string; bold?: boolean } = {}) => ({
  type: "text",
  plain_text: content,
  href: overrides.href ?? null,
  text: { content, link: overrides.href ? { url: overrides.href } : null },
  annotations: {
    bold: overrides.bold ?? false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: "default",
  },
});

let nextId = 0;
const block = (type: string, data: object, children?: NotionBlock[]) =>
  ({
    object: "block",
    id: `b${nextId++}`,
    type,
    has_children: Boolean(children),
    [type]: data,
    children,
  }) as unknown as NotionBlock;

const paragraph = (...rich: ReturnType<typeof text>[]) => block("paragraph", { rich_text: rich, color: "default" });
const bullet = (content: string) => block("bulleted_list_item", { rich_text: [text(content)], color: "default" });
const numbered = (content: string) => block("numbered_list_item", { rich_text: [text(content)], color: "default" });

describe("NotionRenderer", () => {
  it("renders nothing for an empty page", () => {
    const { container } = render(<NotionRenderer blocks={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders headings one level below the page title", () => {
    render(<NotionRenderer blocks={[block("heading_1", { rich_text: [text("Intro")] })]} />);
    expect(screen.getByRole("heading", { level: 2, name: "Intro" })).toBeInTheDocument();
  });

  it("applies rich text annotations", () => {
    render(<NotionRenderer blocks={[paragraph(text("plain "), text("bold", { bold: true }))]} />);
    expect(screen.getByText("bold").closest("strong")).not.toBeNull();
  });

  it("groups consecutive list items of the same kind", () => {
    render(<NotionRenderer blocks={[bullet("a"), bullet("b"), numbered("1"), numbered("2"), bullet("c")]} />);
    const lists = screen.getAllByRole("list");
    expect(lists.map((list) => [list.tagName, within(list).getAllByRole("listitem").length])).toEqual([
      ["UL", 2],
      ["OL", 2],
      ["UL", 1],
    ]);
  });

  it("renders nested children without putting blocks inside <p>", () => {
    const parent = block("paragraph", { rich_text: [text("parent")] }, [paragraph(text("child"))]);
    render(<NotionRenderer blocks={[parent]} />);
    expect(screen.getByText("child").closest("p")?.textContent).toBe("child");
  });

  it("opens safe links in a new tab", () => {
    render(<NotionRenderer blocks={[paragraph(text("site", { href: "https://example.com" }))]} />);
    const link = screen.getByRole("link", { name: "site" });
    expect(link).toHaveAttribute("href", "https://example.com/");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("drops links with unsafe protocols", () => {
    render(<NotionRenderer blocks={[paragraph(text("click", { href: "javascript:alert(1)" }))]} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("click")).toBeInTheDocument();
  });

  it("renders tables with a header row", () => {
    const row = (...cells: string[]) => block("table_row", { cells: cells.map((c) => [text(c)]) });
    const table = block("table", { table_width: 2, has_column_header: true, has_row_header: false }, [
      row("Name", "Role"),
      row("Lucas", "Frontend"),
    ]);
    render(<NotionRenderer blocks={[table]} />);
    expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Name", "Role"]);
    expect(screen.getAllByRole("cell").map((td) => td.textContent)).toEqual(["Lucas", "Frontend"]);
  });

  it("lazy-loads images and uses the caption as alt text", () => {
    const image = block("image", {
      type: "external",
      external: { url: "https://example.com/a.png" },
      caption: [text("A chart")],
    });
    render(<NotionRenderer blocks={[image]} />);
    const img = screen.getByRole("img", { name: "A chart" });
    expect(img).toHaveAttribute("loading", "lazy");
  });
});
