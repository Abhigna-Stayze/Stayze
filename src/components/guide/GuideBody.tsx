import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import { parseBlocks, type MarkdownBlock } from "@/lib/markdown";

/**
 * GuideBody — renders a guide's Markdown body as branded, readable prose.
 *
 * A Server Component: parsing happens in `parseBlocks` (pure) and each block
 * becomes a styled React element here, so **no client JavaScript ships** and
 * there is no `dangerouslySetInnerHTML` — inline emphasis and links are turned
 * into real React nodes, not an HTML string. The measure is capped for
 * readability and the vertical rhythm is set once, in one place.
 */

/** Inline: **bold**, *italic*, `code`, [text](url). Content is trusted (ours). */
function renderInline(text: string, keyPrefix = ""): ReactNode[] {
  const pattern =
    /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;

    if (match[2] !== undefined) {
      nodes.push(
        <strong key={key} className="text-bark font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[4] !== undefined) {
      nodes.push(<em key={key}>{match[4]}</em>);
    } else if (match[6] !== undefined) {
      nodes.push(
        <code
          key={key}
          className="bg-paper-2 text-bark rounded px-1.5 py-0.5 text-[0.9em]"
        >
          {match[6]}
        </code>,
      );
    } else if (match[8] !== undefined) {
      const href = match[9];
      const external = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={key}
          href={href}
          className="text-clay decoration-clay/40 hover:decoration-clay underline underline-offset-2"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {match[8]}
        </a>,
      );
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function Block({ block, index }: { block: MarkdownBlock; index: number }) {
  switch (block.type) {
    case "heading": {
      const Tag = block.level === 3 ? "h3" : "h2";
      return (
        <Tag
          className={
            block.level === 3
              ? "heading-3 text-bark mt-8 scroll-mt-24"
              : "heading-2 text-bark mt-10 scroll-mt-24"
          }
        >
          {renderInline(block.text, `h${index}`)}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="text-bark/90 mt-4 leading-relaxed">
          {renderInline(block.text, `p${index}`)}
        </p>
      );
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`text-bark/90 marker:text-clay mt-4 flex flex-col gap-2 ${
            block.ordered ? "list-decimal" : "list-disc"
          } pl-5 leading-relaxed`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {renderInline(item, `li${index}-${i}`)}
            </li>
          ))}
        </Tag>
      );
    }
    case "callout":
      return (
        <div className="border-clay/30 bg-paper-2/50 mt-6 flex gap-3 rounded-lg border-l-2 p-4">
          <Quote className="text-clay/60 mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-bark/90 leading-relaxed italic">
            {renderInline(block.text, `q${index}`)}
          </p>
        </div>
      );
    case "image":
      return (
        <figure className="mt-6 overflow-hidden rounded-lg">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          {block.alt && (
            <figcaption className="text-muted-ink mt-2 text-center text-xs">
              {block.alt}
            </figcaption>
          )}
        </figure>
      );
    case "hr":
      return <hr className="border-border/70 mt-8" />;
    default:
      return null;
  }
}

export function GuideBody({ body }: { body: string }) {
  const blocks = parseBlocks(body);
  return (
    <div className="max-w-2xl text-base">
      {blocks.map((block, i) => (
        <Fragment key={i}>
          <Block block={block} index={i} />
        </Fragment>
      ))}
    </div>
  );
}
