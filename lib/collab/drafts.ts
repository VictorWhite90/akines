"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { collabApi, type ApiDraft } from "@/lib/api/collab";
import { DEMO } from "@/lib/demo/mode";
import { newId, useLocal } from "@/lib/useLocal";
import type { WorkspaceKind } from "./workspace";

/*
 * Project drafts: Start a project builders the member hasn't finished (the design's My Projects, Drafts tab).
 * Shaped like the REST resource a backend would serve (GET/POST /collab/drafts, PATCH/DELETE /collab/drafts/<id>);
 * the demo keeps them in the browser. A finished builder posts an open call (useCollab().postCall) and the draft goes.
 */

export type DraftQuestion = "q1" | "q2" | "q3" | "q4";
/** What the builder collects: what it is, the idea, four questions about its purpose, how far along it is, what it needs. */
export type DraftAnswers = { type: string; idea: string; q: Record<DraftQuestion, string>; stage: string; needs: string[] };
/** Where the builder was when the member left. */
export type DraftAt = "idea" | DraftQuestion | "stage" | "people" | "workspace" | "review";

export type ProjectDraft = {
  id: string;
  /** The project's working name and one line about it, as the builder last showed them. */
  title: string;
  description: string;
  answers: DraftAnswers;
  /** The member's own edits to the generated brief, by part (name, overview, purpose…). */
  brief: Record<string, string>;
  /** The workspace the member accepted, once they have. */
  workspace?: WorkspaceKind;
  at: DraftAt;
  updatedAt: number;
};

/** The design counts five steps: the idea, its purpose, progress, people and the brief. */
export const DRAFT_STEPS = 5;
export const draftStep = (at: DraftAt) => (at === "idea" ? 1 : at === "stage" ? 3 : at === "people" ? 4 : at === "workspace" || at === "review" ? 5 : 2);

const DAY = 86_400_000;
const now = Date.now();
const SEED: ProjectDraft[] = [
  {
    id: "teaching-tools", title: "Teaching Tools for Rural Schools",
    description: "Low-cost teaching aids that help teachers in schools with few resources bring lessons to life.",
    answers: {
      type: "community", idea: "I want to make low-cost teaching aids that help teachers in schools around Kuje bring lessons to life.",
      q: { q1: "Teachers in schools with few resources often teach science and maths with nothing but a blackboard.", q2: "", q3: "", q4: "" },
      stage: "", needs: [],
    },
    brief: {}, at: "q2", updatedAt: now - 3 * DAY,
  },
  {
    id: "youth-radio", title: "Youth Radio Workshop",
    description: "A weekly radio workshop where young people tell stories from their neighbourhoods.",
    answers: { type: "community", idea: "A weekly radio workshop where young people in Wuse tell stories from their neighbourhoods.", q: { q1: "", q2: "", q3: "", q4: "" }, stage: "", needs: [] },
    brief: {}, at: "idea", updatedAt: now - 14 * DAY,
  },
];

/** "Last edited 3 days ago", in the design's words. */
export function editedAgo(at: number, from = Date.now()) {
  const d = Math.max(0, from - at);
  const mins = Math.round(d / 60_000), hours = Math.round(d / 3_600_000), days = Math.floor(d / DAY);
  const ago = mins < 2 ? "just now" : mins < 60 ? `${mins} minutes ago` : hours < 24 ? (hours === 1 ? "1 hour ago" : `${hours} hours ago`)
    : days === 1 ? "yesterday" : days < 14 ? `${days} days ago` : days < 60 ? `${Math.floor(days / 7)} weeks ago` : `${Math.floor(days / 30)} months ago`;
  return `Last edited ${ago}`;
}

const EMPTY_ANSWERS: DraftAnswers = { type: "", idea: "", q: { q1: "", q2: "", q3: "", q4: "" }, stage: "", needs: [] };
function draftFromApi(d: ApiDraft): ProjectDraft {
  const a = (d.answers ?? {}) as Partial<DraftAnswers>;
  return {
    id: d.id, title: d.title, description: d.description,
    answers: { ...EMPTY_ANSWERS, ...a, q: { ...EMPTY_ANSWERS.q, ...(a.q ?? {}) } },
    brief: d.brief ?? {}, workspace: (d.workspace ?? undefined) as WorkspaceKind | undefined, at: (d.at || "idea") as DraftAt,
    updatedAt: Date.parse(d.updated_at),
  };
}
const draftToApi = (d: ProjectDraft) => ({ title: d.title, description: d.description, answers: d.answers, brief: d.brief, workspace: d.workspace ?? null, at: d.at });

/** Outside the demo: drafts are kept on the server (saved a moment after the member stops typing). */
function useRemoteDrafts() {
  const [list, setList] = useState<ProjectDraft[]>([]);
  const [ready, setReady] = useState(false);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    let live = true;
    void collabApi.drafts().then((r) => { if (!live) return; if (r.ok) setList(r.items.map(draftFromApi)); setReady(true); });
    return () => { live = false; };
  }, []);
  const push = useCallback((d: ProjectDraft, wait = 800) => {
    const t = timers.current.get(d.id);
    if (t) clearTimeout(t);
    timers.current.set(d.id, setTimeout(() => { timers.current.delete(d.id); void collabApi.saveDraft(d.id, draftToApi(d)); }, wait));
  }, []);
  const drop = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
    void collabApi.deleteDraft(id);
  }, []);
  const drafts = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  const save = useCallback((d: Omit<ProjectDraft, "id" | "updatedAt"> & { id?: string }) => {
    const draft: ProjectDraft = { ...d, id: d.id ?? newId("draft"), updatedAt: Date.now() };
    setList((cur) => [draft, ...cur.filter((x) => x.id !== draft.id)]);
    push(draft);
    return draft.id;
  }, [push]);
  const remove = useCallback((id: string) => {
    const index = list.findIndex((x) => x.id === id);
    if (index < 0) return null;
    const draft = list[index];
    setList((cur) => cur.filter((x) => x.id !== id));
    drop(id);
    return { draft, index };
  }, [list, drop]);
  const discard = useCallback((id: string) => { setList((cur) => cur.filter((x) => x.id !== id)); drop(id); }, [drop]);
  const restore = useCallback((draft: ProjectDraft, index: number) => {
    setList((cur) => {
      if (cur.some((x) => x.id === draft.id)) return cur;
      const next = [...cur];
      next.splice(Math.min(index, next.length), 0, draft);
      return next;
    });
    push(draft, 0);
  }, [push]);
  return { ready, drafts, get: (id: string) => list.find((x) => x.id === id), save, remove, discard, restore } as const;
}

/** The member's unfinished builders: the server's outside the demo, the browser's in it. */
export function useDrafts() {
  // DEMO is fixed for a build, so the same hook runs on every render.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return DEMO ? useLocalDrafts() : useRemoteDrafts();
}

function useLocalDrafts() {
  const [list, setList, ready] = useLocal<ProjectDraft[]>("ak:collab-drafts", SEED);
  const drafts = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  /** Creates or updates a draft; resolves to its id. */
  const save = useCallback((d: Omit<ProjectDraft, "id" | "updatedAt"> & { id?: string }) => {
    const id = d.id ?? newId("draft");
    setList((cur) => [{ ...d, id, updatedAt: Date.now() }, ...cur.filter((x) => x.id !== id)]);
    return id;
  }, [setList]);
  /** Deletes a draft; hands back what Undo needs to put it back where it was. */
  const remove = useCallback((id: string) => {
    const index = list.findIndex((x) => x.id === id);
    if (index < 0) return null;
    const draft = list[index];
    setList((cur) => cur.filter((x) => x.id !== id));
    return { draft, index };
  }, [list, setList]);
  /** Deletes a draft by id, whatever this hook last read (the Undo of "Draft saved" runs after the builder has gone). */
  const discard = useCallback((id: string) => setList((cur) => cur.filter((x) => x.id !== id)), [setList]);
  const restore = useCallback((draft: ProjectDraft, index: number) => setList((cur) => {
    if (cur.some((x) => x.id === draft.id)) return cur;
    const next = [...cur];
    next.splice(Math.min(index, next.length), 0, draft);
    return next;
  }), [setList]);
  return { ready, drafts, get: (id: string) => list.find((x) => x.id === id), save, remove, discard, restore } as const;
}
