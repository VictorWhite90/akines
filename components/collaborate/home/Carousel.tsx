"use client";

import { Children, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/kin/Button";
import { useMedia } from "@/components/kin/useMedia";

/*
 * The design's paged carousel (cs-car in ../styles/home-start.css): a number of cards per page for desktop,
 * tablet and phone, previous/next with a "1 / 3" count, and a swipe on touch. Cards off the page are inert.
 */

type Per = { desktop: number; tablet: number; mobile: number };

function useBreakpoint(): keyof Per {
  const mobile = useMedia("(max-width: 767px)");
  const tablet = useMedia("(min-width: 768px) and (max-width: 1279px)");
  return mobile ? "mobile" : tablet ? "tablet" : "desktop";
}

export default function Carousel({ label, noun, per, className, children }: { label: string; noun: string; per: Per; className?: string; children: React.ReactNode }) {
  const items = Children.toArray(children);
  const n = per[useBreakpoint()];
  const pages = Math.max(1, Math.ceil(items.length / n));
  const [page, setPage] = useState(0);
  const at = Math.min(page, pages - 1);
  const go = (p: number) => setPage(((p % pages) + pages) % pages);
  const startX = useRef<number | null>(null);
  return (
    <div className={"cs-car" + (className ? " " + className : "")} role="group" aria-roledescription="carousel" aria-label={label} style={{ ["--page" as string]: at, ["--per" as string]: n } as React.CSSProperties}>
      <div
        className="cs-car__viewport"
        onPointerDown={(e) => { if (e.pointerType === "touch") startX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) go(at + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => { startX.current = null; }}
      >
        <div className="cs-car__track" aria-live="off">
          {items.map((child, i) => {
            const shown = Math.floor(i / n) === at;
            return <div key={i} className="cs-car__item" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`} aria-hidden={shown ? undefined : true} inert={!shown}>{child}</div>;
          })}
        </div>
      </div>
      <div className="cs-car__controls">
        <IconButton label={`Previous ${noun}`} onClick={() => go(at - 1)}><ChevronLeft size={24} strokeWidth={1.5} /></IconButton>
        <span className="cs-car__count" aria-live="polite">{at + 1} / {pages}</span>
        <IconButton label={`Next ${noun}`} onClick={() => go(at + 1)}><ChevronRight size={24} strokeWidth={1.5} /></IconButton>
      </div>
    </div>
  );
}
