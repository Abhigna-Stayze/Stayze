/**
 * A small, self-contained Markdown block parser.
 *
 * Travel-guide bodies are **trusted authored content** from our own database
 * (Markdown, written by the Stayze team), not user input — so rather than pull
 * in a full Markdown pipeline and a sanitizer, this parses the block structure
 * we actually use into a typed list the renderer turns into branded React
 * elements. Nothing here produces HTML strings, so there is no
 * `dangerouslySetInnerHTML` and no injection surface; inline emphasis and links
 * are tokenised into React nodes by the renderer.
 *
 * A pure module — no React, no data access — so it stays testable and the
 * renderer (`GuideBody`) is a plain Server Component that ships no client JS.
 *
 * Supported, because these are what guide bodies use (and the common set a new
 * guide is likely to reach for): `##`/`###` headings, paragraphs, `-`/`*` and
 * `1.` lists, `>` callouts, `![alt](src)` images, and `---` rules. Inline:
 * `**bold**`, `*italic*`, `` `code` `` and `[text](url)`. Anything unrecognised
 * falls through as paragraph text, so an unknown line is shown, never dropped.
 */

export type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "callout"; text: string }
  | { type: "image"; src: string; alt: string }
  | { type: "hr" };

const HEADING = /^(#{2,3})\s+(.*)$/;
const UNORDERED = /^[-*]\s+(.*)$/;
const ORDERED = /^\d+\.\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const IMAGE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const RULE = /^([-*_])\1{2,}$/;

export function parseBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];

  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      continue;
    }

    if (RULE.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: "hr" });
      continue;
    }

    const image = trimmed.match(IMAGE);
    if (image) {
      flushParagraph();
      blocks.push({ type: "image", alt: image[1], src: image[2] });
      continue;
    }

    const heading = trimmed.match(HEADING);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: heading[1].length === 3 ? 3 : 2,
        text: heading[2].trim(),
      });
      continue;
    }

    // A run of quote lines becomes one callout.
    if (QUOTE.test(trimmed)) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const q = lines[i].trim().match(QUOTE);
        if (!q) break;
        quoteLines.push(q[1]);
        i++;
      }
      i--; // step back; the for-loop will advance
      blocks.push({ type: "callout", text: quoteLines.join(" ").trim() });
      continue;
    }

    // A run of like-marked list items becomes one list.
    const isUnordered = UNORDERED.test(trimmed);
    const isOrdered = ORDERED.test(trimmed);
    if (isUnordered || isOrdered) {
      flushParagraph();
      const pattern = isOrdered ? ORDERED : UNORDERED;
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(pattern);
        if (!m) break;
        items.push(m[1].trim());
        i++;
      }
      i--;
      blocks.push({ type: "list", ordered: isOrdered, items });
      continue;
    }

    // Otherwise it's paragraph prose; consecutive lines wrap into one.
    paragraph.push(trimmed);
  }

  flushParagraph();
  return blocks;
}
