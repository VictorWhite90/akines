"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/kin/Button";
import { Field, Input } from "@/components/kin/Field";
import { Empty, Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { DECISION_STATUS, useDecisions, type Decision, type DecisionStatus } from "@/lib/collab/decisions";
import { dayMonth } from "@/lib/collab/tasks";
import { useWorkspace, workspaceHref } from "@/lib/collab/workspace";
import { PEOPLE } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { Metric, Metrics, scrollToId } from "./blocks";
import { PageHead, WorkspaceFrame } from "./Frame";
import { CwLink } from "./parts";
import "../styles/decision.css";

/*
 * A project's decisions, mirrored from the product design (dc-* in ../styles/decision.css): the counts, Propose
 * decision, and the two views, Needs attention and History. With no decisions yet, the design's empty state.
 */

const STATUS_DOT: Record<DecisionStatus, string> = { proposed: "ring", discussion: "ink", awaiting: "amber", approved: "green", rejected: "ring-ink", superseded: "grey" };
const word = (n: number) => (n === 1 ? "decision" : "decisions");
export const decisionsHref = (id: string) => ({ list: `${workspaceHref(id, "decisions")}`, history: `${workspaceHref(id, "decisions")}/history` });
/** Where a decision's milestone is shown: the project's milestones. */
export const milestonesHref = (id: string) => `${workspaceHref(id, "tasks")}/milestones`;

export function DecisionStatusLabel({ status }: { status: DecisionStatus }) {
  return <span className="dc-status"><i className={`dc-status__dot dc-status__dot--${STATUS_DOT[status]}`} aria-hidden /><span className="dc-status__text">{DECISION_STATUS[status]}</span></span>;
}

function Tabs({ projectId, view }: { projectId: string; view: "list" | "history" }) {
  const h = decisionsHref(projectId);
  const tabs = [{ key: "list", label: "Needs attention", href: h.list }, { key: "history", label: "History", href: h.history }] as const;
  return (
    <nav className="dc-tabs" aria-label="Decision views" data-m="up">
      {tabs.map((t) => t.key === view
        ? <span key={t.key} className="dc-tab" aria-current="page"><span className="dc-tab__label">{t.label}</span><span className="dc-tab__rule" /></span>
        : <Link key={t.key} href={t.href} className="dc-tab"><span className="dc-tab__label">{t.label}</span><span className="dc-tab__rule" /></Link>)}
    </nav>
  );
}

function Row({ d, projectId, team }: { d: Decision; projectId: string; team: number }) {
  const decided = d.outcomeAt && (d.status === "approved" || d.status === "rejected" || d.status === "superseded");
  return (
    <li className="dc-row">
      <div className="dc-row__top">
        <Link href={`${workspaceHref(projectId, "decisions")}/${d.slug}`} className="dc-row__hit">{d.title}</Link>
        <DecisionStatusLabel status={d.status} />
      </div>
      <div className="dc-row__bottom">
        <div className="dc-row__meta">
          <span>Proposed by {PEOPLE[d.proposedBy]?.name ?? "a member"}</span>
          {d.milestone ? <><span aria-hidden>·</span><Link href={milestonesHref(projectId)} className="dc-row__ms">{d.milestone}</Link></> : null}
        </div>
        <div className="dc-row__meta">
          <span>{Math.min(d.acknowledged.length, team)} of {team} acknowledged</span>
          <span aria-hidden>·</span>
          <span>{decided ? `Outcome ${dayMonth(d.outcomeAt!)}` : dayMonth(d.proposedAt)}</span>
        </div>
      </div>
    </li>
  );
}

function List({ id, group, items, tight, projectId, team }: { id: string; group: string; items: Decision[]; tight?: boolean; projectId: string; team: number }) {
  return (
    <section className="dc-list" id={id} aria-labelledby={`${id}-group`} data-m="up">
      <h2 className={cn("dc-list__group", tight && "dc-list__group--tight")} id={`${id}-group`}>{group}</h2>
      <ul className="dc-list__rows">{items.map((d) => <Row key={d.id} d={d} projectId={projectId} team={team} />)}</ul>
    </section>
  );
}

/** "What needs to be decided?" */
export function ProposeDialog({ projectId, open, onClose, onProposed }: { projectId: string; open: boolean; onClose: () => void; onProposed?: (d: Decision) => void }) {
  const ws = useWorkspace(projectId);
  const { propose } = useDecisions(projectId);
  const milestone = ws.project ? (ws.milestones.find((m) => !m.done)?.title ?? "") : "";
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [options, setOptions] = useState("");
  const [ms, setMs] = useState(milestone);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setTitle(""); setProblem(""); setOptions(""); setMs(milestone); } }
  const filled = (v: string) => (v.trim() ? "dc-filled" : undefined);
  const example = "Choose who tests the first version";
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const d = propose({
      title: title.trim() || example,
      summary: problem.trim(),
      problem: problem.trim() || undefined,
      milestone: ms.trim() || undefined,
      options: options.split(/\n|;/).map((o) => o.trim()).filter(Boolean).map((o) => ({ title: o, good: "", watch: "" })),
    });
    onClose();
    toast.show({ message: "Decision proposed. Your team can discuss it now.", duration: 2500 });
    onProposed?.(d);
  };
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="NEW DECISION" title="What needs to be decided?" description="Describe the choice so your team can discuss it."
      footer={<><Button type="submit" form="dc-propose-form">Propose decision</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <form id="dc-propose-form" className="cw-form" onSubmit={submit} noValidate>
        <Field label="Decision title" hint="A short, clear choice."><Input className={filled(title)} value={title} placeholder={`For example, ${example}`} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Problem" hint="Say why it needs deciding now."><Input className={filled(problem)} value={problem} placeholder="What is not clear or not agreed yet?" onChange={(e) => setProblem(e.target.value)} /></Field>
        <Field label="Options" hint="Add at least two options."><Input className={filled(options)} value={options} placeholder="List the choices, one per line" onChange={(e) => setOptions(e.target.value)} /></Field>
        <Field label="Related milestone" hint="The milestone this decision belongs to."><Input className={filled(ms)} value={ms} onChange={(e) => setMs(e.target.value)} /></Field>
      </form>
    </Modal>
  );
}

function DecisionsPage({ projectId, view }: { projectId: string; view: "list" | "history" }) {
  const ws = useWorkspace(projectId);
  const dec = useDecisions(projectId);
  const [proposing, setProposing] = useState(false);
  const h = decisionsHref(projectId);
  const team = ws.project ? ws.members.length : 0;
  const empty = dec.list.length === 0;
  const pending = empty ? 0 : dec.pending.length;
  const awaiting = empty ? 0 : dec.awaitingMe.length;
  const history = empty ? 0 : dec.history.length;

  const head = (
    <PageHead label="DECISIONS" title="Decisions that move the project forward." lead="Keep important choices clear, shared and understood.">
      <div className="dc-metrics">
        <Metrics>
          <Metric label="PENDING" value={pending} caption={word(pending)} />
          <Metric label="AWAITING YOU" value={awaiting} caption={word(awaiting)} dot={awaiting > 0} />
          <Metric label="IN HISTORY" value={history} caption={word(history)} />
        </Metrics>
      </div>
      <div className="cw-actions cw-actions--btns">
        <Button onClick={() => setProposing(true)}>Propose decision</Button>
        {empty ? (
          <><Button variant="secondary">View pending decisions</Button><CwLink>View decision history</CwLink></>
        ) : view === "list" ? (
          <><Button variant="secondary" onClick={() => scrollToId("dc-list")}>View pending decisions</Button><CwLink href={h.history}>View decision history</CwLink></>
        ) : (
          <><Button variant="secondary" href={h.list}>View pending decisions</Button><CwLink onClick={() => scrollToId("dc-history-list")}>View decision history</CwLink></>
        )}
      </div>
    </PageHead>
  );
  const dialog = <ProposeDialog projectId={projectId} open={proposing} onClose={() => setProposing(false)} />;

  if (empty) {
    return (
      <WorkspaceFrame projectId={projectId} active="decisions" rail="short">
        {head}
        <div className="dc-empty" data-m="up">
          <Empty className="cw-empty" title="No decisions need attention yet." text="When your team needs to make an important choice, it will appear here." action={<Button arrow="up-right" onClick={() => setProposing(true)}>Propose decision</Button>} />
        </div>
        {dialog}
      </WorkspaceFrame>
    );
  }
  return (
    <WorkspaceFrame projectId={projectId} active="decisions" rail>
      {head}
      <div className="dc-views">
        <Tabs projectId={projectId} view={view} />
        {view === "history"
          ? <List id="dc-history-list" group={`HISTORY (${dec.history.length})`} items={dec.history} tight projectId={projectId} team={team} />
          : <List id="dc-list" group={`NEEDS ATTENTION (${dec.pending.length})`} items={dec.pending} projectId={projectId} team={team} />}
      </div>
      {dialog}
    </WorkspaceFrame>
  );
}

export default function Decisions({ projectId, view = "list" }: { projectId: string; view?: "list" | "history" }) {
  return <DecisionsPage projectId={projectId} view={view} />;
}
