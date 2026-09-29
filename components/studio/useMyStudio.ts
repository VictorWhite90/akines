"use client";

import { useState } from "react";
import { useLocal } from "@/lib/useLocal";
import { STUDIO_KEY, demoStudio, type Studio } from "@/lib/data/studio";

export type StudioPatch = Partial<Studio> | ((s: Studio) => Studio);
export type StudioState = {
  /** The member's studio, or null when they have not opened one yet. */
  studio: Studio | null;
  /** False until the browser has read localStorage (render a skeleton until then). */
  ready: boolean;
  create: (s: Studio) => void;
  update: (patch: StudioPatch) => void;
  reset: () => void;
};

const apply = (s: Studio, patch: StudioPatch): Studio => (typeof patch === "function" ? patch(s) : { ...s, ...patch });

/** The logged-in member's studio, saved in localStorage ("ac:studio"). */
export function useMyStudio(): StudioState {
  const [studio, setStudio, ready] = useLocal<Studio | null>(STUDIO_KEY, null);
  return {
    studio,
    ready,
    create: (s) => setStudio(s),
    update: (patch) => setStudio((prev) => (prev ? apply(prev, patch) : prev)),
    reset: () => setStudio(null),
  };
}

/**
 * Like useMyStudio, but `demo` keeps everything in memory and never touches storage:
 * "1" or "live" starts from a fully seeded studio; anything else ("wizard1"...) starts with none.
 */
export function useStudioState(demo?: string): StudioState {
  const real = useMyStudio();
  const [mem, setMem] = useState<Studio | null>(() => (demo === "1" || demo === "live" ? demoStudio() : null));
  if (!demo) return real;
  return {
    studio: mem,
    ready: true,
    create: (s) => setMem(s),
    update: (patch) => setMem((prev) => (prev ? apply(prev, patch) : prev)),
    reset: () => setMem(null),
  };
}
