"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/collab/types";
import { useCollab } from "@/lib/collab/useCollab";
import { useDecisions } from "@/lib/collab/decisions";
import { decisionHref } from "@/lib/collab/conversations";
import { dayMonth, dueLabel, shortDate, useTasks, type Priority, type TaskStatus } from "@/lib/collab/tasks";
import { isMine, workspaceHref } from "@/lib/collab/workspace";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * What the overview lists read across all the member's projects: the decisions waiting for their
 * acknowledgement and the open tasks due in the next seven days. The decisions and tasks are per-project hooks,
 * so each project gets a small probe that reports up (as my-projects/summary.tsx does for My Projects).
 */

export type AwaitingDecision = { id: string; title: string; askedBy: string; project: string; proposed: string; deadline?: string; at: number; href: string };
export type DueTask = { id: string; title: string; project: string; priority: Priority; owner: PersonId; status: TaskStatus; due: string; dueAt: number; href: string };
type Report = { decisions: AwaitingDecision[]; tasks: DueTask[] };

const DAY = 86_400_000;

function Probe({ p, onChange }: { p: Project; onChange: (id: string, r: Report) => void }) {
  const collab = useCollab();
  const decisions = useDecisions(p.id);
  const tasks = useTasks(p, collab);
  const sent = useRef("");
  const today = new Date(new Date().toDateString()).getTime();
  const report: Report = {
    decisions: decisions.awaitingMe.map((d) => ({
      id: d.id, title: d.title, askedBy: PEOPLE[d.proposedBy]?.name ?? "A teammate", project: p.title,
      proposed: `Proposed ${dayMonth(d.proposedAt)}`, deadline: d.decideBy ? `Decide by ${shortDate(d.decideBy)}` : undefined, at: d.proposedAt, href: decisionHref(p.id, d),
    })),
    // The design's rows open the Tasks list of their project.
    tasks: tasks.items.filter((t) => t.status !== "Completed" && t.dueAt !== undefined && t.dueAt >= today && t.dueAt < today + 7 * DAY).map((t) => ({
      id: `${p.id}/${t.id}`, title: t.title, project: p.title, priority: t.priority, owner: t.owner, status: t.status, due: dueLabel(t), dueAt: t.dueAt!, href: workspaceHref(p.id, "tasks"),
    })),
  };
  const json = decisions.ready ? JSON.stringify(report) : "";
  useEffect(() => {
    if (!json || sent.current === json) return;
    sent.current = json;
    onChange(p.id, JSON.parse(json) as Report);
  }, [json, onChange, p.id]);
  return null;
}

/** The member's awaiting decisions and this week's tasks, with the probes that read them (render `probes`). */
export function useOverview() {
  const collab = useCollab();
  const [reports, setReports] = useState<Record<string, Report>>({});
  const onChange = useCallback((id: string, r: Report) => setReports((cur) => ({ ...cur, [id]: r })), []);
  const mine = collab.projects.filter(isMine);
  const got = mine.map((p) => reports[p.id]).filter((r): r is Report => !!r);
  return {
    ready: collab.ready && got.length === mine.length,
    probes: <>{mine.map((p) => <Probe key={p.id} p={p} onChange={onChange} />)}</>,
    decisions: got.flatMap((r) => r.decisions).sort((a, b) => a.at - b.at),
    tasks: got.flatMap((r) => r.tasks).sort((a, b) => a.dueAt - b.dueAt),
  };
}
