"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark } from "lucide-react";
import Button from "@/components/kin/Button";
import { Tag } from "@/components/kin/Chip";
import { faceSrc } from "@/components/kin/home/parts";
import { collabHref, INTRO_STATUS, type Collaborator, type IntroStatus } from "@/lib/collab/collaborators";
import { PEOPLE, type Person, type PersonId } from "@/lib/data/people";
import "../styles/collaborators.css";

/*
 * Small pieces shared by the Collaborators screens, mirrored from the product design (classes cc-* in
 * ../styles/collaborators.css): the back link, the heading, the empty state, the status tag, the person card.
 */

export const HERO = "/akines/collaborators/hero.jpg";
export const photoOf = (id: PersonId, w = 480) => faceSrc(id, w) ?? (PEOPLE[id] as Person | undefined)?.photo ?? undefined;

/** The design's arrow in buttons: 16px, a fine stroke. */
export const Arrow = () => <ArrowRight size={16} strokeWidth={1.25} />;

export function Back({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  const inner = <><ArrowLeft size={16} strokeWidth={1.25} aria-hidden focusable={false} /><span className="cc-back__label">{children}</span></>;
  return href ? <Link className="cc-back" href={href}>{inner}</Link> : <button type="button" className="cc-back" onClick={onClick}>{inner}</button>;
}

export function Heading({ eyebrow, title, support, level = 1, className }: { eyebrow: string; title: string; support?: string; level?: 1 | 2; className?: string }) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <div className={`cc-heading${className ? ` ${className}` : ""}`}>
      <p className="cc-eyebrow" data-m="up">{eyebrow}</p>
      <H className="cc-h" data-m="words">{title}</H>
      {support ? <p className="cc-support" data-m="up">{support}</p> : null}
    </div>
  );
}

export function CcEmpty({ title, text, action, textWidth = 560 }: { title: string; text: string; action?: React.ReactNode; textWidth?: number }) {
  return (
    <section className="cc-empty" data-m="up">
      <span className="cc-empty__rule" aria-hidden />
      <h2 className="cc-empty__title">{title}</h2>
      <p className="cc-empty__text" style={{ maxWidth: textWidth }}>{text}</p>
      {action}
    </section>
  );
}

export function Status({ status }: { status: IntroStatus }) {
  return <Tag tone={status === "accepted" ? "success" : "warning"} className={`cc-status cc-status--${status}`}>{INTRO_STATUS[status]}</Tag>;
}

/** The design's avatar (k-avatar), a round photo. */
export function CcAvatar({ id, size, shown }: { id: PersonId; size: number; shown?: number }) {
  const px = shown ?? size;
  const src = photoOf(id, size * 2);
  return (
    <span role="img" aria-label={PEOPLE[id].name} className="k-avatar k-avatar--warm" data-size={size} style={{ width: px, height: px, fontSize: Math.round(size * 0.375) }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- member photo */}
      {src ? <img alt="" loading="lazy" decoding="async" src={src} /> : null}
    </span>
  );
}

/** A recommended person: photo, who they are, why you may work well together, and what to do next. */
export function PersonCard({ c, saved, saveLabel, onSave, hideNotRelevant, onNotRelevant, onAsk }: { c: Collaborator; saved: boolean; saveLabel: string; onSave?: () => void; hideNotRelevant?: boolean; onNotRelevant?: () => void; onAsk?: () => void }) {
  const p = PEOPLE[c.id];
  const h = collabHref(c.id);
  const src = photoOf(c.id);
  return (
    <article className="cc-card" data-saved={saved || undefined} aria-labelledby={`cc-card-${c.id}`}>
      <div className="cc-card__top">
        <div className="cc-card__photo">
          {/* eslint-disable-next-line @next/next/no-img-element -- member photo */}
          {src ? <img src={src} alt="" loading="lazy" decoding="async" width={188} height={228} /> : null}
        </div>
        <div className="cc-card__info">
          <div className="cc-card__avail">
            <span className="cc-card__avail-text"><span className="cc-dot" aria-hidden />{c.availability}</span>
            {saved ? <Tag className="cc-card__saved" icon={<Bookmark size={12} strokeWidth={1.5} />}>Saved</Tag> : null}
          </div>
          <h2 className="cc-card__name" id={`cc-card-${c.id}`}>{p.name}</h2>
          <p className="cc-card__role">{p.role}</p>
          <p className="cc-card__skills">{c.keySkills.join(" · ")}</p>
          <p className="cc-card__intro">{c.intro}</p>
        </div>
      </div>
      <div className="cc-card__why">
        <p className="cc-cap">Why you may work well together</p>
        <p className="cc-card__compat">{c.compat}</p>
      </div>
      <div className="cc-card__facts">
        <div><p className="cc-cap">Relevant experience</p><p className="cc-card__fact">{c.experience}</p></div>
        <div><p className="cc-cap">Working preferences</p><p className="cc-card__fact">{c.preference}</p></div>
      </div>
      <div className="cc-card__actions">
        <div className="cc-card__primary">
          <Button href={h.profile} iconRight={<Arrow />}>View profile</Button>
          <Button variant="secondary" href={h.request}>Request introduction</Button>
        </div>
        <div className="cc-card__secondary">
          <Button variant="link" onClick={onSave} aria-pressed={saved && !hideNotRelevant ? true : undefined}>{saveLabel}</Button>
          {hideNotRelevant ? null : <Button variant="link" onClick={onNotRelevant}>Not relevant</Button>}
          <Button variant="link" onClick={onAsk}>Ask Akines why</Button>
        </div>
      </div>
    </article>
  );
}
