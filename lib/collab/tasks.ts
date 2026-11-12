"use client";

import { useCallback, useMemo } from "react";
import { collabApi, useRemoteExtras, type RemoteExtras, type TaskPatch } from "@/lib/api/collab";
import { DEMO } from "@/lib/demo/mode";
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
 * Edit task (the design's Edit task slide-out) changes the title, the responsible person, the due date, the
 * description and the milestone: editTask sends that as one TaskEdit, the body of the same PATCH. Until useCollab
 * can rename a task or a deliverable, the title, owner and due are kept here as an overlay (TaskDetails.edit).
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
  /** Files on a plain task (deliverables carry theirs as proof). */
  files?: WorkItem["files"];
  /** What Edit task changed on the project's own fields, until useCollab can save them. */
  edit?: { title?: string; owner?: PersonId; due?: string };
};

/** What the Edit task form saves: PATCH /collab/projects/:id/tasks/:taskId ← TaskEdit. */
export type TaskEdit = { title: string; description: string; owner: PersonId; due: string; milestone?: string };

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
    criteria: extra.criteria ?? [], files: extra.files ?? [], comments: extra.comments ?? [],
  };
}

/** "Today, 9:05" or "yesterday, 16:12": a comment time the design writes relative to today. */
const at = (daysAgo: number, h: number, m: number) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(h, m, 0, 0); return d.getTime(); };
const CG = "career-guidance-for-everyone", AS = "adire-stories";

/**
 * Sample details of the design's two sample projects (what our model doesn't hold yet), by task id. The tasks
 * themselves (title, owner, due, status) are the projects' own (lib/collab/seed.ts), with the design's ids.
 */
function seedDetails(): Record<string, TaskDetails> {
  return {
    [`${CG}/review-the-student-onboarding-draft`]: { priority: "High", milestone: "first-student-experience", review: true, reviewer: "kemi" },
    [`${CG}/collect-questions-students-ask-about-careers`]: { priority: "High", milestone: "first-student-experience" },
    [`${CG}/write-the-guided-onboarding-questions`]: {
      priority: "Medium", milestone: "first-student-experience", support: "adaeze", reviewer: "adaeze",
      description: "Write the questions that guide a student through the first onboarding screen. Keep each one short and in plain language.",
      criteria: [{ id: "c1", title: "Three questions written", done: true }, { id: "c2", title: "Questions reviewed with Adaeze", done: false }, { id: "c3", title: "Questions added to the onboarding draft", done: false }],
      files: [{ id: "f1", name: "Onboarding questions.docx", meta: "Word, 42 KB, added by Kemi Adeyemi" }, { id: "f2", name: "Career interview notes.docx", meta: "Word, 180 KB, shared by Ngozi Eze" }],
      comments: [
        { by: "tobi", text: "I added the second screen to the draft. Can you look at the wording of the third question?", at: at(1, 16, 12) },
        { by: "adaeze", text: "The wording is clear. I would move the interest question to the end.", at: at(0, 9, 5) },
      ],
    },
    [`${CG}/build-the-second-onboarding-screen`]: { priority: "Medium", milestone: "first-student-experience" },
    [`${CG}/confirm-the-final-interest-questions`]: { priority: "High", milestone: "first-student-experience" },
    [`${CG}/invite-two-schools-to-the-review`]: { priority: "Medium", milestone: "prototype-review" },
    [`${CG}/plan-the-prototype-review-session`]: { priority: "Low", milestone: "prototype-review" },
    [`${CG}/share-the-career-interview-notes`]: { priority: "Low", milestone: "first-student-experience" },
    [`${CG}/set-up-the-shared-canvas`]: { priority: "Low", milestone: "first-student-experience" },

    [`${AS}/review-the-student-onboarding-draft`]: { priority: "High", milestone: "headwrap-portrait", review: true, reviewer: "kemi" },
    [`${AS}/collect-questions-students-ask-about-careers`]: { priority: "High", milestone: "headwrap-portrait" },
    [`${AS}/write-the-guided-onboarding-questions`]: { priority: "Medium", milestone: "headwrap-portrait" },
    [`${AS}/build-the-second-onboarding-screen`]: { priority: "Medium", milestone: "headwrap-portrait" },
    [`${AS}/confirm-the-final-interest-questions`]: { priority: "High", milestone: "headwrap-portrait" },
    [`${AS}/invite-two-schools-to-the-review`]: { priority: "Medium", milestone: "pattern-study-set" },
    [`${AS}/plan-the-prototype-review-session`]: { priority: "Low", milestone: "pattern-study-set" },
    [`${AS}/share-the-career-interview-notes`]: { priority: "Low", milestone: "headwrap-portrait" },
    [`${AS}/set-up-the-shared-canvas`]: { priority: "Low", milestone: "headwrap-portrait" },
  };
}

const ORDER = (a: WorkItem, b: WorkItem) => (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity);
/** Open tasks by due date, then completed ones, most recent first (as the design sorts them). */
export const sortTasks = (items: WorkItem[]) => [...items.filter((t) => t.status !== "Completed").sort(ORDER), ...items.filter((t) => t.status === "Completed").sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))];

type Collab = ReturnType<typeof useCollab>;

const PRIORITY_IN: Record<string, Priority> = { high: "High", medium: "Medium", low: "Low" };
const priorityOut = (p?: Priority) => (p ? (p.toLowerCase() as "high" | "medium" | "low") : undefined);
const STATUS_OUT: Record<TaskStatus, "todo" | "doing" | "review" | "done"> = { "Not started": "todo", "In progress": "doing", "In review": "review", Completed: "done" };

/** Outside the demo, a project's task details are the backend's (tasks, and the extras on deliverables). */
function serverDetails(pid: string, x: RemoteExtras["projects"][string] | undefined): Record<string, TaskDetails> {
  const out: Record<string, TaskDetails> = {};
  for (const t of x?.tasks ?? []) {
    out[`${pid}/${t.id}`] = {
      priority: PRIORITY_IN[t.priority], milestone: t.milestone_id ?? undefined, description: t.description || undefined,
      support: (t.support ?? undefined) as PersonId | undefined, review: t.status === "review", reviewer: (t.reviewer ?? undefined) as PersonId | undefined,
      criteria: t.criteria, comments: t.comments.map((c) => ({ by: c.by as PersonId, text: c.text, at: Date.parse(c.at) })),
    };
  }
  for (const d of x?.deliverables ?? []) {
    out[`${pid}/${d.id}`] = {
      priority: d.priority ? PRIORITY_IN[d.priority] : undefined, milestone: d.milestone_id ?? undefined,
      description: d.description || undefined, support: (d.support ?? undefined) as PersonId | undefined,
    };
  }
  return out;
}

/** What changed between two task details, as the backend's fields. */
function changes(before: TaskDetails, after: TaskDetails, kind: WorkItem["kind"]): TaskPatch {
  const body: TaskPatch = {};
  if (after.priority !== before.priority && after.priority) body.priority = priorityOut(after.priority);
  if (after.milestone !== before.milestone) body.milestone_id = after.milestone ?? null;
  if (after.description !== before.description) body.description = after.description ?? "";
  if (after.support !== before.support) body.support_id = after.support ?? null;
  if (kind === "task") {
    if (after.reviewer !== before.reviewer) body.reviewer_id = after.reviewer ?? null;
    if (JSON.stringify(after.criteria ?? []) !== JSON.stringify(before.criteria ?? [])) body.criteria = after.criteria ?? [];
  }
  return body;
}

/** A project's tasks, and what the member can do with them. */
export function useTasks(project: Project | undefined, collab: Collab) {
  const [localDetails, setDetails] = useLocal<Record<string, TaskDetails>>("ak:collab-task-details:v2", DEMO ? seedDetails() : {});
  const remote = useRemoteExtras();
  const pid = project?.id ?? "";
  const server = useMemo(() => (DEMO || !pid ? null : serverDetails(pid, remote.projects[pid])), [remote, pid]);
  const details = server ?? localDetails;
  const keyOf = useCallback((id: string, title?: string) => (details[`${pid}/${id}`] ? `${pid}/${id}` : title && details[`${pid}/~${title}`] ? `${pid}/~${title}` : `${pid}/${id}`), [details, pid]);

  const items = useMemo<WorkItem[]>(() => {
    if (!project) return [];
    const raw = [
      ...(project.deliverables ?? []).map((d) => ({ base: fromDeliverable(d, details[keyOf(d.id, d.title)] ?? {}), extra: details[keyOf(d.id, d.title)] ?? {} })),
      ...project.tasks.map((t) => ({ base: fromTask(t, details[keyOf(t.id, t.title)] ?? {}, project), extra: details[keyOf(t.id, t.title)] ?? {} })),
    ];
    const seen = new Set<string>();
    return raw.map(({ base: raw, extra }) => {
      // The address stays the one of the first title, so an edited task keeps its page.
      let slug = slugOf(raw.title) || raw.id;
      if (seen.has(slug)) slug = `${slug}-${raw.id}`;
      seen.add(slug);
      const e = extra.edit;
      const base = e ? { ...raw, title: e.title ?? raw.title, owner: e.owner ?? raw.owner, ...(e.due !== undefined ? { dueText: e.due, dueAt: parseDue(e.due) } : {}) } : raw;
      const ms = milestonesOf(project);
      // Without milestones of its own, a deliverable is its own milestone (see milestonesOf).
      const milestone = ms.find((m) => m.id === extra.milestone) ?? (!project.milestones.length && base.kind === "deliverable" ? ms.find((m) => m.id === base.id) : undefined);
      return { ...base, slug, priority: extra.priority ?? "Medium", milestone };
    });
  }, [project, details, keyOf]);

  const patch = useCallback((item: Pick<WorkItem, "id" | "title">, next: TaskDetails | ((d: TaskDetails) => TaskDetails)) => {
    // details are filed under the project's own title (an edited title is only an overlay)
    const own = project ? [...(project.deliverables ?? []), ...project.tasks].find((x) => x.id === item.id)?.title : undefined;
    const k = keyOf(item.id, own ?? item.title);
    if (server && project) {
      const before = server[k] ?? {};
      const after = typeof next === "function" ? next(before) : { ...before, ...next };
      const isTask = project.tasks.some((x) => x.id === item.id);
      const body = changes(before, after, isTask ? "task" : "deliverable");
      if (!Object.keys(body).length) return;
      if (isTask) void collabApi.editTask(project.id, item.id, body);
      else void collabApi.editDeliverable(project.id, item.id, body as Parameters<typeof collabApi.editDeliverable>[2]);
      return;
    }
    setDetails((cur) => ({ ...cur, [k]: typeof next === "function" ? next(cur[k] ?? {}) : { ...cur[k], ...next } }));
  }, [keyOf, setDetails, project, server]);

  const act = collab.project;
  return {
    items: sortTasks(items),
    get: (slug: string) => items.find((t) => t.slug === slug || t.id === slug),
    patch,
    /** Moves a task to a status. Returns false when our model can't make that move for the member. */
    setStatus: (t: WorkItem, status: TaskStatus): boolean => {
      if (!project || t.status === status) return false;
      if (t.kind === "task" && server) {
        void collabApi.editTask(project.id, t.id, { status: STATUS_OUT[status] });
        return true;
      }
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
      else if (server) {
        void collabApi.editTask(project.id, t.id, { status: "review", reviewer_id: reviewer }).then((ok) => { if (ok && note) void collabApi.commentTask(project.id, t.id, note); });
      } else { patch(t, (d) => ({ ...d, review: true, reviewer })); act.moveTask(project.id, t.id, "doing"); if (note) patch(t, (d) => ({ ...d, comments: [...(d.comments ?? []), { by: ME, text: note, at: Date.now() }] })); }
    },
    toggleCriterion: (t: WorkItem, id: string) => {
      if (!project) return;
      if (t.kind === "deliverable") act.toggleStep(project.id, t.id, id);
      else patch(t, (d) => ({ ...d, criteria: (d.criteria ?? []).map((c) => (c.id === id ? { ...c, done: !c.done } : c)) }));
    },
    comment: (t: WorkItem, text: string) => {
      if (!project) return;
      if (t.kind === "deliverable") act.commentDeliverable(project.id, t.id, text);
      else if (server) void collabApi.commentTask(project.id, t.id, text);
      else patch(t, (d) => ({ ...d, comments: [...(d.comments ?? []), { by: ME, text, at: Date.now() }] }));
    },
    /** Saves the Edit task form. */
    editTask: (t: WorkItem, input: TaskEdit) => {
      if (!project) return;
      if (server) {
        const body = { title: input.title, owner_id: input.owner, due: input.due, description: input.description, ...(input.milestone !== undefined ? { milestone_id: input.milestone || null } : {}) };
        if (t.kind === "task") void collabApi.editTask(project.id, t.id, body);
        else void collabApi.editDeliverable(project.id, t.id, body);
        return;
      }
      patch(t, (d) => ({ ...d, description: input.description || undefined, milestone: input.milestone ?? d.milestone, edit: { title: input.title, owner: input.owner, due: input.due } }));
    },
    create: (input: { title: string; who: PersonId; due: string; description?: string; milestone?: string }) => {
      if (!project) return;
      if (server) {
        void collabApi.addTask(project.id, { title: input.title, owner_id: input.who, due: input.due, description: input.description ?? "", milestone_id: input.milestone ?? null, priority: "medium" });
        return;
      }
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
