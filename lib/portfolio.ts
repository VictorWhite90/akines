"use client";

import { DEMO } from "@/lib/demo/mode";
import type { PhotoKey } from "@/lib/data/images";
import { newId, useLocal } from "@/lib/useLocal";
import { shrinkImage } from "@/lib/imageShrink";

/**
 * A member's portfolio: the work they've made, in any line of work (an app, a mural, a menu, a supper club).
 * One place, used everywhere: the Work tab on their profile, the wall in My Studio, and applications to
 * open calls. Saved in the browser for now ("ak:portfolio"); the same shape goes to the API later, with the
 * photo uploaded to file storage instead of kept as a data URL.
 */
export type Piece = {
  id: string;
  title: string;
  /** What kind of work it is, in the member's words: "Web app", "Mural", "Catering", "Product design". */
  kind: string;
  year: string;
  /** A short detail: "12 screens", "20 m wall", "150 guests". */
  detail?: string;
  /** Where people can see it: a live site, a repo, a video. */
  link?: string;
  story?: string;
  /** The member's own photo (a shrunk data URL in the demo). */
  image?: string;
  /** A catalogue photo, for sample pieces only. */
  photo?: PhotoKey;
  createdAt: number;
};

type State = { pieces: Piece[]; /** Pieces already on a My Studio wall have been moved in once. */ importedStudio?: boolean };

export const PORTFOLIO_KEY = "ak:portfolio";
export const KIND_SUGGESTIONS = ["Product design", "Web app", "Mobile app", "Brand design", "Photography", "Video", "Mural", "Illustration", "Writing", "Podcast", "Event", "Catering", "Workshop", "Research", "Community project"];

const DAY = 86_400_000;
/** The demo member's work, so a preview has something to show. A real account starts empty. */
const samplePieces = (): Piece[] => {
  const t = Date.UTC(2026, 9, 1);
  return [
    { id: "w-clinic", title: "Clinic check-in, redesigned", kind: "Product design", year: "2026", detail: "8 screens", photo: "studioBusy", story: "Sat in a Garki waiting room for two mornings. Half the queue was people unsure if they'd been called.", link: "https://clinicqueue.ng", createdAt: t },
    { id: "w-market", title: "Wuse market stall identities", kind: "Brand design", year: "2025", detail: "12 stalls", photo: "beadsHung", story: "Signs for twelve traders, painted by hand from my drawings.", createdAt: t - DAY },
    { id: "w-journal", title: "Field notes app for nurses", kind: "Product design", year: "2025", detail: "Mobile app", photo: "journalOpen", story: "Designed with six nurses on night shift. They wanted fewer taps, not more features.", createdAt: t - 2 * DAY },
    { id: "w-poster", title: "Youth hackathon posters", kind: "Graphic design", year: "2025", detail: "Series of 6", photo: "collabArt", createdAt: t - 3 * DAY },
    { id: "w-cafe", title: "Café menu and signage", kind: "Brand design", year: "2024", photo: "talkCafe", createdAt: t - 4 * DAY },
    { id: "w-gallery", title: "Exhibition wayfinding", kind: "Spatial design", year: "2024", photo: "frameWall", createdAt: t - 5 * DAY },
  ];
};

export function usePortfolio() {
  const [state, setState, ready] = useLocal<State>(PORTFOLIO_KEY, { pieces: DEMO ? samplePieces() : [] });
  const pieces = state.pieces;
  return {
    pieces,
    ready,
    importedStudio: !!state.importedStudio,
    get: (id: string) => pieces.find((p) => p.id === id),
    add: (p: Omit<Piece, "id" | "createdAt">) => {
      const piece: Piece = { ...p, id: newId("pc"), createdAt: Date.now() };
      setState((s) => ({ ...s, pieces: [piece, ...s.pieces] }));
      return piece;
    },
    edit: (id: string, patch: Partial<Piece>) => setState((s) => ({ ...s, pieces: s.pieces.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
    remove: (id: string) => setState((s) => ({ ...s, pieces: s.pieces.filter((p) => p.id !== id) })),
    /** Replace the whole list (My Studio reorders and removes through this). */
    replace: (next: Piece[]) => setState((s) => ({ ...s, pieces: next })),
    /** Moves pieces from an older My Studio wall in, once. */
    importOnce: (fromStudio: Piece[]) => setState((s) => (s.importedStudio ? s : { importedStudio: true, pieces: [...s.pieces, ...fromStudio.filter((w) => !s.pieces.some((p) => p.id === w.id))] })),
  };
}

/** A photo from the member's device, shrunk so it costs a few hundred KB at most. */
export async function photoToDataUrl(file: File): Promise<string> {
  const small = await shrinkImage(file, 1100);
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(small);
  });
}
