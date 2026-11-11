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
