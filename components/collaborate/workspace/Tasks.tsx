"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Button from "@/components/kin/Button";
import { Field, Input } from "@/components/kin/Field";
import { Empty, Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { ME } from "@/lib/collab/me";
import { dueLabel, milestoneCount, PRIORITIES, TASK_STATUSES, useTasks, type Priority, type TaskStatus, type WorkItem } from "@/lib/collab/tasks";
import { useWorkspace, workspaceHref, type WorkspaceMember } from "@/lib/collab/workspace";
import type { Milestone } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { Metric, Metrics } from "./blocks";
import { PageHead, WorkspaceFrame } from "./Frame";
import { milestoneHref } from "./Overview";
import { CwLink, IconCheck, initialsOf } from "./parts";
import "../styles/tasks.css";

/*
 * A project's tasks, mirrored from the product design (tk-* in ../styles/tasks.css): the counts, Create task,
 * Filter tasks and View milestones, then three views (a list grouped open and completed, a board by status, and
 * tasks per milestone). Tasks are our project's tasks and deliverables (lib/collab/tasks).
 */

export const tasksHref = (projectId: string, view: "list" | "board" | "milestones" = "list") => `${workspaceHref(projectId, "tasks")}${view === "list" ? "" : `/${view}`}`;
export const taskHref = (projectId: string, t: Pick<WorkItem, "slug">) => `${workspaceHref(projectId, "tasks")}/${t.slug}`;
const word = (n: number) => (n === 1 ? "task" : "tasks");

export function PriorityMark({ priority }: { priority: Priority }) {
  const n = priority === "High" ? 3 : priority === "Medium" ? 2 : 1;
  return <span className="tk-pri"><span className="tk-pri__bars" aria-hidden><i className="on" /><i className={n >= 2 ? "on" : undefined} /><i className={n >= 3 ? "on" : undefined} /></span><span>{priority}</span></span>;
}
const DOT: Record<TaskStatus, string> = { "Not started": "not", "In progress": "progress", "In review": "review", Completed: "done" };
export function StatusMark({ status }: { status: TaskStatus }) {
  return <span className="tk-status"><i className={cn("tk-dot", `tk-dot--${DOT[status]}`)} aria-hidden /><span>{status}</span></span>;
}
const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "A member";
function Owner({ id, small }: { id: PersonId; small?: boolean }) {
  return <span className={cn("tk-owner", small && "tk-owner--sm")} role="img" aria-label={`Responsible: ${nameOf(id)}`}>{initialsOf(nameOf(id))}</span>;
}

function Row({ projectId, t, withMilestone }: { projectId: string; t: WorkItem; withMilestone?: boolean }) {
  return (
    <Link href={taskHref(projectId, t)} className="tk-row">
      <span className="tk-row__content">
        <span className="tk-row__title">{t.title}</span>
        <span className="tk-row__meta">{withMilestone && t.milestone && t.milestone.id !== t.id ? <span className="tk-row__ms">{t.milestone.title}</span> : null}<PriorityMark priority={t.priority} /></span>
      </span>
      <Owner id={t.owner} />
      <span className="tk-row__status"><StatusMark status={t.status} /></span>
      <span className="tk-row__due">{dueLabel(t)}</span>
    </Link>
  );
}

function Card({ projectId, t }: { projectId: string; t: WorkItem }) {
  return (
    <Link href={taskHref(projectId, t)} className="tk-card">
      <PriorityMark priority={t.priority} />
      <span className="tk-card__title">{t.title}</span>
      {t.milestone && t.milestone.id !== t.id ? <span className="tk-card__ms">{t.milestone.title}</span> : null}
      <span className="tk-card__foot"><Owner id={t.owner} small /><span className="tk-card__due">{dueLabel(t)}</span></span>
    </Link>
  );
}

function Views({ projectId, active }: { projectId: string; active: "list" | "board" | "milestones" }) {
  const tabs = [{ key: "list", label: "List" }, { key: "board", label: "Board" }, { key: "milestones", label: "Milestones" }] as const;
  return (
    <nav className="tk-tabs" aria-label="Task views">
      {tabs.map((t) => t.key === active
        ? <span key={t.key} className="tk-tab" aria-current="page"><span className="tk-tab__label">{t.label}</span><span className="tk-tab__rule" /></span>
        : <Link key={t.key} href={tasksHref(projectId, t.key)} className="tk-tab"><span className="tk-tab__label">{t.label}</span><span className="tk-tab__rule" /></Link>)}
    </nav>
  );
}

/** A menu that opens under its trigger, in place (tk-pop): Escape or a press outside closes it. */
export function TaskPop({ open, onClose, trigger, children }: { open: boolean; onClose: () => void; trigger: React.ReactNode; children: React.ReactNode }) {
  const root = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (root.current && !root.current.contains(e.target as Node)) close.current(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { close.current(); root.current?.querySelector<HTMLElement>("[data-tk-trigger]")?.focus({ preventScroll: true }); } };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    el.style.translate = "";
    const r = el.getBoundingClientRect();
    const over = r.right - (window.innerWidth - 16);
    if (over > 0) el.style.translate = `${-Math.min(over, Math.max(r.left - 16))}px 0`;
  }, [open]);
  useEffect(() => {
    if (!open || !root.current?.contains(document.activeElement)) return;
    (panel.current?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]') ?? panel.current?.querySelector<HTMLElement>("button:not([disabled])"))?.focus({ preventScroll: true });
  }, [open]);
  return <span className="tk-pop" ref={root}>{trigger}{open ? <div className="tk-pop__panel" ref={panel}>{children}</div> : null}</span>;
}

export function Box({ on }: { on: boolean }) {
  return <span className={cn("tk-box", on && "tk-box--on")} aria-hidden>{on ? <IconCheck size={14} sw={1.5} /> : null}</span>;
}

type Filters = { status: TaskStatus[]; priority: Priority[]; person: PersonId[] };
const NONE: Filters = { status: [], priority: [], person: [] };
const matches = (t: WorkItem, f: Filters) => (!f.status.length || f.status.includes(t.status)) && (!f.priority.length || f.priority.includes(t.priority)) && (!f.person.length || f.person.includes(t.owner));

function FilterMenu({ items, members, initial, onApply }: { items: WorkItem[]; members: WorkspaceMember[]; initial: Filters; onApply: (f: Filters) => void }) {
  const [f, setF] = useState(initial);
  const n = items.filter((t) => matches(t, f)).length;
  const flip = <K extends keyof Filters>(k: K, v: Filters[K][number]) => setF((cur) => ({ ...cur, [k]: (cur[k] as string[]).includes(v) ? (cur[k] as string[]).filter((x) => x !== v) : [...cur[k], v] }));
  const groups = [
    { key: "status" as const, label: "STATUS", options: TASK_STATUSES.map((s) => ({ value: s, label: s, count: items.filter((t) => t.status === s).length })) },
    { key: "priority" as const, label: "PRIORITY", options: PRIORITIES.map((p) => ({ value: p, label: p, count: items.filter((t) => t.priority === p).length })) },
    { key: "person" as const, label: "RESPONSIBLE", options: members.map((m) => ({ value: m.id, label: m.you ? `${m.name} (you)` : m.name, count: items.filter((t) => t.owner === m.id).length })) },
  ];
  return (
    <div className="tk-menu tk-menu--filter" role="group" aria-label="Filter tasks">
      <p className="cw-over tk-menu__heading">FILTER TASKS</p>
      {groups.map((g) => (
        <div key={g.key} className="tk-fgroup" role="group" aria-label={g.label}>
          <p className="tk-fgroup__label" aria-hidden>{g.label}</p>
          {g.options.map((o) => {
            const on = (f[g.key] as string[]).includes(o.value);
            return <button key={o.value} type="button" role="checkbox" aria-checked={on} className="tk-opt" onClick={() => flip(g.key, o.value as never)}><Box on={on} /><span className="tk-opt__label">{o.label}</span><span className="tk-opt__count">{o.count}</span></button>;
          })}
        </div>
      ))}
      <div className="tk-menu__actions">
        <CwLink onClick={() => setF(NONE)}>Clear all</CwLink>
        <Button size="sm" disabled={n === 0} onClick={() => onApply(f)}>Show {n} {word(n)}</Button>
      </div>
    </div>
  );
}

const filled = (v: string) => (v.trim() ? "tk-filled" : undefined);
/** Finds a teammate by what was typed: a full or partial name, or the member themselves. */
export function memberByName(typed: string, members: WorkspaceMember[]): PersonId {
  const q = typed.replace(/\(you\)/i, "").trim().toLowerCase();
  return (q ? members.find((m) => m.name.toLowerCase().includes(q) || q.includes(m.name.toLowerCase())) : undefined)?.id ?? members.find((m) => m.you)?.id ?? ME;
}
const youName = (m?: WorkspaceMember) => (m ? (m.you ? `${m.name} (you)` : m.name) : "");

function CreateDialog({ open, onClose, members, milestones, onCreate }: { open: boolean; onClose: () => void; members: WorkspaceMember[]; milestones: Milestone[]; onCreate: (t: { title: string; who: PersonId; due: string; description: string; milestone?: string }) => void }) {
  const me = members.find((m) => m.you);
  const next = milestones.find((m) => !m.done);
  const blank = { title: "", description: "", who: youName(me), due: "", milestone: next?.title ?? "" };
  const [v, setV] = useState(blank);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) setV(blank); }
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setV((cur) => ({ ...cur, [k]: e.target.value }));
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = v.milestone.trim().toLowerCase();
    const ms = q ? milestones.find((m) => m.title.toLowerCase().includes(q) || q.includes(m.title.toLowerCase())) : undefined;
    onCreate({ title: v.title.trim() || "Write the interview summary", who: memberByName(v.who, members), due: v.due.trim() || "This week", description: v.description.trim(), milestone: ms?.id });
  };
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="NEW TASK" title="What needs to be done?" description="Name the task and say who is responsible."
      footer={<><Button type="submit" form="tk-create-form">Create task</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="tk-create-form" className="cw-form" onSubmit={submit} noValidate>
        <Field label="Task title" hint="A short, clear name."><Input className={filled(v.title)} value={v.title} placeholder="For example, Write the interview summary" onChange={set("title")} /></Field>
        <Field label="Description" hint="Optional."><Input className={filled(v.description)} value={v.description} placeholder="What does done look like?" onChange={set("description")} /></Field>
        <div className="tk-pair">
          <Field label="Responsible" hint="Who is accountable."><Input className={filled(v.who)} value={v.who} onChange={set("who")} /></Field>
          <Field label="Due date" hint="When it should be done."><Input className={filled(v.due)} value={v.due} placeholder="Fri 20 Nov" onChange={set("due")} /></Field>
        </div>
        {milestones.length ? <Field label="Milestone" hint="The milestone this task belongs to."><Input className={filled(v.milestone)} value={v.milestone} onChange={set("milestone")} /></Field> : null}
      </form>
    </Modal>
  );
}

const FilterButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement> & { "data-tk-trigger"?: string }) => (
  <Button variant="secondary" icon={<SlidersHorizontal strokeWidth={1.5} aria-hidden focusable={false} />} {...props}>Filter tasks</Button>
);

type View = "list" | "board" | "milestones";
export default function Tasks({ projectId, view = "list" }: { projectId: string; view?: View }) {
  const ws = useWorkspace(projectId);
  const tasks = useTasks(ws.project, ws.collab);
  const router = useRouter();
  const pathname = usePathname();
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState<Filters>(NONE);
  const [filtering, setFiltering] = useState(false);
  const items = tasks.items;
  const shown = useMemo(() => items.filter((t) => matches(t, filters)), [items, filters]);
  if (!ws.project) return <WorkspaceFrame projectId={projectId} active="tasks" rail>{null}</WorkspaceFrame>;
  const p = ws.project;
  const empty = items.length === 0;
  const meId = ws.members.find((m) => m.you)?.id ?? ME;
  const open = items.filter((t) => t.status !== "Completed").length;
  const inReview = items.filter((t) => t.status === "In review").length;
  const mine = items.filter((t) => t.owner === meId && t.status !== "Completed").length;

  const create = (t: Parameters<typeof tasks.create>[0]) => {
    tasks.create(t);
    setCreating(false);
    const list = tasksHref(p.id);
    if (pathname !== list) router.push(list);
    // No Undo: our project store can't remove a task yet.
    toast.show({ message: "Task created. It is on the list now.", duration: 2500 });
  };

  const head = (
    <PageHead label="TASKS" title="The work ahead." lead="A clear view of what needs to happen next.">
      <div className="tk-metrics">
        <Metrics>
          <Metric label="OPEN" value={open} caption={word(open)} />
          <Metric label="IN REVIEW" value={inReview} caption={word(inReview)} />
          <Metric label="ASSIGNED TO YOU" value={mine} caption={word(mine)} dot={mine > 0} />
        </Metrics>
      </div>
      <div className="cw-actions cw-actions--btns">
        <Button onClick={() => setCreating(true)}>Create task</Button>
        {view === "list" && !empty ? (
          <TaskPop open={filtering} onClose={() => setFiltering(false)} trigger={<FilterButton data-tk-trigger="" aria-haspopup="dialog" aria-expanded={filtering} onClick={() => setFiltering((x) => !x)} />}>
            <FilterMenu items={items} members={ws.members} initial={filters} onApply={(f) => { setFilters(f); setFiltering(false); }} />
          </TaskPop>
        ) : <FilterButton />}
        {view === "milestones" ? <CwLink>View milestones</CwLink> : <CwLink href={tasksHref(p.id, "milestones")}>View milestones</CwLink>}
      </div>
    </PageHead>
  );
  const dialog = <CreateDialog open={creating} onClose={() => setCreating(false)} members={ws.members} milestones={ws.milestones} onCreate={create} />;

  if (empty) {
    return (
      <WorkspaceFrame projectId={projectId} active="tasks" rail="short">
        {head}
        <div className="tk-empty" data-m="up">
          <Empty className="cw-empty" title="Nothing on the list yet." text="Define the next steps your team needs to take." action={<Button arrow="up-right" onClick={() => setCreating(true)}>Create task</Button>} />
        </div>
        {dialog}
      </WorkspaceFrame>
    );
  }

  if (view === "board") {
    return (
      <WorkspaceFrame projectId={projectId} active="tasks" wide>
        {head}
        <section className="tk-views" data-m="up" aria-label="Tasks">
          <Views projectId={p.id} active="board" />
          <div className="tk-board">
            {TASK_STATUSES.map((s) => {
              const col = items.filter((t) => t.status === s);
              return (
                <section key={s} className="tk-col" aria-label={s}>
                  <header className="tk-col__head"><h2 className="tk-col__title">{s.toUpperCase()}</h2><span className="tk-col__count">{col.length}</span></header>
                  <ul className="tk-col__cards">{col.map((t) => <li key={t.id}><Card projectId={p.id} t={t} /></li>)}</ul>
                </section>
              );
            })}
          </div>
        </section>
        {dialog}
      </WorkspaceFrame>
    );
  }

  if (view === "milestones") {
    return (
      <WorkspaceFrame projectId={projectId} active="tasks" rail>
        {head}
        <section className="tk-views tk-views--groups" data-m="up" aria-label="Tasks">
          <Views projectId={p.id} active="milestones" />
          {ws.milestones.map((m) => {
            const group = items.filter((t) => t.milestone?.id === m.id);
            if (!group.length) return null;
            const { done, total } = milestoneCount(items, m);
            const pct = total ? Math.round((done / total) * 10000) / 100 : 0;
            return (
              <section key={m.id} className="tk-msgroup" aria-label={m.title}>
                <header className="tk-mh">
                  <div className="tk-mh__top"><h2 className="tk-mh__title">{m.title}</h2><CwLink href={milestoneHref(p.id, m)}>View milestone</CwLink></div>
                  <p className="tk-mh__meta">Due {m.due}. {done} of {total} {word(total)} done.</p>
                  <div className="tk-mh__bar" style={{ ["--tk-p" as string]: `${pct}%` } as React.CSSProperties} role="img" aria-label={`${done} of ${total} tasks done`} />
                </header>
                <div className="tk-list"><ul className="tk-rows">{group.map((t) => <li key={t.id}><Row projectId={p.id} t={t} /></li>)}</ul></div>
              </section>
            );
          })}
        </section>
        {dialog}
      </WorkspaceFrame>
    );
  }

  const openRows = shown.filter((t) => t.status !== "Completed");
  const doneRows = shown.filter((t) => t.status === "Completed");
  return (
    <WorkspaceFrame projectId={projectId} active="tasks" rail>
      {head}
      <section className="tk-views" data-m="up" aria-label="Tasks">
        <Views projectId={p.id} active="list" />
        <div className="tk-list">
          <div className="tk-heads" aria-hidden><span className="tk-heads__task">TASK</span><span className="tk-heads__owner" /><span className="tk-heads__status">STATUS</span><span className="tk-heads__due">DUE</span></div>
          {shown.length === 0 ? <p className="tk-list__none">No tasks match these filters.</p> : null}
          {openRows.length ? <><h2 className="tk-group">OPEN ({openRows.length})</h2><ul className="tk-rows">{openRows.map((t) => <li key={t.id}><Row projectId={p.id} t={t} withMilestone /></li>)}</ul></> : null}
          {doneRows.length ? <><h2 className="tk-group">COMPLETED ({doneRows.length})</h2><ul className="tk-rows">{doneRows.map((t) => <li key={t.id}><Row projectId={p.id} t={t} withMilestone /></li>)}</ul></> : null}
        </div>
      </section>
      {dialog}
    </WorkspaceFrame>
  );
}

