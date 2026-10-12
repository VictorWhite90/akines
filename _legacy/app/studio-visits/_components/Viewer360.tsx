"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft2, ArrowRight2, Headphone, Location } from "iconsax-reactjs";
import Media from "@/components/ui/Media";
import { cn } from "@/lib/cn";
import { HOTSPOTS } from "../_data";

const STEP = 15;
const wrap = (deg: number) => ((deg % 360) + 360) % 360;

/**
 * A mock 360° viewer: a wide panorama you can drag, or pan with arrow keys and
 * buttons. The image repeats so looking around never hits an edge. Smooth
 * panning only happens for users without a reduced-motion preference.
 */
export default function Viewer360({ src, title }: { src: string; title: string }) {
  const [deg, setDeg] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [hotspot, setHotspot] = useState<string | null>(null);
  const drag = useRef<{ x: number; deg: number; width: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  function turn(to: number, smooth = true) {
    const next = wrap(to);
    // Don't animate across the seam (it would spin the long way round).
    setAnimate(smooth && Math.abs(next - deg) <= 180);
    setDeg(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") turn(deg + STEP);
    else if (event.key === "ArrowLeft") turn(deg - STEP);
    else if (event.key === "Home") turn(0);
    else return;
    event.preventDefault();
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, deg, width: event.currentTarget.clientWidth };
    setDragging(true);
    setAnimate(false);
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    // One viewport-width of drag ≈ 180° (the panorama is two viewports wide).
    setDeg(wrap(drag.current.deg - (dx / drag.current.width) * 180));
  }
  function endDrag() {
    drag.current = null;
    setDragging(false);
  }

  const active = HOTSPOTS.find((h) => h.id === hotspot);

  return (
    <div className="flex flex-col gap-3">
      <div
        role="slider"
        tabIndex={0}
        aria-label={`${title}: 360° view. Use the left and right arrow keys, or drag, to look around.`}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={Math.round(deg)}
        aria-valuetext={`Facing ${Math.round(deg)} degrees`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "relative aspect-[16/9] w-full touch-pan-y select-none overflow-hidden rounded-[4px] bg-sand-200 sm:aspect-[5/2]",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        <div
          className={cn("absolute inset-y-0 left-0 flex w-[400%]", animate && "motion-safe:transition-transform motion-safe:duration-300")}
          style={{ transform: `translateX(-${(deg / 360) * 50}%)` }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="relative h-full w-1/2" aria-hidden>
              <Media src={src} alt="" ratio="auto" sizes="(max-width: 768px) 200vw, 1400px" className="h-full" />
              {HOTSPOTS.map((h) => (
                <span
                  key={h.id}
                  className={cn(
                    "absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow",
                    hotspot === h.id ? "bg-gold-400 text-green-950" : "bg-white/90 text-green-950",
                  )}
                  style={{ left: `${(h.deg / 360) * 100}%` }}
                >
                  <Location size={12} variant="Bold" color="currentColor" /> {h.label}
                </span>
              ))}
            </div>
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-green-950/80 px-2.5 py-1 text-[11px] font-semibold text-white">
          360° · facing {Math.round(deg)}°
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => turn(deg - STEP)}
          className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-[2px] border border-green-950 px-3 text-xs font-semibold text-green-950 hover:bg-sand-100"
        >
          <ArrowLeft2 size={14} color="currentColor" aria-hidden /> Look left
        </button>
        <button
          type="button"
          onClick={() => turn(deg + STEP)}
          className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-[2px] border border-green-950 px-3 text-xs font-semibold text-green-950 hover:bg-sand-100"
        >
          Look right <ArrowRight2 size={14} color="currentColor" aria-hidden />
        </button>
        <span className="mx-1 hidden h-5 w-px bg-sand-300 sm:block" aria-hidden />
        <span className="text-xs text-grey-700">Jump to:</span>
        {HOTSPOTS.map((h) => (
          <button
            key={h.id}
            type="button"
            aria-pressed={hotspot === h.id}
            onClick={() => { setHotspot(h.id); turn(h.deg - 90); }}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-xs font-semibold",
              hotspot === h.id ? "border-green-950 bg-green-950 text-white" : "border-sand-300 bg-white text-green-950 hover:border-green-950",
            )}
          >
            {h.label}
          </button>
        ))}
      </div>

      <p className={cn("flex items-start gap-2 rounded-[4px] bg-sand-100 p-3 text-sm text-green-950", !active && "sr-only")} aria-live="polite">
        {active && <Headphone size={18} color="currentColor" className="mt-0.5 shrink-0" aria-hidden />}
        {active ? <span><span className="font-semibold">Audio note · {active.label}:</span> {active.note}</span> : ""}
      </p>
    </div>
  );
}
