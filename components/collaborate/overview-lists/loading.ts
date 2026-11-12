"use client";

import { useEffect, useState } from "react";
import { DEMO } from "@/lib/demo/mode";

/*
 * The design's Loading frames: a screen shows its skeleton the first time it is opened in a visit (2.5 s, the
 * Figma AFTER_TIMEOUT) and then itself. Its "state-loading" route shows the skeleton too and then goes on to the
 * screen; that visit counts as the first one, so the screen does not load twice.
 */

export const LOADING_MS = 2500;
const seen = new Set<string>();
/** True the first time a key is asked for in this visit. */
export const takeFirstVisit = (key: string) => {
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
};

/** Whether the screen `key` still shows its first-visit skeleton. `stateRoute` is the "state-loading" route: then `onDone` moves on. */
export function useFirstVisit(key: string, { stateRoute, skip, onDone }: { stateRoute?: boolean; skip?: boolean; onDone?: () => void } = {}) {
  const [loading, setLoading] = useState(() => {
    if (stateRoute) { takeFirstVisit(key); return true; }
    // The timed skeleton is the prototype's: the preview shows it, the live app never waits on a timer. On real data
    // a screen shows its skeleton only while its data is actually loading (each screen's own `ready` check).
    if (!DEMO) return false;
    return skip ? false : takeFirstVisit(key);
  });
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => (stateRoute && onDone ? onDone() : setLoading(false)), LOADING_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per loading frame
  }, [loading, stateRoute]);
  return loading;
}
