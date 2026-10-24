import type { LiveEvent } from "@/lib/api/chat";

/** Demo stand-in for the live (WebSocket) connection: the fake backend pushes events here. */
const listeners = new Set<(e: LiveEvent) => void>();

export const demoBus = {
  on(fn: (e: LiveEvent) => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  emit(e: LiveEvent) {
    listeners.forEach((fn) => fn(e));
  },
};
