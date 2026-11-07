"use client";

import { useCollab } from "@/lib/collab/useCollab";
import { ME } from "@/lib/collab/me";
import type { Project } from "@/lib/collab/types";
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
export const nextMilestoneOf = (p: Project) => { const m = p.milestones.find((x) => !x.done); return m ? `${m.title.replace(/\.$/, "")}.` : "All milestones complete."; };
export const kindOf = (p: Project): WorkspaceKind => (p.kind === "make" || p.kind === "event" ? "art" : "research");

export function membersOf(p: Project): WorkspaceMember[] {
  return p.members.map((m) => {
    const person = PEOPLE[m.id];
    const name = person?.name ?? "A member";
    return { id: m.id, name, initials: initials(name), role: m.role, owner: m.id === p.host, you: m.id === ME, availability: person ? FROM_PRESENCE[person.presence] : "away" };
  });
}

/** Projects you can open a workspace for: the ones you host or belong to. */
export const isMine = (p: Project) => p.host === ME || p.members.some((m) => m.id === ME);

export function useWorkspace(id: string) {
  const collab = useCollab();
  const project = collab.projects.find((p) => p.id === id);
  if (!project) return { ready: collab.ready, project: undefined, collab } as const;
  return {
    ready: collab.ready,
    collab,
    project,
    phase: phaseOf(project),
    pulse: pulseOf(project),
    nextMilestone: nextMilestoneOf(project),
    kind: kindOf(project),
    members: membersOf(project),
    href: (page: WorkspacePage = "overview") => workspaceHref(project.id, page),
    mine: collab.projects.filter(isMine),
  } as const;
}
