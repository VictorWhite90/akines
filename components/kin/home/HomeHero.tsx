"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { HERO_CARDS, HERO_HEADING, HERO_INTERVAL, HERO_LABEL } from "./content";

/*
 * The top of Community Home, mirrored from the product design (classes in home.css): a row of what is happening
 * now, in the design's order of kinds. It moves on by one card every few seconds, pauses while you point at it,
 * hold it or tab into it, and can be dragged with a mouse. The cards are the design's (./content.ts).
 */

const INTERVAL = HERO_INTERVAL, EAGER = 5, DRAG = 6;

/** The design's auto-advance and mouse drag for the row. */
function useTrack() {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const t = ref.current;
    if (!t) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined, settleUntil = 0, held = false, hover = false, down = false, focus = false, swallow = false;
    let drag: { x: number; left: number; id: number; moved: boolean } | null = null;
    const pad = () => parseFloat(getComputedStyle(t).paddingLeft) || 0;
    const sync = () => { held = hover || down || focus; };
    const schedule = () => { clearTimeout(timer); if (!reduce.matches) timer = window.setTimeout(next, INTERVAL); };
    function next() {
      if (held || document.hidden || reduce.matches) { schedule(); return; }
      const max = t!.scrollWidth - t!.clientWidth, at = t!.scrollLeft;
      let to = 0;
      if (at < max - 2) {
        const p = pad();
        const item = (Array.from(t!.children) as HTMLElement[]).find((c) => c.offsetLeft - p > at + 2);
        to = item ? Math.min(item.offsetLeft - p, max) : 0;
      }
      settleUntil = performance.now() + 1100;
      t!.scrollTo({ left: to, behavior: "smooth" });
      schedule();
    }
    const onScroll = () => { if (performance.now() > settleUntil) schedule(); };
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") { hover = true; sync(); } };
    const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") { hover = false; sync(); schedule(); } };
    const press = (e: PointerEvent) => { down = true; sync(); if (e.pointerType === "mouse" && e.button === 0) drag = { x: e.clientX, left: t.scrollLeft, id: e.pointerId, moved: false }; };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > DRAG) { drag.moved = true; t.setPointerCapture(e.pointerId); t.classList.add("is-dragging"); }
      if (drag.moved) t.scrollLeft = drag.left - dx;
    };
    const release = () => { down = false; sync(); if (drag?.moved) { swallow = true; setTimeout(() => { swallow = false; }, 0); } drag = null; t.classList.remove("is-dragging"); schedule(); };
    // A drag ends with a click on the card under the pointer; it must not open it.
    const click = (e: MouseEvent) => { if (swallow) { e.preventDefault(); e.stopPropagation(); } };
    const focusIn = () => { focus = true; sync(); };
    const focusOut = () => { focus = false; sync(); schedule(); };
    const vis = () => { if (!document.hidden) schedule(); };
    t.addEventListener("scroll", onScroll, { passive: true });
    t.addEventListener("pointerenter", enter);
    t.addEventListener("pointerleave", leave);
    t.addEventListener("pointerdown", press);
    t.addEventListener("pointermove", move);
    t.addEventListener("pointerup", release);
    t.addEventListener("pointercancel", release);
    t.addEventListener("click", click, true);
    t.addEventListener("focusin", focusIn);
    t.addEventListener("focusout", focusOut);
    document.addEventListener("visibilitychange", vis);
    reduce.addEventListener("change", schedule);
    schedule();
    return () => {
      clearTimeout(timer);
      t.removeEventListener("scroll", onScroll);
      t.removeEventListener("pointerenter", enter);
      t.removeEventListener("pointerleave", leave);
      t.removeEventListener("pointerdown", press);
      t.removeEventListener("pointermove", move);
      t.removeEventListener("pointerup", release);
      t.removeEventListener("pointercancel", release);
      t.removeEventListener("click", click, true);
      t.removeEventListener("focusin", focusIn);
      t.removeEventListener("focusout", focusOut);
      document.removeEventListener("visibilitychange", vis);
      reduce.removeEventListener("change", schedule);
    };
  }, []);
  return ref;
}

export default function HomeHero() {
  const cards = HERO_CARDS;
  const track = useTrack();
  return (
    <section className="fd-hero" aria-roledescription="carousel" aria-label={HERO_LABEL}>
      <h1 className="sr-only">{HERO_HEADING}</h1>
      <ul className="fd-hero__track" ref={track}>
        {cards.map((c, i) => (
          <li key={c.id} className="fd-hero__item" style={{ ["--i" as string]: i } as React.CSSProperties}>
            <Link className="fd-hcard" data-kind={c.kind} href={c.href} draggable={false}>
              <span className="fd-hcard__photo">
                {/* eslint-disable-next-line @next/next/no-img-element -- the design's card photo */}
                <img className="cover" src={c.image} alt="" loading={i < EAGER ? "eager" : "lazy"} decoding="async" draggable={false} />
                <span className="fd-hcard__tag">{c.kind === "live" ? <span className="fd-hcard__dot" aria-hidden /> : null}{c.tag}</span>
              </span>
              <span className="fd-hcard__text">
                <span className="fd-hcard__title">{c.title}</span>
                <span className="fd-hcard__meta">{c.meta}</span>
              </span>
              <span className="fd-hcard__rule" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
