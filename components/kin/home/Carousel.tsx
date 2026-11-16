"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Img from "@/components/kin/Img";

/** Community Home's desktop carousels (feed sections and members' photos); styles in home-desktop.css. */

/** The desktop feed column's width: what `sizes` tells the browser for a photo that fills it. */
export const FEED_W = "600px";

/**
 * A row of slides shown one at a time: arrow buttons on the sides (shown on hover and on keyboard focus), the
 * left and right arrow keys while focus is inside, a swipe on touch screens, and dots under it. It wraps from the last
 * slide to the first. `index` is the parent's, so a caption below can follow the slide.
 */
export function Carousel({ label, index, onIndex, slides, ratio = "1 / 1", className }: { label: string; index: number; onIndex: (i: number) => void; slides: { key: string; label: string; node: React.ReactNode }[]; ratio?: string; className?: string }) {
  const n = slides.length;
  const [drag, setDrag] = useState(0);
  const start = useRef<{ x: number; y: number; id: number; on: boolean } | null>(null);
  const moved = useRef(false);
  const go = (k: number) => onIndex(((k % n) + n) % n);
  return (
    <div
      className={["ig-car", className].filter(Boolean).join(" ")}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-many={n > 1 ? "true" : undefined}
      onKeyDown={(e) => {
        if (n < 2 || e.defaultPrevented) return;
        if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      }}
    >
      <div
        className="ig-car__view"
        style={{ aspectRatio: ratio }}
        onPointerDown={(e) => { moved.current = false; if (n < 2 || e.pointerType === "mouse") return; start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false }; }}
        onPointerMove={(e) => {
          const s = start.current; if (!s || s.id !== e.pointerId) return;
          const dx = e.clientX - s.x, dy = e.clientY - s.y;
          if (!s.on) { if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return; s.on = true; moved.current = true; }
          setDrag(dx);
        }}
        onPointerUp={(e) => { const s = start.current; if (!s || s.id !== e.pointerId) return; start.current = null; const dx = e.clientX - s.x; setDrag(0); if (s.on && Math.abs(dx) >= 40) go(index + (dx < 0 ? 1 : -1)); }}
        onPointerCancel={() => { start.current = null; setDrag(0); }}
        onClickCapture={(e) => { if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; } }}
      >
        <div className={drag ? "ig-car__track is-dragging" : "ig-car__track"} style={{ "--ig-i": index, "--ig-drag": `${drag}px` } as React.CSSProperties}>
          {slides.map((s, k) => (
            <div key={s.key} className="ig-car__slide" role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}: ${s.label}`} inert={k !== index}>{s.node}</div>
          ))}
        </div>
        {n > 1 ? (
          <>
            <button type="button" className="ig-car__arrow ig-car__arrow--prev" aria-label={`Previous, ${label}`} onClick={() => go(index - 1)}><ChevronLeft size={20} strokeWidth={1.75} aria-hidden /></button>
            <button type="button" className="ig-car__arrow ig-car__arrow--next" aria-label={`Next, ${label}`} onClick={() => go(index + 1)}><ChevronRight size={20} strokeWidth={1.75} aria-hidden /></button>
            <span className="ig-car__count" aria-hidden>{index + 1}/{n}</span>
          </>
        ) : null}
      </div>
      {n > 1 ? (
        <div className="ig-car__dots" aria-hidden>
          {slides.map((s, k) => <span key={s.key} className="ig-car__dot" data-on={k === index ? "true" : undefined} />)}
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">{n > 1 ? `${index + 1} of ${n}: ${slides[index]?.label ?? ""}` : ""}</p>
    </div>
  );
}

/** A photo that fills its slide; not part of the scroll reveals (slides come and go). */
export function SlidePhoto({ src, eager }: { src: string; eager?: boolean }) {
  return <span className="ig-photo"><Img className="cover" src={src} sizes={FEED_W} priority={eager} draggable={false} /></span>;
}
