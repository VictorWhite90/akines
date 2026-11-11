"use client";

import { useMemo } from "react";
import { toast } from "@/components/kin/Toast";
import { aliasOf, mutate, realId, teamwork, tempId, useResource, type ApiComment, type ApiTeamFile } from "@/lib/api/teamwork";
import { DEMO } from "@/lib/demo/mode";
import { newId, useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import { fileSize } from "@/lib/collab/proof";
import type { Deliverable, LinkKind, Project, ProofItem, StudioItem } from "@/lib/collab/types";
import type { PhotoKey } from "@/lib/data/images";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * A project's files, as the design's Files pages show them (components/collaborate/workspace/Files, FileView).
 * Most come from the project itself: its studio (images and notes, with their comments) and the proof attached to
 * each deliverable (files, links, images, notes). Files added from the Files page, and comments on them and on proof,
 * are their own resource (lib/api/teamwork.ts, /api/v1/teamwork/projects/:id/…):
 *   GET    files                       → page of team files (?category=, ?search=), with their latest comments
 *   POST   files/upload  (multipart)   ← file, category?, work?, milestone?  (checked and stored by the backend)
 *   POST   files                       ← { name, category, work, milestone }  (a new document entry)
 *   DELETE files/:fid                  (the person who added it, or the host)
 *   POST   files/:fid/comments         ← { text }
 *   GET    files/proof-comments        → { proofId: comments }      POST proof/:proofId/comments ← { text }
 * Comments on studio items go to the studio itself (useCollab's project.comment).
 */

export const FILE_CATEGORIES = ["All", "Documents", "Images", "Research", "Design files", "Presentations", "Project references", "Other materials"] as const;
export type FileCategory = Exclude<(typeof FILE_CATEGORIES)[number], "All">;
/** The design's file tiles: a page of text, a picture, notes, shapes (design files), layers (presentations). */
export type FileIcon = "text" | "image" | "notes" | "shapes" | "layers" | "link";
export type FileLink = { text: string; href?: string };
export type FileComment = { id: string; by: PersonId; text: string; at: number };

export type ProjectFile = {
  id: string;
  /** The address of its page: /collaborate/my-projects/:id/files/:slug */
  slug: string;
  name: string;
  /** "PDF", "Word", "Image", "Note", "Link"... */
  type: string;
  /** "PDF document", for the file page. */
  typeLong: string;
  category: FileCategory;
  icon: FileIcon;
  size?: number;
  by: PersonId;
  at: number;
  /** One line about the file, when we have one. */
  about?: string;
  work?: FileLink;
  milestone?: FileLink;
  url?: string;
  photo?: PhotoKey;
  src?: string;
  text?: string;
  comments: FileComment[];
  source: { kind: "studio"; itemId: string } | { kind: "proof"; deliverableId: string; proofId: string } | { kind: "added" };
};

type Added = { id: string; projectId: string; name: string; category: FileCategory; work?: string; milestone?: string; by: PersonId; at: number; doc?: boolean };
type Store = { added: Added[]; comments: Record<string, FileComment[]> };
const KEY = "ak:collab-files:v1";

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "file";
const ext = (name: string) => (name.includes(".") ? name.split(".").pop()!.toLowerCase() : "");
export const firstName = (id: PersonId) => (PEOPLE[id]?.name ?? "A member").split(" ")[0];
export const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "A member";

/** Type, category and tile from a file name. */
function byExt(name: string): Pick<ProjectFile, "type" | "typeLong" | "category" | "icon"> {
  const e = ext(name);
  if (e === "pdf") return { type: "PDF", typeLong: "PDF document", category: "Documents", icon: "text" };
  if (e === "doc" || e === "docx") return { type: "Word", typeLong: "Word document", category: "Documents", icon: "text" };
  if (e === "txt" || e === "md") return { type: "Text", typeLong: "Text document", category: "Documents", icon: "text" };
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(e)) return { type: "Image", typeLong: "Image", category: "Images", icon: "image" };
  if (["fig", "psd", "sketch", "ai", "xd"].includes(e)) return { type: "Design file", typeLong: "Design file", category: "Design files", icon: "shapes" };
  if (["ppt", "pptx", "key"].includes(e)) return { type: "Presentation", typeLong: "Presentation", category: "Presentations", icon: "layers" };
  if (["csv", "xls", "xlsx"].includes(e)) return { type: "Spreadsheet", typeLong: "Spreadsheet", category: "Research", icon: "notes" };
  if (["mp4", "mov", "m4a", "mp3", "wav"].includes(e)) return { type: e.startsWith("m4a") || e === "mp3" || e === "wav" ? "Audio" : "Video", typeLong: e === "mp4" || e === "mov" ? "Video" : "Audio", category: "Other materials", icon: "layers" };
  return { type: "File", typeLong: "File", category: "Other materials", icon: "text" };
}
const LINK_TYPE: Partial<Record<LinkKind, Pick<ProjectFile, "type" | "typeLong" | "category" | "icon">>> = {
  figma: { type: "Design file", typeLong: "Figma design", category: "Design files", icon: "shapes" },
  drive: { type: "Link", typeLong: "Shared folder or document", category: "Documents", icon: "link" },
  github: { type: "Link", typeLong: "Code", category: "Other materials", icon: "link" },
};
const linkKind = (url: string): LinkKind => (/figma\.com/.test(url) ? "figma" : /github\.com/.test(url) ? "github" : /google\.com|docs\./.test(url) ? "drive" : "site");
const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

function fromStudio(p: Project, s: StudioItem, work?: FileLink): ProjectFile {
  const ref = s.tag === "Reference";
  const base = s.kind === "note"
    ? { type: "Note", typeLong: "Note", category: (ref ? "Project references" : "Documents") as FileCategory, icon: "notes" as const }
    : { type: "Image", typeLong: "Image", category: (ref ? "Project references" : "Images") as FileCategory, icon: "image" as const };
  return { ...base, id: s.id, slug: slugOf(s.title), name: s.title, by: s.by, at: s.at, about: s.kind === "note" ? s.text : undefined, work, photo: s.photo, src: s.src, text: s.text,
    comments: s.comments.map((c, i) => ({ id: `${s.id}-c${i}`, by: c.by, text: c.text, at: c.at })), source: { kind: "studio", itemId: s.id } };
}

function fromProof(d: Deliverable, x: ProofItem, work: FileLink): ProjectFile {
  // The message the work was sent with says what it is.
  const sent = d.thread.find((t) => t.by === x.by && Math.abs(t.at - x.at) < 60_000 && (t.kind === "submitted" || t.kind === "comment"));
  const common = { id: x.id, by: x.by, at: x.at, work, about: sent?.text, comments: [] as FileComment[], source: { kind: "proof" as const, deliverableId: d.id, proofId: x.id } };
  if (x.kind === "file" && x.file) return { ...common, ...byExt(x.file.name), slug: slugOf(x.file.name), name: x.file.name, size: x.file.size, url: x.file.url };
  if (x.kind === "image") return { ...common, type: "Image", typeLong: "Image", category: "Images", icon: "image", slug: slugOf(x.title), name: x.title, photo: x.photo, src: x.src };
  if (x.kind === "note") return { ...common, type: "Note", typeLong: "Note", category: "Documents", icon: "notes", slug: slugOf(x.title), name: x.title, text: x.text, about: x.text };
  const url = x.url ?? "";
  return { ...common, ...(LINK_TYPE[linkKind(url)] ?? { type: "Link", typeLong: "Link", category: "Project references", icon: "link" }), slug: slugOf(x.title), name: x.title, url, typeLong: `Link to ${host(url)}` };
}

/** Everything the project is built on, newest first. `workHref` gives the address of a deliverable's task. */
export function filesOf(p: Project, extra: Store, workHref: (d: Deliverable) => string | undefined): ProjectFile[] {
  const out: ProjectFile[] = [];
  const studio = p.studio ?? [];
  const proofs = (p.deliverables ?? []).flatMap((d) => d.proof.map((x) => ({ d, x })));
  for (const s of studio) {
    // A studio picture that is also proof for a deliverable is one file, linked to that work.
    const twin = proofs.find(({ x }) => (x.photo && x.photo === s.photo) || x.title === s.title);
    out.push(fromStudio(p, s, twin ? { text: twin.d.title, href: workHref(twin.d) } : undefined));
  }
  for (const { d, x } of proofs) {
    if (studio.some((s) => (x.photo && x.photo === s.photo) || x.title === s.title)) continue;
    out.push(fromProof(d, x, { text: d.title, href: workHref(d) }));
  }
  for (const a of extra.added.filter((a) => a.projectId === p.id)) {
    const t = a.doc ? { type: "Document", typeLong: "Shared document", category: a.category, icon: "text" as const } : { ...byExt(a.name), category: a.category };
    out.push({ ...t, id: a.id, slug: slugOf(a.name), name: a.name, by: a.by, at: a.at, work: a.work ? { text: a.work } : undefined, milestone: a.milestone ? { text: a.milestone } : undefined, comments: [], source: { kind: "added" } });
  }
  // Unique addresses, and the comments kept here.
  const seen = new Map<string, number>();
  for (const f of out) {
    const n = seen.get(f.slug) ?? 0;
    seen.set(f.slug, n + 1);
    if (n) f.slug = `${f.slug}-${n + 1}`;
    f.comments = [...f.comments, ...(extra.comments[`${p.id}/${f.id}`] ?? [])];
  }
  return out.sort((a, b) => b.at - a.at);
}

const dayFmt = (at: number) => new Date(at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", "");
/** "PDF, 420 KB, shared by Kwame Mensah, Wed 28 Oct" */
export const fileMeta = (f: ProjectFile) => [f.type === "Link" && f.url ? `Link, ${host(f.url)}` : f.type, f.size ? fileSize(f.size) : null, `shared by ${nameOf(f.by)}`, dayFmt(f.at)].filter(Boolean).join(", ");
/** Two letters for the owner badge. */
export const initialsOf = (id: PersonId) => nameOf(id).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

type AddInput = { name: string; category: FileCategory; work?: string; milestone?: string; doc?: boolean; /** The picked file (needed on the backend). */ file?: File };

/** A project's files, and what the member can add. */
function useLocalFiles(p: Project | undefined, workHref: (d: Deliverable) => string | undefined) {
  const [store, setStore, ready] = useLocal<Store>(KEY, { added: [], comments: {} });
  const files = useMemo(() => (p ? filesOf(p, store, workHref) : []), [p, store, workHref]);
  const pid = p?.id ?? "";
  return {
    ready,
    files,
    get: (slug: string) => files.find((f) => f.slug === slug || f.id === slug),
    add: (input: AddInput) => {
      const { file, ...rest } = input;
      void file;
      const a: Added = { ...rest, id: newId("file"), projectId: pid, by: ME, at: Date.now() };
      setStore((cur) => ({ ...cur, added: [...cur.added, a] }));
      return a.id;
    },
    remove: (id: string) => setStore((cur) => ({ ...cur, added: cur.added.filter((a) => a.id !== id) })),
    /** A comment on a file that is not a studio item. */
    comment: (fileId: string, text: string) => setStore((cur) => {
      const k = `${pid}/${fileId}`;
      return { ...cur, comments: { ...cur.comments, [k]: [...(cur.comments[k] ?? []), { id: newId("fc"), by: ME, text, at: Date.now() }] } };
    }),
  };
}

// ── On the backend ──────────────────────────────────────────────────────────────────────────

type Remote = { added: ApiTeamFile[]; proof: Record<string, ApiComment[]> };
const NONE: Remote = { added: [], proof: {} };
const CATEGORY_SET = new Set<string>(FILE_CATEGORIES);
const person = (id: string | null) => (id ?? "akines") as PersonId;
const commentFromApi = (c: ApiComment): FileComment => ({ id: String(c.id), by: person(c.by), text: c.text, at: Date.parse(c.at) });

function teamFileOut(f: ApiTeamFile): ProjectFile {
  const image = f.type?.startsWith("image/");
  const t = f.kind === "document" ? { type: "Document", typeLong: "Shared document", icon: "text" as const }
    : image ? { type: "Image", typeLong: "Image", icon: "image" as const } : byExt(f.name);
  const category = (CATEGORY_SET.has(f.category) && f.category !== "All" ? f.category : "Other materials") as FileCategory;
  return {
    ...t, category, id: f.id, slug: slugOf(f.name), name: f.name, by: person(f.by), at: Date.parse(f.at), about: f.about || undefined,
    size: f.size ?? undefined, url: f.url ?? undefined, src: image ? f.url ?? undefined : undefined,
    work: f.work ? { text: f.work } : undefined, milestone: f.milestone ? { text: f.milestone } : undefined,
    comments: (f.comments ?? []).map(commentFromApi), source: { kind: "added" },
  };
}

function useRemoteFiles(p: Project | undefined, workHref: (d: Deliverable) => string | undefined) {
  const pid = p?.id ?? "";
  const key = pid ? `tw:files:${pid}` : null;
  const loaded = useResource<Remote>(key, async () => {
    const [added, proof] = await Promise.all([teamwork.files(pid), teamwork.proofComments(pid)]);
    return added && proof ? { added, proof } : undefined;
  });
  const store = loaded ?? NONE;
  const files = useMemo(() => {
    if (!p) return [];
    const comments = Object.fromEntries(Object.entries(store.proof).map(([proofId, list]) => [`${p.id}/${proofId}`, list.map(commentFromApi)]));
    const out = [...filesOf(p, { added: [], comments }, workHref), ...store.added.map(teamFileOut)];
    // Unique addresses across both.
    const seen = new Map<string, number>();
    for (const f of out) {
      const base = f.slug;
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      f.slug = n ? `${base}-${n + 1}` : base;
    }
    return out.sort((a, b) => b.at - a.at);
  }, [p, store, workHref]);
  const set = (fn: (r: Remote) => Remote) => { if (key) mutate<Remote>(key, (cur) => fn(cur ?? NONE)); };
  const put = (f: ApiTeamFile | undefined, was?: string) => set((r) => ({ ...r, added: f ? [f, ...r.added.filter((x) => x.id !== f.id && x.id !== was)] : r.added.filter((x) => x.id !== was) }));
  return {
    ready: loaded !== undefined,
    files,
    get: (slug: string) => files.find((f) => f.slug === slug || f.id === slug || f.id === aliasOf(slug)),
    add: (input: AddInput) => {
      const extra = { category: input.category, work: input.work, milestone: input.milestone };
      if (!input.doc && !input.file) {
        toast.show({ message: "Choose the file again, then upload it.", duration: 4000 });
        return "";
      }
      const made = input.doc || !input.file ? teamwork.createDocument(pid, { name: input.name, ...extra }) : teamwork.uploadFile(pid, input.file, extra);
      const id = tempId("file", made.then((f) => f?.id));
      const now = new Date().toISOString();
      put({ id, kind: input.doc ? "document" : "upload", name: input.name, category: input.category, about: "", work: input.work ?? "", milestone: input.milestone ?? "",
        by: ME, at: now, updated_at: now, url: null, size: input.file?.size ?? null, type: input.file?.type ?? null, comments: [] });
      void made.then((f) => put(f, id));
      return id;
    },
    remove: (id: string) => {
      set((r) => ({ ...r, added: r.added.filter((x) => x.id !== id && x.id !== aliasOf(id)) }));
      void realId(id).then((real) => { if (real) void teamwork.removeFile(pid, real); });
    },
    /** A comment on a file that is not a studio item: a team file, or proof on a piece of work. */
    comment: (fileId: string, text: string) => {
      const real = aliasOf(fileId);
      if (store.added.some((x) => x.id === real)) {
        void teamwork.commentFile(pid, real, text).then((f) => f && put(f));
        return;
      }
      void teamwork.commentProof(pid, real, text).then((c) => {
        if (c) set((r) => ({ ...r, proof: { ...r.proof, [c.proof_id]: [...(r.proof[c.proof_id] ?? []), c] } }));
      });
    },
  };
}

export const useFiles: typeof useLocalFiles = DEMO ? useLocalFiles : useRemoteFiles;
