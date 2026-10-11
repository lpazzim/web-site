import { describe, expect, it } from "vitest";
import type { BlogPost, NotionBlock } from "./blog";
import { postDescription } from "./blog";

const post = (description = ""): BlogPost => ({ id: "1", title: "T", slug: "t", description, date: "" });
const paragraph = (text: string) =>
  ({ type: "paragraph", paragraph: { rich_text: text ? [{ plain_text: text }] : [] } }) as unknown as NotionBlock;
const heading = (text: string) =>
  ({ type: "heading_1", heading_1: { rich_text: [{ plain_text: text }] } }) as unknown as NotionBlock;

describe("postDescription", () => {
  it("prefers the description written in Notion", () => {
    expect(postDescription(post("Written summary"), [paragraph("Body")])).toBe("Written summary");
  });

  it("falls back to the first non-empty paragraph, skipping headings", () => {
    expect(postDescription(post(), [heading("Title"), paragraph(""), paragraph("Opening line.")])).toBe(
      "Opening line.",
    );
  });

  it("cuts long paragraphs at a word boundary", () => {
    const long = `${"word ".repeat(60)}end`;
    const description = postDescription(post(), [paragraph(long)]);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).toMatch(/word…$/);
  });

  it("returns an empty string when there is no text", () => {
    expect(postDescription(post(), [heading("Only a heading")])).toBe("");
  });
});
