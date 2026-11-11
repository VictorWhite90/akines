"use client";

import { useCallback, useMemo } from "react";
import { DEMO } from "@/lib/demo/mode";
import { collabApi, useRemoteExtras } from "@/lib/api/collab";
import { useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import { skillsOf } from "@/lib/collab/team";
import { useCollab } from "@/lib/collab/useCollab";
import type { AppStage, Application } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * The host's review of the people who applied (journeys 12.45 REVIEW APPLICANTS and 12.46 OPEN CALL REVIEW):
 * the applications on a call you host, or on the call behind one of your projects, seen as the design's statuses
 * (New, Shortlisted, Talk booked, Offer sent, Joined, Not now), and what the host can do with them.
 *
 * Stages move through useCollab (setAppStage, addNote). What useCollab can't carry yet is kept here, shaped like
 * the REST resource it will become:
 *   PUT  /collab/applications/:id/slots-offered     ← { slots: string[], message }   (Application.slotsOffered)
 *   PUT  /collab/applications/:id/offer             ← { role, hours, start, note }  (setAppStage only fills role, fee, start from the call)
 *   POST /collab/calls/:id/close  · POST /collab/calls/:id/reopen                   (CollabCall has no open/closed state)
 *   GET  /collab/projects/:id/applications           → Application[]                (people asking to join a project that has no call)
 *   GET  /people/:id/experience                      → string                       (the compare table's EXPERIENCE row)
 * The demo keeps these in the browser, and seeds applications to the two sample projects that have no call.
 */

export type ReviewStatus = "New" | "Shortlisted" | "Talk booked" | "Offer sent" | "Joined" | "Not now";
export const REVIEW_STATUSES: ReviewStatus[] = ["New", "Shortlisted", "Talk booked", "Offer sent", "Joined", "Not now"];

/** What the host offers (Modal:Send offer). */
export type OfferTerms = { role: string; hours: string; start: string; note: string };

/** The design's status for an application's stage. A shortlisted person who picked a time has a talk booked. */
export function statusOf(a: Pick<Application, "stage" | "slot">): ReviewStatus | null {
  switch (a.stage) {
    case "submitted":
    case "viewed": return "New";
    case "shortlisted": return a.slot ? "Talk booked" : "Shortlisted";
    case "conversation": return "Talk booked";
    case "offer": return "Offer sent";
    case "joined": return "Joined";
    case "not-selected": return "Not now";
    default: return null;
  }
}

/** One person who applied, as the review screens show them. */
export type Applicant = {
  id: string;
  person: PersonId;
  name: string;
  first: string;
  /** What they do (their profile), and where. */
  role: string;
  place: string;
  /** "2 Nov". */
  applied: string;
  wants: string;
  availability: string;
  message: string;
  /** The first sentence of the message, for the request cards. */
  short: string;
  skills: string[];
  experience?: string;
  status: ReviewStatus;
  stage: AppStage;
  /** "Tue 10 Nov, 4:00 pm" once a talk is booked. */
  talk?: string;
  /** "Wed 11 Nov" when the offer went out, "Fri 13 Nov" when they joined. */
  offerSent?: string;
  joined?: string;
  slotsOffered: string[];
  offer?: OfferTerms;
  /** The saved private note, and what is in the note field now. */
  note: string;
  draft: string;
  /** The stage before Not now, for Undo. */
  before?: AppStage;
  appliedAt: number;
};

/** Each person's experience line. A real build reads it from the person's work profile. */
export const EXPERIENCE: Partial<Record<PersonId, string>> = {
  thandi: "Teaches at a primary school and runs its parents' group.",
  nandi: "Counsels families and hosts small listening rooms.",
  tunde: "Ran the player and parent surveys for the Area 1 Youth League.",
  zuri: "Organises community events, online and around real tables.",
  fatou: "Runs a small kitchen and teaches cooking classes.",
  chidi: "Edits his department's lecture recordings and a friend's football podcast.",
  kwame: "Eight years of software, three of them editing a tech podcast.",
  wanjiru: "Photographs people for magazines, families and small brands.",
  leila: "Founded two companies, the first at 23.",
  efua: "Records oral histories for a city archive.",
};

/* ------------------------------------------------------------------ dates and times */

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY = 86_400_000;
export const dayMonth = (at: number) => { const d = new Date(at); return `${d.getDate()} ${MON[d.getMonth()]}`; };
export const weekdayDate = (at: number) => `${WD[new Date(at).getDay()]} ${dayMonth(at)}`;

/** "16:00" → "4:00 pm". */
export function clock12(hhmm: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return hhmm;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "am" : "pm"}`;
}
/** "4:00 pm" → "16:00". */
export function clock24(text: string) {
  const m = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(text.trim());
  if (!m) return text;
  const h = (Number(m[1]) % 12) + (m[3].toLowerCase() === "pm" ? 12 : 0);
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}
/** A slot as useCollab keeps it ("Thu 14 Nov · 16:00") the way the design writes it ("Thu 14 Nov, 4:00 pm"). */
export function slotText(slot: string) {
  const [day, time] = slot.split(" · ");
  return time ? `${day}, ${clock12(time)}` : slot;
}
/** The next three weekdays after today, for Modal:Propose times. */
export function nextWeekdays(n = 3, from = Date.now()) {
  const out: number[] = [];
  for (let t = from + DAY; out.length < n; t += DAY) { const d = new Date(t).getDay(); if (d !== 0 && d !== 6) out.push(t); }
  return out.map(weekdayDate);
}

/* ------------------------------------------------------------------ the store */

type Extra = { slotsOffered?: string[]; timesMessage?: string; offer?: OfferTerms; before?: AppStage; draft?: string };
type Store = {
  extra: Record<string, Extra>;
  /** Calls the host closed, and when. */
  closed: Record<string, number>;
  /** People ticked to compare, per list (up to three). */
  compare: Record<string, string[]>;
  /** Applications to projects that have no call (demo seeds). */
  apps: Application[];
};

export const COMPARE_MAX = 3;
const KEY = "ak:collab-review:v1";

function seedApps(): Application[] {
  if (!DEMO) return [];
  const now = Date.now();
  const days = nextWeekdays(2);
  const app = (projectId: string, who: PersonId, role: string, statement: string, availability: string, stage: AppStage, ago: number, more: Partial<Application> = {}): Application => ({
    id: `pa-${projectId}-${who}`, callId: "", projectId, applicant: who, role, works: [], statement, availability, materials: {}, stage,
    history: [{ stage: "submitted", at: now - ago * DAY }, ...(stage !== "submitted" && stage !== "viewed" ? [{ stage, at: now - ago * DAY + DAY }] : [])],
    notes: [], tags: [], ...more,
  });
  return [
    app("garki-clinic-booking", "thandi", "Tester", "I would like to test the booking screens with the parents at my school.", "Weekday afternoons", "submitted", 6),
    app("garki-clinic-booking", "nandi", "Patient interviews", "I can talk with patients about the wait, and what would make booking feel safe.", "Open to new collaborations", "shortlisted", 5, { notes: [{ at: now - 2 * DAY, text: "Calm with patients. Ask how many interviews a week she can do." }] }),
    app("garki-clinic-booking", "tunde", "Survey and data", "I ran the surveys for our league. I can collect what patients say in the waiting room.", "Available from next month", "conversation", 5, { slot: `${days[1]} · 16:00` }),
    app("garki-clinic-booking", "zuri", "Community outreach", "I bring people together. I can help families in Garki hear that they can now book online.", "Available for new projects", "submitted", 4),
    app("market-light", "zuri", "Launch organiser", "I would like to help bring the traders and their families to the launch.", "Weekends", "submitted", 3),
    app("market-light", "fatou", "Launch food", "I would like to cook for the launch: food the traders sell, on their own plates.", "Available for new projects", "submitted", 2),
  ];
}
const DRAFTS: Record<string, string> = { "pa-garki-clinic-booking-tunde": "Good talk. Clear plan for the waiting room survey. Ready to make an offer." };

/** Which applications a list shows: a call's, or a project's (its call's, else the ones sent to the project). */
export type ReviewSource = { callId?: string; projectId?: string };
export const listKey = (s: ReviewSource) => (s.callId ? `call:${s.callId}` : `project:${s.projectId ?? ""}`);

export function useApplicants(source: ReviewSource) {
  const collab = useCollab();
  // Outside the demo, times, offers, "not now" and closing the call are kept by the backend.
  const remote = useRemoteExtras();
  const [store, setStore, storeReady] = useLocal<Store>(KEY, { extra: Object.fromEntries(Object.entries(DRAFTS).map(([k, draft]) => [k, { draft }])), closed: {}, compare: {}, apps: seedApps() });
  const key = listKey(source);
  const { callId, projectId } = source;

  const raw = useMemo<Application[]>(() => {
    if (callId) return collab.apps.filter((a) => a.callId === callId && a.applicant !== ME);
    return store.apps.filter((a) => a.projectId === projectId);
  }, [callId, projectId, collab.apps, store.apps]);
  const isLocal = useCallback((id: string) => store.apps.some((a) => a.id === id), [store.apps]);

  const list = useMemo<Applicant[]>(() => raw.flatMap((a) => {
    const status = statusOf(a);
    if (!status) return [];
    const p = PEOPLE[a.applicant];
    const x = store.extra[a.id] ?? {};
    const name = p?.name ?? "A member";
    const at = (s: AppStage) => [...a.history].reverse().find((h) => h.stage === s)?.at;
    const note = a.notes[0]?.text ?? "";
    const appliedAt = a.history[0]?.at ?? 0;
    return [{
      id: a.id, person: a.applicant, name, first: name.split(" ")[0], role: p?.role ?? "", place: p?.city ?? "",
      applied: appliedAt ? dayMonth(appliedAt) : "", wants: a.role, availability: a.availability, message: a.statement,
      short: a.statement.split(/(?<=\.)\s/)[0] ?? a.statement, skills: skillsOf(a.applicant),
      experience: EXPERIENCE[a.applicant] ?? (remote.people[a.applicant]?.experience || undefined),
      status, stage: a.stage, talk: a.slot ? slotText(a.slot) : undefined,
      offerSent: at("offer") ? weekdayDate(at("offer")!) : undefined, joined: at("joined") ? weekdayDate(at("joined")!) : undefined,
      slotsOffered: DEMO ? x.slotsOffered ?? a.slotsOffered ?? [] : a.slotsOffered ?? [],
      offer: DEMO ? x.offer : termsOf(remote.apps[a.id]?.offer), note, draft: x.draft ?? note,
      before: DEMO ? x.before : remote.apps[a.id]?.before, appliedAt,
    }];
  }).sort((a, b) => a.appliedAt - b.appliedAt), [raw, store.extra, remote]);

  const put = useCallback((id: string, e: Extra) => setStore((s) => ({ ...s, extra: { ...s.extra, [id]: { ...s.extra[id], ...e } } })), [setStore]);
  const setLocal = useCallback((id: string, fn: (a: Application) => Application) => setStore((s) => ({ ...s, apps: s.apps.map((a) => (a.id === id ? fn(a) : a)) })), [setStore]);

  /** Move an application on: through useCollab for a call's, here for a project's own. */
  const stage = useCallback((id: string, next: AppStage, extra: { feedback?: string; note?: string } = {}) => {
    if (isLocal(id)) {
      setLocal(id, (a) => ({ ...a, stage: next, feedback: extra.feedback ?? a.feedback, history: [...a.history, { stage: next, at: Date.now(), note: extra.note }] }));
    } else collab.setAppStage(id, next, extra);
  }, [isLocal, setLocal, collab]);

  const find = (id: string) => list.find((a) => a.id === id);
  const compare = store.compare[key] ?? [];

  return {
    ready: collab.ready && storeReady,
    list,
    /** Opening someone counts as seeing their application. */
    view: (id: string) => { if (raw.find((a) => a.id === id)?.stage === "submitted") stage(id, "viewed", { note: "You opened the application." }); },
    shortlist: (id: string) => stage(id, "shortlisted", { note: "You shortlisted them." }),
    proposeTimes: (id: string, slots: string[], message: string) => {
      if (!DEMO && !isLocal(id)) { void collabApi.proposeTimes(id, slots, message.trim()); return; }
      put(id, { slotsOffered: slots, timesMessage: message.trim() || undefined });
      if (isLocal(id)) setLocal(id, (a) => ({ ...a, slotsOffered: slots }));
    },
    sendOffer: (id: string, terms: OfferTerms) => {
      if (!DEMO && !isLocal(id)) { void collabApi.sendOffer(id, terms); return; }
      put(id, { offer: terms });
      stage(id, "offer", { note: `You offered them the ${terms.role} role.` });
      if (isLocal(id)) setLocal(id, (a) => ({ ...a, offer: { role: terms.role, fee: terms.hours, start: terms.start } }));
    },
    notNow: (id: string, message: string) => {
      const a = find(id);
      if (!a || a.status === "Not now") return undefined;
      if (!DEMO && !isLocal(id)) {
        void collabApi.notNow(id, message.trim() || `Thank you, ${a.first}. Now is not the right time for us to add someone.`);
        return a.stage;
      }
      put(id, { before: a.stage });
      stage(id, "not-selected", { feedback: message.trim() || `Thank you, ${a.first}. Now is not the right time for us to add someone.`, note: "You let them know: not now." });
      return a.stage;
    },
    /** Undo from the toast: put back the stage it had (works from a closure made before the change). */
    restore: (id: string, before: AppStage) => {
      if (!DEMO && !isLocal(id)) { void collabApi.undoNotNow(id); return; }
      stage(id, before, { note: "You took your reply back." }); put(id, { before: undefined });
    },
    undoNotNow: (id: string) => {
      const a = find(id);
      if (!a || a.stage !== "not-selected") return;
      if (!DEMO && !isLocal(id)) { void collabApi.undoNotNow(id); return; }
      stage(id, a.before ?? "viewed", { note: "You took your reply back." });
      put(id, { before: undefined });
    },
    setDraft: (id: string, text: string) => put(id, { draft: text }),
    saveNote: (id: string) => {
      const a = find(id);
      const text = (a?.draft ?? "").trim();
      if (!a || !text) return;
      put(id, { draft: text });
      if (isLocal(id)) setLocal(id, (x) => ({ ...x, notes: [{ at: Date.now(), text }, ...x.notes] }));
      else collab.addNote(id, text);
    },
    compare,
    /** Tick or untick someone to compare; a fourth tick is ignored. */
    toggleCompare: (id: string) => setStore((s) => {
      const cur = s.compare[key] ?? [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= COMPARE_MAX ? cur : [...cur, id];
      return { ...s, compare: { ...s.compare, [key]: next } };
    }),
    setCompare: (ids: string[]) => setStore((s) => ({ ...s, compare: { ...s.compare, [key]: ids.slice(0, COMPARE_MAX) } })),
    clearCompare: () => setStore((s) => ({ ...s, compare: { ...s.compare, [key]: [] } })),
    closedAt: !callId ? undefined : DEMO ? store.closed[callId]
      : remote.calls[callId]?.closedAt,
    closeCall: () => {
      if (!callId) return;
      if (!DEMO) { void collabApi.closeCall(callId); return; }
      setStore((s) => ({ ...s, closed: { ...s.closed, [callId]: Date.now() } }));
    },
    reopenCall: () => {
      if (!callId) return;
      if (!DEMO) { void collabApi.reopenCall(callId); return; }
      setStore((s) => { const closed = { ...s.closed }; delete closed[callId]; return { ...s, closed }; });
    },
    /** Starts the call's project with the shortlisted people (outside the demo); resolves to its id. */
    startProject: (ids: string[], keepOpen = false) => (callId && !DEMO ? collabApi.startProject(callId, ids, keepOpen) : Promise.resolve("")),
  };
}

export type Review = ReturnType<typeof useApplicants>;

/** The backend's offer, as the Send offer form reads it. */
function termsOf(o: { role: string; fee: string; start: string; hours?: string; note?: string } | undefined): OfferTerms | undefined {
  return o ? { role: o.role, hours: o.hours || o.fee, start: o.start, note: o.note ?? "" } : undefined;
}

/** "Note state" of the Private Note: nothing typed, typed and not saved, or saved. */
export function noteState(a: Pick<Applicant, "draft" | "note">): "empty" | "draft" | "saved" {
  const d = a.draft.trim();
  if (d && d === a.note.trim()) return "saved";
  return d ? "draft" : "empty";
}

/** Counts per status. */
export function countsOf(list: Pick<Applicant, "status">[]) {
  const c = Object.fromEntries(REVIEW_STATUSES.map((s) => [s, 0])) as Record<ReviewStatus, number>;
  for (const a of list) c[a.status] += 1;
  return c;
}
