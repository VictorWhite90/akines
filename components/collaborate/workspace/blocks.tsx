"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { IconUpRight } from "./parts";

/*
 * Small pieces the design's workspace pages share (classes cw-* and cd-* in ../styles/pages.css, workspace.css):
 * metric tiles, cards and page bands (the text link, back link and avatars are in ./parts). Used by Team and Files.
 */

/** Scrolls to a section, smoothly unless the member asked for less motion. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

export function Metrics({ children }: { children: React.ReactNode }) {
  const n = (Array.isArray(children) ? children.filter(Boolean).length : 1);
  return <div className="cd-metrics" style={{ "--cd-cols": n } as React.CSSProperties}>{children}</div>;
}

/** A metric tile: a link, a scroll-to button, or plain. */
export function Metric({ label, value, caption, dot, href, scrollTo }: { label: string; value: React.ReactNode; caption?: React.ReactNode; dot?: boolean; href?: string; scrollTo?: string }) {
  const inner = (
    <>
      <span className="cd-metric__label">{label}</span>
      <span className="cd-metric__value">{value}</span>
      {caption ? <span className="cd-metric__cap">{dot ? <i className="cw-dot cw-dot--accent" aria-hidden style={{ "--cw-dot": "6px" } as React.CSSProperties} /> : null}{caption}</span> : null}
      {href || scrollTo ? <span className="cd-metric__go" aria-hidden><IconUpRight size={16} /></span> : null}
    </>
  );
  if (href) return <Link href={href} className="cd-metric">{inner}</Link>;
  if (scrollTo) return <button type="button" className="cd-metric" onClick={() => scrollToId(scrollTo)}>{inner}</button>;
  return <div className="cd-metric cd-metric--plain">{inner}</div>;
}

export function Card({ title, id, className, children }: { title?: string; id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("cd-card", className)} data-m="up">
      {title ? <header className="cd-card__head"><h3 className="cd-card__title">{title}</h3></header> : null}
      {children}
    </section>
  );
}

/** A page band: small label, title and support line, then its content. */
export function Band({ label, title, support, children }: { label: string; title: string; support?: string; children: React.ReactNode }) {
  return (
    <section className="cw-band" data-m="up">
      <header className="cw-sh">
        <p className="cw-over cw-sh__label">{label}</p>
        <h2 className="cw-sh__title">{title}</h2>
        {support ? <p className="cw-sh__text">{support}</p> : null}
      </header>
      {children}
    </section>
  );
}
