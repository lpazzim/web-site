import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { RichTextItemResponse } from "@notionhq/client";
import type { NotionBlock } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

type ListBlock = Extract<NotionBlock, { type: "bulleted_list_item" | "numbered_list_item" }>;

// Only allow link protocols that cannot execute script. Relative links resolve
// against the site URL (not `window`), so pre-rendering and the browser agree.
function safeHref(href: string | null | undefined): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href, SITE_URL);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function colorStyle(color: string): CSSProperties | undefined {
  if (color === "default") return undefined;
  if (color.endsWith("_background")) {
    return { background: color.replace("_background", ""), padding: "0 .25em", borderRadius: "4px" };
  }
  return { color };
}

function RichSpan({ item }: { item: RichTextItemResponse }) {
  const { annotations } = item;
  let node: ReactNode = item.plain_text;
  if (annotations.code) node = <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{node}</code>;
  if (annotations.bold) node = <strong>{node}</strong>;
  if (annotations.italic) node = <em>{node}</em>;
  if (annotations.underline) node = <u>{node}</u>;
  if (annotations.strikethrough) node = <s>{node}</s>;

  const href = safeHref(item.href);
  if (href) {
    node = (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:opacity-80"
      >
        {node}
      </a>
    );
  }
  return <span style={colorStyle(annotations.color)}>{node}</span>;
}

function Rich({ text }: { text: RichTextItemResponse[] }) {
  return (
    <>
      {text.map((item, index) => (
        <RichSpan key={index} item={item} />
      ))}
    </>
  );
}

const plainText = (text: RichTextItemResponse[]) => text.map((t) => t.plain_text).join("");

function Children({ block, className = "mt-2 ml-4" }: { block: NotionBlock; className?: string }) {
  if (!block.children?.length) return null;
  return <div className={className}>{renderBlocks(block.children)}</div>;
}

function List({ items }: { items: ListBlock[] }) {
  const ordered = items[0].type === "numbered_list_item";
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`${ordered ? "list-decimal" : "list-disc"} pl-6 my-4 space-y-2`}>
      {items.map((item) => (
        <li key={item.id} className="leading-relaxed text-muted-foreground">
          <Rich
            text={
              item.type === "numbered_list_item" ? item.numbered_list_item.rich_text : item.bulleted_list_item.rich_text
            }
          />
          <Children block={item} />
        </li>
      ))}
    </Tag>
  );
}

function Block({ block }: { block: NotionBlock }): ReactNode {
  switch (block.type) {
    case "heading_1":
      return (
        <h2 className="text-3xl md:text-4xl font-serif leading-tight mt-12 mb-4">
          <Rich text={block.heading_1.rich_text} />
        </h2>
      );
    case "heading_2":
      return (
        <h3 className="text-2xl md:text-3xl font-serif leading-snug mt-10 mb-3">
          <Rich text={block.heading_2.rich_text} />
        </h3>
      );
    case "heading_3":
      return (
        <h4 className="text-xl md:text-2xl font-serif leading-snug mt-8 mb-2">
          <Rich text={block.heading_3.rich_text} />
        </h4>
      );
    case "paragraph":
      return (
        <>
          <p className="leading-relaxed my-4 text-muted-foreground text-lg">
            <Rich text={block.paragraph.rich_text} />
          </p>
          <Children block={block} />
        </>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary pl-6 italic my-6 text-muted-foreground text-lg">
          <Rich text={block.quote.rich_text} />
          <Children block={block} />
        </blockquote>
      );
    case "divider":
      return <hr className="my-8 border-border" />;
    case "to_do":
      return (
        <div className="flex items-start gap-3 my-3">
          <input
            type="checkbox"
            disabled
            defaultChecked={block.to_do.checked}
            className="mt-1 h-4 w-4 accent-primary"
            aria-label={plainText(block.to_do.rich_text)}
          />
          <div className="text-muted-foreground">
            <Rich text={block.to_do.rich_text} />
          </div>
        </div>
      );
    case "toggle":
      return (
        <details className="my-4">
          <summary className="cursor-pointer font-medium hover:text-primary transition-colors">
            <Rich text={block.toggle.rich_text} />
          </summary>
          <Children block={block} />
        </details>
      );
    case "callout":
      return (
        <div className="my-6 p-4 border border-border bg-muted/30 flex items-start gap-3">
          {block.callout.icon?.type === "emoji" && (
            <span className="text-xl shrink-0" aria-hidden="true">
              {block.callout.icon.emoji}
            </span>
          )}
          <div className="flex-1 min-w-0 text-muted-foreground">
            <Rich text={block.callout.rich_text} />
            <Children block={block} className="mt-2" />
          </div>
        </div>
      );
    case "code":
      return (
        <pre className="overflow-x-auto p-4 text-sm bg-muted border border-border my-6 font-mono">
          <code className="block" data-language={block.code.language}>
            {plainText(block.code.rich_text)}
          </code>
        </pre>
      );
    case "image": {
      const { image } = block;
      const src = image.type === "external" ? image.external.url : image.type === "file" ? image.file.url : undefined;
      const caption = plainText(image.caption);
      if (!src) return null;
      return (
        <figure className="my-8">
          <img src={src} alt={caption} loading="lazy" decoding="async" className="w-full h-auto" />
          {caption && <figcaption className="mt-3 text-sm text-center text-muted-foreground">{caption}</figcaption>}
        </figure>
      );
    }
    case "video": {
      const { video } = block;
      const src = video.type === "external" ? video.external.url : video.type === "file" ? video.file.url : undefined;
      if (!src) return null;
      return (
        <div className="my-8 aspect-video">
          <video src={src} controls preload="metadata" className="w-full h-full" />
        </div>
      );
    }
    case "embed": {
      const src = safeHref(block.embed.url);
      if (!src) return null;
      return (
        <div className="my-8">
          <iframe
            src={src}
            title={plainText(block.embed.caption) || new URL(src).hostname}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
            className="w-full aspect-video border-0"
            allowFullScreen
          />
        </div>
      );
    }
    case "bookmark": {
      const href = safeHref(block.bookmark.url);
      if (!href) return null;
      const caption = plainText(block.bookmark.caption);
      return (
        <figure className="my-6">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-border p-4 hover:bg-muted/50 transition"
          >
            <div className="text-foreground truncate">{new URL(href).hostname.replace(/^www\./, "")}</div>
            <div className="text-sm text-muted-foreground break-all">{href}</div>
          </a>
          {caption && <figcaption className="mt-1 text-xs text-muted-foreground">{caption}</figcaption>}
        </figure>
      );
    }
    case "table": {
      const rows = (block.children ?? []).filter((row) => row.type === "table_row");
      const hasHeader = block.table.has_column_header;
      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {rows.map((row, rowIndex) => {
                const CellTag = hasHeader && rowIndex === 0 ? "th" : "td";
                return (
                  <tr key={row.id} className={CellTag === "th" ? "bg-muted" : undefined}>
                    {row.table_row.cells.map((cell, cellIndex) => (
                      <CellTag key={cellIndex} className="border border-border px-4 py-2 text-left">
                        <Rich text={cell} />
                      </CellTag>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    default:
      return null;
  }
}

const isListBlock = (block: NotionBlock): block is ListBlock =>
  block.type === "bulleted_list_item" || block.type === "numbered_list_item";

// Notion returns list items as siblings; group consecutive items of the same
// kind into a single <ul>/<ol>.
function renderBlocks(blocks: NotionBlock[]): ReactNode[] {
  const out: ReactNode[] = [];
  for (let i = 0; i < blocks.length;) {
    const block = blocks[i];
    if (isListBlock(block)) {
      const items: ListBlock[] = [];
      while (i < blocks.length) {
        const next = blocks[i];
        if (!isListBlock(next) || next.type !== block.type) break;
        items.push(next);
        i++;
      }
      out.push(<List key={block.id} items={items} />);
      continue;
    }
    out.push(
      <Fragment key={block.id}>
        <Block block={block} />
      </Fragment>,
    );
    i++;
  }
  return out;
}

export function NotionRenderer({ blocks }: { blocks: NotionBlock[] }) {
  if (blocks.length === 0) return null;
  return <div className="notion-content max-w-none">{renderBlocks(blocks)}</div>;
}
