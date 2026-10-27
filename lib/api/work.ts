"use client";

import { useSyncExternalStore } from "react";
import type { LinkKind, ProofFile, ProofLink } from "@/lib/collab/types";
import { api, upload } from "@/lib/api/client";
import { shrinkImage } from "@/lib/imageShrink";
import type { Piece } from "@/lib/portfolio";
import type { Level, WorkProfile } from "@/lib/workprofile";

/**
 * The work profile and projects, saved to the backend (/api/v1/work/*). One request loads both; edits are
 * applied on screen straight away and saved behind the scenes (profile edits are batched while typing).
 * Demo builds keep using the in-browser stores in lib/workprofile.ts and lib/portfolio.ts instead.
 */

export type ApiMedia = { id: number; url: string; name: string; size: number | null; type: string | null };
export type ApiProject = {
  id: string; title: string; kind: string; role: string; year: number; detail: string; story: string; skills: string[];
  links: ProofLink[]; position: number; created_at: string; photos: ApiMedia[]; files: ApiMedia[];
};
type ApiProfile = {
  field: string; headline: string; level: string; about: string; skills: string[]; open_to: string[]; hours: string;
  rate: { amount: number | null; unit: string } | null; work_mode: string; area: string; languages: string[];
  links: ProofLink[]; cv: ApiMedia | null; published_at: string | null; updated_at?: string; projects: ApiProject[];
};

const LEVEL_TO_API: Record<string, string> = { "0–1 years": "0-1", "2–4 years": "2-4", "4+ years": "4+" };
const LEVEL_FROM_API: Record<string, Level> = { "0-1": "0–1 years", "2-4": "2–4 years", "4+": "4+ years" };
const WHERE_TO_API: Record<string, string> = { "In person": "in_person", Remote: "remote", Both: "both" };
const WHERE_FROM_API: Record<string, WorkProfile["where"]> = { in_person: "In person", remote: "Remote", both: "Both" };

/** Uploaded photos are shown by URL; saving a project needs their ids back. */
const photoIds = new Map<string, number>();

export const fileOut = (m: ApiMedia, kind: ProofFile["kind"]): ProofFile => ({ id: String(m.id), name: m.name, size: m.size ?? 0, type: m.type ?? "", kind, url: m.url });

function profileFromApi(a: ApiProfile): WorkProfile {
  return {
    field: a.field, headline: a.headline, level: LEVEL_FROM_API[a.level], about: a.about, skills: a.skills,
    experience: [], education: [], certificates: [], openTo: a.open_to, hours: a.hours || undefined,
    rate: a.rate ? { amount: a.rate.amount ?? undefined, unit: a.rate.unit as NonNullable<WorkProfile["rate"]>["unit"] } : undefined,
    where: WHERE_FROM_API[a.work_mode], area: a.area || undefined, languages: a.languages, links: a.links,
    cv: a.cv ? fileOut(a.cv, "cv") : undefined,
    publishedAt: a.published_at ? Date.parse(a.published_at) : undefined, updatedAt: a.updated_at ? Date.parse(a.updated_at) : undefined,
  };
}

function profileToApi(p: Partial<WorkProfile>) {
  const out: Record<string, unknown> = {};
  if ("field" in p) out.field = p.field ?? "";
  if ("headline" in p) out.headline = p.headline ?? "";
  if ("level" in p) out.level = p.level ? LEVEL_TO_API[p.level] ?? "" : "";
  if ("about" in p) out.about = p.about ?? "";
  if ("skills" in p) out.skills = p.skills ?? [];
  if ("openTo" in p) out.open_to = p.openTo ?? [];
  if ("hours" in p) out.hours = p.hours ?? "";
  if ("rate" in p) { out.rate_unit = p.rate?.unit ?? ""; out.rate_amount = p.rate?.amount ?? null; }
  if ("where" in p) out.work_mode = p.where ? WHERE_TO_API[p.where] : "";
  if ("area" in p) out.area = p.area ?? "";
  if ("languages" in p) out.languages = p.languages ?? [];
  if ("links" in p) out.links = (p.links ?? []).map((l) => ({ url: l.url, note: l.note ?? "" }));
  if ("cv" in p) out.cv_id = p.cv ? Number(p.cv.id) : null;
  return out;
}

export function pieceFromApi(a: ApiProject): Piece {
  const [cover, ...rest] = a.photos;
  for (const ph of a.photos) photoIds.set(ph.url, ph.id);
  return {
    id: a.id, title: a.title, kind: a.kind, role: a.role || undefined, year: String(a.year), detail: a.detail || undefined,
    story: a.story || undefined, skills: a.skills, links: a.links, link: a.links[0]?.url,
    image: cover?.url, images: rest.map((p) => p.url), files: a.files.map((f) => fileOut(f, "sample")),
    createdAt: Date.parse(a.created_at),
  };
}

function pieceToApi(p: Partial<Piece>) {
  const out: Record<string, unknown> = {};
  for (const k of ["title", "kind", "role", "detail", "story", "skills"] as const) if (k in p) out[k] = p[k] ?? (k === "skills" ? [] : "");
  if ("year" in p) out.year = Number(p.year);
  if ("links" in p) out.links = (p.links ?? []).map((l) => ({ url: l.url, note: l.note ?? "" }));
  if ("image" in p || "images" in p) out.photo_ids = [p.image, ...(p.images ?? [])].filter((u): u is string => !!u).map((u) => photoIds.get(u)).filter((n): n is number => n !== undefined);
  if ("files" in p) out.file_ids = (p.files ?? []).map((f) => Number(f.id)).filter((n) => Number.isFinite(n));
  return out;
}

/** The stored id of a photo uploaded this session (attaching it to something needs the id, the screens keep the URL). */
export const mediaIdFor = (url: string) => photoIds.get(url);

/** Uploads a photo from the device (shrunk first) and returns its URL. */
export async function uploadWorkPhoto(file: File): Promise<string> {
  const small = await shrinkImage(file, 1600);
  const form = new FormData();
  form.append("photo", small, file.name.replace(/\.[^.]+$/, "") + ".jpg");
  const r = await upload<ApiMedia>("work/uploads/photo", form);
  if (!r.ok) throw new Error(r.message);
  photoIds.set(r.data.url, r.data.id);
  return r.data.url;
}

/** Uploads a CV or a project file; the server checks its content. */
export async function uploadWorkFile(file: File, purpose: "cv" | "file"): Promise<ProofFile> {
  const form = new FormData();
  form.append("file", file);
  const r = await upload<ApiMedia>(`work/uploads/${purpose}`, form);
  if (!r.ok) throw new Error(r.message);
  return fileOut(r.data, purpose === "cv" ? "cv" : "sample");
}

// ── A small shared store, so every screen sees the same profile ───────────────────────────────

type Save = "idle" | "saving" | "error";
type Snapshot = { ready: boolean; wp: WorkProfile; pieces: Piece[]; save: Save; message?: string };
const EMPTY: WorkProfile = { field: "", headline: "", about: "", skills: [], experience: [], education: [], certificates: [], openTo: [], languages: ["English"], links: [] };
let snap: Snapshot = { ready: false, wp: EMPTY, pieces: [], save: "idle" };
let loading = false;
const subs = new Set<() => void>();
const emit = (next: Partial<Snapshot>) => { snap = { ...snap, ...next }; subs.forEach((f) => f()); };
/** Temporary ids of projects still being created, mapped to their real ids once saved. */
const aliases = new Map<string, string>();

async function load() {
  if (loading || snap.ready) return;
  loading = true;
  const r = await api.get<ApiProfile>("work/profile");
  loading = false;
  if (r.ok) emit({ ready: true, wp: profileFromApi(r.data), pieces: r.data.projects.map(pieceFromApi) });
  else emit({ ready: true, save: "error", message: r.message });
}

function subscribe(f: () => void) {
  subs.add(f);
  void load();
  return () => subs.delete(f);
}
const server = { ready: false, wp: EMPTY, pieces: [], save: "idle" } as Snapshot;

let pending: Record<string, unknown> = {};
let timer: ReturnType<typeof setTimeout> | undefined;
async function flush() {
  clearTimeout(timer);
  const body = pending;
  pending = {};
  if (!Object.keys(body).length) return true;
  emit({ save: "saving" });
  const r = await api.put<ApiProfile>("work/profile", body);
  if (!r.ok) { emit({ save: "error", message: r.message }); return false; }
  // Keep what's on screen (the member may have typed more meanwhile); take the server's cleaned CV and links.
  emit({ save: Object.keys(pending).length ? "saving" : "idle", message: undefined, wp: { ...snap.wp, cv: profileFromApi(r.data).cv } });
  return true;
}

export function useRemoteWork() {
  const s = useSyncExternalStore(subscribe, () => snap, () => server);
  const real = (id: string) => aliases.get(id) ?? id;

  return {
    ...s,
    patch: (p: Partial<WorkProfile>) => {
      emit({ wp: { ...snap.wp, ...p } });
      Object.assign(pending, profileToApi(p));
      clearTimeout(timer);
      timer = setTimeout(() => void flush(), 700);
    },
    publish: async () => {
      if (!(await flush())) return false;
      const r = await api.post<ApiProfile>("work/profile/publish");
      if (!r.ok) { emit({ save: "error", message: r.message }); return false; }
      emit({ wp: { ...snap.wp, publishedAt: Date.parse(r.data.published_at ?? "") || Date.now() } });
      return true;
    },
    get: (id: string) => snap.pieces.find((p) => p.id === real(id)),
    add: (p: Omit<Piece, "id" | "createdAt">): Piece => {
      const temp: Piece = { ...p, id: `tmp-${Date.now().toString(36)}`, createdAt: Date.now() };
      emit({ pieces: [temp, ...snap.pieces] });
      void api.post<ApiProject>("work/projects", pieceToApi(p)).then((r) => {
        if (!r.ok) return emit({ pieces: snap.pieces.filter((x) => x.id !== temp.id), save: "error", message: r.message });
        aliases.set(temp.id, r.data.id);
        emit({ pieces: snap.pieces.map((x) => (x.id === temp.id ? pieceFromApi(r.data) : x)) });
      });
      return temp;
    },
    edit: (id: string, patch: Partial<Piece>) => {
      const target = real(id);
      emit({ pieces: snap.pieces.map((x) => (x.id === target ? { ...x, ...patch } : x)) });
      void api.put<ApiProject>(`work/projects/${target}`, pieceToApi(patch)).then((r) => {
        if (r.ok) emit({ pieces: snap.pieces.map((x) => (x.id === target ? pieceFromApi(r.data) : x)) });
        else emit({ save: "error", message: r.message });
      });
    },
    remove: (id: string) => {
      const target = real(id);
      const before = snap.pieces;
      emit({ pieces: before.filter((x) => x.id !== target) });
      void api.del(`work/projects/${target}`).then((r) => { if (!r.ok) emit({ pieces: before, save: "error", message: r.message }); });
    },
  };
}

export type { LinkKind };
