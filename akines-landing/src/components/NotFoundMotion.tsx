'use client';

import { useEffect } from 'react';

/**
 * Gentle pointer parallax for the 404 photograph: sets --mx and --my (-1 to 1) on the page wrapper,
 * and the CSS eases the photograph toward them. Only on devices with a hovering pointer, and never
 * with reduced motion.
 */
export function NotFoundMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.nf');
    if (!root) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || calm.matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      root.style.setProperty('--mx', x.toFixed(3));
      root.style.setProperty('--my', y.toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
