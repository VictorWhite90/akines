"use client";

import { useEffect, useRef } from "react";

/**
 * The About hero video, fetched only after the page is ready to use. Until then the poster shows, so on a slow
 * connection the 6–10 MB video never competes with the code that makes the buttons work. Skipped entirely for
 * Data Saver and reduced motion.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let idle: number | ReturnType<typeof setTimeout> = 0;
    const start = () => {
      const go = () => {
        v.src = matchMedia("(max-width: 760px)").matches ? "/akines/hero-mobile.mp4" : "/akines/hero.mp4";
        v.play().catch(() => {});
      };
      idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 300);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle as number);
      clearTimeout(idle);
    };
  }, []);

  return <video ref={ref} className="ak-hero-video" poster="/akines/hero-poster.jpg" muted loop playsInline preload="none" disablePictureInPicture aria-hidden />;
}
