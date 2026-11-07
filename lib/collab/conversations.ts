"use client";

import { useCallback, useMemo } from "react";
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
 * - Decision discussions and new conversations are their own resource until the backend has one:
 *     GET  /collab/projects/:id/threads                 → Thread[] (with messages)
 *     POST /collab/projects/:id/threads                 ← { kind, title, message }
 *     POST /collab/projects/:id/threads/:tid/messages   ← { text }
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
export function useThreads(p: Project | undefined) {
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
