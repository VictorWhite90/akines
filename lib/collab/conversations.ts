"use client";

import { useCallback, useMemo } from "react";
import { aliasOf, mutate, peek, realId, reload, teamwork, tempId, useResource, type ApiComment, type ApiThread } from "@/lib/api/teamwork";
import { DEMO } from "@/lib/demo/mode";
import { newId, useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import { useCollab } from "@/lib/collab/useCollab";
import { DECISION_STATUS, useDecisions, type Decision } from "@/lib/collab/decisions";
import type { Deliverable, Project } from "@/lib/collab/types";
import { workspaceHref } from "@/lib/collab/workspace";
import { slugOf as taskSlug } from "@/lib/collab/tasks";
import { CONVOS, type Convo, type KMsg } from "@/lib/data/kinmessage";
import type { PersonId } from "@/lib/data/people";

/*
 * A project's conversations, as the design's Conversations page groups them (components/collaborate/workspace/
 * Conversations): the whole team's chat, a discussion for each piece of work, each decision, and any the team starts.
 * - The team chat is the project's KinMessage conversation (Project.convoId; stores km:convos and km:msgs, the
 *   same ones Messages reads), so it is the same chat in both places.
 * - A work discussion is a deliverable's thread (Deliverable.thread); writing there comments on the deliverable.
 * - Decision discussions and new conversations are their own resource (lib/api/teamwork.ts, kept in the backend's
 *   teamwork app, not in chat: the chat app holds the whole team's chat only):
 *     GET    /teamwork/projects/:id/threads                 → page of threads (last message, unread for me)
 *     POST   /teamwork/projects/:id/threads                 ← { kind, title, message }
 *     GET    /teamwork/projects/:id/threads/:tid/messages   → page of messages (newest first)
 *     POST   /teamwork/projects/:id/threads/:tid/messages   ← { text }
 *     POST   /teamwork/projects/:id/threads/:tid/read       DELETE /teamwork/projects/:id/threads/:tid
 * In real mode the team chat is read and written through useCollab (thread, project.send: the chat API); nothing
 * here writes the km:* demo stores then.
 */

export type ThreadKind = "project" | "work" | "decision" | "milestone";
export const THREAD_TYPES = ["Project", "Milestone", "Work", "Decision"] as const;
export const KIND_LINE: Record<ThreadKind, string> = { project: "Project conversation", work: "Work discussion", decision: "Decision discussion", milestone: "Milestone discussion" };

export type ThreadMsg = {
  id: string;
  by: PersonId;
  text: string;
  /** When it was sent, if we know the day; KinMessage keeps only the clock time (`clock`). */
  at?: number;
  clock?: string;
  file?: { name: string; meta: string; href?: string };
  decision?: { title: string; status: string; href: string };
};
export type Thread = {
  id: string;
  kind: ThreadKind;
  title: string;
  /** The deliverable or decision it is about. */
  deliverable?: Deliverable;
  decision?: Decision;
  messages: ThreadMsg[];
  /** For sorting: the last message, or when it began. */
  lastAt: number;
};

type Local = { id: string; projectId: string; kind: ThreadKind; title: string; by: PersonId; at: number; decisionId?: string };
type Store = { threads: Local[]; messages: Record<string, ThreadMsg[]>; read: Record<string, number> };
const KEY = "ak:collab-threads:v1";

const HOUR = 3_600_000, DAY = 24 * HOUR;
/** What each decision's discussion said before the member opened it. */
function seedMessages(): Record<string, ThreadMsg[]> {
  const now = Date.now();
  return {
    "decision:gc-dec1": [
      { id: "gcd1", by: "chidi", text: "The reply option works on the cheap Android phones we tested.", at: now - DAY - 6 * HOUR },
      { id: "gcd2", by: "leila", text: "I will write the Hausa version once the wording is agreed.", at: now - DAY - 4 * HOUR },
      { id: "gcd3", by: "kwame", text: "I prefer replies. Can we decide before I set up the SMS gateway?", at: now - DAY - 3 * HOUR },
    ],
    "decision:ml-dec1": [
      { id: "mld1", by: "efua", text: "Matte, please. The traders will hold it in daylight.", at: now - DAY - 5 * HOUR },
      { id: "mld2", by: "wanjiru", text: "Can we see a test print of spread 3 before Saturday?", at: now - DAY - 2 * HOUR },
    ],
  };
}

export const threadHref = (projectId: string, threadId?: string) => `${workspaceHref(projectId, "conversations")}${threadId ? `/${threadId}` : ""}`;
export const decisionHref = (projectId: string, d: Decision) => `${workspaceHref(projectId, "decisions")}/${d.slug}`;
/** Where a deliverable's work lives: its task page (lib/collab/tasks gives each the slug of its title), or the Tasks page. */
export const workHref = (projectId: string, d?: { title: string }) => `${workspaceHref(projectId, "tasks")}${d ? `/${taskSlug(d.title)}` : ""}`;

const clockNow = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/** A project's conversations, newest first, and what the member can do in them. */
function useLocalThreads(p: Project | undefined) {
  const collab = useCollab();
  const pid = p?.id ?? "";
  const decisions = useDecisions(pid);
  const [store, setStore, ready] = useLocal<Store>(KEY, { threads: [], messages: seedMessages(), read: {} });
  const [convos, setConvos] = useLocal<Convo[]>("km:convos", []);
  const [km, setKm] = useLocal<Record<string, KMsg[]>>("km:msgs", {});

  const threads = useMemo<Thread[]>(() => {
    if (!p) return [];
    const out: Thread[] = [];
    // The whole team: the project's KinMessage chat.
    const convo = [...convos, ...CONVOS].find((c) => c.id === p.convoId);
    const chat = [...(convo?.msgs ?? []), ...(km[p.convoId] ?? [])].filter((m): m is Extract<KMsg, { kind: "text" }> => m.kind === "text" && m.from !== ("ai" as PersonId));
    const teamMsgs: ThreadMsg[] = chat.map((m) => ({ id: m.id, by: m.from, text: m.text, clock: m.at }));
    out.push({ id: "team", kind: "project", title: `${p.title} team`, messages: teamMsgs, lastAt: store.read[`${pid}/team-sent`] ?? p.createdAt });
    // Each piece of work that has been talked about.
    for (const d of p.deliverables ?? []) {
      if (!d.thread.length) continue;
      const messages: ThreadMsg[] = d.thread.map((t, i) => {
        const proof = t.kind === "submitted" ? d.proof.find((x) => (x.kind === "file" || x.kind === "link") && Math.abs(x.at - t.at) < 60_000) : undefined;
        return {
          id: `${d.id}-${i}`, by: t.by, text: t.text, at: t.at,
          file: proof ? { name: proof.kind === "file" && proof.file ? proof.file.name : proof.title, meta: proof.kind === "file" && proof.file ? proof.file.type.toUpperCase() : "Link", href: proof.url ?? proof.file?.url } : undefined,
        };
      });
      out.push({ id: d.id, kind: "work", title: d.title, deliverable: d, messages, lastAt: d.thread[d.thread.length - 1]!.at });
    }
    // Each decision still being decided that the team has discussed here.
    for (const dec of decisions.pending) {
      const key = `decision:${dec.id}`;
      const msgs = store.messages[key];
      if (!msgs?.length) continue;
      const embed = { title: dec.title, status: DECISION_STATUS[dec.status], href: decisionHref(pid, dec) };
      // The decision travels with the last thing a teammate said about it.
      const at = msgs.map((m) => m.by).lastIndexOf(msgs.filter((m) => m.by !== ME).at(-1)?.by ?? ("" as PersonId));
      const messages = msgs.map((m, i) => (i === at ? { ...m, decision: embed } : m));
      out.push({ id: `decision-${dec.slug}`, kind: "decision", title: dec.title, decision: dec, messages, lastAt: msgs[msgs.length - 1]!.at ?? dec.proposedAt });
    }
    // Conversations the team started here.
    for (const t of store.threads.filter((x) => x.projectId === pid)) {
      const msgs = store.messages[t.id] ?? [];
      out.push({ id: t.id, kind: t.kind, title: t.title, messages: msgs, lastAt: msgs[msgs.length - 1]?.at ?? t.at });
    }
    return out.sort((a, b) => b.lastAt - a.lastAt);
  }, [p, pid, convos, km, store, decisions.pending]);

  const send = useCallback((t: Thread, text: string) => {
    if (!p) return;
    if (t.kind === "work" && t.deliverable) { collab.project.commentDeliverable(p.id, t.deliverable.id, text); return; }
    if (t.id === "team") {
      // Same stores as Messages: the conversation is made the first time someone writes.
      setConvos((cur) => (cur.some((c) => c.id === p.convoId) || CONVOS.some((c) => c.id === p.convoId) ? cur : [{
        id: p.convoId, kind: "project", name: p.title, members: p.members.map((m) => m.id).filter((m) => m !== ME), intent: "create", photo: p.photo, last: clockNow(),
        health: { label: "Growing", value: 20, exchanges: 0, shared: 1, reciprocity: "Just starting", lastMet: "Not yet" }, memories: [], msgs: [],
      }, ...cur]));
      setKm((cur) => ({ ...cur, [p.convoId]: [...(cur[p.convoId] ?? []), { id: newId("m"), from: ME, at: clockNow(), kind: "text", text }] }));
      setStore((cur) => ({ ...cur, read: { ...cur.read, [`${pid}/team-sent`]: Date.now() } }));
      return;
    }
    const key = t.kind === "decision" && t.decision ? `decision:${t.decision.id}` : t.id;
    setStore((cur) => ({ ...cur, messages: { ...cur.messages, [key]: [...(cur.messages[key] ?? []), { id: newId("tm"), by: ME, text, at: Date.now() }] } }));
  }, [p, pid, collab.project, setConvos, setKm, setStore]);

  return {
    ready: ready && collab.ready,
    threads,
    get: (id: string) => threads.find((t) => t.id === id),
    send,
    /** Unread: someone else wrote in the last three days, and the member has not opened it since. */
    unread: (t: Thread) => { const last = t.messages[t.messages.length - 1]; return !!last && last.by !== ME && t.lastAt > Date.now() - 3 * DAY && (store.read[`${pid}/${t.id}`] ?? 0) < t.lastAt; },
    markRead: (t: Thread) => { if ((store.read[`${pid}/${t.id}`] ?? 0) < t.lastAt) setStore((cur) => ({ ...cur, read: { ...cur.read, [`${pid}/${t.id}`]: Date.now() } })); },
    start: (input: { kind: ThreadKind; title: string; message: string }) => {
      const id = newId("th");
      const at = Date.now();
      setStore((cur) => ({
        ...cur,
        threads: [...cur.threads, { id, projectId: pid, kind: input.kind, title: input.title.trim() || "New conversation", by: ME, at }],
        messages: input.message.trim() ? { ...cur.messages, [id]: [{ id: newId("tm"), by: ME, text: input.message.trim(), at }] } : cur.messages,
      }));
      return id;
    },
    remove: (id: string) => setStore((cur) => ({ ...cur, threads: cur.threads.filter((t) => t.id !== id) })),
  };
}

// ── On the backend ──────────────────────────────────────────────────────────────────────────

const person = (id: string | null) => (id ?? "akines") as PersonId;
const msgFromApi = (m: ApiComment): ThreadMsg => ({ id: String(m.id), by: person(m.by), text: m.text, at: Date.parse(m.at) });
const NO_MSGS: Record<string, ThreadMsg[]> = {};

function workThreads(p: Project): Thread[] {
  return (p.deliverables ?? []).filter((d) => d.thread.length).map((d) => ({
    id: d.id, kind: "work" as const, title: d.title, deliverable: d, lastAt: d.thread[d.thread.length - 1]!.at,
    messages: d.thread.map((t, i) => {
      const proof = t.kind === "submitted" ? d.proof.find((x) => (x.kind === "file" || x.kind === "link") && Math.abs(x.at - t.at) < 60_000) : undefined;
      return {
        id: `${d.id}-${i}`, by: t.by, text: t.text, at: t.at,
        file: proof ? { name: proof.kind === "file" && proof.file ? proof.file.name : proof.title, meta: proof.kind === "file" && proof.file ? proof.file.type.toUpperCase() : "Link", href: proof.url ?? proof.file?.url } : undefined,
      };
    }),
  }));
}

function useRemoteThreads(p: Project | undefined) {
  const collab = useCollab();
  const pid = p?.id ?? "";
  const decisions = useDecisions(pid);
  const listKey = pid ? `tw:threads:${pid}` : null;
  const msgKey = pid ? `tw:thread-msgs:${pid}` : null;
  const list = useResource<ApiThread[]>(listKey, () => teamwork.threads(pid), 15_000);
  // Messages of the conversations opened here, refreshed while they're shown.
  const msgs = useResource<Record<string, ThreadMsg[]>>(msgKey, async () => {
    const open = Object.keys(peek<Record<string, ThreadMsg[]>>(msgKey!) ?? {});
    const loaded = await Promise.all(open.map(async (tid) => [tid, (await teamwork.messages(pid, tid))?.map(msgFromApi)] as const));
    return { ...(peek<Record<string, ThreadMsg[]>>(msgKey!) ?? {}), ...Object.fromEntries(loaded.filter((x): x is readonly [string, ThreadMsg[]] => !!x[1])) };
  }, 10_000) ?? NO_MSGS;
  const [read, setRead] = useLocal<Record<string, number>>("ak:collab-threads-read:v1", {});

  const threads = useMemo<Thread[]>(() => {
    if (!p) return [];
    const out: Thread[] = [];
    // The team chat (the chat API, through useCollab). It sends clock times only, so it sorts by when you last wrote.
    const chat = collab.thread(p).filter((m): m is Extract<KMsg, { kind: "text" }> => m.kind === "text" && m.from !== ("ai" as PersonId));
    out.push({ id: "team", kind: "project", title: `${p.title} team`, messages: chat.map((m) => ({ id: m.id, by: m.from, text: m.text, clock: m.at })), lastAt: read[`${pid}/team-sent`] ?? p.createdAt });
    out.push(...workThreads(p));
    for (const t of list ?? []) {
      const decision = t.decision_id ? decisions.list.find((d) => d.id === t.decision_id) : undefined;
      if (t.kind === "decision" && !decision) continue;
      const messages = msgs[t.id] ?? (t.last_message ? [msgFromApi(t.last_message)] : []);
      const embedAt = decision ? messages.map((m) => m.by !== ME).lastIndexOf(true) : -1;
      const embed = decision ? { title: decision.title, status: DECISION_STATUS[decision.status], href: decisionHref(pid, decision) } : undefined;
      out.push({
        id: t.id, kind: t.kind, title: t.title, decision, lastAt: Date.parse(t.last_at),
        messages: messages.map((m, i) => (i === embedAt ? { ...m, decision: embed } : m)),
      });
    }
    return out.sort((a, b) => b.lastAt - a.lastAt);
  }, [p, pid, collab, read, list, msgs, decisions.list]);

  const apiThread = (id: string) => list?.find((t) => t.id === aliasOf(id));
  const open = (id: string) => {
    const tid = aliasOf(id);
    if (!msgKey || !apiThread(tid) || (peek<Record<string, ThreadMsg[]>>(msgKey) ?? {})[tid]) return;
    mutate<Record<string, ThreadMsg[]>>(msgKey, (cur = {}) => ({ ...cur, [tid]: cur[tid] ?? [] }));
    queueMicrotask(() => void reload(msgKey));
  };

  const send = useCallback((t: Thread, text: string) => {
    if (!p) return;
    if (t.kind === "work" && t.deliverable) { collab.project.commentDeliverable(p.id, t.deliverable.id, text); return; }
    if (t.id === "team") { void collab.project.send(p, text); setRead((cur) => ({ ...cur, [`${pid}/team-sent`]: Date.now() })); return; }
    const tid = aliasOf(t.id);
    const mine: ThreadMsg = { id: newId("tm"), by: ME, text, at: Date.now() };
    if (msgKey) mutate<Record<string, ThreadMsg[]>>(msgKey, (cur = {}) => ({ ...cur, [tid]: [...(cur[tid] ?? t.messages), mine] }));
    void teamwork.sendMessage(pid, tid, text).then((m) => {
      if (m && msgKey) mutate<Record<string, ThreadMsg[]>>(msgKey, (cur = {}) => ({ ...cur, [tid]: (cur[tid] ?? []).map((x) => (x.id === mine.id ? msgFromApi(m) : x)) }));
      if (listKey) void reload(listKey);
    });
  }, [p, pid, collab.project, msgKey, listKey, setRead]);

  return {
    ready: collab.ready && list !== undefined,
    threads,
    get: (id: string) => { open(id); return threads.find((t) => t.id === id || t.id === aliasOf(id)); },
    send,
    unread: (t: Thread) => {
      const api = apiThread(t.id);
      if (api) return api.unread && (read[`${pid}/${api.id}`] ?? 0) < Date.parse(api.last_at);
      const last = t.messages[t.messages.length - 1];
      return !!last && last.by !== ME && t.lastAt > Date.now() - 3 * DAY && (read[`${pid}/${t.id}`] ?? 0) < t.lastAt;
    },
    markRead: (t: Thread) => {
      const api = apiThread(t.id);
      if ((read[`${pid}/${api?.id ?? t.id}`] ?? 0) >= t.lastAt) return;
      setRead((cur) => ({ ...cur, [`${pid}/${api?.id ?? t.id}`]: Date.now() }));
      if (api?.unread) void teamwork.markRead(pid, api.id).then((x) => { if (x && listKey) mutate<ApiThread[]>(listKey, (cur = []) => cur.map((y) => (y.id === x.id ? x : y))); });
    },
    start: (input: { kind: ThreadKind; title: string; message: string }) => {
      const made = teamwork.startThread(pid, { kind: input.kind === "decision" ? "project" : input.kind, title: input.title.trim(), message: input.message.trim() });
      const id = tempId("th", made.then((t) => t?.id));
      const now = new Date().toISOString();
      const draft: ApiThread = { id, kind: input.kind, title: input.title.trim() || "New conversation", decision_id: null, decision_slug: null, started_by: ME, created_at: now, last_at: now,
        message_count: input.message.trim() ? 1 : 0, last_message: input.message.trim() ? { id: 0, by: ME, text: input.message.trim(), at: now } : null, unread: false, read_at: now, updated_at: now };
      if (listKey) mutate<ApiThread[]>(listKey, (cur = []) => [draft, ...cur]);
      void made.then((t) => { if (listKey) mutate<ApiThread[]>(listKey, (cur = []) => (t ? cur.map((x) => (x.id === id ? t : x)) : cur.filter((x) => x.id !== id))); });
      return id;
    },
    remove: (id: string) => {
      if (listKey) mutate<ApiThread[]>(listKey, (cur = []) => cur.filter((x) => x.id !== id && x.id !== aliasOf(id)));
      void realId(id).then((real) => { if (real) void teamwork.removeThread(pid, real); });
    },
  };
}

export const useThreads: typeof useLocalThreads = DEMO ? useLocalThreads : useRemoteThreads;
