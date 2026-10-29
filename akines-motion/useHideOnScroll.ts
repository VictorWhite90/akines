"use client";

import { useEffect, useRef, useState } from "react";

/** Scrolling this many pixels in one direction hides (down) or shows (up) the header. Ignores jitter. */
const TRAVEL = 8;

/**
 * Hides a fixed header on scroll down and shows it on scroll up. Extracted from the landing Header.
 * Returns { hidden, setHidden, barRef }: put `data-hidden={hidden ? "true" : "false"}` and `ref={barRef}`
 * on the header, and style the hidden state with header-hide.css.
 *
 * The header always shows within its own height from the top, while `pinned` is true (for example while a
 * menu is open), and while the html element carries `data-gliding` (set by scrollToId in motion.ts while a
 * link glides to a section, so the section lands under the header with no gap).
 */
export function useHideOnScroll(pinned = false) {
  const [hidden, setHidden] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef(pinned);
  const travel = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    pinnedRef.current = pinned;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a pinned header must be visible
    if (pinned) setHidden(false);
  }, [pinned]);

  useEffect(() => {
    let frame = 0;
    lastY.current = window.scrollY;
    const update = () => {
      frame = 0;
      // Clamp to the real scroll range so rubber-banding at either end is not read as a direction.
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const pos = Math.min(Math.max(0, window.scrollY), max);
      const dy = pos - lastY.current;
      lastY.current = pos;
      const barHeight = barRef.current ? barRef.current.offsetHeight : 80;
      if (pos <= barHeight || pinnedRef.current || document.documentElement.hasAttribute("data-gliding")) {
        travel.current = 0;
        setHidden(false);
        return;
      }
      if (dy === 0) return;
      if (Math.sign(dy) !== Math.sign(travel.current)) travel.current = 0;
      travel.current += dy;
      if (travel.current > TRAVEL) setHidden(true);
      else if (travel.current < -TRAVEL) setHidden(false);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /** Call from the header's onFocus so keyboard users always get to see it. */
  const reveal = () => {
    travel.current = 0;
    setHidden(false);
  };
  return { hidden, setHidden, reveal, barRef };
}
