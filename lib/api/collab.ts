"use client";

import { useSyncExternalStore } from "react";
import { useMyRooms } from "@/lib/collab/myRooms";
import { pickedFile } from "@/components/collab/FileParts";
import { account } from "@/lib/api/account";
import { chat, newClientId, type ChatCard, type ChatMessage } from "@/lib/api/chat";
import { api } from "@/lib/api/client";
import { DEMO } from "@/lib/demo/mode";
import { fileOut, mediaIdFor, pieceFromApi, uploadWorkFile, type ApiMedia, type ApiProject } from "@/lib/api/work";
import { ME, setMe } from "@/lib/collab/me";
import type {
  AppStage, Application, CallMaterial, Charter, Checkin, CollabCall, Deliverable, Field, JourneyStage, ProofFile, ProofItem,
  ProofLink, Project, Proposal, Task, Tool, WorkKind,
} from "@/lib/collab/types";
import type { Room } from "@/lib/data/community";
import type { PhotoKey } from "@/lib/data/images";
import type { KMsg } from "@/lib/data/kinmessage";
import { registerPerson, type PersonId } from "@/lib/data/people";
import type { Piece } from "@/lib/portfolio";
import { newId } from "@/lib/useLocal";
import { apiPhoto, type ImageSource } from "@/lib/images";

/**
 * Collaboration, saved to the backend (/api/v1/collab/*): open calls, applications, proposals and project
 * workspaces. It gives the screens the same shape as the demo store in lib/collab/useCollab.ts, so they don't
 * know which one they're talking to. Other members' changes arrive when the lists refresh (every 30 seconds,
 * and when the tab comes back into view); the project chat refreshes every few seconds while it's open.
 */

// ── What the backend sends ──────────────────────────────────────────────────────────────────

type ApiPerson = {
  user_id: string; username: string | null; first_name: string; last_name: string; profile_photo: string | null; profile_photo_image?: ImageSource | null; headline?: string;
  /** From their published work profile, where the backend sends them (applicants, team members). */
  skills?: string[]; experience?: string;
};
/** The project behind a call (lib/collab/projects.ts CallProfile, in the backend's words). */
export type ApiCallProfile = {
  stage: string; type: string; commitment: string; commitment_cat?: string; rhythm?: string; open_to?: string;
  needs?: Record<string, string>; skill_cats?: string[]; skill_tags?: string[]; progress?: { title: string; detail: string }[];
};
type ApiOffer = { role: string; fee: string; start: string; hours?: string; note?: string };
export type ApiTask = {
  id: string; title: string; owner: string; support: string | null; reviewer: string | null; due: string;
  status: "todo" | "doing" | "review" | "done"; priority: "high" | "medium" | "low"; milestone_id: string | null;
  description: string; criteria: { id: string; title: string; done: boolean }[]; done_at: string | null; created_at: string;
  by: string | null; comments: { by: string; text: string; at: string }[];
};
type ApiMilestone = { id: string; title: string; due: string; done: boolean; done_at: string | null };
export type ApiInvitation = {
  id: string; workspace_id: string; to: ApiPerson; by: ApiPerson; role: string; message: string;
  status: "sent" | "accepted" | "declined" | "withdrawn"; sent_at: string; answered_at: string | null;
  workspace?: { id: string; title: string; summary: string };
};
export type ApiJoinRequest = {
  id: string; workspace_id: string; person: ApiPerson; role: string; message: string;
  status: "pending" | "accepted" | "not_now" | "withdrawn"; reply: string; sent_at: string; decided_at: string | null;
};
export type ApiDraft = {
  id: string; title: string; description: string; answers: unknown; brief: Record<string, string>; workspace: string | null;
  at: string; updated_at: string;
};
export type MySettings = { notify_prefs: { review: boolean; decisions: boolean; conversations: boolean; milestones: boolean }; read: string[] };
type ApiCall = {
  id: string; host: ApiPerson; org: string; org_kind: string; title: string; summary: string; about: string; city: string;
  where: "in_person" | "remote" | "hybrid"; photo: string | null; roles: string[]; fields: Field[]; level: string; fee: string;
  rights: string; selection: string; team_size: number; timeline: { label: string; when: string }[]; closes_on: string;
  closes_in_days: number; status: "open" | "closed"; is_verified: boolean; created_at: string; hosted_by_me: boolean;
  my_application: string | null; application_count?: number; closed_at?: string | null; profile?: ApiCallProfile | null; saved?: boolean; updated_at?: string;
};
type ApiApplication = {
  id: string; call_id: string; applicant: ApiPerson; role: string; statement: string; availability: string; links: ProofLink[];
  projects: ApiProject[]; files: ApiMedia[]; stage: string; slot: string; slots_offered: string[]; feedback: string;
  offer: ApiOffer | null; history: { stage: string; note: string; at: string }[];
  slots_message?: string; decline_reason?: string; previous_stage?: string | null; undo_until?: string | null;
  created_at: string; workspace_id: string | null; tags?: string[]; rating?: number | null; notes?: { text: string; at: string }[];
  call?: ApiCall;
};
type ApiProposal = {
  id: string; sender: ApiPerson; recipient: ApiPerson; title: string; idea: string; sender_role: string; recipient_role: string;
  status: Proposal["status"]; sent_by_me: boolean; created_at: string; conversation_id: string | null; workspace_id: string | null;
};
type ApiProof = { id: number; kind: ProofItem["kind"]; title: string; url: string; text: string; file: { id: number; name: string; size: number | null; type: string | null } | null; by: string; at: string };
type ApiDeliverable = {
  id: string; title: string; owner: string; approver: string; due: string; share: number | null; status: Deliverable["status"];
  steps: Deliverable["steps"]; approved_at: string | null; proof: ApiProof[];
  priority?: "high" | "medium" | "low"; milestone_id?: string | null; description?: string; support?: string | null; thread: { by: string; kind: Deliverable["thread"][number]["kind"]; text: string; at: string }[];
};
/** A list's page (every collab list is paged): pass `server_time` back as ?updated_since= to get only what changed. */
type ApiPage<T> = { results: T[]; page: number; page_size: number; has_more: boolean; server_time: string };
/** The summary a project list sends; open one (GET workspaces/<id>) for the whole workspace. */
type ApiWorkspaceSummary = { id: string; updated_at: string; charter_version: number };
type ApiWorkspace = {
  id: string; title: string; summary: string; host: string; kind: WorkKind | ""; stage: JourneyStage; budget: number;
  call_id: string | null; proposal_id: string | null; conversation_id: string | null; photo: string | null;
  members: (ApiPerson & { role: string; contribution: string; signed_at: string | null })[]; signed_at: string | null; created_at: string;
  charter_version: number; needs?: string; open_to_join?: boolean; tasks?: ApiTask[]; milestones?: ApiMilestone[]; me?: MySettings;
  charter: { credit: string; ownership: string; decisions: string; expenses: string; uses: string; exit_terms: string; split: Record<string, number>; version: number };
  deliverables: ApiDeliverable[]; checkins: { id: number; by: string; done: string; next: string; stuck: string; at: string }[];
  tools: { id: number; label: string; url: string; kind: Tool["kind"] }[]; ledger: { by: string | null; text: string; at: string }[];
};

// ── From the backend to the screens ─────────────────────────────────────────────────────────

const time = (iso: string | null | undefined) => (iso ? Date.parse(iso) : undefined);
const WHERE: Record<ApiCall["where"], CollabCall["where"]> = { in_person: "In person", remote: "Remote", hybrid: "Hybrid" };
const WHERE_TO_API: Record<CollabCall["where"], ApiCall["where"]> = { "In person": "in_person", Remote: "remote", Hybrid: "hybrid" };
/** A catalogue cover when a call or workspace has no photo of its own. */
const COVER: Record<Field, PhotoKey> = { Design: "studioBusy", Tech: "studioBusy", Media: "talkCafe", Arts: "paintingDancers", Food: "talkMugs", Community: "talkGroup", Business: "talkYoung" };
const coverFor = (url: string | null, fields: Field[] = []) => (url ?? COVER[fields[0]] ?? "talkGroup") as PhotoKey;
/** The backend asks every applicant for the same three things. */
const MATERIALS: CallMaterial[] = [
  { id: "works", label: "Your work", hint: "Projects, links or files that show you can do this.", required: true },
  { id: "why", label: "Why this, and why you", hint: "A few honest lines, written for this call.", required: true },
  { id: "availability", label: "Your availability", hint: "For the dates in the timeline.", required: true },
];

/** Puts a member in the people registry, so the screens can show their name and photo by id. */
/**
 * What the backend keeps that the shared types (lib/collab/types.ts) don't carry: the extras the review, team, task and
 * member screens read through `useRemoteExtras` (lib/collab/*.ts, outside the demo).
 */
export type RemoteExtras = {
  apps: Record<string, { slotsMessage?: string; offer?: ApiOffer; before?: AppStage; undoUntil?: number; declineReason?: string }>;
  calls: Record<string, { status: "open" | "closed"; closedAt?: number; profile?: ApiCallProfile | null; saved: boolean }>;
  projects: Record<string, { needs: string; openToJoin: boolean; me?: MySettings; tasks: ApiTask[]; deliverables: ApiDeliverable[]; milestones: ApiMilestone[] }>;
  people: Record<string, { skills: string[]; experience: string }>;
};
const extras: RemoteExtras = { apps: {}, calls: {}, projects: {}, people: {} };

function who(p: ApiPerson): PersonId {
  if (p.skills || p.experience) extras.people[p.user_id] = { skills: p.skills ?? [], experience: p.experience ?? "" };
  registerPerson({
    id: p.user_id, name: `${p.first_name} ${p.last_name}`.trim() || p.username || "A member", role: p.headline ?? "",
    city: "", presence: "open", about: "", photo: apiPhoto(p.profile_photo, p.profile_photo_image),
  });
  return p.user_id as PersonId;
}
const id = (userId: string | null) => (userId ?? "akines") as PersonId;

function callFromApi(c: ApiCall): CollabCall {
  const closedAt = c.status === "closed" ? time(c.closed_at) ?? time(c.updated_at) ?? time(c.created_at) : undefined;
  extras.calls[c.id] = { status: c.status, closedAt, profile: c.profile, saved: !!c.saved };
  return {
    id: c.id, title: c.title, host: who(c.host), org: c.org, orgKind: c.org_kind, city: c.city, where: WHERE[c.where] ?? "In person",
    photo: coverFor(c.photo, c.fields), summary: c.summary, about: c.about, roles: c.roles, fields: c.fields, level: c.level, fee: c.fee,
    rights: c.rights, selection: c.selection, teamSize: c.team_size, materials: MATERIALS, timeline: c.timeline,
    closesInDays: c.status === "open" ? c.closes_in_days : 0, verified: c.is_verified, postedByMe: c.hosted_by_me,
  };
}

const stageFromApi = (s: string) => (s === "not_selected" ? "not-selected" : s) as AppStage;

function appFromApi(a: ApiApplication): Application {
  const pieces: Piece[] = a.projects.map(pieceFromApi);
  extras.apps[a.id] = {
    slotsMessage: a.slots_message || undefined, offer: a.offer ?? undefined, declineReason: a.decline_reason || undefined,
    before: a.previous_stage ? stageFromApi(a.previous_stage) : undefined, undoUntil: time(a.undo_until),
  };
  return {
    id: a.id, callId: a.call_id, applicant: who(a.applicant), role: a.role, works: pieces.map((p) => p.id), pieces,
    links: a.links, files: a.files.map((f) => fileOut(f, "sample")), statement: a.statement, availability: a.availability,
    materials: { works: pieces.length + a.links.length + a.files.length > 0, why: !!a.statement, availability: !!a.availability },
    stage: stageFromApi(a.stage), history: a.history.map((h) => ({ stage: stageFromApi(h.stage), at: Date.parse(h.at), note: h.note || undefined })),
    slot: a.slot || undefined, slotsOffered: a.slots_offered, notes: (a.notes ?? []).map((n) => ({ at: Date.parse(n.at), text: n.text })),
    tags: a.tags ?? [], rating: a.rating ?? undefined, feedback: a.feedback || undefined, offer: a.offer ?? undefined,
    projectId: a.workspace_id ?? undefined,
  };
}

function proposalFromApi(p: ApiProposal): Proposal {
  const [me, them] = p.sent_by_me ? [p.sender, p.recipient] : [p.recipient, p.sender];
  who(me);
  return {
    id: p.id, to: p.sent_by_me ? who(them) : (me.user_id as PersonId), from: p.sent_by_me ? undefined : who(them), title: p.title, idea: p.idea,
    myRole: p.sent_by_me ? p.sender_role : p.recipient_role, theirRole: p.sent_by_me ? p.recipient_role : p.sender_role,
    status: p.status, at: Date.parse(p.created_at), projectId: p.workspace_id ?? undefined, convoId: p.conversation_id ?? undefined,
  };
}

function proofFromApi(x: ApiProof): ProofItem {
  const file: ProofFile | undefined = x.file ? { id: String(x.file.id), name: x.file.name, size: x.file.size ?? 0, type: x.file.type ?? "", kind: "sample", url: x.url } : undefined;
  return {
    id: String(x.id), kind: x.kind, title: x.title, url: x.kind === "link" ? x.url : undefined, file: x.kind === "file" ? file : undefined,
    src: x.kind === "image" ? x.url : undefined, text: x.text || undefined, by: id(x.by), at: Date.parse(x.at),
  };
}

function deliverableFromApi(d: ApiDeliverable): Deliverable {
  return {
    id: d.id, title: d.title, owner: id(d.owner), approver: id(d.approver), due: d.due, share: d.share ?? undefined, status: d.status,
    steps: d.steps, proof: d.proof.map(proofFromApi), approvedAt: time(d.approved_at),
    thread: d.thread.map((m) => ({ by: id(m.by), text: m.text, at: Date.parse(m.at), kind: m.kind })),
  };
}

const TASK_STATUS: Record<ApiTask["status"], Task["status"]> = { todo: "todo", doing: "doing", review: "doing", done: "done" };

function projectFromApi(w: ApiWorkspace): Project {
  const members = w.members.map((m) => ({ id: who(m), role: m.role, contribution: m.contribution }));
  extras.projects[w.id] = {
    needs: w.needs ?? "", openToJoin: !!w.open_to_join, me: w.me, tasks: w.tasks ?? [], deliverables: w.deliverables,
    milestones: w.milestones ?? [],
  };
  const charter: Charter = {
    credit: w.charter.credit, ownership: w.charter.ownership, decisions: w.charter.decisions, expenses: w.charter.expenses,
    uses: w.charter.uses, exit: w.charter.exit_terms, split: w.charter.split as Charter["split"],
    signed: w.members.filter((m) => m.signed_at).map((m) => m.user_id as PersonId), signedAt: time(w.signed_at),
  };
  return {
    id: w.id, title: w.title, summary: w.summary, photo: coverFor(w.photo), host: id(w.host), callId: w.call_id ?? undefined,
    proposalId: w.proposal_id ?? undefined, members, stage: w.stage, createdAt: Date.parse(w.created_at), charter,
    tasks: (w.tasks ?? []).map((t) => ({ id: t.id, title: t.title, who: id(t.owner), due: t.due, status: TASK_STATUS[t.status] })),
    milestones: (w.milestones ?? []).map((m) => ({ id: m.id, title: m.title, due: m.due, done: m.done })),
    // The backend doesn't keep these parts of the demo workspace (yet): the idea board, presenting and expenses.
    studio: [], present: { what: "", where: "", when: "", checklist: [] },
    budget: { total: w.budget, currency: "₦", expenses: [], paidOut: [] },
    ledger: w.ledger.map((e) => ({ at: Date.parse(e.at), who: (e.by ? id(e.by) : "akines") as Project["ledger"][number]["who"], what: e.text })).sort((a, b) => a.at - b.at),
    kind: w.kind || undefined, tools: w.tools.map((t) => ({ id: String(t.id), label: t.label, url: t.url, kind: t.kind })),
    deliverables: w.deliverables.map(deliverableFromApi),
    checkins: w.checkins.map((c) => ({ id: String(c.id), who: id(c.by), at: Date.parse(c.at), done: c.done, next: c.next, stuck: c.stuck || undefined })),
    convoId: w.conversation_id ?? "", rooms: [],
  };
}

const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const msgFromApi = (m: ChatMessage): KMsg | null =>
  m.kind === "system" || m.is_removed || !m.sender ? null : { id: String(m.id), from: who(m.sender), at: clock(m.created_at), kind: "text", text: m.body };

// ── A small shared store, so every screen sees the same collaboration ───────────────────────

type Snapshot = {
  ready: boolean;
  calls: CollabCall[];
  hosted: CollabCall[];
  /** Calls looked up one by one (from an application, or opened by link). */
  extra: CollabCall[];
  mine: Application[];
  desk: Application[];
  proposals: Proposal[];
  projects: Project[];
  threads: Record<string, KMsg[]>;
  saved: string[];
  /** The last thing that didn't save, shown as a notice (components/collab/Notice.tsx). */
  notice?: string;
  x: RemoteExtras;
};
const START: Snapshot = { ready: false, calls: [], hosted: [], extra: [], mine: [], desk: [], proposals: [], projects: [], threads: {}, saved: [], x: extras };
let snap = START;
const subs = new Set<() => void>();
/** Every change hands the screens a fresh snapshot, extras included (they're filled while mapping what came back). */
const emit = (next: Partial<Snapshot>) => {
  const x = { apps: { ...extras.apps }, calls: { ...extras.calls }, projects: { ...extras.projects }, people: { ...extras.people } };
  const saved = Object.entries(extras.calls).filter(([, c]) => c.saved).map(([callId]) => callId);
  snap = { ...snap, saved, ...next, x };
  subs.forEach((f) => f());
};
const fail = (message: string) => emit({ notice: message });
const upsert = <T extends { id: string }>(list: T[], item: T) => (list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list]);

/** Every page of a list (up to `MAX_PAGES` of 50), or only what changed since `since`. */
const MAX_PAGES = 10;
async function allPages<T>(path: string, since?: string): Promise<{ ok: true; items: T[]; serverTime: string } | { ok: false }> {
  const items: T[] = [];
  let serverTime = "";
  for (let page = 1; page <= MAX_PAGES; page++) {
    const q = new URLSearchParams({ page: String(page), page_size: "50" });
    if (since) q.set("updated_since", since);
    const r = await api.get<ApiPage<T>>(`${path}${path.includes("?") ? "&" : "?"}${q}`);
    if (!r.ok) return { ok: false };
    items.push(...r.data.results);
    if (page === 1) serverTime = r.data.server_time;
    if (!r.data.has_more) break;
  }
  return { ok: true, items, serverTime };
}

/** When each list was last loaded (the server's clock), so the next refresh asks only for what changed. */
const since: Record<string, string> = {};
/** The agreement version each project was last seen at; signing says which one it signs. */
const charterVersions = new Map<string, number>();
const merge = <T extends { id: string }>(before: T[], changed: T[], fresh: boolean) =>
  fresh ? changed : changed.reduce((list, item) => upsert(list, item), before);

async function loadWorkspace(workspaceId: string) {
  const r = await api.get<ApiWorkspace>(ws(workspaceId));
  if (!r.ok) return null;
  charterVersions.set(r.data.id, r.data.charter.version);
  return projectFromApi(r.data);
}

/** A full reload now and then puts back what polling can't see (calls that passed their closing date, removed items). */
const FULL_RELOAD_MS = 10 * 60_000;
let lastFull = 0;

async function refresh() {
  if (Date.now() - lastFull > FULL_RELOAD_MS) {
    for (const k of Object.keys(since)) delete since[k];
    lastFull = Date.now();
  }
  const key = (name: string) => since[name];
  const [calls, hosted, mine, proposals, workspaces] = await Promise.all([
    allPages<ApiCall>("collab/calls", key("calls")), allPages<ApiCall>("collab/calls/hosted", key("hosted")),
    allPages<ApiApplication>("collab/applications/mine", key("mine")), allPages<ApiProposal>("collab/proposals", key("proposals")),
    allPages<ApiWorkspaceSummary>("collab/workspaces", key("workspaces")),
  ]);
  const hostedCalls = hosted.ok ? merge(snap.hosted, hosted.items.map(callFromApi), !key("hosted")) : snap.hosted;
  // The review desk: applications to every call I host (a poll includes withdrawn ones, which leave the desk).
  const desks = await Promise.all(hostedCalls.map((c) => allPages<ApiApplication>(`collab/calls/${encodeURIComponent(c.id)}/applications`, key(`desk:${c.id}`))));
  let desk = snap.desk;
  desks.forEach((d, i) => {
    if (!d.ok) return;
    const callId = hostedCalls[i].id;
    const changed = d.items.map(appFromApi);
    desk = key(`desk:${callId}`) ? changed.reduce((list, a) => upsert(list, a), desk) : [...desk.filter((a) => a.callId !== callId), ...changed];
    desk = desk.filter((a) => a.stage !== "withdrawn");
    since[`desk:${callId}`] = d.serverTime;
  });
  // Projects: the list says which changed; each changed one is loaded whole.
  let projects = snap.projects;
  if (workspaces.ok) {
    const loaded = (await Promise.all(workspaces.items.map((w) => loadWorkspace(w.id)))).filter((p): p is Project => !!p);
    projects = merge(snap.projects, loaded, !key("workspaces"));
  }
  const fromApps = mine.ok ? mine.items.flatMap((a) => (a.call ? [callFromApi(a.call)] : [])) : [];
  emit({
    ready: true,
    calls: calls.ok ? merge(snap.calls, calls.items.map(callFromApi), !key("calls")) : snap.calls,
    hosted: hostedCalls,
    extra: [...fromApps, ...snap.extra.filter((x) => !fromApps.some((c) => c.id === x.id))],
    mine: mine.ok ? merge(snap.mine, mine.items.map(appFromApi), !key("mine")) : snap.mine,
    desk,
    proposals: proposals.ok ? merge(snap.proposals, proposals.items.map(proposalFromApi), !key("proposals")) : snap.proposals,
    projects,
    notice: [calls, hosted, mine, proposals, workspaces].some((r) => !r.ok) ? "Some of your collaboration didn't load. It will try again shortly." : snap.notice,
  });
  ([["calls", calls], ["hosted", hosted], ["mine", mine], ["proposals", proposals], ["workspaces", workspaces]] as const)
    .forEach(([name, r]) => { if (r.ok) since[name] = r.serverTime; });
}

let started = false;
async function start() {
  if (started) return;
  started = true;
  const me = await account.profile();
  if (!me.ok) { started = false; return emit({ ready: true, notice: me.message }); }
  setMe(me.data.user_id);
  registerPerson({ id: me.data.user_id, name: `${me.data.first_name} ${me.data.last_name}`.trim() || "You", role: "", city: me.data.location, presence: "open", about: me.data.bio, photo: apiPhoto(me.data.profile_photo, me.data.profile_photo_image) });
  await refresh();
  setInterval(() => { if (subs.size && document.visibilityState === "visible") void refresh(); }, 30_000);
  document.addEventListener("visibilitychange", () => { if (subs.size && document.visibilityState === "visible") void refresh(); });
}

function subscribe(f: () => void) {
  subs.add(f);
  void start();
  return () => subs.delete(f);
}

// ── Project chats: loaded when shown, refreshed every few seconds while they're on screen ──

const watched = new Map<string, number>();
const loadingThread = new Set<string>();
async function loadThread(convoId: string) {
  if (loadingThread.has(convoId)) return;
  loadingThread.add(convoId);
  const r = await chat.messages(convoId, { limit: 50 });
  loadingThread.delete(convoId);
  if (!r.ok) return;
  const msgs = [...r.data.results].sort((a, b) => a.id - b.id).map(msgFromApi).filter((m): m is KMsg => !!m);
  const before = snap.threads[convoId];
  if (before && before.length === msgs.length && before.at(-1)?.id === msgs.at(-1)?.id) return;
  emit({ threads: { ...snap.threads, [convoId]: msgs } });
}
if (typeof window !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [c, seen] of watched) if (now - seen < 15_000) void loadThread(c); else watched.delete(c);
  }, 5_000);
}

// ── Saving ───────────────────────────────────────────────────────────────────────────────────

/** Times the host offers when shortlisting: the next three weekdays, from two days out. */
function nextSlots() {
  const out: string[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const hours = ["10:00", "14:30", "16:00"];
  while (out.length < 3) {
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(`${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${hours[out.length]}`);
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Files picked in a form go up first; the form then sends their ids. Already-stored files keep theirs. */
async function storedIds(files: ProofFile[]) {
  const ids: number[] = [];
  for (const f of files) {
    if (/^\d+$/.test(f.id)) { ids.push(Number(f.id)); continue; }
    const file = pickedFile(f.id);
    if (!file) continue;
    ids.push(Number((await uploadWorkFile(file, f.kind === "cv" ? "cv" : "file")).id));
  }
  return ids;
}

const ws = (workspaceId: string, rest = "") => `collab/workspaces/${encodeURIComponent(workspaceId)}${rest}`;
/** Every workspace change answers with the whole workspace, which replaces ours. */
async function saveWorkspace(req: Promise<Awaited<ReturnType<typeof api.post<ApiWorkspace>>>>) {
  const r = await req;
  if (!r.ok) { fail(r.message); return null; }
  charterVersions.set(r.data.id, r.data.charter.version);
  const p = projectFromApi(r.data);
  emit({ projects: upsert(snap.projects, p) });
  return p;
}
const wsPost = (workspaceId: string, rest: string, body?: unknown) => saveWorkspace(api.post<ApiWorkspace>(ws(workspaceId, rest), body));
const wsPut = (workspaceId: string, rest: string, body?: unknown) => saveWorkspace(api.put<ApiWorkspace>(ws(workspaceId, rest), body));
const wsDel = (workspaceId: string, rest: string) => saveWorkspace(api.del<ApiWorkspace>(ws(workspaceId, rest)));
const wsPatch = (workspaceId: string, rest: string, body?: unknown) => saveWorkspace(api.patch<ApiWorkspace>(ws(workspaceId, rest), body));
const dPath = (dId: string, rest = "") => `/deliverables/${encodeURIComponent(dId)}${rest}`;
/** Shows the change straight away, before the server answers (it replaces it either way). */
const optimistic = (workspaceId: string, fn: (p: Project) => void) => {
  const p = snap.projects.find((x) => x.id === workspaceId);
  if (!p) return;
  const copy = structuredClone(p);
  fn(copy);
  emit({ projects: upsert(snap.projects, copy) });
};
const deliverableAction = (workspaceId: string, dId: string, action: string, note = "") => wsPost(workspaceId, dPath(dId, "/action"), { action, note });

async function saveApp(path: string, body: unknown, list: "mine" | "desk") {
  const r = await api.post<ApiApplication>(path, body);
  if (!r.ok) { fail(r.message); return null; }
  const a = appFromApi(r.data);
  emit(list === "mine" ? { mine: upsert(snap.mine, a) } : { desk: upsert(snap.desk, a) });
  return a;
}
const appPath = (appId: string, rest: string) => `collab/applications/${encodeURIComponent(appId)}/${rest}`;

const notYet = () => fail("That part of the workspace isn't connected yet. It's coming soon.");
const missing = new Set<string>();
async function fetchCall(callId: string) {
  if (missing.has(callId)) return;
  missing.add(callId);
  const r = await api.get<ApiCall>(`collab/calls/${encodeURIComponent(callId)}`);
  if (r.ok) emit({ extra: upsert(snap.extra, callFromApi(r.data)) });
}

// ── The redesign's calls, applications and project pages (outside the demo) ──────────────────

const callPath = (callId: string, rest = "") => `collab/calls/${encodeURIComponent(callId)}${rest}`;
async function saveCall(req: ReturnType<typeof api.post<ApiCall>>) {
  const r = await req;
  if (!r.ok) { fail(r.message); return null; }
  const c = callFromApi(r.data);
  emit(c.postedByMe ? { hosted: upsert(snap.hosted, c) } : { calls: snap.calls.some((x) => x.id === c.id) ? upsert(snap.calls, c) : snap.calls });
  return c;
}
const decide = (appId: string, body: Record<string, unknown>) => saveApp(appPath(appId, "decision"), body, "desk");

/** Fields a task edit sends (PATCH workspaces/<id>/tasks/<taskId>). */
export type TaskPatch = Partial<{
  title: string; owner_id: string; due: string; priority: "high" | "medium" | "low"; milestone_id: string | null;
  description: string; support_id: string | null; reviewer_id: string | null; status: ApiTask["status"];
  criteria: { id: string; title: string; done: boolean }[];
}>;

/** Every remote action the feature hooks use; each updates the shared snapshot with what the server answered. */
export const collabApi = {
  closeCall: (callId: string) => saveCall(api.post<ApiCall>(callPath(callId, "/close"))),
  reopenCall: (callId: string, closesOn?: string) => saveCall(api.post<ApiCall>(callPath(callId, "/reopen"), closesOn ? { closes_on: closesOn } : {})),
  editCall: (callId: string, fields: Record<string, unknown>) => saveCall(api.put<ApiCall>(callPath(callId), fields)),
  toggleSave: async (callId: string) => {
    const on = !extras.calls[callId]?.saved;
    if (extras.calls[callId]) { extras.calls[callId] = { ...extras.calls[callId], saved: on }; emit({}); }
    const r = await (on ? api.put<ApiCall>(callPath(callId, "/save")) : api.del<ApiCall>(callPath(callId, "/save")));
    if (!r.ok) { if (extras.calls[callId]) extras.calls[callId] = { ...extras.calls[callId], saved: !on }; return fail(r.message); }
    callFromApi(r.data);
    emit({});
  },
  /** Starts the call's project with people from the shortlist; resolves to the new project's id ("" if it didn't). */
  startProject: async (callId: string, applicationIds: string[], keepOpen: boolean) => {
    const r = await api.post<{ workspace_id: string; call: ApiCall }>(callPath(callId, "/start-project"), { application_ids: applicationIds, keep_open: keepOpen });
    if (!r.ok) { fail(r.message); return ""; }
    callFromApi(r.data.call);
    await refresh();
    return r.data.workspace_id;
  },
  /** New times to talk (shortlisted, before the talk), with a message. */
  reofferTimes: (appId: string, slots: string[], message: string) => decide(appId, { action: "reoffer_times", slots, message }),
  /** Sends the offer (after the talk: a booked talk counts as had), or changes the one already sent. */
  sendOffer: async (appId: string, terms: { role: string; hours: string; start: string; note: string }) => {
    const stage = snap.desk.find((a) => a.id === appId)?.stage;
    if (stage === "shortlisted" && !(await decide(appId, { action: "conversation_done" }))) return null;
    return decide(appId, { action: stage === "offer" ? "edit_offer" : "offer", offer_role: terms.role, offer_hours: terms.hours, offer_start: terms.start, offer_note: terms.note });
  },
  /** Times to talk: shortlists them with these times, or offers new ones if they're already shortlisted. */
  proposeTimes: (appId: string, slots: string[], message: string) => {
    const stage = snap.desk.find((a) => a.id === appId)?.stage;
    return decide(appId, { action: stage === "submitted" || stage === "viewed" ? "shortlist" : "reoffer_times", slots, message });
  },
  rescindOffer: (appId: string, message = "") => decide(appId, { action: "rescind_offer", message }),
  notNow: (appId: string, feedback: string, reason?: string) => decide(appId, { action: "decline", feedback, ...(reason ? { reason } : {}) }),
  undoNotNow: (appId: string) => decide(appId, { action: "undo_decline" }),
  /** The applicant turns an offer down, saying why. */
  declineOffer: (appId: string, reason?: string, message = "") => saveApp(appPath(appId, "action"), { action: "decline_offer", ...(reason ? { reason } : {}), message }, "mine"),

  details: (pid: string, fields: { title?: string; summary?: string; needs?: string; open_to_join?: boolean }) => wsPatch(pid, "/details", fields),
  mySettings: async (pid: string, body: { notify_prefs?: Partial<MySettings["notify_prefs"]>; read?: string[] }) => {
    const r = await api.put<MySettings>(ws(pid, "/me"), body);
    if (!r.ok) return fail(r.message);
    const p = extras.projects[pid];
    if (p) { extras.projects[pid] = { ...p, me: r.data }; emit({}); }
  },
  leave: async (pid: string, newHostId?: string) => {
    const r = await api.post(ws(pid, "/leave"), newHostId ? { new_host_id: newHostId } : {});
    if (!r.ok) { fail(r.message); return false; }
    emit({ projects: snap.projects.filter((p) => p.id !== pid) });
    return true;
  },
  removeMember: (pid: string, userId: string) => wsDel(pid, `/members/${encodeURIComponent(userId)}`),
  invitations: (pid: string) => allPages<ApiInvitation>(`collab/workspaces/${encodeURIComponent(pid)}/invitations`),
  invite: async (pid: string, input: { to: string; role: string; message: string }) => {
    const r = await api.post<ApiInvitation>(ws(pid, "/invitations"), input);
    if (!r.ok) { fail(r.message); return null; }
    return r.data;
  },
  withdrawInvitation: async (pid: string, invitationId: string) => {
    const r = await api.del<ApiInvitation>(ws(pid, `/invitations/${encodeURIComponent(invitationId)}`));
    if (!r.ok) fail(r.message);
    return r.ok;
  },
  myInvitations: () => allPages<ApiInvitation>("collab/invitations?status=sent"),
  answerInvitation: async (invitationId: string, accept: boolean) => {
    const r = await api.post<ApiInvitation>(`collab/invitations/${encodeURIComponent(invitationId)}/${accept ? "accept" : "decline"}`);
    if (!r.ok) { fail(r.message); return null; }
    if (accept) await refresh();
    return r.data;
  },
  requests: (pid: string) => allPages<ApiJoinRequest>(`collab/workspaces/${encodeURIComponent(pid)}/requests`),
  askToJoin: async (pid: string, role: string, message: string) => {
    const r = await api.post<ApiJoinRequest>(ws(pid, "/requests"), { role, message });
    if (!r.ok) { fail(r.message); return null; }
    return r.data;
  },
  decideRequest: async (pid: string, requestId: string, action: "accept" | "not-now" | "reopen", message = "") => {
    const r = await api.post<ApiJoinRequest>(ws(pid, `/requests/${encodeURIComponent(requestId)}/${action}`), { message });
    if (!r.ok) { fail(r.message); return null; }
    if (action === "accept") { const p = await loadWorkspace(pid); if (p) emit({ projects: upsert(snap.projects, p) }); }
    return r.data;
  },
  addTask: (pid: string, body: TaskPatch & { title: string; owner_id: string }) => wsPost(pid, "/tasks", body),
  editTask: (pid: string, taskId: string, body: TaskPatch) => wsPatch(pid, `/tasks/${encodeURIComponent(taskId)}`, body),
  deleteTask: (pid: string, taskId: string) => wsDel(pid, `/tasks/${encodeURIComponent(taskId)}`),
  commentTask: (pid: string, taskId: string, text: string) => wsPost(pid, `/tasks/${encodeURIComponent(taskId)}/comments`, { text }),
  editDeliverable: (pid: string, dId: string, body: Partial<{ title: string; owner_id: string; due: string; priority: string; milestone_id: string | null; description: string; support_id: string | null }>) =>
    wsPut(pid, dPath(dId), body),
  drafts: () => allPages<ApiDraft>("collab/drafts"),
  saveDraft: async (draftId: string, body: Omit<ApiDraft, "id" | "updated_at">) => {
    const r = await api.put<ApiDraft>(`collab/drafts/${encodeURIComponent(draftId)}`, body);
    if (!r.ok) fail(r.message);
    return r.ok ? r.data : null;
  },
  deleteDraft: async (draftId: string) => {
    const r = await api.del(`collab/drafts/${encodeURIComponent(draftId)}`);
    return r.ok;
  },
  /** A member's skills and experience line, from their published work profile (cached; screens re-read on arrival). */
  person: (userId: string) => {
    if (!extras.people[userId] && !askedPeople.has(userId)) {
      askedPeople.add(userId);
      void api.get<{ skills: string[]; experience: string; headline: string; about: string; projects: { title: string; kind: string; role: string; year: number }[] }>(`work/people/${encodeURIComponent(userId)}`)
        .then((r) => { if (r.ok) { extras.people[userId] = { skills: r.data.skills, experience: r.data.experience }; peopleFull[userId] = r.data; emit({}); } });
    }
    return extras.people[userId];
  },
};
const askedPeople = new Set<string>();
/** The whole work-profile summary of members whose page was opened. */
export const peopleFull: Record<string, { headline: string; about: string; skills: string[]; experience: string; projects: { title: string; kind: string; role: string; year: number }[] }> = {};

const noSubscribe = () => () => {};
/** The extras for the review, team, task and member screens; subscribing starts the shared store (never in the demo). */
export function useRemoteExtras(): RemoteExtras {
  return useSyncExternalStore(DEMO ? noSubscribe : subscribe, () => snap.x, () => START.x);
}
/** What the backend keeps about a call beyond the shared CollabCall type (status, when it closed, its project profile). */
export const remoteCall = (callId: string) => extras.calls[callId];
/** What a member's work profile says (skills, experience), when the backend has sent it. */
export const remotePerson = (userId: string) => extras.people[userId];

type ApplyInput = Pick<Application, "callId" | "role" | "works" | "links" | "files" | "statement" | "availability" | "materials">;
type CallInput = Omit<CollabCall, "id" | "host" | "postedByMe" | "verified">;

/** Takes the demo store's options too (it has no demo engine), so the two swap freely. */
export function useRemoteCollab() {
  const s = useSyncExternalStore(subscribe, () => snap, () => START);
  const [, setRooms] = useMyRooms();
  const allCalls = [...s.hosted, ...s.calls.filter((c) => !s.hosted.some((h) => h.id === c.id))];
  const call = (callId: string) => {
    const found = allCalls.find((c) => c.id === callId) ?? s.extra.find((c) => c.id === callId);
    if (!found && s.ready) void fetchCall(callId);
    return found;
  };
  const apps = [...s.mine, ...s.desk.filter((a) => !s.mine.some((m) => m.id === a.id))];

  const apply = async (input: ApplyInput) => {
    let fileIds: number[];
    try { fileIds = await storedIds(input.files ?? []); } catch (e) { return { ok: false as const, message: (e as Error).message }; }
    const r = await api.post<ApiApplication>(`collab/calls/${encodeURIComponent(input.callId)}/applications`, {
      role: input.role, statement: input.statement, availability: input.availability,
      links: (input.links ?? []).map((l) => ({ url: l.url, note: l.note ?? "" })), project_ids: input.works.filter((w) => !w.startsWith("tmp-")), file_ids: fileIds,
    });
    if (!r.ok) return { ok: false as const, message: r.message };
    if (r.data.call) emit({ extra: upsert(snap.extra, callFromApi(r.data.call)) });
    emit({ mine: upsert(snap.mine, appFromApi(r.data)) });
    return { ok: true as const, id: r.data.id };
  };

  const postCall = async (c: CallInput) => {
    const closes = new Date();
    closes.setDate(closes.getDate() + Math.max(1, c.closesInDays));
    const r = await api.post<ApiCall>("collab/calls", {
      org: c.org, org_kind: c.orgKind, title: c.title, summary: c.summary, about: c.about, city: c.city, where: WHERE_TO_API[c.where],
      roles: c.roles, fields: c.fields, level: c.level, fee: c.fee, rights: c.rights, selection: c.selection, team_size: c.teamSize,
      timeline: c.timeline, closes_on: closes.toISOString().slice(0, 10),
    });
    if (!r.ok) return { ok: false as const, message: r.message };
    emit({ hosted: upsert(snap.hosted, callFromApi(r.data)) });
    return { ok: true as const, id: r.data.id };
  };

  const setAppStage = (appId: string, stage: AppStage, extra: { feedback?: string; note?: string } = {}) => {
    const body =
      stage === "viewed" ? { action: "view" }
      : stage === "shortlisted" ? { action: "shortlist", slots: nextSlots() }
      : stage === "conversation" ? { action: "conversation_done" }
      : stage === "offer" ? { action: "offer" }
      : stage === "not-selected" ? { action: "decline", feedback: extra.feedback ?? "" }
      : null;
    if (body) void saveApp(appPath(appId, "decision"), body, "desk");
  };
  const notes = (appId: string, body: Record<string, unknown>) => void saveApp(appPath(appId, "notes"), body, "desk");

  const project = {
    /** Signs the version of the agreement on screen; if it changed meanwhile, the newer one loads to read first. */
    sign: async (pid: string) => {
      const r = await api.post<ApiWorkspace>(ws(pid, "/sign"), { version: charterVersions.get(pid) ?? 1 });
      if (!r.ok) {
        fail(r.message);
        if (r.status === 409) { const p = await loadWorkspace(pid); if (p) emit({ projects: upsert(snap.projects, p) }); }
        return;
      }
      charterVersions.set(r.data.id, r.data.charter.version);
      emit({ projects: upsert(snap.projects, projectFromApi(r.data)) });
    },
    editCharter: (pid: string, field: keyof Omit<Charter, "split" | "signed" | "signedAt">, value: string) => {
      optimistic(pid, (p) => { p.charter[field] = value; p.charter.signed = []; p.charter.signedAt = undefined; });
      void wsPut(pid, "/charter", { [field === "exit" ? "exit_terms" : field]: value });
    },
    setSplit: (pid: string, split: Partial<Record<PersonId, number>>) => {
      optimistic(pid, (p) => { p.charter.split = split; p.charter.signed = []; p.charter.signedAt = undefined; });
      void wsPut(pid, "/charter", { split });
    },
    toAgree: (pid: string) => void wsPost(pid, "/to-agree"),
    setStage: (pid: string, stage: JourneyStage) => void wsPost(pid, "/stage", { stage }),
    setKind: (pid: string, kind: WorkKind, withStarter: boolean) => void wsPut(pid, "", { kind, with_starter: withStarter }),
    addDeliverable: (pid: string, d: Pick<Deliverable, "title" | "owner" | "approver" | "due" | "share">) =>
      void wsPost(pid, "/deliverables", { title: d.title, owner_id: d.owner, approver_id: d.approver, due: d.due, share: d.share ?? null }),
    removeDeliverable: (pid: string, dId: string) => void wsDel(pid, dPath(dId)),
    startDeliverable: (pid: string, dId: string) => { optimistic(pid, (p) => { const d = p.deliverables?.find((x) => x.id === dId); if (d) d.status = "doing"; }); void deliverableAction(pid, dId, "start"); },
    backToTodo: (pid: string, dId: string) => { optimistic(pid, (p) => { const d = p.deliverables?.find((x) => x.id === dId); if (d?.status === "doing") d.status = "todo"; }); void deliverableAction(pid, dId, "back_to_todo"); },
    submitDeliverable: (pid: string, dId: string, note: string) => void deliverableAction(pid, dId, "submit", note),
    approveDeliverable: (pid: string, dId: string, note: string) => void deliverableAction(pid, dId, "approve", note),
    askChanges: (pid: string, dId: string, note: string) => void deliverableAction(pid, dId, "changes", note),
    commentDeliverable: (pid: string, dId: string, text: string) => void wsPost(pid, dPath(dId, "/comments"), { text }),
    addProof: async (pid: string, dId: string, item: Omit<ProofItem, "id" | "by" | "at">) => {
      let mediaId: number | undefined;
      try {
        if (item.kind === "image") mediaId = item.src ? mediaIdFor(item.src) : undefined;
        if (item.kind === "file" && item.file) [mediaId] = await storedIds([item.file]);
      } catch (e) { return fail((e as Error).message); }
      if ((item.kind === "image" || item.kind === "file") && mediaId === undefined) return fail("That file didn't upload. Please try again.");
      void wsPost(pid, dPath(dId, "/proof"), { kind: item.kind, title: item.title, url: item.url ?? "", text: item.text ?? "", media_id: mediaId });
    },
    removeProof: (pid: string, dId: string, proofId: string) => void wsDel(pid, dPath(dId, `/proof/${proofId}`)),
    /** Steps are saved with the deliverable, as its whole list. */
    addStep: (pid: string, dId: string, title: string) => {
      const d = snap.projects.find((x) => x.id === pid)?.deliverables?.find((x) => x.id === dId);
      if (d) void wsPut(pid, dPath(dId), { steps: [...d.steps, { id: newId("st"), title, done: false }] });
    },
    toggleStep: (pid: string, dId: string, stepId: string) => {
      const d = snap.projects.find((x) => x.id === pid)?.deliverables?.find((x) => x.id === dId);
      if (!d) return;
      const steps = d.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st));
      optimistic(pid, (p) => { const x = p.deliverables?.find((y) => y.id === dId); if (x) x.steps = steps; });
      void wsPut(pid, dPath(dId), { steps });
    },
    addTool: (pid: string, tool: Omit<Tool, "id">) => void wsPost(pid, "/tools", { label: tool.label, url: tool.url }),
    removeTool: (pid: string, toolId: string) => void wsDel(pid, `/tools/${toolId}`),
    checkin: (pid: string, c: Pick<Checkin, "done" | "next" | "stuck">) => void wsPost(pid, "/checkins", { done: c.done, next: c.next, stuck: c.stuck ?? "" }),
    preserve: (pid: string) => void wsPost(pid, "/stage", { stage: 6 }),
    addTask: (pid: string, task: Omit<Task, "id" | "status">) => void collabApi.addTask(pid, { title: task.title, owner_id: task.who, due: task.due }),
    moveTask: (pid: string, taskId: string, status: Task["status"]) => {
      optimistic(pid, (p) => { const t = p.tasks.find((x) => x.id === taskId); if (t) t.status = status; });
      void collabApi.editTask(pid, taskId, { status });
    },
    toggleMilestone: (pid: string, mId: string) => {
      const m = snap.projects.find((x) => x.id === pid)?.milestones.find((x) => x.id === mId);
      if (m) void wsPatch(pid, `/milestones/${encodeURIComponent(mId)}`, { done: !m.done });
    },
    addMilestone: (pid: string, title: string, due: string) => void wsPost(pid, "/milestones", { title, due }),
    // Not kept by the backend yet (the idea board, presenting, expenses and payouts): say so, change nothing.
    addStudio: notYet,
    comment: notYet,
    tagStudio: notYet,
    addExpense: notYet,
    payExpense: notYet,
    payOut: notYet,
    toggleCheck: notYet,
    setPresent: notYet,
    /** A live room for the team (Presence Rooms stay in the browser for now). */
    startRoom: (p: Project, ritual?: string) => {
      const room: Room = {
        id: newId("room"), title: `${p.title} · ${ritual ? ritual.toLowerCase() : "working session"}`, host: ME, when: "Starting now", status: "soon",
        blurb: `A private working session for the ${p.title} team.`, seated: [ME], photo: p.photo, tag: "Collaboration", mine: true, visibility: "private",
      };
      setRooms((cur) => [room, ...cur]);
      const href = "/connect/rooms"; // Rooms are not designed yet: their Coming soon page
      // The team hears about it in the project's own chat (never the browser's km:* stores).
      if (p.convoId) {
        const card: ChatCard = { type: "invite", invite: "project", title: room.title.slice(0, 120), detail: room.blurb.slice(0, 300), href };
        void chat.send(p.convoId, { body: `${room.title}: starting now.`, card, client_id: newClientId() }).then((r) => {
          if (!r.ok) return fail(r.message);
          const m = msgFromApi(r.data);
          if (m) emit({ threads: { ...snap.threads, [p.convoId]: [...(snap.threads[p.convoId] ?? []).filter((x) => x.id !== m.id), m] } });
        });
      }
      return href;
    },
    send: async (p: Project, text: string) => {
      if (!p.convoId) return fail("This project has no chat yet.");
      const r = await chat.send(p.convoId, { body: text, client_id: newClientId() });
      if (!r.ok) return fail(r.message);
      const m = msgFromApi(r.data);
      if (m) emit({ threads: { ...snap.threads, [p.convoId]: [...(snap.threads[p.convoId] ?? []).filter((x) => x.id !== m.id), m] } });
    },
  };

  const thread = (p: Project): KMsg[] => {
    if (!p.convoId) return [];
    if (!watched.has(p.convoId) && !snap.threads[p.convoId]) void loadThread(p.convoId);
    watched.set(p.convoId, Date.now());
    return s.threads[p.convoId] ?? [];
  };

  return {
    ready: s.ready, state: { v: 1 as const, calls: allCalls, applications: apps, projects: s.projects, proposals: s.proposals, saved: s.saved },
    calls: allCalls, apps, projects: s.projects, proposals: s.proposals, myApps: s.mine, hostedCalls: s.hosted, call,
    appFor: (callId: string) => s.mine.find((a) => a.callId === callId && a.stage !== "withdrawn"),
    /** Saved calls are kept on the server, so they follow the member to any device. */
    toggleSave: (callId: string) => void collabApi.toggleSave(callId),
    apply, postCall, setAppStage,
    pickSlot: (appId: string, slot: string) => void saveApp(appPath(appId, "action"), { action: "pick_slot", slot }, "mine"),
    withdraw: (appId: string) => void saveApp(appPath(appId, "action"), { action: "withdraw" }, "mine"),
    declineOffer: (appId: string, reason?: string, message?: string) => void collabApi.declineOffer(appId, reason, message ?? ""),
    /** Accepting puts you in the workspace; resolves to its id (empty if it didn't go through). */
    acceptOffer: async (appId: string) => {
      const a = await saveApp(appPath(appId, "action"), { action: "accept_offer" }, "mine");
      if (!a?.projectId) return "";
      const p = await loadWorkspace(a.projectId);
      if (p) emit({ projects: upsert(snap.projects, p) });
      return a.projectId;
    },
    addNote: (appId: string, text: string) => notes(appId, { note: text }),
    toggleTag: (appId: string, tag: string) => {
      const a = snap.desk.find((x) => x.id === appId);
      if (a) notes(appId, { tags: a.tags.includes(tag) ? a.tags.filter((t) => t !== tag) : [...a.tags, tag] });
    },
    rate: (appId: string, rating: number) => notes(appId, { rating }),
    propose: async (input: Pick<Proposal, "to" | "title" | "idea" | "myRole" | "theirRole">) => {
      const r = await api.post<ApiProposal>("collab/proposals", { recipient_id: input.to, title: input.title, idea: input.idea, sender_role: input.myRole, recipient_role: input.theirRole });
      if (!r.ok) { fail(r.message); return false; }
      emit({ proposals: upsert(snap.proposals, proposalFromApi(r.data)) });
      return true;
    },
    /** Saying yes opens a shared workspace for the two of you; resolves to its id. */
    answerProposal: async (proposalId: string, answer: "accept" | "decline" | "withdraw") => {
      const r = await api.post<ApiProposal>(`collab/proposals/${encodeURIComponent(proposalId)}/answer`, { answer });
      if (!r.ok) { fail(r.message); return ""; }
      emit({ proposals: upsert(snap.proposals, proposalFromApi(r.data)) });
      if (r.data.workspace_id) await refresh();
      return r.data.workspace_id ?? "";
    },
    project, thread,
    /** The project chat is made with the workspace on the backend. */
    ensureConvo: () => {},
    notice: s.notice, clearNotice: () => emit({ notice: undefined }),
    reset: () => {},
  };
}
