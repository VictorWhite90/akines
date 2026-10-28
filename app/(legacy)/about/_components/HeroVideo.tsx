"use client";

import { useEffect, useRef } from "react";

type Conn = { saveData?: boolean; effectiveType?: string; downlink?: number };

/**
 * The About hero video, fetched only after the page is ready to use, and dropped the moment someone taps a
 * link. On a slow connection a streaming 6–10 MB video takes nearly all the bandwidth, so the next page would
 * sit waiting behind it. Until it plays the poster shows; slow connections, Data Saver and reduced motion keep
 * just the poster.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: Conn }).connection;
    const slow = !!conn && (conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType ?? "") || (conn.downlink ?? 10) < 1.5);
    if (slow || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let idle: number | ReturnType<typeof setTimeout> = 0;
    const stop = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !v.getAttribute("src") || new URL(a.href, location.href).pathname === location.pathname) return; // #sections keep it playing
      v.pause();
      v.removeAttribute("src");
      v.load(); // cancels the download in flight
    };
    const start = () => {
      const go = () => {
        v.src = matchMedia("(max-width: 760px)").matches ? "/akines/hero-mobile.mp4" : "/akines/hero.mp4";
        v.play().catch(() => {});
      };
      // A beat after load, so the next pages' prefetches finish first.
      idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 800);
    };
    document.addEventListener("click", stop, true);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      document.removeEventListener("click", stop, true);
      window.removeEventListener("load", start);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle as number);
      clearTimeout(idle);
    };
  }, []);

  return <video ref={ref} className="ak-hero-video" poster="/akines/hero-poster.jpg" muted loop playsInline preload="none" disablePictureInPicture aria-hidden />;
}
