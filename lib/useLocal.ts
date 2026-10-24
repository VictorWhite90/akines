"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * A localStorage-backed value that every component using the same key shares.
 * This is how the prototype "saves" what a member creates (rooms, studio, store, orders)
 * without a backend. Server render and first paint use `initial`.
 */
const listeners = new Set<() => void>();
const parsed = new Map<string, { raw: string; value: unknown }>();
/** Values that didn't fit in storage (it's full, or blocked): kept for this visit so the change still shows. */
const memory = new Map<string, unknown>();
const notify = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useLocal<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const seed = useRef(initial);

  const read = useCallback((): T => {
    if (memory.has(key)) return memory.get(key) as T;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return seed.current;
      const hit = parsed.get(key);
      if (hit && hit.raw === raw) return hit.value as T;
      const value = JSON.parse(raw) as T;
      parsed.set(key, { raw, value });
      return value;
    } catch {
      return seed.current;
    }
  }, [key]);

  const value = useSyncExternalStore(subscribe, read, () => seed.current);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(read()) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
        memory.delete(key);
      } catch {
        memory.set(key, resolved); // storage full or blocked: keep it for this visit
      }
      notify();
    },
    [key, read],
  );

  return [value, set, ready];
}

/** Short unique id for things a member creates. */
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
