"use client";

import { useCallback, useSyncExternalStore } from "react";
import { toast } from "@/components/kin/Toast";
import { api, upload } from "@/lib/api/client";

/**
 * Teamwork, saved to the backend (/api/v1/teamwork/projects/<workspace id>/…): what a team keeps inside a project
 * workspace. Decisions, agreement drafts and suggestions, the brief, files, conversations, meetings, and the shared
 * document and canvas. Only the team can reach any of it (anyone else gets a 404).
 *
 * The hooks in lib/collab/{decisions,agreements,brief,files,conversations,meetings,documents,canvas}.ts read it through
 * `useResource`: one copy per resource, shared by every screen that shows it, loaded when the first one mounts and
 * refreshed every few seconds while the tab is visible. Changes answer with the new state, which replaces ours.
 */

// ── What the backend sends ──────────────────────────────────────────────────────────────────

export type ApiPage<T> = { results: T[]; page: number; page_size: number; has_more: boolean; server_time: string };
export type ApiComment = { id: number; by: string | null; text: string; at: string };
export type ApiTeamFile = {
  id: string; kind: "upload" | "document"; name: string; category: string; about: string; work: string; milestone: string;
  by: string | null; at: string; updated_at: string; url: string | null; size: number | null; type: string | null;
  comments?: ApiComment[]; comment_count?: number;
};
export type ApiDecision = {
  id: string; slug: string; title: string; summary: string;
  status: "proposed" | "discussion" | "awaiting" | "approved" | "rejected" | "superseded";
  proposed_by: string | null; proposed_at: string; decide_by: string | null; milestone: string;
  options: { title: string; good: string; watch: string }[]; context: string; problem: string; direction: string;
  acknowledged: (string | null)[]; files: ApiTeamFile[]; thread_id: string | null; discussion: ApiComment[]; discussion_count: number;
  outcome: string; outcome_at: string | null; outcome_by: string | null; updated_at: string;
};
export type ApiDraft = { id: string; stage: string; title: string; description: string; by: string | null; at: string };
export type ApiSuggestion = {
  id: string; stage: string; change: string; why: string; terms: Record<string, unknown>; based_on_version: number;
  status: "open" | "accepted" | "declined" | "withdrawn"; by: string | null; at: string; answered_by: string | null;
  answered_at: string | null; answer_note: string; resulting_version: number | null;
};
export type ApiCharterVersion = { number: number; reason: string; by: string | null; at: string; terms: Record<string, unknown> };
export type ApiBriefChange = { id: string; part: string; text: string; status: "open" | "agreed" | "withdrawn"; by: string | null; at: string; acknowledged: (string | null)[] };
export type ApiBrief = { version: number; updated_at: string; updated_by: string | null; parts: Record<string, string>; changes: ApiBriefChange[]; agreed: ApiBriefChange[] };
export type ApiThread = {
  id: string; kind: "project" | "milestone" | "work" | "decision"; title: string; decision_id: string | null; decision_slug: string | null;
  started_by: string | null; created_at: string; last_at: string; message_count: number; last_message: ApiComment | null;
  unread: boolean; read_at: string | null; updated_at: string;
};
export type ApiMeeting = {
  id: string; name: string; minutes: number; starts_at: string | null; status: "scheduled" | "ongoing" | "ended" | "cancelled";
  started_at: string | null; ended_at: string | null; created_by: string | null; started_by: string | null;
  here: { by: string | null; camera: boolean; mic: boolean; joined_at: string }[]; attended: (string | null)[]; updated_at: string;
};
export type ApiToolThread = {
  id: string; quote: string; anchor: Record<string, unknown>; resolved: boolean; resolved_by: string | null; by: string | null; at: string;
  messages: ApiComment[]; updated_at: string;
};
export type ApiToolVersion = { number: number; title: string; note: string; by: string | null; at: string; content?: unknown };
export type ApiTool = {
  kind: "document" | "canvas"; title: string; version: number; content: Record<string, unknown> | null; updated_at: string | null;
  updated_by: string | null; threads: ApiToolThread[]; versions: ApiToolVersion[];
};

// ── Calls ───────────────────────────────────────────────────────────────────────────────────

const base = (pid: string, rest = "") => `teamwork/projects/${encodeURIComponent(pid)}/${rest}`;
const MAX_PAGES = 10;

/** Every page of a list (up to 10 pages of 50). */
async function allPages<T>(path: string): Promise<T[] | undefined> {
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const r = await api.get<ApiPage<T>>(`${path}${path.includes("?") ? "&" : "?"}page=${page}&page_size=50`);
    if (!r.ok) return undefined;
    items.push(...r.data.results);
    if (!r.data.has_more) break;
  }
  return items;
}

/** A change's answer, or undefined after telling the member why it didn't go through. */
async function done<T>(req: Promise<Awaited<ReturnType<typeof api.get<T>>>>): Promise<T | undefined> {
  const r = await req;
  if (r.ok) return r.data;
  toast.show({ message: r.message, duration: 4000 });
  return undefined;
}

export const teamwork = {
  // Decisions
  decisions: (pid: string) => allPages<ApiDecision>(base(pid, "decisions")),
  propose: (pid: string, body: unknown) => done(api.post<ApiDecision>(base(pid, "decisions"), body)),
  removeDecision: (pid: string, id: string) => done(api.del<unknown>(base(pid, `decisions/${encodeURIComponent(id)}`))),
  acknowledge: (pid: string, id: string) => done(api.post<ApiDecision>(base(pid, `decisions/${encodeURIComponent(id)}/ack`))),
  unacknowledge: (pid: string, id: string) => done(api.del<ApiDecision>(base(pid, `decisions/${encodeURIComponent(id)}/ack`))),
  commentDecision: (pid: string, id: string, text: string) => done(api.post<ApiDecision>(base(pid, `decisions/${encodeURIComponent(id)}/comments`), { text })),
  recordOutcome: (pid: string, id: string, status: "approved" | "rejected" | "superseded", outcome = "") =>
    done(api.post<ApiDecision>(base(pid, `decisions/${encodeURIComponent(id)}/outcome`), { status, outcome })),
  // Agreements
  charterVersions: (pid: string) => allPages<ApiCharterVersion>(base(pid, "agreements/versions")),
  drafts: (pid: string) => allPages<ApiDraft>(base(pid, "agreements/drafts")),
  createDraft: (pid: string, body: { stage: string; title: string; description: string }) => done(api.post<ApiDraft>(base(pid, "agreements/drafts"), body)),
  removeDraft: (pid: string, id: string) => done(api.del<unknown>(base(pid, `agreements/drafts/${encodeURIComponent(id)}`))),
  suggestions: (pid: string) => allPages<ApiSuggestion>(base(pid, "agreements/suggestions?status=open")),
  suggest: (pid: string, body: { stage: string; change: string; why: string; terms?: Record<string, unknown> }) => done(api.post<ApiSuggestion>(base(pid, "agreements/suggestions"), body)),
  withdrawSuggestion: (pid: string, id: string) => done(api.del<ApiSuggestion>(base(pid, `agreements/suggestions/${encodeURIComponent(id)}`))),
  answerSuggestion: (pid: string, id: string, answer: "accept" | "decline", note = "") =>
    done(api.post<ApiSuggestion>(base(pid, `agreements/suggestions/${encodeURIComponent(id)}/answer`), { answer, note })),
  // Brief
  brief: async (pid: string) => { const r = await api.get<ApiBrief>(base(pid, "brief")); return r.ok ? r.data : undefined; },
  editBrief: (pid: string, parts: Record<string, string>) => done(api.put<ApiBrief>(base(pid, "brief"), { parts })),
  suggestBrief: (pid: string, part: string, text: string) => done(api.post<ApiBrief>(base(pid, "brief/changes"), { part, text })),
  withdrawBrief: (pid: string, id: string) => done(api.del<ApiBrief>(base(pid, `brief/changes/${encodeURIComponent(id)}`))),
  acknowledgeBrief: (pid: string, id: string) => done(api.post<ApiBrief>(base(pid, `brief/changes/${encodeURIComponent(id)}/ack`))),
  // Files
  files: (pid: string) => allPages<ApiTeamFile>(base(pid, "files")),
  proofComments: async (pid: string) => { const r = await api.get<Record<string, ApiComment[]>>(base(pid, "files/proof-comments")); return r.ok ? r.data : undefined; },
  uploadFile: async (pid: string, file: File, extra: { category?: string; work?: string; milestone?: string }) => {
    const form = new FormData();
    form.append("file", file);
    for (const [k, v] of Object.entries(extra)) if (v) form.append(k, v);
    const r = await upload<ApiTeamFile>(base(pid, "files/upload"), form);
    if (r.ok) return r.data;
    toast.show({ message: r.message, duration: 4000 });
    return undefined;
  },
  createDocument: (pid: string, body: { name: string; category?: string; work?: string; milestone?: string }) => done(api.post<ApiTeamFile>(base(pid, "files"), body)),
  removeFile: (pid: string, id: string) => done(api.del<unknown>(base(pid, `files/${encodeURIComponent(id)}`))),
  commentFile: (pid: string, id: string, text: string) => done(api.post<ApiTeamFile>(base(pid, `files/${encodeURIComponent(id)}/comments`), { text })),
  commentProof: (pid: string, proofId: string, text: string) => done(api.post<ApiComment & { proof_id: string }>(base(pid, `proof/${encodeURIComponent(proofId)}/comments`), { text })),
  // Conversations
  threads: (pid: string) => allPages<ApiThread>(base(pid, "threads")),
  messages: async (pid: string, tid: string) => {
    const items = await allPages<ApiComment>(base(pid, `threads/${encodeURIComponent(tid)}/messages`));
    return items?.reverse();  // the backend sends newest first
  },
  startThread: (pid: string, body: { kind: string; title: string; message: string }) => done(api.post<ApiThread>(base(pid, "threads"), body)),
  removeThread: (pid: string, tid: string) => done(api.del<unknown>(base(pid, `threads/${encodeURIComponent(tid)}`))),
  sendMessage: (pid: string, tid: string, text: string) => done(api.post<ApiComment>(base(pid, `threads/${encodeURIComponent(tid)}/messages`), { text })),
  markRead: async (pid: string, tid: string) => { const r = await api.post<ApiThread>(base(pid, `threads/${encodeURIComponent(tid)}/read`)); return r.ok ? r.data : undefined; },
  // Meetings
  nextMeeting: async (pid: string) => { const r = await api.get<{ meeting: ApiMeeting | null }>(base(pid, "meetings/next")); return r.ok ? r.data.meeting : undefined; },
  schedule: (pid: string, body: { name: string; minutes: number; starts_at: string }) => done(api.post<ApiMeeting>(base(pid, "meetings"), body)),
  startMeeting: (pid: string, body: { name?: string; minutes?: number }) => done(api.post<ApiMeeting>(base(pid, "meetings/start"), body)),
  joinMeeting: (pid: string, id: string, seat: { camera: boolean; mic: boolean }) => done(api.post<ApiMeeting>(base(pid, `meetings/${encodeURIComponent(id)}/join`), seat)),
  leaveMeeting: (pid: string, id: string) => done(api.post<ApiMeeting>(base(pid, `meetings/${encodeURIComponent(id)}/leave`))),
  endMeeting: (pid: string, id: string) => done(api.post<ApiMeeting>(base(pid, `meetings/${encodeURIComponent(id)}/end`))),
  cancelMeeting: (pid: string, id: string) => done(api.del<ApiMeeting>(base(pid, `meetings/${encodeURIComponent(id)}`))),
  // Shared document and canvas
  tool: async (pid: string, kind: "document" | "canvas") => { const r = await api.get<ApiTool>(base(pid, kind)); return r.ok ? r.data : undefined; },
  saveTool: (pid: string, kind: "document" | "canvas", body: { title?: string; content: unknown; base_version: number; note?: string }) => done(api.put<ApiTool>(base(pid, kind), body)),
  restoreTool: (pid: string, kind: "document" | "canvas", n: number) => done(api.post<ApiTool>(base(pid, `${kind}/versions/${n}/restore`))),
  commentTool: (pid: string, kind: "document" | "canvas", body: { text: string; quote?: string; anchor?: Record<string, unknown> }) => done(api.post<ApiTool>(base(pid, `${kind}/comments`), body)),
  replyTool: (pid: string, kind: "document" | "canvas", tid: string, text: string) => done(api.post<ApiTool>(base(pid, `${kind}/comments/${encodeURIComponent(tid)}/replies`), { text })),
  resolveTool: (pid: string, kind: "document" | "canvas", tid: string, resolved: boolean) => done(api.post<ApiTool>(base(pid, `${kind}/comments/${encodeURIComponent(tid)}/resolve`), { resolved })),
};

// ── Shared, polled resources ────────────────────────────────────────────────────────────────

type Entry = { data: unknown; subs: Set<() => void>; timer?: number; loading?: Promise<void>; load: () => Promise<unknown> };
const store = new Map<string, Entry>();

function entry(key: string, load: () => Promise<unknown>) {
  let e = store.get(key);
  if (!e) { e = { data: undefined, subs: new Set(), load }; store.set(key, e); }
  return e;
}
const emit = (e: Entry) => e.subs.forEach((f) => f());

/** Loads `key` again now (one load at a time); keeps what we had if the load fails. */
export function reload(key: string) {
  const e = store.get(key);
  if (!e) return Promise.resolve();
  e.loading ??= e.load().then((d) => { if (d !== undefined) { e.data = d; emit(e); } }).finally(() => { e.loading = undefined; });
  return e.loading;
}

/** Changes our copy of `key` now (an optimistic change, or a server's answer). */
export function mutate<T>(key: string, fn: (cur: T | undefined) => T | undefined) {
  const e = store.get(key);
  if (!e) return;
  e.data = fn(e.data as T | undefined);
  emit(e);
}
export const peek = <T>(key: string) => store.get(key)?.data as T | undefined;

/**
 * A resource shared by every screen showing it: loaded on first use, refreshed every `every` ms while the tab is
 * visible and someone is showing it. `key` is null while there is nothing to load (no project yet).
 */
export function useResource<T>(key: string | null, load: () => Promise<T | undefined>, every = 20_000): T | undefined {
  const subscribe = useCallback((cb: () => void) => {
    if (!key) return () => {};
    const e = entry(key, load);
    e.subs.add(cb);
    if (e.subs.size === 1) {
      void reload(key);
      e.timer = window.setInterval(() => { if (document.visibilityState === "visible") void reload(key); }, every);
    }
    return () => {
      e.subs.delete(cb);
      if (!e.subs.size) window.clearInterval(e.timer);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- `load` is fixed per key
  return useSyncExternalStore(subscribe, () => (key ? (store.get(key)?.data as T | undefined) : undefined), () => undefined);
}

/** A temporary id for something being created, resolved to the server's id once it answers (for Undo and links). */
const aliases = new Map<string, Promise<string | undefined>>();
const resolved = new Map<string, string>();
let tempN = 0;
export function tempId(prefix: string, created: Promise<string | undefined>) {
  const id = `${prefix}-new-${Date.now().toString(36)}-${++tempN}`;
  aliases.set(id, created.then((real) => { if (real) resolved.set(id, real); return real; }));
  return id;
}
/** The server's id for `id` (waits if it's still being created); undefined if creating it failed. */
export const realId = async (id: string) => (aliases.has(id) ? aliases.get(id)! : id);
/** The server's id for `id` if known now, else `id` itself. */
export const aliasOf = (id: string) => resolved.get(id) ?? id;

export const ms = (iso: string | null | undefined) => (iso ? Date.parse(iso) : undefined);
