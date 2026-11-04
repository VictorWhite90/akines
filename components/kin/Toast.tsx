"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** The design's toast: one short message at the bottom, gone after a moment. Call `toast.show(...)` anywhere. */
type T = { id: number; message: string; actionLabel?: string; onAction?: () => void; duration?: number };
let current: T | null = null;
let n = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export const toast = {
  show(t: Omit<T, "id">) { current = { ...t, id: ++n }; emit(); },
  dismiss() { current = null; emit(); },
};

export default function Toaster() {
  const live = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => current, () => null);
  const [shown, setShown] = useState<T | null>(null);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror the store, keeping the last toast for its exit
    if (live) { setShown(live); setClosing(false); } else setClosing(true);
  }, [live]);
  useEffect(() => {
    if (!shown || closing) return;
    const t = window.setTimeout(() => toast.dismiss(), shown.duration ?? 2500);
    return () => window.clearTimeout(t);
  }, [shown, closing]);
  useEffect(() => {
    if (!closing) return;
    const t = window.setTimeout(() => setShown(null), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300);
    return () => window.clearTimeout(t);
  }, [closing]);
  if (!shown) return null;
  return (
    <div key={shown.id} className="toast" role="status" aria-live="polite" data-state={closing ? "closed" : "open"}>
      <svg className="toast__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      <span className="toast__msg">{shown.message}</span>
      {shown.actionLabel ? <button type="button" className="toast__action" onClick={() => { shown.onAction?.(); toast.dismiss(); }}>{shown.actionLabel}</button> : null}
    </div>
  );
}
