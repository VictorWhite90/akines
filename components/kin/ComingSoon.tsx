import type { Metadata } from "next";
import "./coming-soon.css";

/**
 * A page the product design has not designed yet: the design's placeholder (src/app-shell/Placeholder.tsx, `.ph`),
 * as `.soon` so it never clashes with the copy of `.ph` in the meeting styles. Eyebrow is the section, title the page.
 */
export default function ComingSoon({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <section className="soon">
      {eyebrow ? <p className="soon__eyebrow">{eyebrow}</p> : null}
      <h1 className="soon__title">{title}</h1>
      <p className="soon__text">Coming soon. This part of Akines is being designed; use the header and tabs to move around.</p>
    </section>
  );
}

/** Metadata title for a Coming soon page. */
export const soonTitle = (title: string) => `${title} · Akines`;

type SoonProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** The clicked thing's name, from ?item= (lib/soon.ts builds the link). */
async function itemOf(searchParams: SoonProps["searchParams"]) {
  const v = (await searchParams).item;
  const s = (Array.isArray(v) ? v[0] : v)?.replace(/\s+/g, " ").trim();
  return s ? s.slice(0, 120) : undefined;
}

/**
 * A Coming soon route: `const s = soonPage("Connect", "Rooms"); export default s.Page; export const generateMetadata = s.generateMetadata;`
 * Opened for one thing (?item=Evening Studio Hour), the page says what was clicked: the page's name moves up to the eyebrow
 * and the thing's name is the title, in the same placeholder layout.
 */
export function soonPage(eyebrow: string | undefined, title: string) {
  async function Page({ searchParams }: SoonProps) {
    const item = await itemOf(searchParams);
    return item ? <ComingSoon eyebrow={title} title={item} /> : <ComingSoon eyebrow={eyebrow} title={title} />;
  }
  async function generateMetadata({ searchParams }: SoonProps): Promise<Metadata> {
    return { title: soonTitle((await itemOf(searchParams)) ?? title) };
  }
  return { Page, generateMetadata };
}
