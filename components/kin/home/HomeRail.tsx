"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CircleCheck } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import type { Circle } from "@/lib/data/community";
import type { PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";
import { CIRCLES, CIRCLES_COPY, MATCHES, MATCH_COPY } from "./content";
import { FdAvatar } from "./parts";

/**
 * The design's right column on Community Home and Connect Discover: your circles and a match to meet, with the
 * design's circles and matches (./content.ts; its Discover rail reads the same list). `circles` is kept for callers
 * but no longer read.
 * `profileHref` is optional: where it returns a path, the photo and name of that slide are one link to it (Connect Discover links
 * them to the person's profile). Community Home does not pass it, so there the slide is unchanged.
 */
export default function HomeRail({ className = "fd-rail", profileHref, empty }: { circles?: Circle[]; className?: string; profileHref?: (id: PersonId) => string | undefined; empty?: boolean }) {
  return (
    <aside className={className} aria-label="Your circles and a match">
      <Circles />
      <Match profileHref={profileHref} empty={empty} />
    </aside>
  );
}

function Circles() {
  const circles = CIRCLES;
  return (
    <section className="fd-box fd-circles" aria-labelledby="fd-circles-title">
      <div className="fd-box__head">
        <h2 className="fd-box__title" id="fd-circles-title">{CIRCLES_COPY.title} <span className="fd-box__count">({circles.length})</span></h2>
        <Link className="fd-link" href={CIRCLES_COPY.link.href}>{CIRCLES_COPY.link.label}</Link>
      </div>
      <ul className="fd-circles__list">
        {circles.map((c) => (
          <li key={c.id}>
            <Link className="fd-circle" href={c.href}>
              {/* eslint-disable-next-line @next/next/no-img-element -- circle photo */}
              <span className="fd-circle__photo"><img className="cover" src={c.image} alt="" loading="lazy" decoding="async" draggable={false} /></span>
              <span className="fd-circle__text"><span className="fd-circle__name">{c.name}</span><span className="fd-circle__meta">{c.meta}</span></span>
              <span className="fd-circle__chev"><ChevronRight size={16} strokeWidth={1.5} aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const MAX = 10, SWIPE = 40;
function Match({ profileHref, empty }: { profileHref?: (id: PersonId) => string | undefined; empty?: boolean }) {
  const list = MATCHES.slice(0, MAX);
  const n = list.length;
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hello, setHello] = useLocal<Record<string, boolean>>("ak:feed-hello", {});
  const start = useRef<{ x: number; y: number; id: number; drag: boolean } | null>(null);
  if (empty || n === 0) {
    return (
      <section className="fd-box fd-match fd-match--empty" aria-labelledby="fd-match-title">
        <h2 className="fd-box__title" id="fd-match-title">{MATCH_COPY.title}</h2>
        <p className="fd-match__nothing">{MATCH_COPY.empty.text}</p>
        <Link className="fd-link" href={MATCH_COPY.empty.link.href}>{MATCH_COPY.empty.link.label}</Link>
      </section>
    );
  }
  const go = (k: number) => setI(((k % n) + n) % n);
  const cur = list[i];
  const firstName = cur.name.split(" ")[0];
  const sent = !!hello[cur.id];
  const sayHello = () => { setHello((h) => ({ ...h, [cur.id]: true })); toast.show({ message: `Hello sent to ${firstName}` }); };
  return (
    <section className="fd-box fd-match" aria-roledescription="carousel" aria-labelledby="fd-match-title" tabIndex={0} data-index={i} onKeyDown={(e) => { if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); } else if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); } }}>
      <h2 className="fd-box__title fd-match__title" id="fd-match-title">{MATCH_COPY.title}</h2>
      <div
        className="fd-match__view"
        onPointerDown={(e) => { if (n < 2 || (e.pointerType === "mouse" && e.button !== 0)) return; start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, drag: false }; }}
        onPointerMove={(e) => {
          const s = start.current; if (!s || s.id !== e.pointerId) return;
          const dx = e.clientX - s.x, dy = e.clientY - s.y;
          if (!s.drag) { if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return; s.drag = true; setDragging(true); try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} }
          setDrag(dx);
        }}
        onPointerUp={(e) => { const s = start.current; if (!s || s.id !== e.pointerId) return; start.current = null; const dx = e.clientX - s.x, dy = e.clientY - s.y; setDragging(false); setDrag(0); if (Math.abs(dx) >= SWIPE && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1)); }}
        onPointerCancel={() => { start.current = null; setDragging(false); setDrag(0); }}
      >
        <div className={dragging ? "fd-match__track is-dragging" : "fd-match__track"} style={{ "--fd-i": i, "--fd-drag": `${drag}px` } as React.CSSProperties}>
          {list.map((m, k) => {
            return (
              <div key={m.id} className="fd-slide" role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} inert={k !== i}>
                {(() => {
                  const who = <><FdAvatar src={m.image} size={56} /><div className="fd-slide__id"><p className="fd-slide__name" id={`fd-name-${m.id}`}>{m.name}</p><p className="fd-slide__role">{m.role} · {m.place}</p></div></>;
                  const href = profileHref?.(m.id);
                  return href ? <Link className="fd-slide__who fd-slide__who--link" href={href} draggable={false}>{who}</Link> : <div className="fd-slide__who">{who}</div>;
                })()}
                <p className="fd-slide__quote">{`“${m.quote}”`}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fd-match__side">
        <Link className="fd-link fd-match__why" href={MATCH_COPY.link.href}>{MATCH_COPY.link.label}</Link>
        <div className="fd-match__slot">
          {sent ? (
            <p className="fd-match__sent" role="status"><CircleCheck size={20} strokeWidth={1.5} aria-hidden /><span>Hello sent to {firstName}. We will let you know when they reply.</span></p>
          ) : (
            <div className="fd-match__actions">
              <Button variant="secondary" full onClick={() => go(i + 1)} aria-describedby={`fd-name-${cur.id}`}>{MATCH_COPY.skip}</Button>
              <Button full onClick={sayHello} aria-describedby={`fd-name-${cur.id}`}>{MATCH_COPY.hello}</Button>
            </div>
          )}
        </div>
        <div className="fd-match__ctrl">
          <div className="fd-match__nav">
            <div className="fd-dots" role="group" aria-label="Choose a profile">
              {list.map((m, k) => <button key={m.id} type="button" className="fd-dot" aria-label={`Show profile ${k + 1} of ${n}`} aria-current={k === i ? "true" : undefined} onClick={() => go(k)}><span /></button>)}
            </div>
            <span className="fd-match__count">{i + 1} / {n}</span>
          </div>
          <div className="fd-match__arrows">
            <IconButton variant="ghost" className="fd-arrow" label="Previous profile" onClick={() => go(i - 1)}><ChevronLeft size={24} strokeWidth={1.5} /></IconButton>
            <IconButton variant="ghost" className="fd-arrow" label="Next profile" onClick={() => go(i + 1)}><ChevronRight size={24} strokeWidth={1.5} /></IconButton>
          </div>
        </div>
      </div>
    </section>
  );
}
