"use client";

import { useEffect, useState } from "react";
import { useLocal } from "@/lib/useLocal";
import { STUDIO_KEY, demoStudio, type Studio, type Work } from "@/lib/data/studio";
import { usePortfolio, type Piece } from "@/lib/portfolio";

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

/** A portfolio piece as a work on the studio wall, and back. */
const toWork = (p: Piece): Work => ({ id: p.id, title: p.title, medium: p.kind, size: p.detail ?? "", year: p.year, photo: p.photo, image: p.image, story: p.story ?? "" });
const toPiece = (w: Work, prev?: Piece): Piece => ({
  id: w.id, title: w.title, kind: w.medium, detail: w.size || undefined, year: w.year, photo: w.image ? undefined : w.photo, image: w.image,
  story: w.story || undefined, link: prev?.link, createdAt: prev?.createdAt ?? Date.now(),
});

/**
 * The logged-in member's studio, saved in localStorage ("ac:studio"). The wall is the member's portfolio
 * (lib/portfolio): the same pieces as the Work tab on their profile and in their applications, so adding or
 * removing work here changes it everywhere. A wall saved before the portfolio existed moves in once.
 */
export function useMyStudio(): StudioState {
  const [raw, setStudio, ready] = useLocal<Studio | null>(STUDIO_KEY, null);
  const pf = usePortfolio();
  const both = ready && pf.ready;

  useEffect(() => {
    if (!both || !raw?.works.length) return;
    pf.importOnce(raw.works.map((w) => toPiece(w)));
    setStudio((s) => (s ? { ...s, works: [] } : s));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when an older wall is found
  }, [both, raw?.works.length]);

  const studio = raw && { ...raw, works: pf.pieces.map(toWork) };
  const merge = (works: Work[]) => pf.replace(works.map((w) => toPiece(w, pf.get(w.id))));
  return {
    studio,
    ready: both,
    create: (s) => {
      if (s.works.length) merge([...s.works, ...pf.pieces.filter((p) => !s.works.some((w) => w.id === p.id)).map(toWork)]);
      setStudio({ ...s, works: [] });
    },
    update: (patch) => {
      if (!studio) return;
      const next = apply(studio, patch);
      if (next.works !== studio.works) merge(next.works);
      setStudio({ ...next, works: [] });
    },
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
