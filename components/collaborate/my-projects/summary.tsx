"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/collab/types";
import { ME } from "@/lib/collab/me";
import { useCollab } from "@/lib/collab/useCollab";
import { useDecisions } from "@/lib/collab/decisions";
import { decisionHref, threadHref, useThreads } from "@/lib/collab/conversations";
import { useTasks } from "@/lib/collab/tasks";
import { milestonesOf, phaseOf, workspaceHref } from "@/lib/collab/workspace";
import { PEOPLE } from "@/lib/data/people";

/*
 * What My Projects and Collaborate Home say about each of the member's projects, read from the project and from
 * the workspace modules (tasks, decisions, conversations). Those are per-project hooks, so each project gets a
 * small probe that reports its summary up; the pages render from the summaries.
 */

export type ProjectSummary = {
  id: string;
  /** The member's next step: their own open work first, then the team's. */
  next?: string;
  /** Decisions waiting for the member's acknowledgement. */
  decisions: { title: string; projectTitle: string; at: number; href: string }[];
  /** The member's open work due in the next seven days. */
  dueThisWeek: number;
  /** The last thing a teammate said in each conversation. */
  messages: { key: string; projectTitle: string; sender: string; text: string; at?: number; clock?: string; unread: boolean; href: string }[];
  /** The most recent thing that happened in the project. */
  lastAt: number;
};

const DAY = 86_400_000;
const sentence = (t: string) => (/[.!?]$/.test(t.trim()) ? t.trim() : `${t.trim()}.`);

function Probe({ p, onChange }: { p: Project; onChange: (s: ProjectSummary) => void }) {
  const collab = useCollab();
  const decisions = useDecisions(p.id);
  const threads = useThreads(p);
  const tasks = useTasks(p, collab);
  const sent = useRef("");

  const open = tasks.items.filter((t) => t.status !== "Completed");
  const mineOpen = open.filter((t) => t.owner === ME);
  const today = new Date(new Date().toDateString()).getTime();
  // The next piece of work, unless it is the milestone the card already names: then its first open step.
  const milestone = milestonesOf(p).find((m) => !m.done)?.title.trim().replace(/\.$/, "");
  const sameAsMilestone = (t: { title: string }) => t.title.trim().replace(/\.$/, "") === milestone;
  const work = mineOpen.find((t) => !sameAsMilestone(t)) ?? open.find((t) => !sameAsMilestone(t));
  const step = open.find(sameAsMilestone)?.criteria.find((c) => !c.done);
  const nextUp = p.members.some((m) => m.id === ME) && !p.charter.signed.includes(ME) && p.stage <= 2 ? "Agree the project terms."
    : work ? sentence(work.title) : step ? sentence(step.title) : undefined;
  const summary: ProjectSummary = {
    id: p.id,
    next: nextUp,
    decisions: decisions.awaitingMe.map((d) => ({ title: d.title, projectTitle: p.title, at: d.proposedAt, href: decisionHref(p.id, d) })),
    dueThisWeek: mineOpen.filter((t) => t.dueAt !== undefined && t.dueAt >= today && t.dueAt < today + 7 * DAY).length,
    messages: threads.threads.flatMap((t) => {
      const last = [...t.messages].reverse().find((m) => m.by !== ME);
      if (!last) return [];
      return [{ key: `${p.id}/${t.id}`, projectTitle: p.title, sender: PEOPLE[last.by]?.name ?? "A teammate", text: last.text, at: last.at, clock: last.clock, unread: threads.unread(t), href: threadHref(p.id, t.id) }];
    }),
    lastAt: Math.max(p.createdAt, ...p.ledger.map((l) => l.at), ...(p.checkins ?? []).map((c) => c.at), ...threads.threads.map((t) => t.lastAt)),
  };
  const json = JSON.stringify(summary);
  useEffect(() => {
    if (sent.current === json) return;
    sent.current = json;
    onChange(JSON.parse(json) as ProjectSummary);
  }, [json, onChange]);
  return null;
}

/** Renders nothing: keeps `onChange` told about each project's summary. */
export function ProjectProbes({ projects, onChange }: { projects: Project[]; onChange: (s: ProjectSummary) => void }) {
  return <>{projects.map((p) => <Probe key={p.id} p={p} onChange={onChange} />)}</>;
}

/** Progress in the design's five bars: how many are filled, in proportion to the milestones done. */
export function progressOf(p: Project) {
  const ms = milestonesOf(p);
  const done = ms.filter((m) => m.done).length;
  return { done, total: ms.length, bars: ms.length ? Math.round((done / ms.length) * 5) : 0, label: `${done} of ${ms.length} ${ms.length === 1 ? "milestone" : "milestones"}` };
}

/** The current milestone, as the cards word it. */
export function currentMilestone(p: Project) {
  const m = milestonesOf(p).find((x) => !x.done);
  return m ? sentence(m.label ?? m.title) : "All milestones complete.";
}

/** "2 hours ago", "yesterday": for "Active …". */
export function activeAgo(at: number) {
  const m = Math.round((Date.now() - at) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} ${m === 1 ? "minute" : "minutes"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "yesterday";
  if (d < 14) return `${d} days ago`;
  return `${Math.round(d / 7)} weeks ago`;
}

export const cardHref = (p: Project) => workspaceHref(p.id);
export const ctaOf = (p: Project) => (phaseOf(p) === "PLANNING" ? "Continue planning" : "Continue working");
