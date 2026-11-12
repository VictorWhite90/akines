"use client";

import { useCollab } from "@/lib/collab/useCollab";
import { useLocal } from "@/lib/useLocal";
import { DEMO } from "@/lib/demo/mode";
import { ME } from "@/lib/collab/me";
import type { Milestone, Project } from "@/lib/collab/types";
import { PEOPLE, type PersonId, type Presence } from "@/lib/data/people";

/*
 * A project's workspace as the design shows it (components/collaborate/workspace), read from our own project:
 * the phase pill, team pulse and next milestone in the project bar, the eight pages of the left menu, and each
 * member's availability. Everything here is derived from the Project in useCollab, so it follows the backend.
 */

export type WorkspacePage = "overview" | "tasks" | "workspace" | "conversations" | "files" | "decisions" | "team" | "agreements";
export const WORKSPACE_PAGES: { key: WorkspacePage; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "workspace", label: "Workspace" },
  { key: "conversations", label: "Conversations" },
  { key: "files", label: "Files" },
  { key: "decisions", label: "Decisions" },
  { key: "team", label: "Team" },
  { key: "agreements", label: "Agreements" },
];

/** The design's two kinds of shared workspace: a drawing canvas, or a document. */
export type WorkspaceKind = "art" | "research";
export const WORKSPACE_KIND_LABEL: Record<WorkspaceKind, string> = { art: "Digital Art Workspace", research: "Research Workspace" };

export type Availability = "available" | "working" | "away";
export const AVAILABILITY_TEXT: Record<Availability, string> = { available: "Available for review", working: "Working on a milestone", away: "Away" };
/** The dot colour the design gives each availability. */
export const AVAILABILITY_TONE: Record<Availability, "green" | "accent" | "gray"> = { available: "green", working: "accent", away: "gray" };
export const AVAILABILITY_WORD: Record<Availability, string> = { available: "Available", working: "Working", away: "Away" };
const FROM_PRESENCE: Record<Presence, Availability> = { open: "available", studio: "working", room: "working", quiet: "away" };

export type WorkspaceMember = { id: PersonId; name: string; initials: string; role: string; owner: boolean; you: boolean; availability: Availability };

export const workspaceHref = (id: string, page: WorkspacePage = "overview") => (page === "overview" ? `/collaborate/my-projects/${id}` : `/collaborate/my-projects/${id}/${page}`);
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

/** Planning until the terms are agreed (Discover, Imagine, Agree), then Building. */
export const phaseOf = (p: Project) => (p.stage <= 2 ? "PLANNING" : "BUILDING");
/** Strong while nobody's latest check-in says they are stuck; steady otherwise. */
export function pulseOf(p: Project) {
  const latest = new Map<PersonId, NonNullable<Project["checkins"]>[number]>();
  for (const c of p.checkins ?? []) if (!latest.has(c.who) || latest.get(c.who)!.at < c.at) latest.set(c.who, c);
  return [...latest.values()].some((c) => c.stuck) ? "Steady alignment" : "Strong alignment";
}
/**
 * A project's milestones. Build, study and teach projects track their work as deliverables and keep no
 * milestones, so each deliverable stands as one (done once approved).
 */
export const milestonesOf = (p: Project): Milestone[] => (p.milestones.length ? p.milestones : (p.deliverables ?? []).map((d) => ({ id: d.id, title: d.title, due: d.due, done: d.status === "approved" })));
export const nextMilestoneOf = (p: Project) => { const m = milestonesOf(p).find((x) => !x.done); return m ? `${(m.label ?? m.title).replace(/\.$/, "")}.` : "All milestones complete."; };
export const kindOf = (p: Project): WorkspaceKind => (p.kind === "make" || p.kind === "event" ? "art" : "research");

/** Preview only: what the members of the design's sample projects share (Kemi is working on a milestone, Ngozi is away). */
const SAMPLE_AVAILABILITY: Record<string, Partial<Record<PersonId, Availability>>> = {
  "career-guidance-for-everyone": { kemi: "working", adaeze: "available", tobi: "working", ngozi: "away" },
  "adire-stories": { kemi: "working", "amara-obi": "available", "ayo-bello": "working", "yusuf-danjuma": "away" },
};

/*
 * Preview only: what the design's Overview shows for its two sample projects that our record can't tell yet: this
 * week's updates (Monday to Sunday, today is Thursday), the brief at a glance and the two rows to continue with.
 * `to` is under the project's own address.
 */
export type SampleOverview = {
  /** The design's one-line lead under the overview title (shorter than the project's description). */
  lead: string;
  week: { bars: number[]; total: number; today: number };
  glance: { label: string; value: string }[];
  work: { title: string; status: string; to: string }[];
};
const glanceOf = (audience: string, goal: string, scope: string) => [{ label: "AUDIENCE", value: audience }, { label: "GOAL", value: goal }, { label: "SCOPE", value: scope }];
const SAMPLE_OVERVIEW: Record<string, SampleOverview> = {
  "career-guidance-for-everyone": {
    lead: "Helping Nigerian students make informed career decisions.",
    week: { bars: [3, 5, 4, 6, 0, 0, 0], total: 18, today: 3 },
    glance: glanceOf("Students aged 14 to 18", "200 complete the interest check", "Exploration and a personal shortlist"),
    work: [
      { title: "Review the student onboarding draft", status: "Needs your review", to: "files/student-onboarding-draft-pdf" },
      { title: "Respond to the research findings", status: "Waiting for your reply", to: "conversations" },
    ],
  },
  "adire-stories": {
    lead: "A shared illustration series celebrating adire patterns.",
    week: { bars: [3, 5, 4, 6, 0, 0, 0], total: 14, today: 3 },
    glance: glanceOf("Young Nigerians who love cloth", "Twelve plates and every dyer credited", "A printed zine and a small exhibition"),
    work: [
      { title: "Review the headwrap colour layer", status: "Needs your review", to: "files" },
      { title: "Respond to the pattern history notes", status: "Waiting for your reply", to: "conversations" },
    ],
  },
};
export const sampleOverview = (projectId: string): SampleOverview | undefined => (DEMO ? SAMPLE_OVERVIEW[projectId] : undefined);

/** Preview only: a milestone page's description and completion criteria, as the design writes them (milestone ids). */
export type SampleMilestone = { description: string; criteria: { title: string; caption: string; status: "Completed" | "In progress" | "Next" }[] };
const SAMPLE_MILESTONES: Record<string, Record<string, SampleMilestone>> = {
  "career-guidance-for-everyone": {
    "first-student-experience": {
      description: "Define the first version of the student-facing product experience.",
      criteria: [
        { title: "The first five screens are drafted", caption: "Reviewed by Adaeze", status: "Completed" },
        { title: "The onboarding flow is agreed", caption: "One decision is waiting for the team", status: "In progress" },
        { title: "Five students try the draft", caption: "After the prototype review", status: "Next" },
      ],
    },
    "prototype-review": {
      description: "Test the first prototype with five students and record what we learn.",
      criteria: [
        { title: "Five students are chosen", caption: "Two schools, ages 14 to 18", status: "Next" },
        { title: "The prototype works on a basic phone", caption: "Tested by Tobi before the sessions", status: "Next" },
        { title: "Findings are written up", caption: "Shared with the whole team", status: "Next" },
      ],
    },
  },
};
export const sampleMilestone = (projectId: string, id: string): SampleMilestone | undefined => (DEMO ? SAMPLE_MILESTONES[projectId]?.[id] : undefined);

export function membersOf(p: Project): WorkspaceMember[] {
  return p.members.map((m) => {
    const person = PEOPLE[m.id];
    const name = person?.name ?? "A member";
    const shared = DEMO ? SAMPLE_AVAILABILITY[p.id]?.[m.id] : undefined;
    return { id: m.id, name, initials: initials(name), role: m.role, owner: m.id === p.host, you: m.id === ME, availability: shared ?? (person ? FROM_PRESENCE[person.presence] : "away") };
  });
}

/** Projects you can open a workspace for: the ones you host or belong to. */
export const isMine = (p: Project) => p.host === ME || p.members.some((m) => m.id === ME);

export function useWorkspace(id: string) {
  const collab = useCollab();
  const project = collab.projects.find((p) => p.id === id);
  const { settings } = useProjectSettings(id);
  if (!project) return { ready: collab.ready, project: undefined, collab } as const;
  return {
    /** The name and summary, as edited in the project settings. */
    title: settings.name || project.title,
    summary: settings.summary || project.summary,
    ready: collab.ready,
    collab,
    project,
    phase: phaseOf(project),
    pulse: pulseOf(project),
    nextMilestone: nextMilestoneOf(project),
    milestones: milestonesOf(project),
    kind: kindOf(project),
    members: membersOf(project),
    href: (page: WorkspacePage = "overview") => workspaceHref(project.id, page),
    mine: collab.projects.filter(isMine),
  } as const;
}

/*
 * What the project bar's settings change that our Project can't hold yet: edited details (name, summary, what the
 * team needs), whether it is open to new collaborators, the member's notification preferences and which project
 * notifications they have read. Shaped like PATCH /collab/projects/:id and /collab/projects/:id/me.
 */
export type NotifyPrefs = { review: boolean; decisions: boolean; conversations: boolean; milestones: boolean };
export type ProjectSettings = { name?: string; summary?: string; needs?: string; open?: boolean; prefs?: NotifyPrefs; read?: string[] };
export const DEFAULT_PREFS: NotifyPrefs = { review: true, decisions: true, conversations: true, milestones: false };

export function useProjectSettings(id: string) {
  const [all, setAll] = useLocal<Record<string, ProjectSettings>>("ak:collab-project-settings:v1", {});
  const s = all[id] ?? {};
  const put = (next: ProjectSettings | ((cur: ProjectSettings) => ProjectSettings)) => setAll((cur) => ({ ...cur, [id]: typeof next === "function" ? next(cur[id] ?? {}) : { ...cur[id], ...next } }));
  return { settings: s, prefs: s.prefs ?? DEFAULT_PREFS, read: s.read ?? [], open: s.open ?? true, put };
}
