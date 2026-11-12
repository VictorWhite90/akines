"use client";

import { useSyncExternalStore } from "react";

/** The app's three layouts, as the product design draws them: phones below 768, tablets below 1280, desktop above. */
export type Layout = "desktop" | "tablet" | "mobile";
const MQ = { mobile: "(max-width: 767px)", tablet: "(min-width: 768px) and (max-width: 1279px)" };
function subscribe(cb: () => void) {
  const a = window.matchMedia(MQ.mobile), t = window.matchMedia(MQ.tablet);
  a.addEventListener("change", cb); t.addEventListener("change", cb);
  return () => { a.removeEventListener("change", cb); t.removeEventListener("change", cb); };
}
const current = (): Layout => (window.matchMedia(MQ.mobile).matches ? "mobile" : window.matchMedia(MQ.tablet).matches ? "tablet" : "desktop");
export function useLayout(): Layout {
  return useSyncExternalStore(subscribe, current, () => "desktop");
}
