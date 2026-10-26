"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const STALL_MS = 4000;

/**
 * A thin bar across the top the moment someone taps a link, until the next page is on screen. In-app
 * navigation doesn't spin the browser's own loading icon, so without this a tap on a slow connection
 * looks like nothing happened. If the switch stalls, it falls back to a normal page load.
 */
export default function NavProgress() {
  const path = usePathname();
  const [state, setState] = useState<"idle" | "going" | "done">("idle");
  const done = useRef<ReturnType<typeof setTimeout>>(undefined);
  const stuck = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const to = new URL(a.href, location.href);
      if (to.origin !== location.origin) return;
      if (to.pathname === location.pathname && to.search === location.search) return; // same page or a #section
      clearTimeout(done.current);
      clearTimeout(stuck.current);
      setState("going");
      // A slow connection can stall the in-app page switch. After a few seconds, load the page the normal way
      // instead: it gets a fresh request and the browser shows its own loading icon.
      stuck.current = setTimeout(() => { if (location.pathname !== to.pathname) location.assign(to.href); }, STALL_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // The new page is showing: finish the bar and fade it out.
  useEffect(() => {
    clearTimeout(stuck.current);
    setState((s) => {
      if (s !== "going") return s;
      done.current = setTimeout(() => setState("idle"), 400);
      return "done";
    });
  }, [path]);

  if (state === "idle") return null;
  return <div className={`nav-progress ${state}`} role="progressbar" aria-label="Opening the page" />;
}
