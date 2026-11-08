"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/kin/Button";
import { Field, Input } from "@/components/kin/Field";
import { Drawer, Empty, Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { faceSrc } from "@/components/kin/home/parts";
import { ME } from "@/lib/collab/me";
import { useNextSession } from "@/lib/collab/session";
import { skillsOf, useTeam } from "@/lib/collab/team";
import { AVAILABILITY_TEXT, useWorkspace, workspaceHref, type Availability } from "@/lib/collab/workspace";
import type { Project } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { Dot, PageHead, WorkspaceFrame } from "./Frame";
import { Band, Metric, Metrics } from "./blocks";
import { InterestBand, useInterestRequests } from "./InterestRequests";
import { CwLink, IconUpRight } from "./parts";
import "../styles/team.css";

/*
 * The project workspace's Team page, mirrored from the product design (classes pt-* in ../styles/team.css):
 * the head with members and interest requests, each request with Accept and Not now, the member cards, the
 * member panel (cd-member), and the invite and not-now dialogs. Members come from the project (useWorkspace);
 * interest requests from ./InterestRequests (the call's applications) and invitations from lib/collab/team.
 */

const NUM = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const num = (n: number) => NUM[n] ?? String(n);
const TONE: Record<Availability, "green" | "accent" | "gray"> = { available: "green", working: "accent", away: "gray" };
const TOAST_MS = 2500;
const filled = (v: string) => (v.trim() ? "pt-filled" : undefined);

export const memberSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const memberHref = (projectId: string, name: string) => `${workspaceHref(projectId, "team")}/${memberSlug(name)}`;

/** Everyone on the team as the cards show them: the project's members, then people accepted from requests. */
export type TeamPerson = { id: PersonId; name: string; initials: string; role: string; cardRole: string; contribution: string; availability: Availability; you: boolean; owner: boolean };

export function useTeamPeople(projectId: string) {
  const ws = useWorkspace(projectId);
  const team = useTeam(projectId);
  const people = useMemo<TeamPerson[]>(() => {
    if (!ws.project) return [];
    const p = ws.project;
    const base = ws.members.map((m) => {
      const contribution = p.members.find((x) => x.id === m.id)?.contribution ?? m.role;
      const role = m.owner ? (/^(host|owner)$/i.test(m.role) ? "Owner" : `Owner and ${m.role}`) : m.role;
      return { id: m.id, name: m.name, initials: m.initials, role: m.role, cardRole: role, contribution, availability: m.availability, you: m.you, owner: m.owner };
    });
    const extra = team.joined.filter((r) => !base.some((b) => b.id === r.person)).map((r) => {
      const name = PEOPLE[r.person]?.name ?? "A member";
      return { id: r.person, name, initials: name.split(/\s+/).slice(0, 2).map((w) => w[0]!.toUpperCase()).join(""), role: r.wants, cardRole: r.wants, contribution: r.message, availability: "away" as Availability, you: false, owner: false };
    });
    return [...base, ...extra];
  }, [ws.project, ws.members, team.joined]);
  return { ws, team, people };
}

/** The latest thing someone did on the project, for the member panel. */
function recentOf(p: Project, id: PersonId) {
  const d = (p.deliverables ?? []).flatMap((x) => x.thread.filter((t) => t.by === id).map((t) => ({ at: t.at, text: t.kind === "submitted" ? `Sent "${x.title}" for review.` : t.kind === "approved" ? `Approved "${x.title}".` : t.text })));
  const l = p.ledger.filter((x) => x.who === id).map((x) => ({ at: x.at, text: `${x.what}.` }));
  return [...d, ...l].sort((a, b) => b.at - a.at)[0]?.text;
}

/** The member panel (cd-member in a cd-slide drawer): who they are, their skills, their latest work. */
export function MemberPanel({ projectId, person, open, onClose }: { projectId: string; person: TeamPerson | null; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const ws = useWorkspace(projectId);
  const { startNow } = useNextSession(projectId);
  const [last, setLast] = useState(person);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the last person while the panel closes
  useEffect(() => { if (person) setLast(person); }, [person]);
  const m = person ?? last;
  if (!m || !ws.project) return null;
  const photo = faceSrc(m.id, 960);
  const recent = recentOf(ws.project, m.id);
  return (
    <Drawer open={open} onClose={onClose} eyebrow="MEMBER" label={m.name} flush className="cd-slide" footer={<>
      {m.you ? null : <Button size="sm" href={`/messages/${m.id}`}>Message</Button>}
      <Button size="sm" variant="secondary" onClick={() => { startNow(); router.push(`${workspaceHref(projectId)}/meet`); }}>Start meeting</Button>
      <CwLink href={memberHref(projectId, m.name)}>Open full profile</CwLink>
    </>}>
      <div className="cd-member">
        {/* eslint-disable-next-line @next/next/no-img-element -- member photo */}
        {photo ? <div className="cd-member__photo"><img src={photo} alt="" decoding="async" /></div> : null}
        <div className="cd-member__body">
          <div className="cd-member__id">
            <h2 className="cd-member__name">{m.name}</h2>
            <p className="cd-member__role">{m.cardRole}</p>
            <p className="cd-member__status"><Dot tone={TONE[m.availability]} size={7} />{AVAILABILITY_TEXT[m.availability]}</p>
          </div>
          <section className="cd-member__block"><p className="cw-over">ABOUT</p><p>{m.contribution}</p></section>
          {skillsOf(m.id).length ? <section className="cd-member__block"><p className="cw-over">SKILLS</p><ul className="cd-chips" aria-label="Skills">{skillsOf(m.id).map((s) => <li key={s}>{s}</li>)}</ul></section> : null}
          {recent ? <section className="cd-member__block"><p className="cw-over">RECENT CONTRIBUTION</p><p>{recent}</p></section> : null}
        </div>
      </div>
    </Drawer>
  );
}

export function SkillList({ labels, wrap }: { labels: { label: string; used?: boolean }[]; wrap?: boolean }) {
  return (
    <ul className={cn("pt-skills", wrap && "pt-skills--wrap")} aria-label="Skills">
      {labels.map((s) => (
        <li key={s.label}>
          <button type="button" className={cn("pt-skill", s.used && "pt-skill--used")}>
            {s.used ? <><i className="pt-skill__dot" aria-hidden /><span className="sr-only">Used in project work: </span></> : null}
            {s.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

function MemberCard({ m, wide, onOpen }: { m: TeamPerson; wide: boolean; onOpen: () => void }) {
  const [first, ...rest] = skillsOf(m.id);
  const photo = faceSrc(m.id, wide ? 1404 : 684);
  return (
    <button type="button" className={wide ? "pt-mcard pt-mcard--wide" : "pt-mcard"} onClick={onOpen} aria-haspopup="dialog">
      <span className="pt-mcard__media">
        {/* eslint-disable-next-line @next/next/no-img-element -- member photo */}
        <span className="pt-mcard__img">{photo ? <img src={photo} alt="" width={wide ? 702 : 342} height={430} loading="lazy" decoding="async" data-crop={wide ? "top" : undefined} /> : <span className="pt-mcard__initials">{m.initials}</span>}</span>
        <span className="pt-mcard__go" aria-hidden><IconUpRight size={18} /></span>
      </span>
      <span className="pt-mcard__info">
        <span className="pt-mcard__name">{m.you ? `${m.name} (you)` : m.name}</span>
        <span className="pt-mcard__role">{m.cardRole}</span>
        <span className="pt-mcard__skills">{first ? <span className="pt-mcard__tag">{first}</span> : null}{rest.length ? <span className="pt-mcard__more">+{rest.length}</span> : null}</span>
      </span>
      <span className="sr-only">Open {m.name}</span>
    </button>
  );
}

function InviteModal({ open, onClose, onSend }: { open: boolean; onClose: () => void; onSend: (v: { to: string; role: string; message: string }) => void }) {
  const [to, setTo] = useState(""), [role, setRole] = useState(""), [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh form each time it opens
  useEffect(() => { if (open) { setTo(""); setRole(""); setMessage(""); setError(""); } }, [open]);
  const submit = (e?: React.FormEvent) => { e?.preventDefault(); if (!to.trim()) { setError("Add a name or email."); return; } onSend({ to: to.trim(), role: role.trim(), message: message.trim() }); };
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="INVITE COLLABORATOR" title="Who would you like to invite?" description="Invite someone by name or email. They choose whether to join." footer={<><Button type="submit" form="pt-invite-form">Send invitation</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="pt-invite-form" className="cw-form pt-form" onSubmit={submit} noValidate>
        <Field label="Name or email" hint="They will receive an invitation." error={error || undefined}><Input className={filled(to)} value={to} placeholder="For example, name@example.com" onChange={(e) => { setTo(e.target.value); setError(""); }} /></Field>
        <Field label="Role" hint="The role you have in mind for them."><Input className={filled(role)} value={role} placeholder="For example, Product Designer" onChange={(e) => setRole(e.target.value)} /></Field>
        <Field label="Message" hint="Optional."><Input className={filled(message)} value={message} placeholder="Say why you would like them to join." onChange={(e) => setMessage(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

export default function Team({ projectId }: { projectId: string }) {
  const { ws, team, people } = useTeamPeople(projectId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [panel, setPanel] = useState<TeamPerson | null>(null);
  const ir = useInterestRequests({ callId: ws.project?.callId, projectId });
  if (!ws.project) return null;
  const empty = people.length <= 1;
  const pending = ir.requests;
  const me = people.find((x) => x.id === ME);


  return (
    <WorkspaceFrame projectId={projectId} active="team" rail={empty ? "short" : "full"}>
      <div className={empty ? "pt-page pt-page--empty" : "pt-page"}>
        <PageHead label="TEAM" title="The people behind the work." lead="Understand the strengths, roles and contributions that bring this project together.">
          <Metrics>
            <Metric label="MEMBERS" value={people.length} caption={people.length === 1 ? "just you" : "people"} />
            <Metric label="INTEREST REQUESTS" value={pending.length} caption={pending.length ? "waiting" : "none waiting"} dot={pending.length > 0} />
          </Metrics>
          <div className="cw-actions cw-actions--btns">
            <Button onClick={() => setInviteOpen(true)} aria-haspopup="dialog">Invite collaborator</Button>
            <Button variant="secondary" href={ws.href("agreements")}>View team agreements</Button>
            {!empty && me ? <CwLink href={`${memberHref(projectId, me.name)}#mb-history`}>View contribution history</CwLink> : null}
          </div>
        </PageHead>
        {empty ? (
          <div data-m="up">
            <Empty className="cw-empty" title="Every project starts with someone." text="Invite collaborators when you’re ready to build together." action={<Button arrow="up-right" onClick={() => setInviteOpen(true)} aria-haspopup="dialog">Invite collaborator</Button>} />
          </div>
        ) : (
          <>
            <InterestBand ir={ir} />
            <Band label="TEAM MEMBERS" title={`${num(people.length)} people, one project.`} support="Availability is shown only when a member chooses to share it.">
              <ul className="pt-grid">
                {people.map((m, i) => <li key={m.id}><MemberCard m={m} wide={people.length % 2 === 1 && i === people.length - 1} onOpen={() => setPanel(m)} /></li>)}
              </ul>
            </Band>
          </>
        )}
      </div>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onSend={(v) => {
        setInviteOpen(false);
        const inv = team.invite(v);
        toast.show({ message: "Invitation sent. You will see their reply here.", actionLabel: "Undo", duration: TOAST_MS, onAction: () => team.uninvite(inv.id) });
      }} />
      <MemberPanel projectId={projectId} person={panel} open={!!panel} onClose={() => setPanel(null)} />
    </WorkspaceFrame>
  );
}

