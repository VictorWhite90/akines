"use client";

import { useEffect, useSyncExternalStore } from "react";
import { toast } from "@/components/kin/Toast";
import { api } from "@/lib/api/client";
import type { Collaborator, IncomingIntroduction, IncomingStatus, Introduction, IntroStatus, MatchIntention, MatchPrefs, Pronoun } from "@/lib/collab/collaborators";
import { registerPerson, type PersonId } from "@/lib/data/people";
import { apiPhoto, type ImageSource } from "@/lib/images";

/**
 * Collaborator matching, saved to the backend (/api/v1/matching/*): the member's intention, recommendations with
 * their reasons, "not relevant", saved collaborators and introductions both ways. It gives lib/collab/collaborators.ts
 * the same shapes as its demo store, so the screens don't know which one they're talking to. Every change shows
 * at once and is put back, with a toast, if the server refuses it. Introductions refresh every 30 seconds while a
 * screen that shows them is open (and when the tab comes back into view).
 *
 *   GET|PUT  matching/intention                       {intention, project_id, prefs, need}
 *   GET      matching/recommendations?page=            page of ApiCollaborator
 *   GET      matching/collaborators/:user_id          ApiCollaborator
 *   POST     matching/dismissals {user_id, reason?}    DELETE matching/dismissals/:user_id (undo)
 *   GET|POST matching/saved {user_id}                  DELETE matching/saved/:user_id
 *   GET|POST matching/introductions {recipient_id, project_id?, message}
 *   POST     matching/introductions/:id/withdraw|restore           (the sender)
 *   GET      matching/introductions/incoming
 *   POST     matching/introductions/:id/accept|not-now|reopen      (the recipient)
 */

// ── What the backend sends ──────────────────────────────────────────────────────────────────

type ApiPerson = { user_id: string; username: string | null; first_name: string; last_name: string; profile_photo: string | null; profile_photo_image?: ImageSource | null; headline?: string; location?: string };
type ApiPage<T> = { results: T[]; page: number; page_size: number; has_more: boolean; server_time: string };
type ApiIntention = { intention: MatchIntention["intention"]; project_id: string | null; prefs: MatchPrefs | null; need: string | null; updated_at: string | null };
export type ApiCollaborator = {
  user: ApiPerson; pronoun: Pronoun; availability: string; key_skills: string[]; intro: string; compat: string; experience: string;
  preference: string; about: string; experience_list: { title: string; detail: string }[]; skills: string[]; interests: string[];
  preferences: { label: string; value: string }[]; contributions: { title: string; detail: string }[]; match_context: string;
  reasons: { category: string; text: string; source: string }[]; ask: string[]; aligned: string; saved: boolean;
  introduction: { id: string; status: string } | null; saved_at?: string;
};
type ApiSent = {
  id: string; recipient: ApiPerson; project_id: string | null; project_title: string; message: string; status: "pending" | "accepted" | "not_now" | "withdrawn";
  sent_at: string; seen_at: string | null; answered_at: string | null; withdrawn_at: string | null; conversation_id: string | null;
};
type ApiIncoming = {
  id: string; sender: ApiPerson; project_id: string | null; project_title: string; purpose: string; note: string;
  status: "waiting" | "accepted" | "not_now"; received_at: string; answered_at: string | null; conversation_id: string | null;
};

// ── From the backend to the screens ─────────────────────────────────────────────────────────

const at = (iso: string | null | undefined) => (iso ? Date.parse(iso) : undefined);

function who(p: ApiPerson): PersonId {
  registerPerson({
    id: p.user_id, name: `${p.first_name} ${p.last_name}`.trim() || p.username || "A member", role: p.headline ?? "",
    city: p.location ?? "", presence: "open", about: "", photo: apiPhoto(p.profile_photo, p.profile_photo_image),
  });
  return p.user_id as PersonId;
}

function collaboratorFromApi(c: ApiCollaborator): Collaborator {
  return {
    id: who(c.user), pronoun: c.pronoun, availability: c.availability, keySkills: c.key_skills, intro: c.intro, compat: c.compat,
    experience: c.experience, preference: c.preference, about: c.about, experienceList: c.experience_list, skills: c.skills,
    interests: c.interests, preferences: c.preferences, contributions: c.contributions, matchContext: c.match_context,
    reasons: c.reasons, ask: c.ask, aligned: c.aligned,
  };
}

const SENT_STATUS: Record<ApiSent["status"], IntroStatus> = { pending: "pending", accepted: "accepted", not_now: "notnow", withdrawn: "pending" };
const sentFromApi = (x: ApiSent): Introduction => ({
  id: x.id, to: who(x.recipient), projectId: x.project_id, projectTitle: x.project_title, message: x.message, status: SENT_STATUS[x.status],
  sentAt: Date.parse(x.sent_at), seenAt: at(x.seen_at), answeredAt: at(x.answered_at), withdrawnAt: at(x.withdrawn_at),
});
const IN_STATUS: Record<ApiIncoming["status"], IncomingStatus> = { waiting: "waiting", accepted: "accepted", not_now: "notnow" };
const incomingFromApi = (x: ApiIncoming): IncomingIntroduction & { conversationId?: string } => ({
  id: x.id, from: who(x.sender), projectId: x.project_id, projectTitle: x.project_title, purpose: x.purpose, note: x.note,
  status: IN_STATUS[x.status], receivedAt: Date.parse(x.received_at), answeredAt: at(x.answered_at), conversationId: x.conversation_id ?? undefined,
});

// ── A small shared store ────────────────────────────────────────────────────────────────────

type Snapshot = {
  intention: MatchIntention | null;
  recs: PersonId[] | null;
  /** Every collaborator seen (recommendations, saved, opened one by one), by id. */
  people: Record<string, Collaborator>;
  /** Ids the server said aren't available to this member. */
  missing: Record<string, true>;
  saved: PersonId[] | null;
  sent: Introduction[] | null;
  incoming: IncomingIntroduction[] | null;
};
let snap: Snapshot = { intention: null, recs: null, people: {}, missing: {}, saved: null, sent: null, incoming: null };
const subs = new Set<() => void>();
const emit = (next: Partial<Snapshot>) => { snap = { ...snap, ...next }; subs.forEach((f) => f()); };
const fail = (message: string) => toast.show({ message });
const keep = (list: Collaborator[]) => {
  const people = { ...snap.people };
  for (const c of list) people[c.id] = c;
  return people;
};

/** Every page of a list (up to 10 pages of 50). */
async function allPages<T>(path: string): Promise<T[] | null> {
  const items: T[] = [];
  for (let page = 1; page <= 10; page++) {
    const r = await api.get<ApiPage<T>>(`${path}?page=${page}&page_size=50`);
    if (!r.ok) return null;
    items.push(...r.data.results);
    if (!r.data.has_more) break;
  }
  return items;
}

const loading = new Set<string>();
async function once(name: string, run: () => Promise<void>) {
  if (loading.has(name)) return;
  loading.add(name);
  try { await run(); } finally { loading.delete(name); }
}

const loadIntention = () => once("intention", async () => {
  const r = await api.get<ApiIntention>("matching/intention");
  if (r.ok) emit({ intention: intentionFromApi(r.data) });
});
const intentionFromApi = (x: ApiIntention): MatchIntention => ({ intention: x.intention, projectId: x.project_id, prefs: x.prefs, need: x.need, updatedAt: at(x.updated_at) ?? null });

const loadRecs = () => once("recs", async () => {
  const items = await allPages<ApiCollaborator>("matching/recommendations");
  if (!items) return emit({ recs: snap.recs ?? [] });
  const list = items.map(collaboratorFromApi);
  emit({ recs: list.map((c) => c.id), people: keep(list) });
});
const loadSaved = () => once("saved", async () => {
  const items = await allPages<ApiCollaborator>("matching/saved");
  if (!items) return emit({ saved: snap.saved ?? [] });
  const list = items.map(collaboratorFromApi);
  emit({ saved: list.map((c) => c.id), people: keep(list) });
});
const loadSent = () => once("sent", async () => {
  const items = await allPages<ApiSent>("matching/introductions");
  emit({ sent: items ? items.map(sentFromApi) : snap.sent ?? [] });
});
const loadIncoming = () => once("incoming", async () => {
  const items = await allPages<ApiIncoming>("matching/introductions/incoming");
  emit({ incoming: items ? items.map(incomingFromApi) : snap.incoming ?? [] });
});
const loadPerson = (id: string) => once(`person:${id}`, async () => {
  const r = await api.get<ApiCollaborator>(`matching/collaborators/${encodeURIComponent(id)}`);
  if (r.ok) emit({ people: keep([collaboratorFromApi(r.data)]) });
  else if (r.status === 404) emit({ missing: { ...snap.missing, [id]: true } });
});

/** Introductions both ways, refreshed while something shows them. */
let watching = 0;
if (typeof window !== "undefined") {
  setInterval(() => { if (watching && document.visibilityState === "visible") { void loadSent(); void loadIncoming(); } }, 30_000);
  document.addEventListener("visibilitychange", () => { if (watching && document.visibilityState === "visible") { void loadSent(); void loadIncoming(); } });
}

type Part = "intention" | "recs" | "saved" | "sent" | "incoming";
const LOADERS: Record<Part, () => Promise<void>> = { intention: loadIntention, recs: loadRecs, saved: loadSaved, sent: loadSent, incoming: loadIncoming };

/** The store, loading the parts a screen needs the first time it asks. */
export function useMatchingStore(parts: Part[]): Snapshot {
  const s = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => snap, () => snap);
  const key = parts.join(",");
  useEffect(() => {
    for (const p of key.split(",") as Part[]) if (snap[p] === null) void LOADERS[p]();
    const live = key.includes("sent") || key.includes("incoming");
    if (live) watching++;
    return () => { if (live) watching--; };
  }, [key]);
  return s;
}

/** One collaborator: from the store, or asked for once. `undefined` while loading, `null` when not available. */
export function useRemoteCollaboratorById(id: string | undefined): Collaborator | null | undefined {
  const s = useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => snap, () => snap);
  useEffect(() => { if (id && !snap.people[id] && !snap.missing[id]) void loadPerson(id); }, [id]);
  if (!id) return null;
  return s.people[id] ?? (s.missing[id] ? null : undefined);
}

/** Read without subscribing (for link helpers). */
export const matchingSnapshot = () => snap;

// ── Saving ───────────────────────────────────────────────────────────────────────────────────

export async function saveIntention(next: Partial<Pick<MatchIntention, "intention" | "projectId" | "prefs" | "need">>, before: MatchIntention | null) {
  const body: Record<string, unknown> = {};
  if ("intention" in next) body.intention = next.intention;
  if ("projectId" in next) body.project_id = next.projectId ?? "";
  if ("prefs" in next) body.prefs = next.prefs;
  if ("need" in next) body.need = next.need ?? "";
  emit({ intention: { ...(snap.intention ?? { intention: "project", projectId: null, prefs: null, updatedAt: null }), ...next, updatedAt: Date.now() } });
  const r = await api.put<ApiIntention>("matching/intention", body);
  if (!r.ok) { emit({ intention: before }); fail(r.message); return; }
  emit({ intention: intentionFromApi(r.data) });
  void loadRecs(); // the recommendations follow the new intention
}

export function dismiss(id: PersonId, reason?: string) {
  const before = snap.recs;
  emit({ recs: (snap.recs ?? []).filter((x) => x !== id) });
  const done = api.post("matching/dismissals", { user_id: id, ...(reason ? { reason } : {}) }).then((r) => {
    if (!r.ok) { emit({ recs: before }); fail(r.message); }
  });
  return () => {
    emit({ recs: before });
    // after the dismissal has landed, so the two can't cross
    void done.then(() => api.del(`matching/dismissals/${encodeURIComponent(id)}`)).then((r) => { if (!r.ok) fail(r.message); });
  };
}

export function setSaved(id: PersonId, saved: boolean) {
  const before = snap.saved ?? [];
  emit({ saved: saved ? (before.includes(id) ? before : [id, ...before]) : before.filter((x) => x !== id) });
  const r = saved ? api.post("matching/saved", { user_id: id }) : api.del(`matching/saved/${encodeURIComponent(id)}`);
  void r.then((x) => { if (!x.ok) { emit({ saved: before }); fail(x.message); } });
}

export function sendIntroduction(input: Pick<Introduction, "to" | "projectId" | "projectTitle" | "message">): Introduction {
  const draft: Introduction = { ...input, id: `pending-${Date.now().toString(36)}`, status: "pending", sentAt: Date.now() };
  emit({ sent: [draft, ...(snap.sent ?? [])] });
  void api.post<ApiSent>("matching/introductions", { recipient_id: input.to, message: input.message, ...(input.projectId ? { project_id: input.projectId } : {}) })
    .then((r) => {
      const others = (snap.sent ?? []).filter((x) => x.id !== draft.id);
      if (!r.ok) { emit({ sent: others }); fail(r.message); return; }
      emit({ sent: [sentFromApi(r.data), ...others] });
    });
  return draft;
}

/** Withdraw a pending request; the undo puts it back (restore). */
export function withdrawIntroduction(id: string) {
  const before = snap.sent ?? [];
  emit({ sent: before.map((x) => (x.id === id ? { ...x, withdrawnAt: Date.now() } : x)) });
  const done = api.post<ApiSent>(`matching/introductions/${encodeURIComponent(id)}/withdraw`).then((r) => {
    if (!r.ok) { emit({ sent: before }); fail(r.message); }
  });
  return () => {
    emit({ sent: (snap.sent ?? []).map((x) => (x.id === id ? { ...x, withdrawnAt: undefined } : x)) });
    void done.then(() => api.post<ApiSent>(`matching/introductions/${encodeURIComponent(id)}/restore`)).then((r) => {
      if (!r.ok) { fail(r.message); void loadSent(); return; }
      const restored = sentFromApi(r.data);
      emit({ sent: (snap.sent ?? []).map((x) => (x.id === id ? restored : x)) });
    });
  };
}

/** Accept or Not now (the recipient); the undo reopens it. Reopen alone is `answerIntroduction(id, "waiting")`. */
export function answerIntroduction(id: string, status: IncomingStatus) {
  const before = snap.incoming ?? [];
  const action = status === "accepted" ? "accept" : status === "notnow" ? "not-now" : "reopen";
  emit({ incoming: before.map((x) => (x.id === id ? { ...x, status, answeredAt: status === "waiting" ? undefined : Date.now() } : x)) });
  const run = (path: string, onFail: () => void) => api.post<ApiIncoming>(`matching/introductions/${encodeURIComponent(id)}/${path}`).then((r) => {
    if (!r.ok) { onFail(); fail(r.message); return; }
    const next = incomingFromApi(r.data);
    emit({ incoming: (snap.incoming ?? []).map((x) => (x.id === id ? next : x)) });
  });
  const done = run(action, () => emit({ incoming: before }));
  return () => {
    emit({ incoming: (snap.incoming ?? []).map((x) => (x.id === id ? { ...x, status: "waiting", answeredAt: undefined } : x)) });
    void done.then(() => run("reopen", () => void loadIncoming()));
  };
}
