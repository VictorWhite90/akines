"use client";

import { useCallback, useMemo } from "react";
import { aliasOf, mutate, realId, teamwork, tempId, useResource, type ApiBrief, type ApiBriefChange } from "@/lib/api/teamwork";
import { DEMO } from "@/lib/demo/mode";
import { newId, useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { CollabCall, Project } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { milestonesOf } from "@/lib/collab/workspace";

/*
 * A project's shared brief, as the product design shows it (pages.css, cw-parts): ten numbered parts, a version,
 * and changes members suggest that the team acknowledges. Our Project holds a summary, a team and milestones, so
 * those parts are read from it live; the rest (problem, users, outcome, scope, risks, resources, success) has no
 * home in our model and is its own resource (lib/api/teamwork.ts, /api/v1/teamwork/projects/:id/…):
 *   GET    brief                      → { version, updated_at, updated_by, parts, changes (open), agreed }
 *   PUT    brief                      ← { parts }  (the host writes parts: a new version)
 *   POST   brief/changes              ← { part, text }  (suggest a change; the author counts as acknowledging it)
 *   POST   brief/changes/:id/ack      (acknowledge; once everyone has, it's agreed and the brief is a new version)
 *   DELETE brief/changes/:id          (take it back, the toast's Undo)
 * The demo keeps them in the browser, seeded for our sample projects.
 */

export type BriefPartKey = "purpose" | "problem" | "users" | "outcome" | "scope" | "team" | "milestones" | "risks" | "resources" | "success";
export const BRIEF_PARTS: { key: BriefPartKey; title: string; heading: string }[] = [
  { key: "purpose", title: "PROJECT PURPOSE", heading: "Project purpose" },
  { key: "problem", title: "PROBLEM", heading: "Problem" },
  { key: "users", title: "INTENDED USERS", heading: "Intended users" },
  { key: "outcome", title: "EXPECTED OUTCOME", heading: "Expected outcome" },
  { key: "scope", title: "SCOPE", heading: "Scope" },
  { key: "team", title: "TEAM", heading: "Team" },
  { key: "milestones", title: "MILESTONES", heading: "Milestones" },
  { key: "risks", title: "RISKS", heading: "Risks" },
  { key: "resources", title: "REQUIRED RESOURCES", heading: "Required resources" },
  { key: "success", title: "DEFINITION OF SUCCESS", heading: "Definition of success" },
];

export type BriefChange = { id: string; part: BriefPartKey; text: string; by: PersonId; at: number; acknowledged: PersonId[] };
export type BriefDoc = {
  version: number;
  updatedAt: number;
  updatedBy: PersonId;
  /** Parts our Project doesn't hold. */
  parts: Partial<Record<Exclude<BriefPartKey, "team" | "milestones">, string>>;
  changes: BriefChange[];
};

const DAY = 24 * 60 * 60 * 1000;
function seed(): Record<string, BriefDoc> {
  const now = Date.now();
  return {
    "garki-clinic-booking": {
      version: 3, updatedAt: now - 2 * DAY, updatedBy: "kwame",
      parts: {
        problem: "Patients at Garki Family Clinic queue for up to three hours because there is no way to book a time. Reception keeps the day's list on paper.",
        users: "Patients of Garki Family Clinic, many on basic Android phones, and the front desk team who run each day's list.",
        outcome: "Patients book a time from their phone and get a reminder the day before; the front desk sees the day's bookings on one screen.",
        scope: "Includes booking, cancelling, SMS reminders in English and Hausa and a front desk screen. Excludes payments and medical records for now.",
        risks: "Patients without data or a smartphone. SMS costs growing faster than bookings. Staff time to learn the new screen.",
        resources: "SMS credits for the first 2,000 reminders, hosting for the first release and a nurse to check the Hausa messages.",
        success: "Half of the clinic's appointments are booked online within a month, and the average wait drops below 45 minutes.",
      },
      changes: [{ id: "bc-garki-1", part: "scope", text: "Add Hausa versions of the help text to the scope, not only the reminders.", by: "leila", at: now - DAY, acknowledged: ["leila", "chidi"] }],
    },
    "market-light": {
      version: 2, updatedAt: now - 5 * DAY, updatedBy: "efua",
      parts: {
        problem: "Wuse Market's traders are photographed all the time but rarely asked what they think. Their stories stay at the stall.",
        users: "The traders themselves and their families first, then people in Abuja who shop at the market and want to know who they buy from.",
        outcome: "A small photo book of 24 traders, each with a portrait and a few lines in their own words, launched at the market.",
        scope: "Includes portraits, interviews, captions and a 24-page layout. Excludes a website or selling the book for now.",
        risks: "Traders changing their minds about their words. Printing costs going up. Launch day clashing with a busy market day.",
        resources: "A printer for 200 copies, transport to the market and a quiet corner to record interviews.",
        success: "Every trader approves their page and gets copies, and the first 200 copies are given out at the launch.",
      },
      changes: [],
    },
  };
}

const KEY = "ak:collab-briefs:v1";
const first = (id: PersonId) => PEOPLE[id]?.name.split(" ")[0] ?? "A member";
const name = (id: PersonId) => PEOPLE[id]?.name ?? "A member";
const sentence = (s: string) => { const t = s.trim(); return /[.!?]$/.test(t) ? t : `${t}.`; };
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** A brief part as shown: its number in the list, its title and what it says. */
export type BriefPart = { key: BriefPartKey; number: string; title: string; heading: string; body: string };

/**
 * A project's brief. Purpose, team and milestones are read from the project; the other parts come from the brief
 * resource, or from the open call the project began as. Parts nobody has written yet are left out.
 */
function useLocalBrief(project: Project | undefined, summary: string, call?: CollabCall) {
  const [all, setAll, ready] = useLocal<Record<string, BriefDoc>>(KEY, seed());
  const pid = project?.id ?? "";
  const blank = useCallback((): BriefDoc => ({ version: 1, updatedAt: project?.createdAt ?? 0, updatedBy: project?.host ?? ME, parts: {}, changes: [] }), [project?.createdAt, project?.host]);
  const doc = useMemo(() => all[pid] ?? blank(), [all, pid, blank]);
  const put = useCallback((fn: (d: BriefDoc) => BriefDoc) => setAll((cur) => ({ ...cur, [pid]: fn(structuredClone(cur[pid] ?? blank())) })), [pid, blank, setAll]);
  const actions = {
    /** Sends a suggestion to the team; the member counts as having acknowledged their own. Returns its id. */
    suggest: (part: BriefPartKey, text: string) => {
      const id = newId("bc");
      put((d) => ({ ...d, changes: [...d.changes, { id, part, text: text.trim(), by: ME, at: Date.now(), acknowledged: [ME] }] }));
      return id;
    },
    withdraw: (id: string) => put((d) => ({ ...d, changes: d.changes.filter((c) => c.id !== id) })),
    acknowledge: (id: string) => put((d) => ({ ...d, changes: d.changes.map((c) => (c.id === id && !c.acknowledged.includes(ME) ? { ...c, acknowledged: [...c.acknowledged, ME] } : c)) })),
  };
  return useBriefView(project, summary, call, doc, ready, actions);
}

// ── On the backend ──────────────────────────────────────────────────────────────────────────

const PART_KEYS = new Set<string>(BRIEF_PARTS.map((p) => p.key));
const person = (id: string | null) => (id ?? "akines") as PersonId;
const changeFromApi = (c: ApiBriefChange): BriefChange => ({
  id: c.id, part: (PART_KEYS.has(c.part) ? c.part : "scope") as BriefPartKey, text: c.text, by: person(c.by), at: Date.parse(c.at),
  acknowledged: c.acknowledged.filter((x): x is string => !!x) as PersonId[],
});
const briefFromApi = (b: ApiBrief): BriefDoc => ({
  version: b.version, updatedAt: Date.parse(b.updated_at), updatedBy: person(b.updated_by), parts: b.parts as BriefDoc["parts"], changes: b.changes.map(changeFromApi),
});

function useRemoteBrief(project: Project | undefined, summary: string, call?: CollabCall) {
  const pid = project?.id ?? "";
  const key = pid ? `tw:brief:${pid}` : null;
  const loaded = useResource<BriefDoc>(key, async () => { const b = await teamwork.brief(pid); return b && briefFromApi(b); });
  const doc = useMemo<BriefDoc>(() => loaded ?? { version: 1, updatedAt: project?.createdAt ?? 0, updatedBy: project?.host ?? ME, parts: {}, changes: [] }, [loaded, project?.createdAt, project?.host]);
  const set = (b: ApiBrief | undefined) => { if (b && key) mutate<BriefDoc>(key, () => briefFromApi(b)); };
  const change = (fn: (d: BriefDoc) => BriefDoc) => { if (key) mutate<BriefDoc>(key, (cur) => fn(cur ?? doc)); };
  const actions = {
    suggest: (part: BriefPartKey, text: string) => {
      const sent = teamwork.suggestBrief(pid, part, text.trim());
      // The new suggestion is the newest open one by me.
      const id = tempId("bc", sent.then((b) => { set(b); return b?.changes.filter((c) => c.by === ME).at(-1)?.id; }));
      change((d) => ({ ...d, changes: [...d.changes, { id, part, text: text.trim(), by: ME, at: Date.now(), acknowledged: [ME] }] }));
      return id;
    },
    withdraw: (id: string) => {
      change((d) => ({ ...d, changes: d.changes.filter((c) => c.id !== id && c.id !== aliasOf(id)) }));
      void realId(id).then((real) => { if (real) void teamwork.withdrawBrief(pid, real).then(set); });
    },
    acknowledge: (id: string) => {
      change((d) => ({ ...d, changes: d.changes.map((c) => (c.id === id && !c.acknowledged.includes(ME) ? { ...c, acknowledged: [...c.acknowledged, ME] } : c)) }));
      void realId(id).then((real) => { if (real) void teamwork.acknowledgeBrief(pid, real).then(set); });
    },
    /** The host writes parts of the brief (a new version). */
    edit: (parts: Partial<BriefDoc["parts"]>) => void teamwork.editBrief(pid, parts as Record<string, string>).then(set),
  };
  return useBriefView(project, summary, call, doc, loaded !== undefined, actions);
}

export const useBrief: typeof useLocalBrief = DEMO ? useLocalBrief : useRemoteBrief;

type BriefActions = { suggest: (part: BriefPartKey, text: string) => string; withdraw: (id: string) => void; acknowledge: (id: string) => void };

/** What the screens read from a brief, the same in the demo and on the backend. */
function useBriefView(project: Project | undefined, summary: string, call: CollabCall | undefined, doc: BriefDoc, ready: boolean, actions: BriefActions) {

  const parts = useMemo<BriefPart[]>(() => {
    if (!project) return [];
    const ms = milestonesOf(project);
    const body: Partial<Record<BriefPartKey, string>> = {
      ...doc.parts,
      purpose: sentence(summary),
      problem: doc.parts.problem ?? (call?.about && call.about !== call.summary ? call.about : undefined),
      resources: doc.parts.resources ?? (call?.roles.length ? sentence(list(call.roles)) : undefined),
      team: project.members.length ? sentence(list(project.members.map((m) => `${name(m.id)} (${m.id === project.host ? "owner" : m.role.toLowerCase()})`))) : undefined,
      milestones: ms.length ? ms.map((m) => sentence(m.title)).join(" ") : undefined,
    };
    return BRIEF_PARTS.filter((p) => body[p.key]?.trim()).map((p, i) => ({ ...p, number: String(i + 1).padStart(2, "0"), body: body[p.key]! }));
  }, [project, doc.parts, summary, call]);

  const team = project?.members.length ?? 0;
  const pending = doc.changes.filter((c) => c.acknowledged.length < team);

  return {
    ready,
    parts,
    version: doc.version,
    /** "Updated 2 days ago by Kwame Asante" */
    updated: `Updated ${ago(doc.updatedAt)} by ${name(doc.updatedBy)}`,
    pending,
    team,
    ...actions,
    firstName: first,
  };
}

/** "2 days ago", "yesterday", "3 hours ago". */
export function ago(at: number, now = Date.now()) {
  const m = Math.max(0, Math.round((now - at) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return m === 1 ? "1 minute ago" : `${m} minutes ago`;
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? "1 hour ago" : `${h} hours ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "yesterday";
  if (d < 14) return `${d} days ago`;
  const w = Math.round(d / 7);
  return w < 9 ? `${w} weeks ago` : `${Math.round(d / 30)} months ago`;
}
