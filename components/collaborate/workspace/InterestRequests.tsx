"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/kin/Button";
import { Field, Input } from "@/components/kin/Field";
import { Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { faceSrc } from "@/components/kin/home/parts";
import { DEMO } from "@/lib/demo/mode";
import { fileSize, linkLook } from "@/lib/collab/proof";
import { skillsOf, useTeam } from "@/lib/collab/team";
import { useCollab } from "@/lib/collab/useCollab";
import type { AppStage, ProofFile, ProofLink } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { Band } from "./blocks";
import { CwLink, Dot } from "./parts";
import "../styles/pages.css";
import "../styles/team.css";

/*
 * Interest requests, as the design's Team page shows them (pt-req in ../styles/team.css): people who pressed
 * Express interest, with what they want to do and what they said, and the owner's Accept and Not now.
 * Interest is an application to the project's open call (useCollab `apps`), so these are the call's open
 * applications: Accept sends an offer (they join when they accept it), Not now lets them know with the owner's
 * message. Both can be undone from the toast. Demo projects without a call show lib/collab/team's seeded requests.
 * Used by the workspace Team page and, for a call with no workspace yet, by the host's view of the project page.
 */

const OPEN: AppStage[] = ["submitted", "viewed", "shortlisted", "conversation"];
const NUM = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const TOAST_MS = 2500;
const filled = (v: string) => (v.trim() ? "pt-filled" : undefined);
const sentOn = (at: number) => `Interest sent ${new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "Someone";

/** One request, from an application or a demo seed. */
export type InterestRequest = {
  key: string;
  person: PersonId;
  /** What they do. */
  role: string;
  /** The role they would like here. */
  wants: string;
  message: string;
  availability?: string;
  links: ProofLink[];
  files: ProofFile[];
  sentAt: number;
  appId?: string;
  seedId?: string;
};

/** The open requests for a project (by its call, or its seeded demo requests), and what the owner can do. */
export function useInterestRequests({ callId, projectId }: { callId?: string; projectId?: string }) {
  const collab = useCollab();
  const team = useTeam(projectId ?? "");
  const apps = useMemo(() => (callId ? collab.apps.filter((a) => a.callId === callId) : []), [collab.apps, callId]);
  const seeded = DEMO && !!projectId && apps.length === 0;

  const requests = useMemo<InterestRequest[]>(() => {
    if (seeded) return team.pending.map((r) => ({ key: r.id, person: r.person, role: r.role, wants: r.wants, message: r.message, links: [], files: [], sentAt: r.sentAt, seedId: r.id }));
    return apps.filter((a) => OPEN.includes(a.stage)).sort((a, b) => (b.history[0]?.at ?? 0) - (a.history[0]?.at ?? 0)).map((a) => ({
      key: a.id, person: a.applicant, role: PEOPLE[a.applicant]?.role ?? "", wants: a.role, message: a.statement, availability: a.availability,
      links: a.links ?? [], files: a.files ?? [], sentAt: a.history[0]?.at ?? 0, appId: a.id,
    }));
  }, [seeded, team.pending, apps]);

  /** The latest answer the owner gave, for the line under the band once nobody is waiting. */
  const latest = useMemo(() => {
    if (seeded) return team.latest ? { person: team.latest.person, wants: team.latest.wants, accepted: team.latest.status === "accepted" } : null;
    const answered = apps.filter((a) => a.stage === "offer" || a.stage === "joined" || a.stage === "not-selected").sort((a, b) => (b.history.at(-1)?.at ?? 0) - (a.history.at(-1)?.at ?? 0))[0];
    return answered ? { person: answered.applicant, wants: answered.role, accepted: answered.stage !== "not-selected", joined: answered.stage === "joined" } : null;
  }, [seeded, team.latest, apps]);

  // Seeing a new application counts as opening it: the applicant's status moves on to "viewed".
  const unseen = apps.filter((a) => a.stage === "submitted").map((a) => a.id).join(",");
  useEffect(() => {
    if (!unseen) return;
    for (const id of unseen.split(",")) collab.setAppStage(id, "viewed", { note: "You opened the application." });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per newly seen application
  }, [unseen]);

  const stageOf = (appId: string) => collab.apps.find((a) => a.id === appId)?.stage;
  return {
    requests,
    latest,
    accept: (r: InterestRequest) => {
      const name = nameOf(r.person);
      if (r.seedId) {
        team.accept(r.seedId);
        toast.show({ message: `Request accepted. ${name} is on the team.`, actionLabel: "Undo", duration: TOAST_MS, onAction: () => team.reopen(r.seedId!) });
        return;
      }
      const before = stageOf(r.appId!);
      collab.setAppStage(r.appId!, "offer", { note: `You offered them the ${r.wants} role.` });
      toast.show({ message: `Request accepted. ${name} joins when they accept.`, actionLabel: "Undo", duration: TOAST_MS, onAction: () => { if (before && stageOf(r.appId!) === "offer") collab.setAppStage(r.appId!, before, { note: "You took the offer back." }); } });
    },
    notNow: (r: InterestRequest, message: string) => {
      const name = nameOf(r.person);
      if (r.seedId) {
        team.notNow(r.seedId, message);
      } else {
        const before = stageOf(r.appId!);
        collab.setAppStage(r.appId!, "not-selected", { feedback: message.trim() || `Thank you, ${name.split(" ")[0]}. Now is not the right time for us to add someone.`, note: "You let them know: not now." });
        toast.show({ message: `Response sent. ${name} will see it.`, actionLabel: "Undo", duration: TOAST_MS, onAction: () => { if (before) collab.setAppStage(r.appId!, before, { note: "You took your reply back." }); } });
        return;
      }
      toast.show({ message: `Response sent. ${name} will see it.`, actionLabel: "Undo", duration: TOAST_MS, onAction: () => team.reopen(r.seedId!) });
    },
  };
}

function Sent({ links, files }: { links: ProofLink[]; files: ProofFile[] }) {
  return (
    <p className="pt-req__value pt-req__value--msg">
      {links.map((l, i) => {
        const k = linkLook(l);
        return <span key={l.url}>{i ? ", " : null}<a className="cw-link" href={l.url} target="_blank" rel="noopener noreferrer"><span className="cw-link__label">{l.note ?? k.label}</span></a></span>;
      })}
      {files.map((f, i) => <span key={f.id}>{links.length || i ? ", " : null}{f.kind === "cv" ? "CV, " : null}{f.name} ({fileSize(f.size)})</span>)}
    </p>
  );
}

function RequestCard({ r, onAccept, onNotNow }: { r: InterestRequest; onAccept: () => void; onNotNow: () => void }) {
  const name = nameOf(r.person);
  const photo = faceSrc(r.person, 112);
  const skills = skillsOf(r.person);
  const sent = r.links.length + r.files.length > 0;
  return (
    <article className="pt-req" aria-label={`Interest request from ${name}`}>
      <div className="pt-req__top">
        <div className="pt-req__person">
          {/* eslint-disable-next-line @next/next/no-img-element -- their face */}
          <span className="pt-photo" style={{ "--pt-ph": "56px" } as React.CSSProperties} aria-hidden>{photo ? <img src={photo} alt="" width={56} height={56} loading="lazy" decoding="async" /> : null}</span>
          <div className="pt-req__text"><h3 className="pt-req__name">{name}</h3><p className="pt-req__role">{r.role}</p></div>
        </div>
        <p className="pt-req__sent">{sentOn(r.sentAt)}</p>
      </div>
      {skills.length ? <ul className="pt-skills" aria-label="Skills">{skills.map((s) => <li key={s}><button type="button" className="pt-skill">{s}</button></li>)}</ul> : null}
      <div className="pt-rule" aria-hidden />
      <div className="pt-req__fields">
        <div className="pt-req__field"><p className="cw-over cw-over--12">WANTS TO JOIN AS</p><p className="pt-req__value">{r.wants}</p></div>
        <div className="pt-req__field pt-req__field--grow"><p className="cw-over cw-over--12">MESSAGE</p><p className="pt-req__value pt-req__value--msg">{r.message}</p></div>
      </div>
      {r.availability || sent ? (
        <div className="pt-req__fields">
          {r.availability ? <div className="pt-req__field"><p className="cw-over cw-over--12">AVAILABLE</p><p className="pt-req__value">{r.availability}</p></div> : null}
          {sent ? <div className={cn("pt-req__field", "pt-req__field--grow")}><p className="cw-over cw-over--12">THEIR WORK</p><Sent links={r.links} files={r.files} /></div> : null}
        </div>
      ) : null}
      <div className="pt-req__actions">
        <Button size="sm" onClick={onAccept}>Accept</Button>
        <Button size="sm" variant="secondary" onClick={onNotNow} aria-haspopup="dialog">Not now</Button>
      </div>
    </article>
  );
}

function NotNowModal({ open, name, onClose, onSend }: { open: boolean; name: string; onClose: () => void; onSend: (message: string) => void }) {
  const [message, setMessage] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh form each time it opens
  useEffect(() => { if (open) setMessage(""); }, [open]);
  const first = name.split(" ")[0];
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="NOT NOW" title={`Reply to ${first}?`} description={`This is not a no. ${first} will see that now is not the right time.`} footer={<><Button type="submit" form="pt-notnow-form">Send</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="pt-notnow-form" className="cw-form pt-form" onSubmit={(e) => { e.preventDefault(); onSend(message); }} noValidate>
        <Field label="To" hint="They will see your reply."><Input className="pt-filled" value={name} readOnly /></Field>
        <Field label="Message" hint="Optional."><Input className={filled(message)} value={message} placeholder="For example, We are not adding anyone just yet." onChange={(e) => setMessage(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

/** The INTEREST REQUESTS band: who is waiting, or the owner's latest answer. */
export function InterestBand({ ir }: { ir: ReturnType<typeof useInterestRequests> }) {
  const [notNow, setNotNow] = useState<InterestRequest | null>(null);
  const n = ir.requests.length;
  const l = ir.latest;
  const confirmation = !n && l ? (l.accepted ? (l.joined === false ? `Offer sent to ${nameOf(l.person)} as ${l.wants}. They join when they accept.` : `${nameOf(l.person)} joined the team as ${l.wants}.`) : `Response sent to ${nameOf(l.person)}.`) : null;
  return (
    <>
      <Band label="INTEREST REQUESTS" title={n ? (n === 1 ? "One person would like to join." : `${NUM[n] ?? n} people would like to join.`) : "No requests waiting."} support={n ? "People who pressed Express interest on this project. You decide who joins." : "When someone expresses interest in joining, you will see it here."}>
        {ir.requests.map((r) => <RequestCard key={r.key} r={r} onAccept={() => ir.accept(r)} onNotNow={() => setNotNow(r)} />)}
        {confirmation ? <p className="pt-confirm"><Dot tone="green" size={8} /><span>{confirmation}</span></p> : null}
      </Band>
      <NotNowModal open={!!notNow} name={notNow ? nameOf(notNow.person) : ""} onClose={() => setNotNow(null)} onSend={(message) => { const r = notNow; setNotNow(null); if (r) ir.notNow(r, message); }} />
    </>
  );
}

/** The band on its own, for the host's view of a project page (an open call that may have no workspace yet). */
export function HostInterest({ callId, projectId }: { callId: string; projectId?: string }) {
  const ir = useInterestRequests({ callId, projectId });
  return <InterestBand ir={ir} />;
}
