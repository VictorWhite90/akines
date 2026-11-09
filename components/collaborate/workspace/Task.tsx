"use client";

import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import Button from "@/components/kin/Button";
import { Field, Input, Textarea } from "@/components/kin/Field";
import { Drawer, Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { ME } from "@/lib/collab/me";
import { threadHref, useThreads } from "@/lib/collab/conversations";
import { dueLong, milestoneCount, TASK_STATUSES, useTasks, type TaskEdit, type TaskStatus, type WorkItem } from "@/lib/collab/tasks";
import { AVAILABILITY_TEXT, AVAILABILITY_TONE, milestonesOf, useWorkspace, type WorkspaceMember } from "@/lib/collab/workspace";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { CtxBlock, PageHead, WorkspaceFrame } from "./Frame";
import { milestoneHref } from "./Overview";
import { BackLink, CwLink, Dot, IconCheck, Initials, Over, initialsOf, when } from "./parts";
import { Box, memberByName, PriorityMark, StatusMark, TaskPop, tasksHref } from "./Tasks";
import "../styles/tasks.css";
import "../styles/conversations.css";

/*
 * One task, mirrored from the product design (tk-* in ../styles/tasks.css): what it
 * is, who is on it, its details, completion criteria, files and comments; Request review while it is in progress,
 * Complete task once it is in review. The context column shows the people on it, its milestone and conversation.
 * Edit task opens the Edit task slide-out (title, description, responsible, due date, milestone): a task without a
 * title shows "Add a title to continue." and is not saved; Save changes shows "Task updated." The state-* routes
 * open it with the slide-out showing, in its Needs attention state, or just saved.
 */

const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "A member";
const withYou = (id: PersonId) => (id === ME ? `${nameOf(id)} (you)` : nameOf(id));

function StatusMenu({ current, onPick }: { current: TaskStatus; onPick: (s: TaskStatus) => void }) {
  const keys = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const list = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemradio"]'));
    const i = list.indexOf(document.activeElement as HTMLElement);
    const n = e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : e.key === "ArrowDown" ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
    list[n]?.focus();
  };
  return (
    <div className="tk-menu tk-menu--status" role="menu" aria-label="Change status" onKeyDown={keys}>
      {TASK_STATUSES.map((s) => (
        <button key={s} type="button" role="menuitemradio" aria-checked={s === current} className="tk-sopt" onClick={() => onPick(s)}>
          <StatusMark status={s} />
          <span className="tk-sopt__check" aria-hidden>{s === current ? <IconCheck size={16} sw={1.5} /> : null}</span>
        </button>
      ))}
    </div>
  );
}

function RequestDialog({ open, onClose, reviewer, members, onRequest }: { open: boolean; onClose: () => void; reviewer: string; members: WorkspaceMember[]; onRequest: (who: PersonId, note: string) => void }) {
  const [who, setWho] = useState(reviewer);
  const [note, setNote] = useState("");
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setWho(reviewer); setNote(""); } }
  const filled = (v: string) => (v.trim() ? "tk-filled" : undefined);
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="REQUEST REVIEW" title="Who should review this?" description="They will be told that the task is ready."
      footer={<><Button type="submit" form="tk-review-form">Request review</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="tk-review-form" className="cw-form" onSubmit={(e) => { e.preventDefault(); onRequest(memberByName(who.trim() || reviewer, members.filter((m) => !m.you)), note.trim()); }} noValidate>
        <Field label="Reviewer" hint="They will be told straight away."><Input className={filled(who)} value={who} onChange={(e) => setWho(e.target.value)} /></Field>
        <Field label="Note" hint="Optional."><Input className={filled(note)} value={note} placeholder="Anything the reviewer should know?" onChange={(e) => setNote(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

/** Composer: the field takes the ink border on focus, Send turns primary once something is typed. */
function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  const ok = text.trim().length > 0;
  // the field grows with what is typed (92 px at least, as in the design)
  useEffect(() => { const el = field.current; if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight + 2}px`; } }, [text]);
  return (
    <form className="tk-composer" onSubmit={(e) => { e.preventDefault(); if (!ok) return; onSend(text.trim()); setText(""); field.current?.focus(); }} noValidate>
      <textarea ref={field} className="tk-composer__field" rows={1} value={text} placeholder="Add a comment." aria-label="Add a comment" onChange={(e) => setText(e.target.value)} />
      <div className="tk-composer__actions">
        <div className="tk-composer__refs"><CwLink>Attach file</CwLink><CwLink>Link task</CwLink><CwLink>Link decision</CwLink></div>
        <Button type="submit" variant={ok ? "primary" : "secondary"} disabled={!ok}>Send</Button>
      </div>
    </form>
  );
}

const filled = (v: string) => (v.trim() ? "tk-filled" : undefined);

/**
 * Slide-out: Edit task, 480 wide from the right: the EDIT TASK label with the close button, the headline, five fields
 * and Save changes with Cancel. Needs attention: without a title it shows "Add a title to continue." and does not save.
 * `invalid` opens it in that state (the title emptied).
 */
function EditTask({ open, t, invalid, members, milestones, onClose, onSave }: { open: boolean; t: WorkItem; invalid?: boolean; members: WorkspaceMember[]; milestones: { id: string; title: string }[]; onClose: () => void; onSave: (e: TaskEdit) => void }) {
  const title = useRef<HTMLInputElement>(null);
  const start = () => ({ title: invalid ? "" : t.title, description: t.description ?? "", who: withYou(t.owner), due: dueLong(t), milestone: t.milestone?.title ?? "" });
  const [f, setF] = useState(start);
  const [tried, setTried] = useState(Boolean(invalid));
  const [wasOpen, setWasOpen] = useState(open);
  // every opening starts again from the task
  if (open !== wasOpen) { setWasOpen(open); if (open) { setF(start()); setTried(Boolean(invalid)); } }
  const set = (k: keyof ReturnType<typeof start>) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!f.title.trim()) { setTried(true); title.current?.focus(); return; }
    const q = f.milestone.trim().toLowerCase();
    const ms = q ? milestones.find((m) => m.title.toLowerCase().includes(q) || q.includes(m.title.toLowerCase())) : undefined;
    onSave({ title: f.title.trim(), description: f.description.trim(), owner: memberByName(f.who, members), due: !f.due.trim() || f.due.trim() === dueLong(t) ? t.dueText : f.due.trim(), milestone: ms?.id });
  };
  return (
    <Drawer open={open} onClose={onClose} eyebrow="EDIT TASK" label="Edit this task" flush className="cd-slide"
      footer={<><Button type="submit" form="tk-edit-form">Save changes</Button><Button variant="secondary" onClick={onClose}>Cancel</Button></>}>
      <form id="tk-edit-form" className="tk-edit" onSubmit={save} noValidate>
        <h2 className="tk-edit__title">Edit this task</h2>
        <Field label="Task title" error={tried && !f.title.trim() ? "Add a title to continue." : undefined}>
          <Input ref={title} className={filled(f.title)} value={f.title} placeholder="For example, Write the interview summary" onChange={set("title")} />
        </Field>
        <Field label="Description"><Textarea className={filled(f.description)} rows={3} value={f.description} onChange={set("description")} /></Field>
        <Field label="Responsible"><Input className={filled(f.who)} value={f.who} onChange={set("who")} /></Field>
        <Field label="Due date"><Input className={filled(f.due)} value={f.due} onChange={set("due")} /></Field>
        <Field label="Milestone"><Input className={filled(f.milestone)} value={f.milestone} onChange={set("milestone")} /></Field>
      </form>
    </Drawer>
  );
}

function Context({ projectId, t, items }: { projectId: string; t: WorkItem; items: WorkItem[] }) {
  const ws = useWorkspace(projectId);
  const { threads } = useThreads(ws.project);
  const people = [{ id: t.owner, part: "responsible" }, ...(t.support && t.support !== t.owner ? [{ id: t.support, part: "supporting" }] : [])];
  const thread = threads.find((x) => x.kind === "work" && x.deliverable?.id === t.id) ?? threads.find((x) => x.id === "team");
  const last = thread?.messages.at(-1);
  const m = t.milestone;
  const count = m ? milestoneCount(items, m) : null;
  return (
    <>
      <CtxBlock label="ON THIS TASK">
        <ul className="cw-people">
          {people.map((p) => {
            const mem = ws.project ? ws.members.find((x) => x.id === p.id) : undefined;
            const a = mem?.availability ?? "away";
            return (
              <li key={p.id} className="cw-people__row">
                <Initials initials={initialsOf(nameOf(p.id))} size={36} />
                <div className="cw-people__text"><span className="cw-people__name">{nameOf(p.id)} ({p.part})</span><span className="cw-people__status"><Dot tone={AVAILABILITY_TONE[a]} size={7} />{AVAILABILITY_TEXT[a]}</span></div>
              </li>
            );
          })}
        </ul>
      </CtxBlock>
      {m && count && m.id !== t.id ? (
        <CtxBlock label="RELATED MILESTONE">
          <p className="cw-session__title">{m.title}</p>
          <p className="cw-ctx__line">Due {m.due}</p>
          <p className="cw-ctx__line">{count.done} of {count.total} tasks done</p>
          <CwLink href={milestoneHref(projectId, m)} arrow>View milestone</CwLink>
        </CtxBlock>
      ) : null}
      {thread ? (
        <CtxBlock label="RELATED CONVERSATION">
          <p className="cw-ctx__item">{thread.title}</p>
          {last ? <p className="cw-ctx__status">{nameOf(last.by)}, {last.at ? when(last.at).replace(/^Today, /, "today at ").replace(/^Yesterday, /, "yesterday at ") : `today at ${last.clock}`}</p> : null}
          <CwLink href={threadHref(projectId, thread.id)} arrow>Open conversation</CwLink>
        </CtxBlock>
      ) : null}
    </>
  );
}

const UPDATED = "Task updated. Everyone on it has been told.";

export default function Task({ projectId, slug, state }: { projectId: string; slug: string; /** The state-* routes: the Edit task slide-out open, in Needs attention, or just saved. */ state?: "edit" | "invalid" | "updated" }) {
  const ws = useWorkspace(projectId);
  const tasks = useTasks(ws.project, ws.collab);
  const [requesting, setRequesting] = useState(false);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(state === "edit" || state === "invalid");
  // state-task-updated: the toast shows when the page opens (it stays longer so it can be looked at)
  useEffect(() => { if (state === "updated") toast.show({ message: UPDATED, duration: 8000 }); }, [state]);
  if (!ws.project) return <WorkspaceFrame projectId={projectId} active="tasks">{null}</WorkspaceFrame>;
  const p = ws.project;
  const t = tasks.get(slug);
  const back = <BackLink href={tasksHref(p.id)}>Back to tasks</BackLink>;
  if (!t) {
    return (
      <WorkspaceFrame projectId={projectId} active="tasks">
        <div className="tk-detail"><PageHead back={back} label="TASK" title="This task is no longer here." lead="It may have been removed or renamed. Every task is on the list." /></div>
      </WorkspaceFrame>
    );
  }

  const reviewer = t.reviewer && t.reviewer !== ME ? t.reviewer : ws.members.find((m) => !m.you && m.id !== t.owner)?.id ?? ws.members.find((m) => !m.you)?.id ?? ME;
  const canComplete = t.kind === "task" || t.reviewer === ME;
  const complete = () => {
    if (!tasks.setStatus(t, "Completed")) return;
    // Only a plain task can go back: an approval is on the record.
    toast.show({ message: "Task completed. Everyone on it has been told.", duration: 2500, ...(t.kind === "task" ? { actionLabel: "Undo", onAction: () => ws.collab.project.moveTask(p.id, t.id, "doing") } : {}) });
  };
  const request = (who: PersonId, note: string) => {
    tasks.requestReview(t, who, note);
    setRequesting(false);
    toast.show({ message: `Review requested. ${nameOf(t.kind === "deliverable" ? t.reviewer ?? who : who)} has been told.`, duration: 2500, ...(t.kind === "task" ? { actionLabel: "Undo", onAction: () => tasks.setStatus({ ...t, status: "In review" }, "In progress") } : {}) });
  };
  const pick = (s: TaskStatus) => {
    setMenu(false);
    if (s === "In review") { setRequesting(true); return; }
    if (s === "Completed") { complete(); return; }
    tasks.setStatus(t, s);
  };
  const notice = t.status === "In review" && t.reviewer === ME && t.owner !== ME ? `${nameOf(t.owner)} asked you to review this.` : t.status === "In review" ? `Review requested from ${nameOf(t.reviewer ?? reviewer)}. You will be told when it is done.` : t.status === "Completed" ? "Completed. Everyone on this task has been told." : null;
  const working = t.status === "In progress" || t.status === "Not started";
  const changeStatus = (extra: React.ButtonHTMLAttributes<HTMLButtonElement> & { "data-tk-trigger"?: string } = {}) => <Button variant="secondary" {...extra}>Change status</Button>;

  return (
    <WorkspaceFrame projectId={projectId} active="tasks" context={<Context projectId={p.id} t={t} items={tasks.items} />}>
      <div className="tk-detail">
        <PageHead back={back} label="TASK" title={t.title} lead={t.description}>
          {notice ? <p className="tk-notice">{notice}</p> : null}
          <div className="cw-actions cw-actions--btns">
            {working ? <Button onClick={() => setRequesting(true)}>Request review</Button> : null}
            {t.status === "In review" && canComplete ? <Button onClick={complete}>Complete task</Button> : null}
            {working ? (
              <TaskPop open={menu} onClose={() => setMenu(false)} trigger={changeStatus({ "data-tk-trigger": "", "aria-haspopup": "menu", "aria-expanded": menu, onClick: () => setMenu((x) => !x) })}>
                <StatusMenu current={t.status} onPick={pick} />
              </TaskPop>
            ) : changeStatus()}
            <CwLink onClick={() => setEditing(true)}>Edit task</CwLink>
          </div>
        </PageHead>

        <dl className="tk-details" data-m="up" aria-label="Details">
          <div className="tk-field"><dt>RESPONSIBLE</dt><dd>{withYou(t.owner)}</dd></div>
          {t.support ? <div className="tk-field"><dt>SUPPORTING</dt><dd>{withYou(t.support)}</dd></div> : null}
          <div className="tk-field"><dt>DUE DATE</dt><dd>{dueLong(t)}</dd></div>
          <div className="tk-field"><dt>STATUS</dt><dd><StatusMark status={t.status} /></dd></div>
          <div className="tk-field"><dt>PRIORITY</dt><dd><PriorityMark priority={t.priority} /></dd></div>
          {t.milestone && t.milestone.id !== t.id ? <div className="tk-field"><dt>MILESTONE</dt><dd>{t.milestone.title}</dd></div> : null}
        </dl>

        {t.criteria.length ? (
          <section className="tk-sec" data-m="up" aria-label="Completion criteria">
            <Over as="h3">COMPLETION CRITERIA</Over>
            <ul className="tk-crit">
              {t.criteria.map((c) => <li key={c.id}><button type="button" role="checkbox" aria-checked={c.done} className="tk-crit__item" onClick={() => tasks.toggleCriterion(t, c.id)}><Box on={c.done} /><span>{c.title}</span></button></li>)}
            </ul>
          </section>
        ) : null}

        {t.files.length ? (
          <section className="tk-sec" data-m="up" aria-label="Related files">
            <Over as="h3">RELATED FILES</Over>
            <ul className="tk-files">
              {t.files.map((f) => (
                <li key={f.id} className="tk-file">
                  <span className="tk-file__icon" aria-hidden><FileText size={22} strokeWidth={1.5} focusable={false} /></span>
                  <span className="tk-file__text"><span className="tk-file__name">{f.name}</span><span className="tk-file__meta">{f.meta}</span></span>
                  {f.href ? <a className="cw-link" href={f.href} target="_blank" rel="noreferrer"><span className="cw-link__label">Open</span></a> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="tk-sec" data-m="up" aria-label="Comments">
          <Over as="h3">COMMENTS ({t.comments.length})</Over>
          <div className="tk-thread">
            {t.comments.length ? (
              <ol className="tk-msgs" aria-label="Comments">
                {t.comments.map((c, i) => (
                  <li key={i} className="tk-msg">
                    <Initials initials={initialsOf(nameOf(c.by))} size={36} tone="muted" />
                    <div className="tk-msg__body">
                      <div className="tk-msg__head">
                        <span className="tk-msg__who"><span className="tk-msg__name">{nameOf(c.by)}</span><span className="tk-msg__time">{when(c.at)}</span></span>
                        <button type="button" className="tk-msg__reply" aria-label={`Reply to ${nameOf(c.by)}`}>Reply</button>
                      </div>
                      <p className="tk-msg__text">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
            <Composer onSend={(text) => tasks.comment(t, text)} />
          </div>
        </section>
      </div>
      <EditTask open={editing} t={t} invalid={state === "invalid"} members={ws.members} milestones={milestonesOf(p)} onClose={() => setEditing(false)}
        onSave={(e) => { tasks.editTask(t, e); setEditing(false); toast.show({ message: UPDATED, duration: 2500 }); }} />
      <RequestDialog open={requesting} onClose={() => setRequesting(false)} reviewer={withYou(reviewer)} members={ws.members} onRequest={request} />
    </WorkspaceFrame>
  );
}
