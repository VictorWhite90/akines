"use client";

import { useSyncExternalStore } from "react";

/** True when the media query matches. Server and first client render return `fallback`. */
export function useMedia(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const usePhone = () => useMedia("(max-width: 639px)", true);
