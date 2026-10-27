"use client";

import type { ProofFile, ProofLink } from "@/lib/collab/types";
import type { PhotoKey } from "@/lib/data/images";
import { newId, useLocal } from "@/lib/useLocal";
import { shrinkImage } from "@/lib/imageShrink";
import { DEMO } from "@/lib/demo/mode";
import { uploadWorkFile, uploadWorkPhoto, useRemoteWork } from "@/lib/api/work";

/**
 * A member's projects: the work they've done, in any line of work (an app, a mural, a menu, a supper club),
 * shown the way that suits it: links, files, a written case study, photos, or a mix. Part of their work
 * profile (lib/workprofile), and used everywhere: the Work tab on their profile, the wall in My Studio and
 * applications to open calls. Saved to the backend (lib/api/work.ts); demo builds keep it in the browser
 * ("ak:portfolio").
 */
export type Piece = {
  id: string;
  title: string;
  /** What kind of work it is, in the member's words: "Web app", "Mural", "Catering", "Product design". */
  kind: string;
  year: string;
  /** A short detail: "12 screens", "20 m wall", "150 guests". */
  detail?: string;
  /** What the member did on it: "Lead designer", "Head cook", "Organiser". */
  role?: string;
  /** Where people can see it: a live site, a repo, a video (the first of `links`, kept for older pieces). */
  link?: string;
  links?: ProofLink[];
  /** Documents, decks, audio, a menu: names and sizes in the demo, stored files with the API. */
  files?: ProofFile[];
  /** The write-up: the problem, what they did, what changed. */
  story?: string;
  skills?: string[];
  /** The member's own cover photo (a shrunk data URL in the demo). */
  image?: string;
  /** More photos, after the cover. */
  images?: string[];
  /** A catalogue photo, for sample pieces only. */
  photo?: PhotoKey;
  createdAt: number;
};

type State = { pieces: Piece[]; /** Pieces already on a My Studio wall have been moved in once. */ importedStudio?: boolean };

export const PORTFOLIO_KEY = "ak:portfolio";
export const KIND_SUGGESTIONS = ["Product design", "Web app", "Mobile app", "Brand design", "Photography", "Video", "Mural", "Illustration", "Writing", "Podcast", "Event", "Catering", "Workshop", "Research", "Community project"];

const DAY = 86_400_000;
/** The demo member's work, so a preview has something to show. A real account starts empty. */
export const samplePieces = (): Piece[] => {
  const t = Date.UTC(2026, 9, 1);
  const file = (name: string, kb: number): ProofFile => ({ id: `sample-${name}`, name, size: kb * 1024, type: name.split(".").pop() ?? "", kind: "sample" });
  return [
    {
      id: "w-clinic", title: "Clinic check-in, redesigned", kind: "Product design", role: "Lead designer", year: "2026", detail: "8 screens", photo: "studioBusy",
      story: "Patients at a Garki clinic waited up to three hours, unsure whether they'd been called. I spent two mornings in the waiting room, then designed a check-in and queue screen with the nurses.\n\nWaiting complaints dropped by half in the first month.",
      links: [{ url: "https://clinicqueue.ng", kind: "site", note: "Live app" }, { url: "https://figma.com/file/clinic-checkin", kind: "figma" }], link: "https://clinicqueue.ng",
      files: [file("Clinic-checkin-case-study.pdf", 2300)], skills: ["User research", "Product design", "Prototyping"], createdAt: t,
    },
    {
      id: "w-research", title: "What Wuse market traders need from a phone", kind: "Research", role: "Researcher", year: "2025", detail: "24 interviews",
      story: "Interviewed 24 traders about how they take orders and payments. The report shaped a small ordering tool now used by 12 stalls.",
      files: [file("Wuse-traders-research-report.pdf", 1800)], skills: ["User research", "Interviewing", "Report writing"], createdAt: t - DAY,
    },
    {
      id: "w-journal", title: "Field notes app for nurses", kind: "Mobile app", role: "Product designer", year: "2025", photo: "journalOpen",
      story: "Designed with six nurses on night shift. They wanted fewer taps, not more features, so the whole app is three screens.",
      links: [{ url: "https://github.com/amara-okafor/field-notes", kind: "github" }], skills: ["Mobile design", "Accessibility"], createdAt: t - 2 * DAY,
    },
    {
      id: "w-mentoring", title: "Design mentoring circle", kind: "Mentoring", role: "Mentor", year: "2024", detail: "4 mentees",
      story: "Weekly calls with four junior designers in Abuja for a year. Two now work full time in product teams.", skills: ["Mentoring", "Design critique"], createdAt: t - 3 * DAY,
    },
    {
      id: "w-poster", title: "Youth hackathon posters", kind: "Graphic design", role: "Designer", year: "2025", detail: "Series of 6", photo: "collabArt",
      story: "Posters and social cards for a 300-person youth hackathon at the Abuja Tech Hub.", skills: ["Graphic design", "Branding"], createdAt: t - 4 * DAY,
    },
  ];
};


function useLocalPortfolio() {
  // Everyone, demo included, builds their own. The demo's "Fill with an example" adds the sample pieces.
  const [state, setState, ready] = useLocal<State>(PORTFOLIO_KEY, { pieces: [] });
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

/** The same store, saved to the backend: projects are created, edited and removed through /api/v1/work. */
function useRemotePortfolio() {
  const w = useRemoteWork();
  return {
    pieces: w.pieces,
    ready: w.ready,
    importedStudio: true,
    get: w.get,
    add: w.add,
    edit: w.edit,
    remove: w.remove,
    /** My Studio's wall saves through this: new pieces are created, missing ones removed, changed ones saved. */
    replace: (next: Piece[]) => {
      for (const p of w.pieces) if (!next.some((n) => n.id === p.id)) w.remove(p.id);
      for (const n of next) {
        const was = w.pieces.find((p) => p.id === n.id);
        if (!was) w.add(n);
        else if (JSON.stringify(was) !== JSON.stringify(n)) w.edit(n.id, n);
      }
    },
    importOnce: () => {},
  };
}

/** Demo builds keep projects in the browser; the real app saves them to the backend. */
export const usePortfolio: () => ReturnType<typeof useLocalPortfolio> = DEMO ? useLocalPortfolio : useRemotePortfolio;

/** A project photo from the member's device: uploaded (and shrunk) in the real app, a data URL in the demo. */
export const storePhoto = (file: File): Promise<string> => (DEMO ? photoToDataUrl(file) : uploadWorkPhoto(file));

/** A CV or project file: uploaded and checked by the server in the real app; just its name and size in the demo. */
export const storeFile = async (file: File, kind: ProofFile["kind"]): Promise<ProofFile> =>
  DEMO ? { id: `${kind}-${file.name}-${file.size}`, name: file.name, size: file.size, type: file.type || file.name.split(".").pop() || "", kind } : uploadWorkFile(file, kind === "cv" ? "cv" : "file");

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
