"use client";

import Link from "next/link";
import Pic from "@/components/home/Pic";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { APP_FLOW, JOURNEY, type AppStage, type Application, type CollabCall, type Project } from "@/lib/collab/types";
import { STAGE_LABEL } from "@/lib/collab/useCollab";
import type { PhotoKey } from "@/lib/data/images";
import { PEOPLE, type PersonId } from "@/lib/data/people";

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
export const firstName = (id: PersonId) => PEOPLE[id].name.split(" ")[0];
export function ago(at: number) {
  const s = Math.max(1, Math.round((Date.now() - at) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export function Thumb({ photo, sizes = "120px", className = "ph" }: { photo: PhotoKey; sizes?: string; className?: string }) {
  return <span className={className}><Pic name={photo} sizes={sizes} /></span>;
}

export function Faces({ ids, size = 28, max = 5 }: { ids: PersonId[]; size?: number; max?: number }) {
  return <span className="co-faces">{ids.slice(0, max).map((id) => <Avatar key={id} person={PEOPLE[id]} size={size} />)}</span>;
}

/** The seven stages of a collaboration (S1), with the current one marked. */
export function JourneyBar({ stage, labels = true }: { stage: number; labels?: boolean }) {
  return (
    <div>
      <div className="co-journey" aria-hidden>{JOURNEY.map((j, i) => <span key={j} className={i < stage ? "done" : i === stage ? "now" : undefined} />)}</div>
      {labels && <div className="co-journey-labels">{JOURNEY.map((j, i) => (i === stage ? <b key={j}>{j}</b> : <span key={j}>{j}</span>))}</div>}
      <span className="sr-only">Stage {stage + 1} of 7: {JOURNEY[stage]}</span>
    </div>
  );
}

/** Where an application stands, the same six steps for applicant and host. */
export function AppTrack({ stage, side = "applicant" }: { stage: AppStage; side?: "applicant" | "host" }) {
  const at = APP_FLOW.indexOf(stage);
  return (
    <div className="co-track" aria-label={`Status: ${STAGE_LABEL[stage][side]}`}>
      {APP_FLOW.map((s, i) => <div key={s} className={at >= 0 && i < at ? "done" : i === at ? "now" : undefined}>{STAGE_LABEL[s][side]}</div>)}
    </div>
  );
}

export function CallCard({ call, applied }: { call: CollabCall; applied?: Application }) {
  return (
    <Link href={`/collaborate/calls/${call.id}`} className="co-call">
      <span className="co-call-img">
        <Pic name={call.photo} sizes="(max-width: 760px) 100vw, 380px" />
        <span className="co-chip">{call.fields[0]}</span>
        <span className="co-chip co-days"><Icon name="time" size={13} />{call.closesInDays} days left</span>
      </span>
      <span className="co-call-body">
        <span className="co-org"><Avatar person={PEOPLE[call.host]} size={22} /><b>{call.org}</b>{call.verified && <Icon name="verified" size={14} />}<span>· {call.city}</span></span>
        <h3>{call.title}</h3>
        <p>{call.summary}</p>
        <span className="co-row">{call.roles.slice(0, 3).map((r) => <span key={r} className="co-chip blue">{r}</span>)}</span>
        <span className="co-call-foot">
          <b>{call.fee.split(" · ")[0]}</b>
          {applied ? <span className="co-chip ok">{STAGE_LABEL[applied.stage].applicant}</span> : call.postedByMe ? <span className="co-chip warn">You host this</span> : <span className="co-muted">{call.where}</span>}
        </span>
      </span>
    </Link>
  );
}

/** What the team should do next, in a sentence. */
export function nextStep(p: Project, me: PersonId) {
  if (p.stage === 1) return "Shape the idea in the studio, then agree the terms.";
  if (!p.charter.signedAt) return p.charter.signed.includes(me) ? "Waiting for everyone to sign the charter." : "Read and sign the charter so work can start.";
  const ds = p.deliverables ?? [];
  const review = ds.find((d) => d.approver === me && d.status === "review");
  if (review) return `${review.owner === me ? "You" : PEOPLE[review.owner].name.split(" ")[0]} sent "${review.title}" for your review.`;
  const changes = ds.find((d) => d.owner === me && d.status === "changes");
  if (changes) return `Changes asked on "${changes.title}".`;
  const mine = ds.find((d) => d.owner === me && (d.status === "doing" || d.status === "todo"));
  if (mine) return `Your next delivery: ${mine.title}${mine.due && mine.due !== "No date" ? ` (${mine.due})` : ""}`;
  const waiting = ds.find((d) => d.owner === me && d.status === "review");
  if (waiting) return `Waiting for ${PEOPLE[waiting.approver].name.split(" ")[0]} to approve "${waiting.title}".`;
  const open = ds.filter((d) => d.status !== "approved").length;
  if (open) return `${open} still to deliver across the team.`;
  if (!ds.length) return "Set up the plan: what each person will deliver.";
  return "Everything's approved. Share what it earned and keep the record.";
}

export function ProjectCard({ p, me }: { p: Project; me: PersonId }) {
  return (
    <Link href={`/collaborate/projects/${p.id}`} className="co-proj">
      <Thumb photo={p.photo} className="co-proj-img" sizes="90px" />
      <span style={{ display: "grid", gap: 8, minWidth: 0 }}>
        <span className="co-row" style={{ justifyContent: "space-between" }}>
          <span className="co-chip blue">{JOURNEY[p.stage]}</span>
          <Faces ids={p.members.map((m) => m.id)} size={24} />
        </span>
        <h3>{p.title}</h3>
        <JourneyBar stage={p.stage} labels={false} />
        <span className="co-next">{nextStep(p, me)}</span>
      </span>
    </Link>
  );
}

export function Stars({ value = 0, onChange }: { value?: number; onChange?: (n: number) => void }) {
  return (
    <span className="co-stars" role={onChange ? "radiogroup" : undefined} aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => onChange
        ? <button key={n} type="button" role="radio" aria-checked={value === n} className={n <= value ? undefined : "off"} onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>★</button>
        : <span key={n} className={n <= value ? undefined : "off"} aria-hidden>★</span>)}
    </span>
  );
}

export function DemoNote({ children }: { children: React.ReactNode }) {
  return <p className="co-demo-note"><Icon name="spark" size={16} /> {children}</p>;
}
