"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, FileText, Info, MessageSquare, Paperclip, Plus, Video } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Field, Input } from "@/components/kin/Field";
import { Drawer, Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { faceSrc } from "@/components/kin/home/parts";
import { ME } from "@/lib/collab/me";
import { fileSize } from "@/lib/collab/proof";
import { useNextSession } from "@/lib/collab/session";
import { DECISION_STATUS } from "@/lib/collab/decisions";
import { KIND_LINE, THREAD_TYPES, threadHref, useThreads, workHref, type Thread, type ThreadKind, type ThreadMsg } from "@/lib/collab/conversations";
import { AVAILABILITY_TEXT, AVAILABILITY_TONE, workspaceHref, type WorkspaceMember } from "@/lib/collab/workspace";
import type { Deliverable } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { Dot, WorkspaceFrame } from "./Frame";
import { CwLink, initialsOf } from "./parts";
import { fileHref, useProjectFiles } from "./Files";
import { ScheduleDialog } from "./Rail";
import "../styles/conversations.css";

/*
 * The project workspace's Conversations page, mirrored from the product design (classes cv-* in
 * ../styles/conversations.css): the list of the project's conversations beside the open one, its messages with
 * shared files, decisions and the next meeting, the composer, the Meet menu, conversation info and the
 * new-conversation dialog. Conversations are read from the project (lib/collab/conversations).
 */

const TOAST_MS = 2500;
const DAY = 86_400_000;
const midnight = (at: number) => { const d = new Date(at); d.setHours(0, 0, 0, 0); return d.getTime(); };
const clockOf = (at: number) => new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
/** "Today", "Yesterday", "Mon 2 Nov". */
function dayLabel(at: number) {
  const diff = Math.round((midnight(Date.now()) - midnight(at)) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", "");
}
/** The list's time: the clock today, then Yesterday, the weekday this week, the date before that. */
function listTime(t: Thread) {
  const last = t.messages[t.messages.length - 1];
  if (last && !last.at) return last.clock ?? "";
  if (!last) return "";
  const diff = Math.round((midnight(Date.now()) - midnight(last.at!)) / DAY);
  if (diff === 0) return clockOf(last.at!);
  if (diff === 1) return "Yesterday";
  if (diff < 7) return new Date(last.at!).toLocaleDateString("en-GB", { weekday: "short" });
  return new Date(last.at!).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
const lcFirst = (s: string) => (s ? s[0]!.toLowerCase() + s.slice(1) : s);
const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "A member";

function Face({ id, size, className }: { id: PersonId; size: number; className?: string }) {
  const src = faceSrc(id, size * 2);
  return (
    <span className={cn("cv-face", className)} style={{ "--cv-face": `${size}px` } as React.CSSProperties} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- member face */}
      {src ? <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" /> : <span>{initialsOf(nameOf(id))}</span>}
    </span>
  );
}

function Row({ t, href, active, unread }: { t: Thread; href: string; active: boolean; unread: boolean }) {
  const dot = unread && !active;
  const inner = (
    <>
      <span className="cv-row__name">{dot ? <span className="sr-only">Unread. </span> : null}{t.title}</span>
      <span className="cv-row__meta"><span className="cv-row__time">{listTime(t)}</span><i className="cv-row__dot" aria-hidden /></span>
    </>
  );
  const cls = cn("cv-row", dot && "cv-row--unread");
  return active ? <div className={cls} aria-current="true">{inner}</div> : <Link href={href} className={cls}>{inner}</Link>;
}

function Message({ m, fileLink, showDay }: { m: ThreadMsg; fileLink?: string; showDay: boolean }) {
  const own = m.by === ME;
  const time = m.at ? (showDay ? `${dayLabel(m.at)}, ${clockOf(m.at)}` : clockOf(m.at)) : m.clock ?? "";
  const name = own ? "You" : nameOf(m.by);
  const open = m.file ? (m.file.href ?? fileLink) : undefined;
  return (
    <li className="cv-item">
      <div className={cn("cv-msg", own && "cv-msg--own")}>
        {own ? null : <Face id={m.by} size={36} />}
        <div className="cv-msg__col">
          <div className="cv-msg__meta">{own ? <><span className="cv-msg__time">{time}</span><span className="cv-msg__name">{name}</span></> : <><span className="cv-msg__name">{name}</span><span className="cv-msg__time">{time}</span></>}</div>
          <p className="cv-bubble">{m.text}</p>
        </div>
      </div>
      {m.file ? (
        <div className="cv-embed">
          <div className="cv-embed__card cv-file">
            <span className="cv-tile" aria-hidden><FileText size={16} strokeWidth={1.5} /></span>
            <span className="cv-file__text"><span className="cv-file__name">{m.file.name}</span><span className="cv-file__meta">{m.file.meta}</span></span>
            {open ? <Link href={open} className="cv-file__open" aria-label={`Open ${m.file.name}`} target={open.startsWith("http") ? "_blank" : undefined} rel={open.startsWith("http") ? "noreferrer" : undefined}>Open</Link> : null}
          </div>
        </div>
      ) : null}
      {m.decision ? (
        <div className="cv-embed">
          <Link href={m.decision.href} className="cv-embed__card cv-dec">
            <span className="cv-dec__label">DECISION</span>
            <span className="cv-dec__title">{m.decision.title}</span>
            <span className="cv-dec__status"><Dot tone="accent" size={8} />{m.decision.status}</span>
            <span className="cv-dec__link">Review decision</span>
          </Link>
        </div>
      ) : null}
    </li>
  );
}

/** The next meeting, in the team's conversation (mt-join). */
function MeetingJoin({ projectId }: { projectId: string }) {
  const { session } = useNextSession(projectId);
  if (session.status === "none") return null;
  return (
    <li className="cv-item">
      <div className="cv-embed cv-embed--join">
        <div className="mt-join" role="group" aria-label="Meeting">
          <div className="mt-join__main">
            <span className="mt-join__icon" aria-hidden><Video size={18} strokeWidth={1.5} /></span>
            <div className="mt-join__text"><span className="mt-join__title">{session.name}</span><span className="mt-join__meta">{session.status === "ongoing" ? `Started ${session.startedAt}, ${session.minutes} min` : `${session.when}, ${session.minutes} min`}</span></div>
          </div>
          <Button size="sm" href={`${workspaceHref(projectId)}/meet`}>Join</Button>
        </div>
      </div>
    </li>
  );
}

/** The Meet menu (k-menu): start now, or schedule for later. */
function MeetMenu({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { startNow } = useNextSession(projectId);
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; min: number; up: boolean } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = (refocus = true) => { setOpen(false); setPos(null); if (refocus) requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true })); };
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const t = trigger.current, m = menu.current;
      if (!t) return;
      const r = t.getBoundingClientRect(), h = m?.offsetHeight ?? 0, w = m?.offsetWidth ?? r.width;
      const up = h > 0 && r.bottom + 8 + h > window.innerHeight && r.top - 8 - h > 0;
      const left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8));
      setPos({ top: up ? r.top - 8 - h : r.bottom + 8, left, min: r.width, up });
    };
    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { const t = e.target as Node; if (!menu.current?.contains(t) && !trigger.current?.contains(t)) close(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", esc); };
  }, [open]);
  const items = () => Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  useEffect(() => { if (open && pos) items()[0]?.focus({ preventScroll: true }); }, [open, pos === null]); // eslint-disable-line react-hooks/exhaustive-deps -- focus once placed
  const keys = (e: React.KeyboardEvent) => {
    const list = items(), i = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") { e.preventDefault(); list[(i + 1) % list.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); list[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); list[list.length - 1]?.focus(); }
    else if (e.key === "Tab") close(false);
  };
  const choose = [
    { label: "Start a meeting now", description: "Meet with the team right away.", run: () => { startNow(); router.push(`${workspaceHref(projectId)}/meet`); } },
    { label: "Schedule for later", description: "Pick a time and invite the team.", run: () => setSchedule(true) },
  ];
  return (
    <>
      <span className="k-menu-anchor" data-open={open || undefined} onKeyDown={(e) => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); } }}>
        <Button ref={trigger} variant="secondary" size="sm" iconRight={<ChevronDown size={20} strokeWidth={1.4} />} aria-expanded={open} aria-haspopup="menu" aria-controls={open ? id : undefined} onClick={() => (open ? close(false) : setOpen(true))}>Meet</Button>
      </span>
      {open ? createPortal(
        <div ref={menu} id={id} role="menu" className={cn("k-menu", "k-menu--end", pos?.up && "k-menu--up")} data-state="open" data-k-overlay="" style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, minWidth: Math.max(pos?.min ?? 0, 200), visibility: pos ? "visible" : "hidden" }} onKeyDown={keys}>
          {choose.map((c) => (
            <button key={c.label} type="button" role="menuitem" className="k-menu__item" tabIndex={-1} onClick={() => { close(true); c.run(); }}>
              <span className="k-menu__label">{c.label}<span className="k-menu__desc">{c.description}</span></span>
            </button>
          ))}
        </div>,
        document.body,
      ) : null}
      <ScheduleDialog projectId={projectId} open={schedule} onClose={() => setSchedule(false)} />
    </>
  );
}

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [draft, setDraft] = useState("");
  const field = useRef<HTMLInputElement>(null);
  return (
    <form className="cv-composer" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { onSend(draft.trim()); setDraft(""); field.current?.focus(); } }} noValidate>
      <IconButton label="Attach file" variant="secondary" className="cv-composer__attach"><Paperclip strokeWidth={1.5} /></IconButton>
      <input ref={field} className="cv-composer__field" type="text" value={draft} placeholder="Write to the team" aria-label="Write to the team" autoComplete="off" onChange={(e) => setDraft(e.target.value)} />
      <Button type="submit" arrow="up-right">Send</Button>
    </form>
  );
}

function lineOf(t: Thread, people: number) {
  if (t.kind === "work" && t.deliverable) return `${people} people, linked to ${lcFirst(t.deliverable.title)}`;
  if (t.kind === "decision" && t.decision) return `${people} people, decision ${DECISION_STATUS[t.decision.status].toLowerCase()}`;
  if (t.id === "team") return `${people} people, the whole project team`;
  return `${people} people, ${KIND_LINE[t.kind].toLowerCase()}`;
}

function ThreadView({ projectId, t, members, fileLink, onSend, onInfo }: { projectId: string; t: Thread; members: WorkspaceMember[]; fileLink: (name: string) => string | undefined; onSend: (text: string) => void; onInfo: () => void }) {
  const list = useRef<HTMLOListElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    list.current?.lastElementChild?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [t.messages.length]);
  const start = t.messages[0]?.at;
  const others = members.filter((m) => m.id !== ME).slice(0, 3);
  return (
    <section className="cv-thread" aria-label={t.title}>
      <header className="cv-thread__head">
        <div className="cv-thread__who">
          <span className="cv-stack" aria-hidden>{others.map((m) => <Face key={m.id} id={m.id} size={32} className="cv-stack__face" />)}</span>
          <div className="cv-thread__text"><h2 className="cv-thread__title">{t.title}</h2><p className="cv-thread__line">{lineOf(t, members.length)}</p></div>
        </div>
        <div className="cv-thread__actions">
          <MeetMenu projectId={projectId} />
          <IconButton label="Conversation info" variant="secondary" size="sm" className="cv-info-btn" aria-haspopup="dialog" onClick={onInfo}><Info strokeWidth={1.5} /></IconButton>
        </div>
      </header>
      <div className="cv-feed">
        {start ? <p className="cv-date">{dayLabel(start)}</p> : null}
        <ol className="cv-msgs" ref={list} aria-label="Messages">
          {t.messages.map((m) => <Message key={m.id} m={m} fileLink={m.file ? fileLink(m.file.name) : undefined} showDay={!!m.at && !!start && midnight(m.at) !== midnight(start)} />)}
          {t.id === "team" ? <MeetingJoin projectId={projectId} /> : null}
        </ol>
      </div>
      <Composer onSend={onSend} />
    </section>
  );
}

const STATUS_WORDS: Record<Deliverable["status"], string> = { todo: "Not started", doing: "In progress", review: "Waiting for review", changes: "Changes asked for", approved: "Approved" };

function InfoPanel({ projectId, t, members, files, open, onClose }: { projectId: string; t: Thread; members: WorkspaceMember[]; files: { name: string; meta: string }[]; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { startNow } = useNextSession(projectId);
  const d = t.deliverable, dec = t.decision;
  const linked = d
    ? { title: d.title, status: d.status === "review" && d.approver === ME ? "Needs your review" : STATUS_WORDS[d.status], href: workHref(projectId, d), action: "Open work" }
    : dec ? { title: dec.title, status: DECISION_STATUS[dec.status], href: `${workspaceHref(projectId, "decisions")}/${dec.slug}`, action: "Open decision" } : null;
  return (
    <Drawer open={open} onClose={onClose} eyebrow="CONVERSATION" label={t.title} flush className="cd-slide" footer={<>
      <Button onClick={() => { startNow(); router.push(`${workspaceHref(projectId)}/meet`); }}>Start meeting</Button>
      <Button variant="secondary" onClick={onClose}>Close</Button>
    </>}>
      <div className="cv-info" tabIndex={-1} data-autofocus>
        <div className="cv-info__id"><h2 className="cv-info__title">{t.title}</h2><p className="cv-info__kind">{KIND_LINE[t.kind]}</p></div>
        {linked ? (
          <section className="cv-info__block" aria-label="Linked work">
            <p className="cv-info__label">LINKED WORK</p>
            <div className="cv-info__card">
              <p className="cv-info__work">{linked.title}</p>
              <p className="cv-info__status"><Dot tone="accent" size={8} />{linked.status}</p>
              <Link href={linked.href} className="cv-info__link">{linked.action}</Link>
            </div>
          </section>
        ) : null}
        <section className="cv-info__block" aria-label="Members">
          <p className="cv-info__label">MEMBERS</p>
          <ul className="cv-info__people">
            {members.map((m) => (
              <li className="cv-person" key={m.id}>
                <Face id={m.id} size={40} />
                <span className="cv-person__text"><span className="cv-person__name">{m.you ? `${m.name} (You)` : m.name}</span><span className="cv-person__role">{m.role}</span></span>
                <span className="cv-person__dot"><Dot tone={AVAILABILITY_TONE[m.availability]} size={8} /><span className="sr-only">{AVAILABILITY_TEXT[m.availability]}</span></span>
              </li>
            ))}
          </ul>
        </section>
        {files.length ? (
          <section className="cv-info__block" aria-label="Shared files">
            <p className="cv-info__label">SHARED FILES</p>
            <ul className="cv-info__files">
              {files.map((f) => (
                <li className="cv-sfile" key={f.name}>
                  <span className="cv-tile cv-tile--sm" aria-hidden><FileText size={16} strokeWidth={1.5} /></span>
                  <span className="cv-file__text"><span className="cv-file__name">{f.name}</span><span className="cv-file__meta">{f.meta}</span></span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Drawer>
  );
}

function StartModal({ open, placeholder, onClose, onStart }: { open: boolean; placeholder: string; onClose: () => void; onStart: (v: { kind: ThreadKind; title: string; message: string }) => void }) {
  const [type, setType] = useState<(typeof THREAD_TYPES)[number]>("Work");
  const [title, setTitle] = useState(""), [message, setMessage] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh form each time it opens
  useEffect(() => { if (open) { setType("Work"); setTitle(""); setMessage(""); } }, [open]);
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="NEW CONVERSATION" title="What do you want to discuss?" description="Choose what it is about so the right people see it." footer={<><Button type="submit" form="cv-start-form">Start conversation</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="cv-start-form" className="cw-form" onSubmit={(e) => { e.preventDefault(); onStart({ kind: type.toLowerCase() as ThreadKind, title, message }); }} noValidate>
        <div className="cw-form__group" role="group" aria-labelledby="cv-type-label">
          <span className="cw-form__label" id="cv-type-label">Type</span>
          <div className="cw-chips">{THREAD_TYPES.map((x) => <Chip key={x} selected={type === x} onClick={() => setType(x)}>{x}</Chip>)}</div>
        </div>
        <Field label="Conversation name" hint="A few words are enough."><Input value={title} placeholder={placeholder} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="First message" hint="Your team will be notified."><Input value={message} placeholder="Say what this conversation is for." onChange={(e) => setMessage(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

export default function Conversations({ projectId, threadId }: { projectId: string; threadId?: string }) {
  const router = useRouter();
  const { ws, files } = useProjectFiles(projectId);
  const th = useThreads(ws.project);
  const [startOpen, setStartOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const current = (threadId ? th.get(threadId) : undefined) ?? th.threads[0];
  const { markRead } = th;
  useEffect(() => { if (current && th.ready) markRead(current); }, [current?.id, current?.lastAt, th.ready]); // eslint-disable-line react-hooks/exhaustive-deps -- mark read as it opens
  if (!ws.project) return null;
  const p = ws.project;
  const empty = th.threads.every((t) => t.messages.length === 0);
  const placeholder = `For example, ${(p.deliverables ?? []).find((d) => d.status !== "approved")?.title ?? p.tasks[0]?.title ?? "Next steps"}`;
  const fileLink = (name: string) => { const f = files.find((x) => x.name === name); return f ? fileHref(projectId, f) : undefined; };
  const sharedFiles = !current ? [] : current.deliverable
    ? files.filter((f) => f.source.kind === "proof" && f.source.deliverableId === current.deliverable!.id).map((f) => ({ name: f.name, meta: f.size ? `${f.type}, ${fileSize(f.size)}` : f.type }))
    : current.decision ? current.decision.files : [];

  return (
    <WorkspaceFrame projectId={projectId} active="conversations" wide>
      <div className={cn("cv-chat", empty && "cv-chat--empty")} data-m="up">
        <section className="cv-list" aria-labelledby="cv-list-title">
          <header className="cv-list__head">
            <h1 className="cv-list__title" id="cv-list-title">Conversations</h1>
            <IconButton label="New conversation" variant="secondary" size="sm" className="cv-new" aria-haspopup="dialog" onClick={() => setStartOpen(true)}><Plus strokeWidth={1.5} /></IconButton>
          </header>
          {empty ? null : (
            <ul className="cv-list__rows" aria-label="Conversations">
              {th.threads.map((t) => <li key={t.id}><Row t={t} href={threadHref(projectId, t.id)} active={t.id === current?.id} unread={th.unread(t)} /></li>)}
            </ul>
          )}
        </section>
        {empty || !current ? (
          <div className="cv-empty">
            <span className="cv-empty__icon" aria-hidden><MessageSquare size={24} strokeWidth={1.5} /></span>
            <h2 className="cv-empty__title">Every collaboration starts with a conversation.</h2>
            <p className="cv-empty__text">Start a discussion with your team.</p>
            <Button arrow="up-right" onClick={() => setStartOpen(true)} aria-haspopup="dialog">Start conversation</Button>
          </div>
        ) : (
          <ThreadView key={current.id} projectId={projectId} t={current} members={ws.members} fileLink={fileLink} onSend={(text) => th.send(current, text)} onInfo={() => setInfoOpen(true)} />
        )}
      </div>
      <StartModal open={startOpen} placeholder={placeholder} onClose={() => setStartOpen(false)} onStart={(v) => {
        setStartOpen(false);
        const id = th.start(v);
        router.push(threadHref(projectId, id));
        toast.show({ message: "Conversation started. Your team has been notified.", actionLabel: "Undo", duration: TOAST_MS, onAction: () => { th.remove(id); router.push(threadHref(projectId)); } });
      }} />
      {current && !empty ? <InfoPanel projectId={projectId} t={current} members={ws.members} files={sharedFiles} open={infoOpen} onClose={() => setInfoOpen(false)} /> : null}
    </WorkspaceFrame>
  );
}
