// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { NotionBlock } from "@/lib/blog";
import { NotionRenderer } from "./NotionRenderer";

// Pre-rendering runs in Node, without `window`. The output must match what the
// browser renders, or React discards the page during hydration.
describe("NotionRenderer without a DOM", () => {
  it("renders links the same way as in the browser", () => {
    const paragraph = {
      object: "block",
      id: "p1",
      type: "paragraph",
      has_children: false,
      paragraph: {
        color: "default",
        rich_text: [
          {
            type: "text",
            plain_text: "docs",
            href: "https://example.com/docs",
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
          },
        ],
      },
    } as unknown as NotionBlock;

    expect(typeof window).toBe("undefined");
    expect(renderToString(<NotionRenderer blocks={[paragraph]} />)).toContain('href="https://example.com/docs"');
  });
});
