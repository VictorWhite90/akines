"use client";

import { useCallback, useMemo } from "react";
import { useLocal, newId } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { Project } from "@/lib/collab/types";
import type { PersonId } from "@/lib/data/people";
import { photoSrc } from "@/components/kin/home/parts";
import { ago, clock24, daysAgo, presenceFor, type LivePerson, type Thread, type Version } from "@/lib/collab/live";

/*
 * A project's shared canvas, as the product design's Digital Art Workspace shows it (art-workspace*.css, tw-/ta-):
 * the artwork, its layers, the colour and brush in use, where collaborators are pointing, comment pins and the
 * version history. Our Project has no canvas yet, so this is its own resource, shaped like the REST one it will be:
 *   GET   /collab/projects/:id/canvas                       → Canvas
 *   PATCH /collab/projects/:id/canvas/layers/:layerId       ← { hidden }
 *   POST  /collab/projects/:id/canvas/comments/:id/replies  ← { text }
 *   POST  /collab/projects/:id/canvas/comments/:id/resolve
 *   POST  /collab/projects/:id/canvas/versions/:id/restore
 * The demo keeps edits in the browser, seeded with a canvas for Market Light; other making projects start from
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
  if (project.id === "market-light") {
    return {
      ...base,
      title: "Chapter opener: the fabric row",
      art: "/kin/collaborate/art-adire-portrait.jpg",
      layers: LAYERS.map((l) => (l.id === "colour" ? { ...l, name: "Colour: Adire pattern", editor: "wanjiru" } : l)),
      cursors: [{ who: "wanjiru", slot: "Amara" }, { who: "efua", slot: "Ayo" }],
      pins: [
        { id: "ml-c1", n: 1, messages: [
          { who: "efua", at: ago(now, 64), text: "Could the Adire pattern repeat here? It feels sparse next to the rest of the headwrap." },
          { who: "wanjiru", at: ago(now, 55), text: "Yes, I will extend the pattern on the colour layer." },
        ] },
        { id: "ml-c2", n: 2, messages: [{ who: ME, at: ago(now, 40), text: "Leave this corner quiet for the chapter title." }] },
      ],
      versions: [
        { id: "ml-v6", at: ago(now, 28), who: "wanjiru", what: "colour layer" },
        { id: "ml-v5", at: ago(now, 115), who: ME, what: "linework" },
        { id: "ml-v4", at: daysAgo(now, 1, 16, 20), who: "efua", what: "highlights" },
        { id: "ml-v3", at: daysAgo(now, 1, 11, 2), who: "wanjiru", what: "colour layer" },
        { id: "ml-v2", at: daysAgo(now, 4, 15, 40), who: ME, what: "sketch" },
        { id: "ml-v1", at: daysAgo(now, 5, 9, 30), who: ME, what: "new canvas" },
      ],
      presence: presenceFor(members, [
        { who: ME, state: "editing", note: "Editing the layers" },
        { who: "wanjiru", state: "editing", note: "Editing the colour layer" },
        { who: "efua", state: "viewing", note: "Viewing the canvas" },
      ], "Editing the layers"),
    };
  }
  return {
    ...base,
    title: `${project.title}: shared canvas`,
    art: photoSrc(project.photo, 1760),
    layers: LAYERS,
    cursors: [],
    pins: [],
    versions: [{ id: `${project.id}-v1`, at: project.createdAt, who: project.host, what: "new canvas" }],
    presence: presenceFor(members, [], "Editing the layers"),
  };
}

/** What a member has changed on a canvas, kept per project. */
type Edits = { hidden?: Partial<Record<LayerId, boolean>>; pins?: Record<string, Pick<Thread, "messages" | "resolved" | "resolvedBy">>; versions?: Version[] };

export function useCanvas(project: Project | undefined) {
  const [all, setAll] = useLocal<Record<string, Edits>>("ak:collab-canvas:v1", {});
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
  };
}
