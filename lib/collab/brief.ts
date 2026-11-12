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
 * The demo keeps them in the browser, seeded for the design's two sample projects.
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
/** The briefs of the design's two sample projects (Career Guidance for Everyone's is the design's brief, word for word). */
function seed(): Record<string, BriefDoc> {
  const now = Date.now();
  return {
    "career-guidance-for-everyone": {
      version: 3, updatedAt: now - 2 * DAY, updatedBy: "adaeze",
      parts: {
        problem: "Many students choose subjects and careers with little guidance. Advice depends on who they happen to know and rarely reflects the jobs that exist in Nigeria today.",
        users: "Secondary school students aged 14 to 18, and the teachers and parents who support their decisions.",
        outcome: "A guidance platform students can use on their own phones, with clear next steps for every path they explore.",
        scope: "Includes career exploration, a short interest check and a personal shortlist. Excludes university admissions and job listings for now.",
        risks: "Reaching students with limited data access. Keeping career information accurate. Finding schools willing to pilot.",
        resources: "A researcher to validate career information, a school partner for the pilot and hosting for the first release.",
        success: "At least 200 students complete the interest check, and most say they know their next step.",
      },
      // The design counts one change waiting, acknowledged by two of four (its words are not shown).
      changes: [{ id: "bc-career-1", part: "scope", text: "Add the interest check to the first student experience, before the shortlist.", by: "adaeze", at: now - 2 * DAY, acknowledged: ["adaeze", "tobi"] }],
    },
    "adire-stories": {
      version: 1, updatedAt: new Date(2026, 9, 8, 12).getTime(), updatedBy: "kemi",
      parts: {
        users: "Young Nigerians who love cloth.",
        scope: "A printed zine and a small exhibition.",
        success: "Twelve plates and every dyer credited.",
      },
      changes: [],
    },
  };
}

/** Preview only: the design's brief words for the parts we otherwise read from the project (purpose, team, milestones). */
const SAMPLE_FIXED: Record<string, Partial<Record<BriefPartKey, string>>> = {
  "career-guidance-for-everyone": {
    purpose: "Help Nigerian students make informed career decisions by connecting what they enjoy with the paths open to them.",
    team: "Kemi Adeyemi (owner), Adaeze Okoye (product design), Tobi Adeyemi (engineering) and Ngozi Eze (research).",
    milestones: "Project brief approved. First student experience. Prototype review. Pilot with two schools. Launch to students.",
  },
  "adire-stories": {
    purpose: "A shared illustration series that celebrates adire textile patterns and the people who make them.",
  },
};

const KEY = "ak:collab-briefs:v2";
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
      ...(DEMO ? SAMPLE_FIXED[project.id] : undefined),
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
