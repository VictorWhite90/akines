"use client";

import { useCallback, useMemo } from "react";
import { useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { useCollab } from "@/lib/collab/useCollab";
import type { Deliverable, Milestone, Project, Task } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { milestonesOf } from "@/lib/collab/workspace";

/*
 * A project's tasks as the product design shows them (tasks.css, tk-): one list with a status, a priority, a
 * milestone, a responsible person and, on its page, completion criteria, files and comments.
 * Our Project keeps two kinds of work, and both are tasks here:
 *   - Project.tasks (title, who, due, todo/doing/done), and
 *   - Project.deliverables, which already carry review: steps are the completion criteria, proof is the files,
 *     the thread is the comments, and the approver is who reviews it.
 * What neither has (a priority, the milestone a task belongs to, a description, a supporting person, review on a
 * plain task) is kept as task details, shaped like the resource it will become:
 *   PATCH /collab/projects/:id/tasks/:taskId  ← { priority, milestone, description, support, review }
 * Status changes, criteria and comments go through useCollab, so they reach the backend.
 */

export type TaskStatus = "Not started" | "In progress" | "In review" | "Completed";
export const TASK_STATUSES: TaskStatus[] = ["Not started", "In progress", "In review", "Completed"];
export type Priority = "High" | "Medium" | "Low";
export const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

export type TaskDetails = {
  priority?: Priority;
  /** A milestone id. */
  milestone?: string;
  description?: string;
  support?: PersonId;
  /** A plain task sent for review (deliverables have their own review). */
  review?: boolean;
  reviewer?: PersonId;
  criteria?: { id: string; title: string; done: boolean }[];
  comments?: { by: PersonId; text: string; at: number }[];
};

export type WorkItem = {
  id: string;
  slug: string;
  kind: "task" | "deliverable";
  title: string;
  owner: PersonId;
  support?: PersonId;
  reviewer?: PersonId;
  status: TaskStatus;
  priority: Priority;
  milestone?: Milestone;
  description?: string;
  /** As entered ("Fri 8 Nov", "Week 4"), and as a date when it reads as one. */
  dueText: string;
  dueAt?: number;
  doneAt?: number;
  criteria: { id: string; title: string; done: boolean }[];
  files: { id: string; name: string; meta: string; href?: string }[];
  comments: { by: PersonId; text: string; at: number }[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Sat 2 Nov", "2 Nov" or "2 November" → that day this year (or next, for a month long past). */
export function parseDue(text: string): number | undefined {
  const m = /(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]{3,})/.exec(text);
  if (!m) return undefined;
  const month = MONTHS.findIndex((x) => m[2].toLowerCase().startsWith(x.toLowerCase()));
  if (month < 0) return undefined;
  const now = new Date();
  const year = month < now.getMonth() - 6 ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, month, Number(m[1])).getTime();
}
export const shortDate = (at: number) => { const d = new Date(at); return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const dayMonth = (at: number) => { const d = new Date(at); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
export const longDate = (at: number) => { const d = new Date(at); return `${DAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`; };
/** A due that already names its weekday ("Fri 8 Nov") is kept as written: the seed's weekdays aren't this year's. */
const NAMED = /^([A-Za-z]{3})\s+(\d{1,2})\s+([A-Za-z]{3,})/;
/** The due column: "Fri 6 Nov", or "Done 3 Nov" once completed. */
export const dueLabel = (t: WorkItem) => (t.status === "Completed" ? (t.doneAt ? `Done ${dayMonth(t.doneAt)}` : "Done") : NAMED.test(t.dueText) ? t.dueText : t.dueAt ? shortDate(t.dueAt) : t.dueText);
/** The due date in full: "Tuesday 10 November". */
export function dueLong(t: WorkItem) {
  const m = NAMED.exec(t.dueText);
  if (m) {
    const d = DAYS.findIndex((x) => x.toLowerCase() === m[1].toLowerCase()), mo = MONTHS.findIndex((x) => m[3].toLowerCase().startsWith(x.toLowerCase()));
    if (d >= 0 && mo >= 0) return `${DAYS_LONG[d]} ${m[2]} ${MONTHS_LONG[mo]}`;
  }
  return t.dueAt ? longDate(t.dueAt) : t.dueText;
}

export const slugOf = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const KB = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
const first = (id: PersonId) => PEOPLE[id]?.name ?? "A member";
const FILE_KIND: Record<string, string> = { pdf: "PDF", mp4: "Video", docx: "Word", doc: "Word", png: "Image", jpg: "Image" };

function fromDeliverable(d: Deliverable, extra: TaskDetails): Omit<WorkItem, "slug" | "milestone" | "priority"> {
  const status: TaskStatus = d.status === "todo" ? "Not started" : d.status === "review" ? "In review" : d.status === "approved" ? "Completed" : "In progress";
  return {
    id: d.id, kind: "deliverable", title: d.title, owner: d.owner, support: extra.support, reviewer: d.approver, status, description: extra.description,
    dueText: d.due, dueAt: parseDue(d.due), doneAt: d.approvedAt,
    criteria: d.steps,
    files: d.proof.filter((p) => p.kind !== "note").map((p) => ({
      id: p.id, name: p.file?.name ?? p.title, href: p.url,
      meta: p.file ? `${FILE_KIND[p.file.type] ?? p.file.type.toUpperCase()}, ${KB(p.file.size)}, added by ${first(p.by)}` : p.kind === "link" ? `Link, added by ${first(p.by)}` : `Photo, added by ${first(p.by)}`,
    })),
    comments: d.thread.map((c) => ({ by: c.by, text: c.text, at: c.at })),
  };
}

function fromTask(t: Task, extra: TaskDetails, p: Project): Omit<WorkItem, "slug" | "milestone" | "priority"> {
  const status: TaskStatus = t.status === "todo" ? "Not started" : t.status === "done" ? "Completed" : extra.review ? "In review" : "In progress";
  const finished = p.ledger.find((l) => l.what === `Finished: ${t.title}`)?.at;
  return {
    id: t.id, kind: "task", title: t.title, owner: t.who, support: extra.support, reviewer: extra.reviewer, status, description: extra.description,
    dueText: t.due, dueAt: parseDue(t.due), doneAt: finished ?? (t.status === "done" ? parseDue(t.due) : undefined),
    criteria: extra.criteria ?? [], files: [], comments: extra.comments ?? [],
  };
}

/** Sample details for our two sample projects (what our model doesn't hold yet). */
const SEED: Record<string, TaskDetails> = {
  "market-light/t1": { priority: "Low", milestone: "m1" },
  "market-light/t2": { priority: "High", milestone: "m2", support: "amara", description: "Write up Mama Ngozi's interview in her own words, ready for the caption." },
  "market-light/t3": { priority: "High", milestone: "m3", support: "wanjiru", description: "Lay out all 24 pages with the selects and captions, so all three can sign it off.", criteria: [{ id: "c1", title: "Grid and type set", done: true }, { id: "c2", title: "Every trader placed", done: false }, { id: "c3", title: "Captions in", done: false }] },
  "market-light/t4": { priority: "Medium", milestone: "m3" },
  "market-light/t5": { priority: "Medium", milestone: "m4" },
  "market-light/ml-d1": { priority: "High", milestone: "m1" },
  "market-light/ml-d2": { priority: "High", milestone: "m2" },
  "market-light/ml-d3": { priority: "High", milestone: "m3", support: "efua" },
  "market-light/ml-d4": { priority: "Medium", milestone: "m4" },
  "garki-clinic-booking/gc-d1": { priority: "Low" },
  "garki-clinic-booking/gc-d2": { priority: "Low" },
  "garki-clinic-booking/gc-d3": { priority: "High", description: "The screen the front desk uses each morning: today's bookings, cancellations and who confirmed." },
  "garki-clinic-booking/gc-d6": { priority: "High", support: "amara", description: "Pick a time, confirm, and choose reminders. Each screen must work on a cheap Android phone." },
  "garki-clinic-booking/gc-d7": { priority: "Medium" },
  "garki-clinic-booking/gc-d8": { priority: "Medium", support: "amara" },
  "garki-clinic-booking/gc-d4": { priority: "High", support: "leila", description: "The day-before reminder in English and Hausa, checked by a nurse." },
  "garki-clinic-booking/gc-d9": { priority: "Medium" },
  "garki-clinic-booking/gc-d5": { priority: "High" },
};

const ORDER = (a: WorkItem, b: WorkItem) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity);
/** Open tasks by due date, then completed ones, most recent first (as the design sorts them). */
export const sortTasks = (items: WorkItem[]) => [...items.filter((t) => t.status !== "Completed").sort(ORDER), ...items.filter((t) => t.status === "Completed").sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))];

type Collab = ReturnType<typeof useCollab>;

/** A project's tasks, and what the member can do with them. */
export function useTasks(project: Project | undefined, collab: Collab) {
  const [details, setDetails] = useLocal<Record<string, TaskDetails>>("ak:collab-task-details:v1", SEED);
  const pid = project?.id ?? "";
  const keyOf = useCallback((id: string, title?: string) => (details[`${pid}/${id}`] ? `${pid}/${id}` : title && details[`${pid}/~${title}`] ? `${pid}/~${title}` : `${pid}/${id}`), [details, pid]);

  const items = useMemo<WorkItem[]>(() => {
    if (!project) return [];
    const raw = [
      ...(project.deliverables ?? []).map((d) => ({ base: fromDeliverable(d, details[keyOf(d.id, d.title)] ?? {}), extra: details[keyOf(d.id, d.title)] ?? {} })),
      ...project.tasks.map((t) => ({ base: fromTask(t, details[keyOf(t.id, t.title)] ?? {}, project), extra: details[keyOf(t.id, t.title)] ?? {} })),
    ];
    const seen = new Set<string>();
    return raw.map(({ base, extra }) => {
      let slug = slugOf(base.title) || base.id;
      if (seen.has(slug)) slug = `${slug}-${base.id}`;
      seen.add(slug);
      const ms = milestonesOf(project);
      // Without milestones of its own, a deliverable is its own milestone (see milestonesOf).
      const milestone = ms.find((m) => m.id === extra.milestone) ?? (!project.milestones.length && base.kind === "deliverable" ? ms.find((m) => m.id === base.id) : undefined);
      return { ...base, slug, priority: extra.priority ?? "Medium", milestone };
    });
  }, [project, details, keyOf]);

  const patch = useCallback((item: Pick<WorkItem, "id" | "title">, next: TaskDetails | ((d: TaskDetails) => TaskDetails)) => {
    const k = keyOf(item.id, item.title);
    setDetails((cur) => ({ ...cur, [k]: typeof next === "function" ? next(cur[k] ?? {}) : { ...cur[k], ...next } }));
  }, [keyOf, setDetails]);

  const act = collab.project;
  return {
    items: sortTasks(items),
    get: (slug: string) => items.find((t) => t.slug === slug || t.id === slug),
    patch,
    /** Moves a task to a status. Returns false when our model can't make that move for the member. */
    setStatus: (t: WorkItem, status: TaskStatus): boolean => {
      if (!project || t.status === status) return false;
      if (t.kind === "task") {
        patch(t, (d) => ({ ...d, review: status === "In review" }));
        act.moveTask(project.id, t.id, status === "Not started" ? "todo" : status === "Completed" ? "done" : "doing");
        return true;
      }
      if (status === "Not started") { if (t.status !== "In progress") return false; act.backToTodo(project.id, t.id); return true; }
      if (status === "In progress") { if (t.status !== "Not started") return false; act.startDeliverable(project.id, t.id); return true; }
      if (status === "In review") { act.submitDeliverable(project.id, t.id, ""); return true; }
      if (t.reviewer !== ME) return false;
      act.approveDeliverable(project.id, t.id, "");
      return true;
    },
    requestReview: (t: WorkItem, reviewer: PersonId, note: string) => {
      if (!project) return;
      if (t.kind === "deliverable") act.submitDeliverable(project.id, t.id, note);
      else { patch(t, (d) => ({ ...d, review: true, reviewer })); act.moveTask(project.id, t.id, "doing"); if (note) patch(t, (d) => ({ ...d, comments: [...(d.comments ?? []), { by: ME, text: note, at: Date.now() }] })); }
    },
    toggleCriterion: (t: WorkItem, id: string) => {
      if (!project) return;
      if (t.kind === "deliverable") act.toggleStep(project.id, t.id, id);
      else patch(t, (d) => ({ ...d, criteria: (d.criteria ?? []).map((c) => (c.id === id ? { ...c, done: !c.done } : c)) }));
    },
    comment: (t: WorkItem, text: string) => {
      if (!project) return;
      if (t.kind === "deliverable") act.commentDeliverable(project.id, t.id, text);
      else patch(t, (d) => ({ ...d, comments: [...(d.comments ?? []), { by: ME, text, at: Date.now() }] }));
    },
    create: (input: { title: string; who: PersonId; due: string; description?: string; milestone?: string }) => {
      if (!project) return;
      act.addTask(project.id, { title: input.title, who: input.who, due: input.due });
      // The new task's id is made by the store, so its details are filed under its title until it has one.
      setDetails((cur) => ({ ...cur, [`${project.id}/~${input.title}`]: { priority: "Medium", milestone: input.milestone, description: input.description || undefined } }));
    },
  };
}

/** Tasks per milestone: done and total. */
export const milestoneCount = (items: WorkItem[], m: Milestone) => {
  const mine = items.filter((t) => t.milestone?.id === m.id);
  return { done: mine.filter((t) => t.status === "Completed").length, total: mine.length };
};
