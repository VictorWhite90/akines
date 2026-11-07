"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CtxBlock, Dot } from "@/components/collaborate/workspace/Frame";
import { AVAILABILITY_TEXT, type Availability, type WorkspaceMember } from "@/lib/collab/workspace";
import { cn } from "@/lib/cn";
import "../../styles/pages.css";

/*
 * Small pieces the brief and milestone pages share, mirrored from the product design's workspace pages (cw-):
 * the back link, the underlined text link, initials, the people list with availability, and a titled band.
 */

export const Arrow = () => <ArrowRight size={16} strokeWidth={1.25} aria-hidden focusable={false} />;

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="cw-back"><ArrowLeft size={16} strokeWidth={1.25} aria-hidden focusable={false} /><span>{children}</span></Link>;
}

/** The design's text link (cw-link): a link with a href, a button otherwise. */
export function CwLink({ href, onClick, arrow, children }: { href?: string; onClick?: () => void; arrow?: boolean; children: React.ReactNode }) {
  const inner = <><span className="cw-link__label">{children}</span>{arrow ? <Arrow /> : null}</>;
  return href ? <Link href={href} className="cw-link">{inner}</Link> : <button type="button" className="cw-link" onClick={onClick}>{inner}</button>;
}

export function Initials({ initials, size = 32 }: { initials: string; size?: number }) {
  return <span className="cw-av cw-av--brand" aria-hidden style={{ ["--cw-av" as string]: `${size}px`, ["--cw-fs" as string]: `${size >= 48 ? 13 : size >= 36 ? 12 : 11}px` } as React.CSSProperties}>{initials}</span>;
}

const TONE: Record<Availability, "green" | "accent" | "gray"> = { available: "green", working: "accent", away: "gray" };

/** A context block listing people and their availability (the design's team availability, or who is responsible). */
export function PeopleBlock({ label = "TEAM AVAILABILITY", people }: { label?: string; people: WorkspaceMember[] }) {
  if (!people.length) return null;
  return (
    <CtxBlock label={label}>
      <ul className="cw-people">
        {people.map((p) => (
          <li key={p.id} className="cw-people__row">
            <Initials initials={p.initials} size={36} />
            <div className="cw-people__text">
              <span className="cw-people__name">{p.name}</span>
              <span className="cw-people__status"><Dot tone={TONE[p.availability]} size={7} />{AVAILABILITY_TEXT[p.availability]}</span>
            </div>
          </li>
        ))}
      </ul>
    </CtxBlock>
  );
}

/** A section with the design's small label, title and support line (cw-band, cw-sh). */
export function Band({ label, title, support, className, children }: { label: string; title: string; support?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("cw-band", className)} data-m="up">
      <header className="cw-sh">
        <p className="cw-over cw-sh__label">{label}</p>
        <h2 className="cw-sh__title">{title}</h2>
        {support ? <p className="cw-sh__text">{support}</p> : null}
      </header>
      {children}
    </section>
  );
}
