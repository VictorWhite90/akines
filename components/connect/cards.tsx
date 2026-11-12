"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import Button from "@/components/kin/Button";
import { useJoined } from "@/components/circles/useJoined";
import { faceSrc, photoSrc } from "@/components/kin/home/parts";
import { profilePath } from "@/lib/connect/profiles";
import type { Interest } from "@/lib/connect/interests";
import type { Match } from "@/lib/data/matches";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { first, interestPath, type Card, type EXPLORE } from "./data";
import { useDiscoverState, type RecStatus } from "./state";

/**
 * The cards of Discover and its pages, mirrored from the product design (connect/discover/cards.tsx, ExploreCard.tsx,
 * InterestCard.tsx and the Someone to meet card of Recommendations.tsx). Classes in discover.css.
 */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Bring a card that gets keyboard focus fully into a scrolling row (not on mouse focus, so the row never moves under a press). */
export const revealFocused = (e: React.FocusEvent) => {
  const t = e.target as HTMLElement;
  if (t.matches(":focus-visible")) t.closest("li")?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduced() ? "auto" : "smooth" });
};
export { reduced };

/* ---------------------------------------------------------------- Explore Card */
export function ExploreCard({ c, eager }: { c: (typeof EXPLORE)[number]; eager?: boolean }) {
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- the design's category photo */}
      <span className="dxe-photo"><img className="dxe-img" src={c.image} alt="" loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} /></span>
      <span className="dxe-text">
        <span className="dxe-line"><span className="dxe-title">{c.title}</span><span className="dxe-arrow" aria-hidden><ArrowRight size={20} strokeWidth={1.5} /></span></span>
        <span className="dxe-desc">{c.text}</span>
      </span>
      <span className="dxe-rule" aria-hidden />
    </>
  );
  return c.href ? <Link className="dxe-card" href={c.href} draggable={false}>{body}</Link> : <button type="button" className="dxe-card">{body}</button>;
}

/* ---------------------------------------------------------------- Interest Card */
export function InterestCard({ interest }: { interest: Interest }) {
  return (
    <Link className="dxi-card" href={interestPath(interest.id)} draggable={false}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the design's interest photo */}
      <img className="dxi-photo" src={photoSrc(interest.photo)} alt="" loading="lazy" decoding="async" draggable={false} />
      <span className="dxi-blur" aria-hidden><i /><i /><i /></span>
      <span className="dxi-scrim" aria-hidden />
      <span className="dxi-title">{interest.title}</span>
      <span className="dxi-desc">{interest.text}</span>
      <span className="dxi-action">Explore<ArrowRight size={16} strokeWidth={1.5} aria-hidden /></span>
    </Link>
  );
}

/* ---------------------------------------------------------------- For you cards */
function Photo({ src, reveal }: { src?: string; reveal: boolean }) {
  return (
    <div className="fd-photo dxf-photo" data-m={reveal ? "frame" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the card's photo */}
      {src ? <img className="cover" src={src} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
    </div>
  );
}

/** The title control that covers the card: a link where the card has a destination, a plain button where the design has none. */
function Main({ href, children }: { href?: string; children: React.ReactNode }) {
  return href ? <Link className="dxf-main" href={href}>{children}</Link> : <button type="button" className="dxf-main">{children}</button>;
}

function Done({ done, label, children }: { done: boolean; label: string; children: React.ReactNode }) {
  return <div className="dxf-act" aria-live="polite" aria-atomic="true">{done ? <span className="dxf-pill"><Check size={16} strokeWidth={1.25} aria-hidden /><span>{label}</span></span> : children}</div>;
}

export function CardView({ card, reveal }: { card: Card; reveal: boolean }) {
  const { has, toggle } = useJoined();
  const d = useDiscoverState();
  const body = (() => {
    switch (card.kind) {
      case "person":
        return (
          <>
            <Photo src={card.image} reveal={reveal} />
            <div className="dxf-text">
              <h3 className="dxf-name"><Main href={card.href}>{card.name}</Main></h3>
              <p className="dxf-role">{card.identity}</p>
              <p className="dxf-desc">{card.text}</p>
            </div>
            <div className="dxf-foot dxf-foot--end">
              <Done done={d.isRequested(card.person)} label="Requested"><Button variant="secondary" aria-label={`Connect with ${card.name}`} onClick={() => d.connect(card.person)}>Connect</Button></Done>
            </div>
          </>
        );
      case "circle":
        return (
          <>
            <Photo src={card.image} reveal={reveal} />
            <div className="dxf-text">
              <h3 className="dxf-name"><Main href={card.href}>{card.name}</Main></h3>
              <p className="dxf-meta dxf-meta--block">{card.meta}</p>
              <p className="dxf-desc">{card.text}</p>
            </div>
            {/* Open circles have the button alone, on the right. Approval circles keep the note on the left, also after the request. */}
            {card.access === "approval" ? (
              <div className="dxf-foot">
                <span className="dxf-meta">Approval needed</span>
                <Done done={d.isCircleRequested(card.circle)} label="Requested"><Button variant="secondary" aria-label={`Request to join ${card.name}`} onClick={() => d.requestCircle(card.circle)}>Request to join</Button></Done>
              </div>
            ) : (
              <div className="dxf-foot dxf-foot--end">
                <Done done={has(card.circle)} label="Joined"><Button variant="secondary" aria-label={`Join ${card.name}`} onClick={() => { if (!has(card.circle)) toggle(card.circle); }}>Join</Button></Done>
              </div>
            )}
          </>
        );
      case "artwork":
        return (
          <>
            <Photo src={card.image} reveal={reveal} />
            <div className="dxf-text">
              <p className="dxf-tag">{card.tag}</p>
              <h3 className="dxf-name"><Main href={card.href}>{card.title}</Main></h3>
              {/* The maker row is its own link, above the control that covers the card: it opens the maker's profile */}
              <Link className="dxf-maker dxf-maker--link" href={card.makerHref}>
                {/* eslint-disable-next-line @next/next/no-img-element -- the maker's face */}
                <span className="fd-av dxf-av">{faceSrc(card.maker) ? <img src={faceSrc(card.maker)} alt="" loading="lazy" decoding="async" draggable={false} /> : null}</span>
                <span className="dxf-maker__name">{PEOPLE[card.maker]?.name ?? "A member"}</span>
              </Link>
            </div>
            <div className="dxf-foot">
              <p className="dxf-price"><span>{card.price}</span><span className="dxf-meta">{card.edition}</span></p>
              <div className="dxf-act"><Button variant="secondary" href={card.href} aria-label={`Buy ${card.title}`}>Buy</Button></div>
            </div>
          </>
        );
      default: {
        const inner = <><span>{card.action}<span className="sr-only"> {card.title}</span></span><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></>;
        return (
          <>
            <Photo src={card.image} reveal={reveal} />
            <div className="dxf-text">
              <p className="dxf-tag">{card.tag}</p>
              <h3 className="dxf-title"><Main href={card.href}><span className="dxf-clamp">{card.title}</span></Main></h3>
              <p className="dxf-desc dxf-desc--tall">{card.text}</p>
            </div>
            <div className="dxf-foot">
              <span className="dxf-meta">{card.meta}</span>
              <div className="dxf-act">
                {card.href ? <Link className="fd-link dxf-link" href={card.href}>{inner}</Link> : <button type="button" className="fd-link dxf-link">{inner}</button>}
              </div>
            </div>
          </>
        );
      }
    }
  })();
  return <article className="dxf-card" data-kind={card.kind}>{body}<span className="dxf-rule" aria-hidden /></article>;
}

/* ---------------------------------------------------------------- Someone to meet */
/** The design's Akines assistant mark, deep amber on ivory. */
export function AssistantMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 600 600" width={size} height={size} aria-hidden focusable="false">
      <path d="M104.9 378.5A222.75 222.75 0 1 1 495.1 378.5" fill="none" stroke="#AE690A" strokeWidth="49.5" strokeLinecap="round" />
      <circle cx="225" cy="258" r="42.5" fill="#AE690A" />
      <circle cx="376" cy="258" r="42.5" fill="#AE690A" />
      <path d="M300.0 577.5L431.2 489.8A155 66 0 1 0 300.0 520.3Z" fill="#AE690A" />
    </svg>
  );
}

/** One Someone to meet card (Discover's section and All suggestions). Focus follows the member's action, as the design does. */
export function RecCard({ match: m, index }: { match: Match; index: number }) {
  const d = useDiscoverState();
  const id = m.id as PersonId;
  const status = d.recStatus(id);
  const set = (s: RecStatus) => d.setRec(id, s);
  const p = PEOPLE[id];
  const name = first(id);
  const notNow = useRef<HTMLButtonElement>(null), sent = useRef<HTMLParagraphElement>(null), undo = useRef<HTMLButtonElement>(null);
  const after = useRef<RecStatus | "back" | null>(null);
  useEffect(() => {
    const was = after.current; after.current = null;
    if (was === "sent" && status === "sent") sent.current?.focus();
    else if (was === "dismissed" && status === "dismissed") undo.current?.focus();
    else if (was === "back" && status === "idle") notNow.current?.focus();
  }, [status]);
  const nameId = `dxr-name-${id}`, noteId = `dxr-note-${id}`;
  return (
    <li className="dxr-card" data-status={status} style={{ ["--dxr-i" as string]: index } as React.CSSProperties}>
      <div className="dxr-card__body" inert={status === "dismissed"}>
        <div className="dxr-top"><p className="dxr-eyebrow">Someone to meet</p></div>
        <Link className="dxr-who" href={profilePath(id)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the member's face */}
          <span className="dxr-photo">{faceSrc(id) ? <img src={faceSrc(id)} alt="" width={72} height={72} loading="lazy" decoding="async" draggable={false} /> : null}</span>
          <span className="dxr-who__text"><span className="dxr-name" id={nameId}>{p?.name}</span><span className="dxr-role">{p ? `${p.role} · ${p.city}` : ""}</span></span>
        </Link>
        <ul className="dxr-tags">{m.signals.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="dxr-reason">{`“${m.ask ?? m.reason}”`}</p>
        <div className="dxr-slot">
          {status === "sent" ? (
            <p className="dxr-sent" ref={sent} tabIndex={-1}>{`Hello sent to ${name}. We will let you know when they reply.`}</p>
          ) : (
            <div className="dxr-actions">
              <Button variant="secondary" full ref={notNow} onClick={() => { after.current = "dismissed"; set("dismissed"); }} aria-describedby={nameId}>Not now</Button>
              <Button full onClick={() => { after.current = "sent"; set("sent"); }} aria-describedby={nameId}>Say hello</Button>
            </div>
          )}
        </div>
      </div>
      {status === "dismissed" ? (
        <div className="dxr-dismissed">
          <p className="dxr-dismissed__text" id={noteId}>{`Not now noted. We will not show ${name} for a while.`}</p>
          <button type="button" className="fd-link" ref={undo} onClick={() => { after.current = "back"; set("idle"); }} aria-describedby={noteId}>Undo</button>
        </div>
      ) : null}
    </li>
  );
}
