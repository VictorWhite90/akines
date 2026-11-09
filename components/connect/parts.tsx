"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useJoined } from "@/components/circles/useJoined";
import HomeRail from "@/components/kin/home/HomeRail";
import { FdLink } from "@/components/kin/home/parts";
import { profilePath } from "@/lib/connect/profiles";
import { CIRCLES } from "@/lib/data/community";
import { CardView } from "./cards";
import type { Card } from "./data";
import "@/components/kin/home/home.css";
import "./discover.css";
import "./lists.css";

/**
 * The frame and parts shared by Discover and the pages it leads to, mirrored from the product design
 * (connect/discover/parts.tsx, list-parts.tsx and DiscoverRail.tsx). Classes in discover.css and lists.css.
 */

/** Section heading in the Community Home style, with the design's section ids. */
export function Section({ id, title, support, link, className, children }: { id: string; title: string; support?: string; link?: { label: string; href: string }; className?: string; children: React.ReactNode }) {
  return (
    <section className={["fd-section", "dx-section", className].filter(Boolean).join(" ")} id={`dx-${id}`} aria-labelledby={`dx-title-${id}`} data-dx-section={id}>
      <header className="fd-head" data-m="up">
        <div className="fd-head__copy">
          <h2 className="fd-head__title" id={`dx-title-${id}`}>{title}</h2>
          {support ? <p className="fd-head__support">{support}</p> : null}
        </div>
        {link ? <FdLink href={link.href}>{link.label}</FdLink> : null}
      </header>
      {children}
    </section>
  );
}

/** The rail of Discover: Community Home's, with the match's photo and name linking to the person's profile. */
export function DiscoverRail() {
  const { ids } = useJoined();
  return <HomeRail circles={CIRCLES.filter((c) => ids.includes(c.id))} className="dx-rail" profileHref={profilePath} />;
}

/** The design's Back link: an arrow and a semibold label. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="dxl-back"><ArrowLeft size={16} strokeWidth={1.25} absoluteStrokeWidth aria-hidden focusable={false} /><span>{children}</span></Link>;
}

/** A page of Discover with its rail: Back link, header, then the filters and cards. `wide` is Explore all (40 between the blocks). */
export function ListPage({ title, support, back = "Back to Discover", backHref = "/connect", wide, children }: { title: string; support: string; back?: string; backHref?: string; wide?: boolean; children: React.ReactNode }) {
  const titleId = useId();
  return (
    <div className="fd-page dx-feed">
      <div className="dx-body">
        <div className="dx-column">
          <section className={wide ? "dxl-section dxl-section--wide" : "dxl-section"} aria-labelledby={titleId}>
            <div className="dxl-head" data-m="up">
              <BackLink href={backHref}>{back}</BackLink>
              <header className="dxl-header">
                <div className="fd-head__copy">
                  <h1 className="fd-head__title" id={titleId}>{title}</h1>
                  <p className="fd-head__support">{support}</p>
                </div>
              </header>
            </div>
            {children}
          </section>
        </div>
        <DiscoverRail />
      </div>
    </div>
  );
}

/** The design's Section Empty with an action: one centred line between two hairlines and a link under it. */
export function NoResults({ text, action }: { text: string; action: { label: string; href?: string; onClick?: () => void } }) {
  return (
    <div className="dxn">
      <p className="dxn__text">{text}</p>
      {action.href ? <Link href={action.href} className="fd-link">{action.label}</Link> : <button type="button" className="fd-link" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}

/**
 * The row of filter chips and the grid under it (the For you block). A change of chip replaces the whole grid at once and a polite
 * status says what it shows now. With no cards `none` takes the grid's place under the same chips.
 */
export function FilterBlock<K extends string>({ name, chips, value, onSelect, cards, none }: { name: string; chips: readonly { key: K; label: string }[]; value: K | null; onSelect: (key: K) => void; cards: readonly Card[]; none: React.ReactNode }) {
  const [shown, setShown] = useState(value);
  const [swapped, setSwapped] = useState(false);
  const [note, setNote] = useState("");
  const group = useRef<HTMLDivElement>(null);
  if (shown !== value) {
    const label = chips.find((c) => c.key === value)?.label ?? "all";
    setShown(value);
    setSwapped(true);
    setNote(cards.length ? `Showing ${label}, ${cards.length} ${cards.length === 1 ? "card" : "cards"}.` : `No results for ${label}.`);
  }
  // The link of No results goes away when it is pressed: keep focus in the block, on the chip that is on (or the first one)
  const empty = cards.length === 0;
  const wasEmpty = useRef(empty);
  useEffect(() => {
    const was = wasEmpty.current;
    wasEmpty.current = empty;
    if (!was || empty) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    const all = group.current?.querySelectorAll<HTMLElement>(".dxf-chip");
    (group.current?.querySelector<HTMLElement>('[aria-pressed="true"]') ?? all?.[0])?.focus({ preventScroll: true });
  }, [empty, value]);
  return (
    <div className="dxf">
      <div className="dxf-filters" role="group" aria-label={name} ref={group} data-m="up">
        {chips.map((c) => <button key={c.key} type="button" className="dxf-chip" aria-pressed={value === c.key} onClick={() => onSelect(c.key)}>{c.label}</button>)}
      </div>
      <p className="sr-only" role="status">{note}</p>
      {cards.length ? (
        <ul key={String(value)} className={swapped ? "dxf-grid dxf-grid--swap" : "dxf-grid"} role="list" data-m={swapped ? undefined : "stagger"}>
          {cards.map((c) => <li key={c.id} className="dxf-cell"><CardView card={c} reveal={!swapped} /></li>)}
        </ul>
      ) : none}
    </div>
  );
}
