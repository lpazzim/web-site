import React from "react";

type RichText = {
  plain_text: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    color?: string;
  };
}[];

function spanFor(rt: RichText[number]) {
  const style: React.CSSProperties = {};
  const color = rt.annotations?.color;
  if (color && color !== "default") {
    if (color.endsWith("_background")) {
      style.background = color.replace("_background", "").replaceAll("_", "-");
      style.padding = "0 .25em";
      style.borderRadius = "4px";
    } else {
      style.color = color.replaceAll("_", "-");
    }
  }
  let el: React.ReactNode = rt.plain_text;
  if (rt.annotations?.code)
    el = (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        {el}
      </code>
    );
  if (rt.annotations?.bold) el = <strong>{el}</strong>;
  if (rt.annotations?.italic) el = <em>{el}</em>;
  if (rt.annotations?.underline) el = <u>{el}</u>;
  if (rt.annotations?.strikethrough) el = <s>{el}</s>;
  if (rt.href)
    el = (
      <a
        href={rt.href}
        target="_blank"
        rel="noreferrer"
        className="text-primary underline underline-offset-2 hover:opacity-80"
      >
        {el}
      </a>
    );
  return <span style={style}>{el}</span>;
}

function Rich({ rich_text }: { rich_text: RichText }) {
  return (
    <>
      {rich_text?.map((t, i) => (
        <React.Fragment key={i}>{spanFor(t)}</React.Fragment>
      ))}
    </>
  );
}

export function NotionRenderer({ blocks }: { blocks: any[] }) {
  const renderBlocks = (nodes: any[]): React.ReactNode[] => {
    if (!nodes || !Array.isArray(nodes)) return [];
    
    const out: React.ReactNode[] = [];
    let i = 0;

    while (i < nodes.length) {
      const block = nodes[i];
      const t = block.type;
      const b = block[t];

      if (t === "numbered_list_item") {
        const items: any[] = [];
        while (i < nodes.length && nodes[i].type === "numbered_list_item") {
          items.push(nodes[i]);
          i++;
        }
        out.push(
          <ol
            key={`ol-${items[0].id}`}
            className="list-decimal pl-6 my-4 space-y-2"
          >
            {items.map((item) => {
              const bi = item.numbered_list_item || item[item.type];
              return (
                <li key={item.id} className="leading-relaxed text-muted-foreground">
                  <Rich rich_text={bi.rich_text} />
                  {item.children?.length ? (
                    <div className="mt-2 ml-4">{renderBlocks(item.children)}</div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        );
        continue;
      }

      if (t === "bulleted_list_item") {
        const items: any[] = [];
        while (i < nodes.length && nodes[i].type === "bulleted_list_item") {
          items.push(nodes[i]);
          i++;
        }
        out.push(
          <ul
            key={`ul-${items[0].id}`}
            className="list-disc pl-6 my-4 space-y-2"
          >
            {items.map((item) => {
              const bi = item.bulleted_list_item || item[item.type];
              return (
                <li key={item.id} className="leading-relaxed text-muted-foreground">
                  <Rich rich_text={bi.rich_text} />
                  {item.children?.length ? (
                    <div className="mt-2 ml-4">{renderBlocks(item.children)}</div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        );
        continue;
      }

      i++;

      switch (t) {
        case "heading_1":
          out.push(
            <h1
              key={block.id}
              className="text-3xl md:text-4xl font-serif leading-tight mt-12 mb-4"
            >
              <Rich rich_text={b.rich_text} />
            </h1>
          );
          break;

        case "heading_2":
          out.push(
            <h2
              key={block.id}
              className="text-2xl md:text-3xl font-serif leading-snug mt-10 mb-3"
            >
              <Rich rich_text={b.rich_text} />
            </h2>
          );
          break;

        case "heading_3":
          out.push(
            <h3
              key={block.id}
              className="text-xl md:text-2xl font-serif leading-snug mt-8 mb-2"
            >
              <Rich rich_text={b.rich_text} />
            </h3>
          );
          break;

        case "paragraph":
          out.push(
            <p
              key={block.id}
              className="leading-relaxed my-4 text-muted-foreground text-lg"
            >
              <Rich rich_text={b.rich_text} />
              {block.children?.length ? (
                <div className="mt-2 ml-4">{renderBlocks(block.children)}</div>
              ) : null}
            </p>
          );
          break;

        case "quote":
          out.push(
            <blockquote
              key={block.id}
              className="border-l-4 border-primary pl-6 italic my-6 text-muted-foreground text-lg"
            >
              <Rich rich_text={b.rich_text} />
            </blockquote>
          );
          break;

        case "divider":
          out.push(
            <hr key={block.id} className="my-8 border-border" />
          );
          break;

        case "to_do":
          out.push(
            <div
              key={block.id}
              className="flex items-start gap-3 my-3"
            >
              <input
                type="checkbox"
                disabled
                defaultChecked={b.checked}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <div className="text-muted-foreground">
                <Rich rich_text={b.rich_text} />
              </div>
            </div>
          );
          break;

        case "toggle":
          out.push(
            <details key={block.id} className="my-4">
              <summary className="cursor-pointer font-medium hover:text-primary transition-colors">
                <Rich rich_text={b.rich_text} />
              </summary>
              {block.children?.length ? (
                <div className="ml-4 mt-2">{renderBlocks(block.children)}</div>
              ) : null}
            </details>
          );
          break;

        case "callout":
          out.push(
            <div
              key={block.id}
              className="my-6 p-4 rounded-none border border-border bg-muted/30 flex items-start gap-3"
            >
              {b.icon?.emoji && (
                <span className="text-xl shrink-0">{b.icon.emoji}</span>
              )}
              <div className="flex-1 min-w-0 text-muted-foreground">
                <Rich rich_text={b.rich_text} />
              </div>
            </div>
          );
          break;

        case "code":
          out.push(
            <pre
              key={block.id}
              className="overflow-x-auto rounded-none p-4 text-sm bg-muted border border-border my-6 font-mono"
            >
              <code className="block">
                {b.rich_text?.map((r: any) => r.plain_text).join("")}
              </code>
            </pre>
          );
          break;

        case "image": {
          const src =
            b.type === "external" ? b.external?.url : b.file?.url;
          const caption = b.caption?.[0]?.plain_text ?? "";
          out.push(
            <figure key={block.id} className="my-8">
              <img
                src={src}
                alt={caption}
                className="w-full h-auto"
              />
              {caption && (
                <figcaption className="mt-3 text-sm text-center text-muted-foreground">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
          break;
        }

        case "video": {
          const src =
            b.type === "external" ? b.external?.url : b.file?.url;
          out.push(
            <div key={block.id} className="my-8 aspect-video">
              <video
                src={src}
                controls
                className="w-full h-full"
              />
            </div>
          );
          break;
        }

        case "embed": {
          out.push(
            <div key={block.id} className="my-8">
              <iframe
                src={b.url}
                className="w-full aspect-video border-0"
                allowFullScreen
              />
            </div>
          );
          break;
        }

        case "bookmark": {
          const url: string = b.url;
          const caption = b.caption?.[0]?.plain_text ?? "";
          try {
            const u = new URL(url);
            const hostname = u.hostname.replace(/^www\./, "");
            out.push(
              <figure key={block.id} className="my-6">
                <a
                  href={u.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-4 border border-border p-4 hover:bg-muted/50 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground truncate">{hostname}</div>
                    <div className="text-sm text-muted-foreground break-all">
                      {u.href}
                    </div>
                  </div>
                </a>
                {caption && (
                  <figcaption className="mt-1 text-xs text-muted-foreground">
                    {caption}
                  </figcaption>
                )}
              </figure>
            );
          } catch {
            out.push(
              <a
                key={block.id}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block break-all border border-border p-4 my-4 hover:bg-muted/50"
              >
                {url}
              </a>
            );
          }
          break;
        }

        case "table": {
          out.push(
            <div key={block.id} className="my-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {block.children?.map((row: any, rowIndex: number) => (
                    <tr key={row.id} className={rowIndex === 0 ? "bg-muted" : ""}>
                      {row.table_row?.cells?.map((cell: any, cellIndex: number) => {
                        const CellTag = rowIndex === 0 ? "th" : "td";
                        return (
                          <CellTag
                            key={cellIndex}
                            className="border border-border px-4 py-2 text-left"
                          >
                            <Rich rich_text={cell} />
                          </CellTag>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          break;
        }

        default:
          break;
      }
    }

    return out;
  };

  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <article className="notion-content max-w-none">
      {renderBlocks(blocks)}
    </article>
  );
}
