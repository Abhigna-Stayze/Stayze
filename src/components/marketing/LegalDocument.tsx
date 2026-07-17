import Link from "next/link";

/**
 * A legal / policy document, laid out for reading.
 *
 * One component behind both Privacy and Terms so the two never drift: a titled
 * masthead with a "last updated" line, an anchored table of contents (sticky
 * beside the text on desktop, a plain list on mobile — pure anchor links, no
 * client JS), then the numbered sections. Content is data (`LegalSection[]`),
 * so a clause change is a text edit, not a layout one.
 */

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-bark/90 mt-3 leading-relaxed">{block.text}</p>;
    case "ul":
      return (
        <ul className="text-bark/90 marker:text-clay mt-3 flex list-disc flex-col gap-2 pl-5 leading-relaxed">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="text-bark/90 marker:text-clay mt-3 flex list-decimal flex-col gap-2 pl-5 leading-relaxed marker:font-medium">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      );
    default:
      return null;
  }
}

export function LegalDocument({
  title,
  updatedOn,
  intro,
  sections,
}: {
  title: string;
  updatedOn: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="container-page py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-clay">Legal</p>
        <h1 className="display text-bark mt-3">{title}</h1>
        <p className="text-muted-ink mt-3 text-sm">
          Last updated <span className="num">{updatedOn}</span>
        </p>
        <p className="text-muted-ink mt-5 leading-relaxed">{intro}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
        {/* Anchored contents. */}
        <nav
          aria-label="On this page"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <p className="eyebrow text-muted-ink">On this page</p>
          <ol className="mt-3 flex flex-col gap-2">
            {sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted-ink hover:text-clay focus-visible:ring-ring flex gap-2 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="num text-bark/40">{i + 1}.</span>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-2xl min-w-0">
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className={i === 0 ? "scroll-mt-24" : "mt-10 scroll-mt-24"}
            >
              <h2 className="heading-3 text-bark flex gap-2">
                <span className="num text-clay">{i + 1}.</span>
                {section.heading}
              </h2>
              {section.blocks.map((block, j) => (
                <Block key={j} block={block} />
              ))}
            </section>
          ))}
        </div>
      </div>

      <p className="text-muted-ink border-border mt-12 border-t pt-6 text-sm">
        Questions about this policy? {""}
        <Link
          href="/contact"
          className="text-clay underline underline-offset-2"
        >
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
