"use client";

import { useCallback, useMemo } from "react";
import { toast } from "@/components/kin/Toast";
import { mutate, teamwork, useResource, type ApiTool } from "@/lib/api/teamwork";
import { DEMO } from "@/lib/demo/mode";
import { useLocal, newId } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { Project } from "@/lib/collab/types";
import type { PersonId } from "@/lib/data/people";
import { photoSrc } from "@/components/kin/home/parts";
import { clock24, daysAgo, on2026, presenceFor, threadFromApi, versionFromApi, versionNumber, type LivePerson, type Thread, type Version } from "@/lib/collab/live";

/*
 * A project's shared canvas, as the product design's Digital Art Workspace shows it (art-workspace*.css, tw-/ta-):
 * the artwork, its layers, the colour and brush in use, where collaborators are pointing, comment pins and the
 * version history. It is its own resource (lib/api/teamwork.ts, /api/v1/teamwork/projects/:id/…):
 *   GET  canvas                                  → { title, version, content: { art, size, layers, … }, threads, versions }
 *   PUT  canvas                                  ← { title?, content, base_version, note? }  (a layer shown or hidden is
 *                                                  a save of the layers; 409 if someone saved since)
 *   POST canvas/comments                         ← { text, anchor: { x, y } }  (a pin)
 *   POST canvas/comments/:id/replies             ← { text }
 *   POST canvas/comments/:id/resolve             ← { resolved }
 *   POST canvas/versions/:n/restore
 * The demo keeps edits in the browser, seeded with the design's canvas for Adire Stories; other making projects start from
 * their own cover photo.
 */

/** The design's five layer kinds; each has its own thumbnail colour in the styles. */
export type LayerId = "highlights" | "linework" | "colour" | "sketch" | "paper";
export type Layer = { id: LayerId; name: string; blend: "Normal" | "Multiply"; opacity: number; hidden?: boolean; editor?: PersonId };
/** Where a collaborator's pointer is. The styles place two pointers; `slot` picks the place and colour. */
export type Cursor = { who: PersonId; slot: "Amara" | "Ayo" };
/** A comment pin on the artwork. The styles place pins 1 and 2. */
export type Pin = Thread & { n: 1 | 2 };

export type Canvas = {
  projectId: string;
  title: string;
  /** The artwork: an image path or one of our photo keys. */
  art: string;
  size: { width: number; height: number; dpi: number };
  layers: Layer[];
  colour: string;
  recent: string[];
  brush: { name: string; size: number; opacity: number };
  brushes: { id: string; name: string }[];
  cursors: Cursor[];
  pins: Pin[];
  versions: Version[];
  presence: LivePerson[];
};

const BRUSHES = [
  { id: "dry-ink", name: "Dry ink" },
  { id: "soft-pencil", name: "Soft pencil" },
  { id: "gouache", name: "Gouache" },
  { id: "fine-liner", name: "Fine liner" },
  { id: "watercolour-wash", name: "Watercolour wash" },
];
const RECENT = ["#1F3A6E", "#C4562A", "#E8B04A", "#2F7D5B", "#F4EFE6", "#2B2B2B"];
const LAYERS: Layer[] = [
  { id: "highlights", name: "Highlights", blend: "Normal", opacity: 100 },
  { id: "linework", name: "Linework", blend: "Multiply", opacity: 100 },
  { id: "colour", name: "Colour", blend: "Normal", opacity: 100 },
  { id: "sketch", name: "Sketch", blend: "Normal", opacity: 40, hidden: true },
  { id: "paper", name: "Paper", blend: "Normal", opacity: 100 },
];
/** Seed times are counted back from when the page first loaded. */
const SEEDED_AT = Date.now();
export const layerDetail = (l: Layer) => `${l.blend}, ${l.opacity}%`;

function seedCanvas(project: Project, now: number): Canvas {
  const members = project.members.map((m) => m.id);
  const base = { projectId: project.id, size: { width: 4000, height: 3000, dpi: 300 }, colour: RECENT[0]!, recent: RECENT, brush: { name: "Dry ink", size: 24, opacity: 80 }, brushes: BRUSHES };
  if (project.id === "adire-stories") {
    // The design's Digital Art Workspace (12.16), word for word.
    return {
      ...base,
      title: "Visual identity and illustration series",
      art: "/kin/design/workspace/art-adire-portrait.jpg",
      layers: LAYERS.map((l) => (l.id === "colour" ? { ...l, name: "Colour: Adire pattern", editor: "amara-obi" } : l)),
      cursors: [{ who: "amara-obi", slot: "Amara" }, { who: "ayo-bello", slot: "Ayo" }],
      pins: [
        { id: "as-c1", n: 1, messages: [
          { who: "ayo-bello", at: daysAgo(now, 0, 10, 42), text: "Could the Adire pattern repeat here? It feels sparse next to the rest of the headwrap." },
          { who: "kemi", at: daysAgo(now, 0, 10, 51), text: "Yes, I will extend the pattern on the colour layer." },
        ] },
        // Pin 2 has no open thread in the design.
        { id: "as-c2", n: 2, messages: [{ who: "kemi", at: daysAgo(now, 0, 10, 55), text: "Leave this corner quiet for the plate title." }] },
      ],
      versions: [
        { id: "as-v6", at: daysAgo(now, 0, 10, 42), who: "amara-obi", what: "colour layer" },
        { id: "as-v5", at: daysAgo(now, 0, 9, 15), who: "kemi", what: "linework" },
        { id: "as-v4", at: daysAgo(now, 1, 16, 20), who: "ayo-bello", what: "highlights" },
        { id: "as-v3", at: daysAgo(now, 1, 11, 2), who: "amara-obi", what: "colour layer" },
        { id: "as-v2", at: on2026(10, 12, 15, 40), who: "kemi", what: "sketch" },
        { id: "as-v1", at: on2026(10, 11, 9, 30), who: "kemi", what: "new canvas" },
      ],
      presence: [
        { who: "kemi", state: "editing", note: "Editing the layers", access: "Owner" },
        { who: "amara-obi", state: "editing", note: "Editing the colour layer", access: "Can edit" },
        { who: "ayo-bello", state: "viewing", note: "Viewing the canvas", access: "Can comment" },
        { who: "yusuf-danjuma", state: "away", note: "Last seen yesterday", access: "View only" },
      ],
    };
  }
  return {
    ...base,
    title: `${project.title}: shared canvas`,
    art: photoSrc(project.photo),
    layers: LAYERS,
    cursors: [],
    pins: [],
    versions: [{ id: `${project.id}-v1`, at: project.createdAt, who: project.host, what: "new canvas" }],
    presence: presenceFor(members, [], "Editing the layers"),
  };
}

/** What a member has changed on a canvas, kept per project. */
type Edits = { hidden?: Partial<Record<LayerId, boolean>>; pins?: Record<string, Pick<Thread, "messages" | "resolved" | "resolvedBy">>; versions?: Version[] };

function useLocalCanvas(project: Project | undefined) {
  const [all, setAll] = useLocal<Record<string, Edits>>("ak:collab-canvas:v2", {});
  const id = project?.id ?? "";
  const edits = all[id];
  const canvas = useMemo<Canvas | undefined>(() => {
    if (!project) return undefined;
    const c = seedCanvas(project, SEEDED_AT);
    if (!edits) return c;
    return {
      ...c,
      layers: c.layers.map((l) => (edits.hidden?.[l.id] === undefined ? l : { ...l, hidden: edits.hidden[l.id] })),
      pins: c.pins.map((p) => ({ ...p, ...edits.pins?.[p.id] })),
      versions: [...(edits.versions ?? []), ...c.versions],
    };
  }, [project, edits]);
  const edit = useCallback((f: (e: Edits) => Edits) => setAll((cur) => ({ ...cur, [id]: f(cur[id] ?? {}) })), [id, setAll]);
  const pinOf = (pinId: string) => canvas?.pins.find((p) => p.id === pinId);
  return {
    canvas,
    reply: (pinId: string, text: string) => { const p = pinOf(pinId); if (p) edit((e) => ({ ...e, pins: { ...e.pins, [pinId]: { messages: [...p.messages, { who: ME, at: Date.now(), text }], resolved: p.resolved } } })); },
    resolve: (pinId: string, resolved: boolean) => { const p = pinOf(pinId); if (p) edit((e) => ({ ...e, pins: { ...e.pins, [pinId]: { messages: p.messages, resolved, resolvedBy: resolved ? ME : undefined } } })); },
    restore: (v: Version) => edit((e) => ({ ...e, versions: [{ id: newId("v"), at: Date.now(), who: ME, what: `restored the ${clock24(v.at)} version` }, ...(e.versions ?? [])] })),
    /** Shows or hides a layer. */
    setHidden: (layer: LayerId, hidden: boolean) => edit((e) => ({ ...e, hidden: { ...e.hidden, [layer]: hidden } })),
  };
}

// ── On the backend ──────────────────────────────────────────────────────────────────────────

type CanvasContent = Pick<Canvas, "art" | "size" | "layers" | "colour" | "recent" | "brush" | "brushes">;

function canvasFromApi(project: Project, t: ApiTool | undefined): Canvas {
  const seed = seedCanvas(project, SEEDED_AT);
  const saved = !!t && t.version > 0;
  const c = (saved ? t.content ?? {} : {}) as Partial<CanvasContent>;
  return {
    ...seed,
    title: saved && t.title ? t.title : seed.title,
    art: typeof c.art === "string" ? c.art : seed.art,
    size: c.size ?? seed.size,
    layers: Array.isArray(c.layers) ? c.layers : seed.layers,
    colour: typeof c.colour === "string" ? c.colour : seed.colour,
    recent: Array.isArray(c.recent) ? c.recent : seed.recent,
    brush: c.brush ?? seed.brush,
    brushes: Array.isArray(c.brushes) ? c.brushes : seed.brushes,
    cursors: [],
    // The styles place two pins.
    pins: t ? t.threads.map((x, i) => ({ ...threadFromApi(x), n: ((i % 2) + 1) as 1 | 2 })) : [],
    versions: t?.versions.length ? t.versions.map(versionFromApi) : seed.versions,
    presence: presenceFor(project.members.map((m) => m.id), [], "Editing the layers"),
  };
}

function useRemoteCanvas(project: Project | undefined) {
  const pid = project?.id ?? "";
  const key = pid ? `tw:tool:canvas:${pid}` : null;
  const tool = useResource<ApiTool>(key, () => teamwork.tool(pid, "canvas"), 15_000);
  const canvas = useMemo(() => (project ? canvasFromApi(project, tool) : undefined), [project, tool]);
  const set = (t: ApiTool | undefined) => { if (t && key) mutate<ApiTool>(key, () => t); };
  return {
    canvas,
    reply: (pinId: string, text: string) => void teamwork.replyTool(pid, "canvas", pinId, text).then(set),
    resolve: (pinId: string, resolved: boolean) => void teamwork.resolveTool(pid, "canvas", pinId, resolved).then(set),
    restore: (v: Version) => {
      const n = versionNumber(v);
      if (n === null) { toast.show({ message: "Nothing has been saved yet, so there's no earlier version to go back to.", duration: 4000 }); return; }
      void teamwork.restoreTool(pid, "canvas", n).then(set);
    },
    setHidden: (layer: LayerId, hidden: boolean) => {
      if (!canvas) return;
      const content: CanvasContent = { art: canvas.art, size: canvas.size, layers: canvas.layers.map((l) => (l.id === layer ? { ...l, hidden } : l)),
        colour: canvas.colour, recent: canvas.recent, brush: canvas.brush, brushes: canvas.brushes };
      void teamwork.saveTool(pid, "canvas", { title: canvas.title, content, base_version: tool?.version ?? 0, note: `${hidden ? "hid" : "showed"} a layer` }).then(set);
    },
  };
}

export const useCanvas: typeof useLocalCanvas = DEMO ? useLocalCanvas : useRemoteCanvas;
