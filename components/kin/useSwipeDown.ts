"use client";

import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";

/** The element that moves with the finger: the kit overlay panel (Community sheets) or the shell sheet (page and profile sheets). */
const PANEL = ".k-panel, .sheet";

/**
 * Handle of a phone bottom sheet (the design's "Handle area", its app-shell/useSwipeDown.ts): a tap closes the sheet, and dragging
 * it down moves the sheet with the finger; letting go far enough (or with a quick flick) closes it, otherwise the sheet springs back.
 * Spread the result on the handle: `<button className="sheet__handle" {...useSwipeDown(onClose, open)}>`.
 */
export function useSwipeDown(onClose: () => void, open = true) {
  const drag = useRef<{ id: number; y: number; t: number; dy: number; moved: boolean; panel: HTMLElement | null } | null>(null);
  const lastPanel = useRef<HTMLElement | null>(null);
  const dragged = useRef(false);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);

  // a sheet that was dragged away keeps its offset while it leaves; clear it when it opens again
  useEffect(() => {
    if (!open || !lastPanel.current) return;
    lastPanel.current.style.transform = "";
    lastPanel.current.style.transition = "";
    lastPanel.current = null;
  }, [open]);

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag.current = { id: e.pointerId, y: e.clientY, t: performance.now(), dy: 0, moved: false, panel: e.currentTarget.closest<HTMLElement>(PANEL) };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety */
      }
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dy = Math.max(0, e.clientY - d.y);
      if (!d.moved && dy < 6) return;
      d.moved = true;
      d.dy = dy;
      if (d.panel) {
        d.panel.style.transition = "none";
        d.panel.style.transform = `translateY(${dy}px)`;
      }
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      if (!d.moved) return; // a tap: the click closes
      dragged.current = true;
      const p = d.panel;
      const speed = d.dy / Math.max(1, performance.now() - d.t);
      if (d.dy > 96 || speed > 0.6) {
        if (p) {
          p.style.transition = "";
          lastPanel.current = p;
        }
        close.current();
      } else if (p) {
        p.style.transition = "transform 0.32s var(--ease-out)";
        p.style.transform = "";
      }
    },
    onPointerCancel() {
      const d = drag.current;
      drag.current = null;
      if (d?.panel) {
        d.panel.style.transition = "transform 0.32s var(--ease-out)";
        d.panel.style.transform = "";
      }
    },
    onClick(e: MouseEvent<HTMLElement>) {
      if (dragged.current) {
        dragged.current = false;
        e.preventDefault();
        return;
      }
      close.current();
    },
  };
}
