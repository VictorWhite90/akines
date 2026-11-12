"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import { Field, Input } from "@/components/kin/Field";
import { Empty, Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { ME } from "@/lib/collab/me";
import { agreementStages, charterVersions, numberWord, signedAt, stageOfChip, STAGE_CHIPS, STAGES, useAgreements, type StageId, type StageStatus, type StageView } from "@/lib/collab/agreements";
import { longDate, shortDate } from "@/lib/collab/tasks";
import { useWorkspace, workspaceHref } from "@/lib/collab/workspace";
import { PEOPLE } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { PageHead, WorkspaceFrame } from "./Frame";
import { BackLink, CwLink, Dot, IconCheck, IconUpRight, initialsOf } from "./parts";
import "../styles/pages.css";
import "../styles/workspace.css";
import "../styles/agreements.css";

/*
 * A project's Agreements, mirrored from the product design (classes ag-* in ../styles/agreements.css, with the
 * workspace's cd-* metrics, cards and stage rail): the six stages, a stage's page (its terms, who has
 * acknowledged and the version history) and the optional formal agreement with its legal templates.
 * The stages are read from our project's charter (lib/collab/agreements.ts): acknowledging is signing it.
 */

const CREATED = "Agreement created. Your team can review it now.";
const SUGGESTED = "Change suggested. Your team will be asked to review it.";
const ACKNOWLEDGED = "Agreement acknowledged. Your team can see it.";
const TOAST_MS = 2500;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

// ── The workspace's dashboard pieces (cd-*), as the design's agreement pages use them ──

function Metrics({ children }: { children: React.ReactNode[] }) {
  return <div className="cd-metrics" style={{ ["--cd-cols" as string]: children.filter(Boolean).length } as React.CSSProperties}>{children}</div>;
}
function Metric({ label, value, caption, dot, scrollTo, onClick }: { label: string; value: React.ReactNode; caption?: string; dot?: boolean; scrollTo?: string; onClick?: () => void }) {
  const act = scrollTo ? () => scrollToId(scrollTo) : onClick;
  const inner = (
    <>
      <span className="cd-metric__label">{label}</span>
      <span className="cd-metric__value">{value}</span>
      {caption ? <span className="cd-metric__cap">{dot ? <Dot size={6} /> : null}{caption}</span> : null}
      {act ? <span className="cd-metric__go" aria-hidden><IconUpRight /></span> : null}
    </>
  );
  return act ? <button type="button" className="cd-metric" onClick={act}>{inner}</button> : <div className="cd-metric cd-metric--plain">{inner}</div>;
}
function Card({ title, id, className, children }: { title: string; id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("cd-card", className)} data-m="up">
      <header className="cd-card__head"><h3 className="cd-card__title">{title}</h3></header>
      {children}
    </section>
  );
}
type StepState = "done" | "doing" | "next";
function Steps({ states }: { states: StepState[] }) {
  return (
    <ol className="cd-stages" style={{ ["--cd-n" as string]: states.length } as React.CSSProperties}>
      {STAGES.map((s, i) => (
        <li key={s.id} className="cd-stage" aria-current={states[i] === "doing" ? "step" : undefined}>
          <div className="cd-stage__body">
            <span className="cd-stage__rail">
              <span className={`cd-stage__mark cd-stage__mark--${states[i]}`} aria-hidden>{states[i] === "done" ? <IconCheck size={13} sw={1.6} /> : states[i] === "doing" ? <i /> : null}</span>
              <i className="cd-stage__line" aria-hidden />
            </span>
            <span className="cd-stage__when">STAGE {String(i + 1).padStart(2, "0")}</span>
            <span className="cd-stage__title">{s.id === "formal" ? "Formal agreement" : s.title}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
/** The stage rail: a stage is done once acknowledged; the page's own stage (or, once it's done, the next one) is current. */
function stepStates(stages: StageView[], current: number): StepState[] {
  const here = stages[current].status === "Acknowledged" ? stages.findIndex((s, i) => i > current && s.status !== "Acknowledged") : current;
  return stages.map((s, i) => (s.status === "Acknowledged" ? "done" : i === here ? "doing" : "next"));
}

const STATUS_DOT: Record<StageStatus, string> = { "Not started": "none", "In progress": "progress", "Awaiting acknowledgement": "awaiting", Acknowledged: "done" };
function Status({ status }: { status: StageStatus }) {
  return <span className="ag-status"><i className={`ag-status__dot ag-status__dot--${STATUS_DOT[status]}`} aria-hidden />{status}</span>;
}
const Label = ({ children }: { children: React.ReactNode }) => <h2 className="ag-label">{children}</h2>;

// ── Dialogs ──

function CreateDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (v: { stage: StageId; title: string; description: string }) => void }) {
  const [stage, setStage] = useState<string>("Ownership");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [was, setWas] = useState(open);
  if (open !== was) { setWas(open); if (open) { setStage("Ownership"); setTitle(""); setDesc(""); } }
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="NEW AGREEMENT" title="What would you like to agree?" description="Choose a stage, then name the agreement and describe it."
      footer={<><Button type="submit" form="ag-create-form">Create agreement</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="ag-create-form" className="cw-form" noValidate onSubmit={(e) => { e.preventDefault(); onCreate({ stage: stageOfChip(stage), title: title.trim() || "Who owns what we make", description: desc.trim() }); }}>
        <div className="cw-form__group" role="group" aria-labelledby="ag-stage-label">
          <span className="ag-flabel" id="ag-stage-label">Stage</span>
          <div className="ag-chips">{STAGE_CHIPS.map((c) => <Chip key={c} selected={stage === c} onClick={() => setStage(c)}>{c}</Chip>)}</div>
          <p className="ag-hint">Agreements build up one stage at a time.</p>
        </div>
        <Field label="Agreement title" hint="A short, plain name."><Input value={title} placeholder="For example, Who owns what we make" onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Description" hint="Optional. Keep it short and clear."><Input value={desc} placeholder="What should this agreement help everyone understand?" onChange={(e) => setDesc(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

function SuggestDialog({ open, onClose, onSuggest }: { open: boolean; onClose: () => void; onSuggest: (v: { change: string; why: string }) => void }) {
  const [change, setChange] = useState("");
  const [why, setWhy] = useState("");
  const [was, setWas] = useState(open);
  if (open !== was) { setWas(open); if (open) { setChange(""); setWhy(""); } }
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="SUGGEST A CHANGE" title="What would you change?" description="Your team will see your suggestion. Nothing changes until everyone has acknowledged it."
      footer={<><Button type="submit" form="ag-suggest-form">Suggest change</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="ag-suggest-form" className="cw-form" noValidate onSubmit={(e) => { e.preventDefault(); onSuggest({ change: change.trim(), why: why.trim() }); }}>
        <Field label="What to change" hint="Describe the change in a sentence or two."><Input value={change} placeholder="For example, Ngozi also leads the interview questions" onChange={(e) => setChange(e.target.value)} /></Field>
        <Field label="Why" hint="Optional, but it helps the team decide."><Input value={why} placeholder="Help the team understand the reason" onChange={(e) => setWhy(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

function AcknowledgeDialog({ open, onClose, onConfirm, label, summary }: { open: boolean; onClose: () => void; onConfirm: () => void; label: string; summary: string[] }) {
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="ACKNOWLEDGE" title="Acknowledge this agreement?" description="Take a moment to read the summary before you confirm."
      footer={<><Button onClick={onConfirm}>Acknowledge</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <div className="ag-summary">
        <p className="ag-summary__label">{label}</p>
        {summary.map((s) => <p key={s} className="ag-summary__line">{s}</p>)}
        <p className="ag-summary__note">Acknowledging records that you have read and understood this version. It does not change who owns the work. You can suggest a change at any time.</p>
      </div>
    </Modal>
  );
}

/** "Create agreement": the dialog, saved as a draft; from a stage page it returns to the agreements. */
function useCreate(projectId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const { create } = useAgreements(projectId);
  const [open, setOpen] = useState(false);
  const home = `${workspaceHref(projectId, "agreements")}`;
  return {
    show: () => setOpen(true),
    modal: <CreateDialog open={open} onClose={() => setOpen(false)} onCreate={(v) => { create(v); setOpen(false); if (pathname !== home) router.push(home); toast.show({ message: CREATED, duration: TOAST_MS }); }} />,
  };
}

// ── Pages ──

function useStages(projectId: string) {
  const ws = useWorkspace(projectId);
  const { drafts } = useAgreements(projectId);
  return ws.project ? agreementStages(ws.project, drafts, workspaceHref(projectId, "agreements")) : [];
}

function OverviewBody({ projectId }: { projectId: string }) {
  const stages = useStages(projectId);
  const create = useCreate(projectId);
  const n = (s: StageStatus) => stages.filter((x) => x.status === s).length;
  const done = n("Acknowledged"), awaiting = n("Awaiting acknowledgement"), none = n("Not started");
  return (
    <>
      <div className="ag-stack">
        <PageHead label="AGREEMENTS" title="Make sure everyone understands what they're building together." lead="Agree on the expectations, contributions and responsibilities that guide your collaboration.">
          <Metrics>
            {[
              <Metric key="a" label="ACKNOWLEDGED" value={`${done}/${stages.length}`} caption="stages" />,
              <Metric key="b" label="AWAITING" value={awaiting} caption={awaiting === 1 ? "stage" : "stages"} dot={awaiting > 0} />,
              <Metric key="c" label="NOT STARTED" value={none} caption={none === 1 ? "stage" : "stages"} />,
            ]}
          </Metrics>
          <div className="cw-actions cw-actions--btns">
            <Button onClick={create.show}>Create agreement</Button>
            <CwLink href={workspaceHref(projectId, "team")}>View contribution history</CwLink>
          </div>
        </PageHead>
        <section className="ag-stagesec" data-m="up" aria-label="Agreement stages">
          <div className="ag-stagehead"><Label>AGREEMENT STAGES</Label><p>Take the stages one at a time. Each one builds on the last.</p></div>
          <ul className="ag-stages">
            {stages.map((s) => {
              const inner = (
                <>
                  <span className="ag-stage__top"><span className="ag-stage__label">STAGE {String(s.index + 1).padStart(2, "0")}</span><Status status={s.status} /></span>
                  <span className="ag-stage__title">{s.title}</span>
                  <span className="ag-stage__text">{s.text}</span>
                  <span className="ag-stage__note">{s.note}</span>
                </>
              );
              return <li key={s.id}>{s.href ? <Link href={s.href} className="ag-stage">{inner}</Link> : <button type="button" className="ag-stage">{inner}</button>}</li>;
            })}
          </ul>
        </section>
      </div>
      {create.modal}
    </>
  );
}

/** Before the team has agreed anything: the charter has no terms of its own and nothing is being drafted (the design's Empty). */
function EmptyBody({ projectId }: { projectId: string }) {
  const create = useCreate(projectId);
  return (
    <>
      <div className="ag-stack">
        <PageHead label="AGREEMENTS" title="Make sure everyone understands what they're building together." lead="Agree on the expectations, contributions and responsibilities that guide your collaboration." />
        <div data-m="up">
          <Empty className="cw-empty" title="Start with shared understanding." text="Clarify expectations, roles and contributions before substantial work begins." action={<Button arrow="up-right" onClick={create.show}>Create agreement</Button>} />
        </div>
      </div>
      {create.modal}
    </>
  );
}

/** Agreements: the six stages. */
export default function Agreements({ projectId }: { projectId: string }) {
  const ws = useWorkspace(projectId);
  const { drafts } = useAgreements(projectId);
  const c = ws.project?.charter;
  const empty = !!c && ![c.credit, c.ownership, c.decisions, c.expenses, c.uses, c.exit].some((t) => t?.trim()) && !c.signed.length && !drafts.length;
  return (
    <WorkspaceFrame projectId={projectId} active="agreements" rail={empty ? "short" : true}>
      {empty ? <EmptyBody projectId={projectId} /> : <OverviewBody projectId={projectId} />}
    </WorkspaceFrame>
  );
}

const nameOf = (id: string) => (PEOPLE as Record<string, { name: string } | undefined>)[id]?.name ?? (id === "akines" ? "Akines" : "A member");

function StageBody({ projectId, stage }: { projectId: string; stage: StageId }) {
  const ws = useWorkspace(projectId);
  const stages = useStages(projectId);
  const { suggest } = useAgreements(projectId);
  const [suggesting, setSuggesting] = useState(false);
  const [acking, setAcking] = useState(false);
  const p = ws.project!;
  const i = STAGES.findIndex((s) => s.id === stage);
  const s = stages[i];
  const versions = charterVersions(p);
  const v = versions.at(-1)!;
  const total = p.members.length;
  const signed = p.members.filter((m) => p.charter.signed.includes(m.id));
  const all = signed.length >= total;
  const year = (at: number) => new Date(at).getFullYear();
  const versionText = (x: (typeof versions)[number], current: boolean) =>
    `${longDate(x.at)} ${year(x.at)}. Proposed by ${nameOf(x.by)}.${x.what ? ` ${x.what}.` : ""}${current && all ? ` Acknowledged by all ${numberWord(total)} members.` : ""}`;
  const back = workspaceHref(projectId, "agreements");

  return (
    <>
      <div className="ag-stack ag-stack--detail">
        <PageHead back={<BackLink href={back}>Back to agreements</BackLink>} label={`STAGE ${String(i + 1).padStart(2, "0")} OF 6`} title={s.name} lead={s.lead}>
          <div className="cw-actions cw-actions--btns">
            {all ? <p className="ag-done">Everyone has acknowledged version {v.n}.</p> : p.charter.signed.includes(ME) ? <p className="ag-done">You have acknowledged version {v.n}.</p> : <Button onClick={() => setAcking(true)}>Acknowledge</Button>}
            <Button variant="secondary" onClick={() => setSuggesting(true)}>Suggest a change</Button>
          </div>
        </PageHead>
        <Metrics>
          {[
            <Metric key="a" label="ACKNOWLEDGED" value={`${signed.length}/${total}`} caption="members" dot={!all} scrollTo="ag-acks" />,
            <Metric key="b" label="VERSION" value={v.n} caption="current" scrollTo="ag-versions" />,
            <Metric key="c" label="STAGE" value={`${i + 1}/6`} caption="of six stages" scrollTo="ag-stages" />,
            <Metric key="d" label="TERMS" value={s.terms.length} caption={all ? "agreed" : "proposed"} scrollTo="ag-terms" />,
          ]}
        </Metrics>
        <Card title="AGREEMENT STAGES" id="ag-stages" className="ag-card--stages"><Steps states={stepStates(stages, i)} /></Card>
        <Card title="ACKNOWLEDGEMENTS" id="ag-acks" className="ag-card--acks">
          <p className="ag-total"><span className="ag-total__n">{signed.length}</span><span className="ag-total__text">of {total} members have acknowledged version {v.n}</span></p>
          <div className="ag-seg"><div className="cd-seg" role="img" aria-label={`${signed.length} of ${total} acknowledged`}>{Array.from({ length: total }, (_, k) => <i key={k} className={k < signed.length ? "is-done" : undefined} />)}</div></div>
          <ul className="ag-tiles">
            {[...signed, ...p.members.filter((m) => !p.charter.signed.includes(m.id))].map((m) => {
              const at = signedAt(p, m.id);
              const name = nameOf(m.id);
              return (
                <li key={m.id} className="ag-tile">
                  <span className="ag-tile__av" aria-hidden>{initialsOf(name)}<i className={cn("ag-tile__dot", at !== undefined || p.charter.signed.includes(m.id) ? "ag-tile__dot--done" : "ag-tile__dot--waiting")} /></span>
                  <span className="ag-tile__text"><span className="ag-tile__name">{name}{m.id === ME ? " (you)" : ""}</span><span className="ag-tile__role">{m.id === p.host ? `${m.role.replace(/^owner and /i, "")}, project owner` : m.role}</span></span>
                  <span className="ag-tile__status">
                    <span className={cn("ag-tile__state", p.charter.signed.includes(m.id) && "is-done")}>{p.charter.signed.includes(m.id) ? "Acknowledged" : "Waiting"}</span>
                    <span className="ag-tile__when">{at ? shortDate(at) : "Not yet"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
        <section id="ag-terms" className="ag-block ag-anchor" data-m="up" aria-label="PROPOSED TERMS">
          <Label>PROPOSED TERMS</Label>
          <ol className="ag-list ag-list--lined">
            {s.terms.map((t, k) => <li key={k} className="ag-term"><span className="ag-term__n">{String(k + 1).padStart(2, "0")}</span><span className="ag-term__text">{t}</span></li>)}
          </ol>
        </section>
        <section id="ag-versions" className="ag-block ag-anchor" data-m="up" aria-label="VERSION HISTORY">
          <Label>VERSION HISTORY</Label>
          <ul className="ag-list ag-list--lined">
            {[...versions].reverse().map((x) => (
              <li key={x.n} className="ag-version">
                <span className="ag-version__info"><span className="ag-version__title">Version {x.n}</span><span className="ag-version__text">{versionText(x, x.n === v.n)}</span></span>
                {x.n === v.n ? <span className="ag-version__current">Current</span> : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <SuggestDialog open={suggesting} onClose={() => setSuggesting(false)} onSuggest={(x) => { suggest({ stage, ...x }); setSuggesting(false); toast.show({ message: SUGGESTED, duration: TOAST_MS }); }} />
      <AcknowledgeDialog open={acking} onClose={() => setAcking(false)} label={`${s.name}, version ${v.n}`} summary={s.terms}
        onConfirm={() => { ws.collab.project.sign(p.id); setAcking(false); toast.show({ message: ACKNOWLEDGED, duration: TOAST_MS }); }} />
    </>
  );
}

/** A stage's page: its terms, who has acknowledged, and the versions. */
export function AgreementStage({ projectId, stage }: { projectId: string; stage: Exclude<StageId, "formal"> }) {
  return <WorkspaceFrame projectId={projectId} active="agreements" rail><StageBody projectId={projectId} stage={stage} /></WorkspaceFrame>;
}

const TEMPLATES = [
  { title: "Collaboration agreement", text: "How the team works together on a commercial project." },
  { title: "Intellectual property agreement", text: "Who owns what the team creates, and how it is credited." },
  { title: "Revenue sharing agreement", text: "How income from the project is shared between members." },
];

function FormalBody({ projectId }: { projectId: string }) {
  const stages = useStages(projectId);
  const { drafts } = useAgreements(projectId);
  const create = useCreate(projectId);
  const mine = drafts.filter((d) => d.stage === "formal").length;
  return (
    <>
      <div className="ag-stack ag-stack--detail">
        <PageHead back={<BackLink href={workspaceHref(projectId, "agreements")}>Back to agreements</BackLink>} label="STAGE 06 OF 6" title="Formal Agreement" lead="Optional legal templates for serious commercial projects.">
          <div className="cw-actions cw-actions--btns"><Button onClick={create.show}>Create agreement</Button></div>
        </PageHead>
        <Metrics>
          {[
            <Metric key="a" label="DRAFTS" value={mine} caption={mine ? "being drafted" : "not started"} onClick={create.show} />,
            <Metric key="b" label="TEMPLATES" value={TEMPLATES.length} caption="to choose from" scrollTo="ag-templates" />,
            <Metric key="c" label="STAGE" value="6/6" caption="optional" scrollTo="ag-stages" />,
          ]}
        </Metrics>
        <Card title="AGREEMENT STAGES" id="ag-stages" className="ag-card--stages"><Steps states={stages.map((s, i) => (i === 5 ? "doing" : s.status === "Acknowledged" ? "done" : "next"))} /></Card>
        <section className="ag-note" data-m="up" aria-label="A draft is not automatically legally binding.">
          <span className="ag-note__rule" aria-hidden />
          <h2 className="ag-note__title">A draft is not automatically legally binding.</h2>
          <p className="ag-note__text">Drafting an agreement on Akines helps your team agree in plain language. It does not, on its own, make anything legally binding. For a binding agreement, speak to a qualified legal adviser.</p>
        </section>
        <section id="ag-templates" className="ag-block ag-block--templates ag-anchor" data-m="up" aria-label="LEGAL TEMPLATES (OPTIONAL)">
          <Label>LEGAL TEMPLATES (OPTIONAL)</Label>
          <ul className="ag-templates">
            {TEMPLATES.map((t) => <li key={t.title} className="ag-template"><span className="ag-template__tag">OPTIONAL</span><span className="ag-template__title">{t.title}</span><span className="ag-template__text">{t.text}</span></li>)}
          </ul>
          <p className="ag-foot">Nothing here changes ownership automatically. The team decides first, and everyone acknowledges.</p>
        </section>
      </div>
      {create.modal}
    </>
  );
}

/** Stage 06: the formal agreement and its optional legal templates. */
export function FormalAgreement({ projectId }: { projectId: string }) {
  return <WorkspaceFrame projectId={projectId} active="agreements" rail><FormalBody projectId={projectId} /></WorkspaceFrame>;
}
