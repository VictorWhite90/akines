"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Video } from "lucide-react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Field, Input, Select } from "@/components/kin/Field";
import { Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { faceSrc } from "@/components/kin/home/parts";
import { ME } from "@/lib/collab/me";
import { useDecisions } from "@/lib/collab/decisions";
import { SESSION_LENGTHS, SESSION_TIMES, useNextSession, type Session } from "@/lib/collab/meetings";
import { useTasks } from "@/lib/collab/tasks";
import { AVAILABILITY_TONE, AVAILABILITY_WORD, useWorkspace, workspaceHref, type WorkspaceMember } from "@/lib/collab/workspace";
import { PEOPLE } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { MemberPanel, useTeamPeople } from "./Team";
import { CwLink, Dot, IconChevron, IconDoc, IconUpRight, Portrait, ago } from "./parts";
import "../styles/workspace.css";
import "../styles/meeting-card.css";

/*
 * The project rail, mirrored from the product design (cd-rail in ../styles/workspace.css, mt-card in
 * meeting-card.css): the next session, the team's availability (each opens the member's sheet), what is waiting
 * for the member's review, and everyone's open tasks. "short" shows only the session and the team.
 */

const meetHref = (id: string) => `${workspaceHref(id)}/meet`;

/** The next-session card: coming up, happening now, or none yet (start now or schedule). */
export function MeetingCard({ projectId, empty }: { projectId: string; empty?: boolean }) {
  const router = useRouter();
  const ws = useWorkspace(projectId);
  const { session, startNow } = useNextSession(projectId);
  const [scheduling, setScheduling] = useState(false);
  const people = ws.project ? ws.members.length : 0;
  void empty;
  if (session.status === "ongoing") {
    const here = (ws.project ? ws.members : []).filter((m) => !m.you).slice(0, 3);
    return (
      <section className="mt-card mt-card--ongoing" aria-label="Meeting happening now">
        <div className="mt-card__top">
          <span className="mt-tile mt-tile--dark" aria-hidden><Video size={20} strokeWidth={1.5} /></span>
          <div className="mt-card__text">
            <p className="mt-eyebrow"><Dot tone="green" size={6} />HAPPENING NOW</p>
            <h3 className="mt-title">{session.name}</h3>
            <p className="mt-sub">Started {session.startedAt}, {here.length} people here</p>
          </div>
        </div>
        <div className="mt-card__foot">
          <span className="mt-faces" aria-hidden>{here.map((m) => <Portrait key={m.id} src={faceSrc(m.id)} size={32} initials={m.initials} />)}</span>
          <Button size="sm" href={meetHref(projectId)}>Join meeting</Button>
        </div>
      </section>
    );
  }
  if (session.status === "upcoming") {
    return (
      <section className="mt-card" aria-label="Next session">
        <div className="mt-card__top">
          <span className="mt-tile mt-tile--date" aria-hidden><span className="mt-tile__day">{session.day}</span><span className="mt-tile__time">{session.time}</span></span>
          <div className="mt-card__text">
            <p className="mt-eyebrow"><Dot size={6} />NEXT SESSION</p>
            <h3 className="mt-title">{session.name}</h3>
            <p className="mt-sub">{session.minutes} min, {people} people</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" full iconRight={<IconUpRight />} href={meetHref(projectId)}>View meeting</Button>
      </section>
    );
  }
  return (
    <section className="mt-card" aria-label="No meeting yet">
      <div className="mt-card__top">
        <span className="mt-tile mt-tile--grey" aria-hidden><Video size={20} strokeWidth={1.5} /></span>
        <div className="mt-card__text">
          <p className="mt-eyebrow"><Dot tone="gray" size={6} />NO MEETING YET</p>
          <h3 className="mt-title">Meet with the team</h3>
          <p className="mt-sub">Start now or pick a time.</p>
        </div>
      </div>
      <div className="mt-card__buttons">
        <Button size="sm" onClick={() => { startNow(); router.push(meetHref(projectId)); }}>Start meeting</Button>
        <Button size="sm" variant="secondary" onClick={() => setScheduling(true)} aria-haspopup="dialog">Schedule</Button>
      </div>
      <ScheduleDialog projectId={projectId} open={scheduling} onClose={() => setScheduling(false)} />
    </section>
  );
}

/** "When should the team meet?" */
export function ScheduleDialog({ projectId, open, onClose, name }: { projectId: string; open: boolean; onClose: () => void; name?: string }) {
  const { session, schedule, restore } = useNextSession(projectId);
  const initial = name ?? (session.status === "none" ? "Team meeting" : session.name);
  const [minutes, setMinutes] = useState(45);
  const [title, setTitle] = useState(initial);
  const [at, setAt] = useState(SESSION_TIMES[0]);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setMinutes(45); setTitle(initial); setAt(SESSION_TIMES[0]); } }
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const before: Session = session;
    schedule({ name: title, minutes, when: at });
    onClose();
    toast.show({ message: `Meeting scheduled for ${at}.`, actionLabel: "Undo", duration: 4000, onAction: () => restore(before) });
  };
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="SCHEDULE A MEETING" title="When should the team meet?" description="Everyone on this project is invited."
      footer={<><Button type="submit" form="mt-schedule-form">Schedule meeting</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="mt-schedule-form" className="cw-form" onSubmit={submit} noValidate>
        <div className="cw-form__group" role="group" aria-labelledby="mt-length-label">
          <span className="cw-form__label" id="mt-length-label">Length</span>
          <div className="cw-chips">{SESSION_LENGTHS.map((m) => <Chip key={m} selected={minutes === m} onClick={() => setMinutes(m)}>{m} min</Chip>)}</div>
        </div>
        <Field label="Meeting name" hint="Shown to everyone who is invited."><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Date and time" hint="The team is notified in the conversation.">
          <Select className="mt-plain-select" value={at} onChange={(e) => setAt(e.target.value)}>{SESSION_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}</Select>
        </Field>
      </form>
    </Modal>
  );
}

function RailHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return <header className="cd-rail__head"><h3 className="cd-rail__title">{title}</h3>{right}</header>;
}

function Availability({ projectId }: { projectId: string }) {
  const ws = useWorkspace(projectId);
  const { people } = useTeamPeople(projectId);
  const [who, setWho] = useState<WorkspaceMember | null>(null);
  const [open, setOpen] = useState(false);
  if (!ws.project) return null;
  const count = (a: WorkspaceMember["availability"]) => ws.members.filter((m) => m.availability === a).length;
  return (
    <section className="cd-rail__block" aria-label="Team availability">
      <RailHead title="TEAM AVAILABILITY" right={<Link href={ws.href("team")} className="cd-rail__link">Team<IconUpRight size={14} /></Link>} />
      <ul className="cd-avail">
        {ws.members.map((m) => (
          <li key={m.id}>
            <button type="button" className="cd-avail__item" aria-haspopup="dialog" onClick={() => { setWho(m); setOpen(true); }}>
              <Portrait src={faceSrc(m.id)} size={56} tone={AVAILABILITY_TONE[m.availability]} initials={m.initials} />
              <span className="cd-avail__name">{m.name.split(" ")[0]}</span>
              <span className="cd-avail__word">{AVAILABILITY_WORD[m.availability]}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="cd-legend">
        <span><Dot tone="green" size={6} />{count("available")} available</span>
        <span><Dot size={6} />{count("working")} working</span>
        <span><Dot tone="gray" size={6} />{count("away")} away</span>
      </p>
      <MemberPanel projectId={projectId} person={people.find((x) => x.id === who?.id) ?? null} open={open} onClose={() => setOpen(false)} />
    </section>
  );
}

/** What waits for the member: work they review, then decisions they haven't acknowledged. */
export function useNeedsReview(projectId: string) {
  const ws = useWorkspace(projectId);
  const tasks = useTasks(ws.project, ws.collab);
  const decisions = useDecisions(projectId);
  const base = workspaceHref(projectId);
  const work = tasks.items.filter((t) => t.status === "In review" && t.reviewer === ME).map((t) => {
    const sent = [...t.comments].reverse().find((c) => c.by === t.owner)?.at;
    return { key: `work:${t.slug}`, kind: "file" as const, title: t.title, caption: `${PEOPLE[t.owner]?.name ?? "A member"}${sent ? `, ${ago(sent).toLowerCase()}` : ""}`, href: `${base}/tasks/${t.slug}`, at: sent ?? 0 };
  }).sort((a, b) => b.at - a.at);
  const dec = decisions.awaitingMe.map((d) => ({ key: `decision:${d.slug}`, kind: "decision" as const, title: d.title, caption: "Decision, waiting for you", href: `${base}/decisions/${d.slug}`, at: d.proposedAt }));
  return { work, decisions: dec, all: [...work, ...dec], tasks: tasks.items };
}

function NeedsReview({ projectId, hide }: { projectId: string; hide?: string[] }) {
  const { work, decisions } = useNeedsReview(projectId);
  // The rail lists the latest piece of work and the first decision, as the design does; `hide` drops a kind or one item.
  const rows = [...work.slice(0, 1), ...decisions.slice(0, 1)].filter((r) => !hide?.some((h) => h === r.kind || h === r.key));
  if (!rows.length) return null;
  return (
    <section className="cd-rail__block cd-rail__block--review" aria-label="Needs review">
      <RailHead title="NEEDS REVIEW" right={<span className="cd-badge">{rows.length}</span>} />
      <ul className="cd-review">
        {rows.map((r) => (
          <li key={r.key}>
            <Link href={r.href} className="cd-review__row">
              <span className="cd-review__icon"><IconDoc /></span>
              <span className="cd-review__text"><span className="cd-review__title">{r.title}</span><span className="cd-review__cap">{r.caption}</span></span>
              <IconChevron />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Workload({ projectId }: { projectId: string }) {
  const ws = useWorkspace(projectId);
  const { tasks } = useNeedsReview(projectId);
  if (!ws.project) return null;
  const open = (id: string) => tasks.filter((t) => t.owner === id && t.status !== "Completed").length;
  const top = Math.max(3, ...ws.members.map((m) => open(m.id)));
  return (
    <section className="cd-rail__block cd-rail__block--load" aria-label="Workload">
      <RailHead title="WORKLOAD" right={<span className="cd-rail__note">Open tasks</span>} />
      <ul className="cd-load">
        {ws.members.map((m) => {
          const n = open(m.id);
          return (
            <li key={m.id} className="cd-load__row">
              <Portrait src={faceSrc(m.id)} size={28} initials={m.initials} />
              <span className="cd-load__name">{m.name.split(" ")[0]}</span>
              <span className="cd-load__track" role="img" aria-label={`${n} open tasks`}><i style={{ width: `${Math.min(100, Math.round((n / top) * 100))}%` }} /></span>
              <span className="cd-load__n">{n}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The project rail (cd-rail). */
export default function WorkspaceRail({ projectId, variant, hide }: { projectId: string; variant: "full" | "short"; hide?: string[] }) {
  return (
    <div className={cn("cd-rail", variant === "short" && "cd-rail--short")}>
      <MeetingCard projectId={projectId} empty={variant === "short"} />
      <Availability projectId={projectId} />
      {variant === "full" ? <><NeedsReview projectId={projectId} hide={hide} /><Workload projectId={projectId} /></> : null}
    </div>
  );
}
