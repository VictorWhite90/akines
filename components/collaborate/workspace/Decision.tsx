"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import Button from "@/components/kin/Button";
import { Modal } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { ME } from "@/lib/collab/me";
import { DECISION_STATUS, isDecided, useDecisions, type Decision as DecisionT } from "@/lib/collab/decisions";
import { dayMonth, longDate } from "@/lib/collab/tasks";
import { useWorkspace, workspaceHref } from "@/lib/collab/workspace";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { Card, Metric, Metrics } from "./blocks";
import { milestonesHref } from "./Decisions";
import { fileHref, useProjectFiles } from "./Files";
import { PageHead, WorkspaceFrame } from "./Frame";
import { BackLink, CwLink, IconCheck, initialsOf } from "./parts";
import "../styles/workspace.css";
import "../styles/decisions.css";
import "../styles/decision.css";

/*
 * One decision, mirrored from the product design (dd-* in ../styles/decisions.css): acknowledge or discuss it,
 * its counts, progress, who has acknowledged, its details, the options side by side, context, files, the
 * discussion so far and the outcome. Acknowledging asks first (dc-summary), then says how many have.
 */

const UpRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={size === 24 ? 1 : 1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" /></svg>
);
const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "A member";
const WEEKDAY = (at: number) => new Date(at).toLocaleDateString("en-GB", { weekday: "short" });
const MONTH_DAY = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
const list = (names: string[]) => (names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

type Stage = { state: "done" | "doing" | "next"; when: string; title: string };
function Stages({ stages }: { stages: Stage[] }) {
  return (
    <ol className="cd-stages" style={{ ["--cd-n" as string]: stages.length } as React.CSSProperties}>
      {stages.map((s) => (
        <li key={s.when} className="cd-stage" aria-current={s.state === "doing" ? "step" : undefined}>
          <div className="cd-stage__body">
            <span className="cd-stage__rail">
              <span className={`cd-stage__mark cd-stage__mark--${s.state}`} aria-hidden>{s.state === "done" ? <IconCheck size={13} sw={1.6} /> : s.state === "doing" ? <i /> : null}</span>
              <i className="cd-stage__line" aria-hidden />
            </span>
            <span className="cd-stage__when">{s.when}</span>
            <span className="cd-stage__title">{s.title}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function AcknowledgeDialog({ open, onClose, d, onAcknowledge }: { open: boolean; onClose: () => void; d: DecisionT; onAcknowledge: () => void }) {
  const direction = d.options[0]?.title ?? d.direction;
  return (
    <Modal open={open} onClose={onClose} width={640} eyebrow="ACKNOWLEDGE DECISION" title="Acknowledge this decision?" description="You are saying you have read it and will work with the outcome."
      footer={<><Button onClick={onAcknowledge}>Acknowledge</Button><CwLink onClick={onClose}>Cancel</CwLink></>}>
      <div className="dc-summary">
        <div className="dc-summary__item"><p className="dc-summary__label">DECISION</p><p className="dc-summary__text">{d.title}</p></div>
        {direction ? <div className="dc-summary__item"><p className="dc-summary__label">PROPOSED DIRECTION</p><p className="dc-summary__text">{direction}</p></div> : null}
        <div className="dc-summary__item"><p className="dc-summary__label">WHAT ACKNOWLEDGING MEANS</p><p className="dc-summary__text dc-summary__text--small">You have read the decision and will work with the outcome. You can still add to the discussion.</p></div>
      </div>
    </Modal>
  );
}

function DecisionPage({ projectId, slug }: { projectId: string; slug: string }) {
  const ws = useWorkspace(projectId);
  const dec = useDecisions(projectId);
  // A supporting file that is in Files opens its page there.
  const projectFiles = useProjectFiles(projectId).files;
  const [asking, setAsking] = useState(false);
  const d = dec.get(slug);
  const base = workspaceHref(projectId, "decisions");
  const discussHref = workspaceHref(projectId, "conversations");
  if (!ws.project) return <WorkspaceFrame projectId={projectId} active="decisions" rail railHide={["decision"]}>{null}</WorkspaceFrame>;
  if (!d) {
    return (
      <WorkspaceFrame projectId={projectId} active="decisions" rail railHide={["decision"]}>
        <div className="dd-page"><PageHead back={<BackLink href={base}>Back to decisions</BackLink>} label="DECISION" title="This decision is no longer here." lead="It may have been removed. Your team's other decisions are on the list." /></div>
      </WorkspaceFrame>
    );
  }

  const team = ws.members;
  const total = team.length;
  const acked = team.filter((m) => d.acknowledged.includes(m.id));
  const waiting = team.filter((m) => !d.acknowledged.includes(m.id));
  // Acknowledged first, in order; then those still to, with you last.
  const people = [...d.acknowledged.map((id) => team.find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => !!m), ...waiting.filter((m) => !m.you), ...waiting.filter((m) => m.you)];
  const done = isDecided(d.status);
  const canAck = !done && !d.acknowledged.includes(ME);

  const acknowledge = () => {
    setAsking(false);
    dec.acknowledge(d.id, total);
    const n = Math.min(total, d.acknowledged.length + 1);
    toast.show({ message: `Decision acknowledged. ${n} of ${total} have acknowledged.`, duration: 2500 });
  };

  const stages: Stage[] = [
    { state: "done", when: `PROPOSED ${dayMonth(d.proposedAt).toUpperCase()}`, title: `Proposed by ${nameOf(d.proposedBy)}` },
    done
      ? { state: "done", when: "ACKNOWLEDGED", title: `Acknowledgement, ${acked.length} of ${total} people` }
      : { state: "doing", when: "IN PROGRESS", title: `Acknowledgement, ${acked.length} of ${total} people` },
    done
      ? { state: "done", when: d.outcomeAt ? `OUTCOME ${dayMonth(d.outcomeAt).toUpperCase()}` : "OUTCOME", title: DECISION_STATUS[d.status] }
      : { state: "next", when: d.decideBy ? `DECIDE BY ${dayMonth(d.decideBy).toUpperCase()}` : "OUTCOME", title: "Outcome is recorded here" },
  ];
  const columns = [{ label: "CONTEXT", text: d.context }, { label: "PROBLEM", text: d.problem }, { label: "PROPOSED DIRECTION", text: d.direction }].filter((c) => c.text);

  return (
    <WorkspaceFrame projectId={projectId} active="decisions" rail railHide={["decision"]}>
      <div className="dd-page">
        <PageHead back={<BackLink href={base}>Back to decisions</BackLink>} label="DECISION" title={d.title} lead={d.summary || undefined}>
          <div className="cw-actions cw-actions--btns">
            {canAck ? <Button onClick={() => setAsking(true)}>Acknowledge decision</Button> : null}
            <Button variant={canAck ? "secondary" : "primary"} href={discussHref}>Open discussion</Button>
          </div>
        </PageHead>
        <Metrics>
          <Metric label="ACKNOWLEDGED" value={`${acked.length}/${total}`} caption={`of ${total} people`} dot scrollTo="dd-ack" />
          {d.decideBy ? <Metric label="DECIDE BY" value={WEEKDAY(d.decideBy)} caption={MONTH_DAY(d.decideBy)} scrollTo="dd-ack" /> : null}
          {d.options.length ? <Metric label="OPTIONS" value={d.options.length} caption="compared" scrollTo="dd-options" /> : null}
          {d.files.length ? <Metric label="FILES" value={d.files.length} caption="attached" scrollTo="dd-files" /> : null}
        </Metrics>
        <Card title="DECISION PROGRESS" className="dd-progress"><Stages stages={stages} /></Card>
        <div className="dd-pair" id="dd-ack">
          <Card title="ACKNOWLEDGEMENTS" className="dd-ack">
            <p className="dd-total"><span>{acked.length}</span>of {total} people have acknowledged</p>
            <div className="cd-seg" role="img" aria-label={`${acked.length} of ${total} acknowledged`}>{Array.from({ length: total }, (_, i) => <i key={i} className={i < acked.length ? "is-done" : undefined} />)}</div>
            <ul className="dd-legend">
              {people.map((m) => {
                const yes = d.acknowledged.includes(m.id);
                return (
                  <li key={m.id}>
                    <span className="dd-legend__name"><i className={cn("dd-dot", yes && "dd-dot--done")} aria-hidden />{m.name}</span>
                    <span className={cn("dd-legend__state", !yes && "is-waiting")}>{yes ? "Acknowledged" : "Waiting"}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card title="DETAILS" className="dd-details">
            <ul className="dd-lines">
              <li className="dd-line"><div className="dd-line__in"><span className="dd-line__k">Proposed by</span><span className="dd-line__v">{nameOf(d.proposedBy)}</span></div></li>
              <li className="dd-line"><div className="dd-line__in"><span className="dd-line__k">Proposed</span><span className="dd-line__v">{longDate(d.proposedAt)}</span></div></li>
              {d.decideBy ? <li className="dd-line"><div className="dd-line__in"><span className="dd-line__k">Decide by</span><span className="dd-line__v">{longDate(d.decideBy)}</span></div></li> : null}
              {d.milestone ? (
                <li className="dd-line">
                  <Link href={milestonesHref(projectId)} className="dd-line__in dd-line__in--link"><span className="dd-line__k">Milestone</span><span className="dd-line__v">{d.milestone}<UpRight size={24} /></span></Link>
                </li>
              ) : null}
            </ul>
          </Card>
        </div>
        {d.options.length ? (
          <>
            <div className="dd-options" id="dd-options">
              {d.options.map((o, i) => (
                <article key={o.title} className={cn("dd-opt", i === 0 && "dd-opt--proposed")} data-m="up">
                  <div className="dd-opt__top"><span className="dd-label">OPTION {String.fromCharCode(65 + i)}</span>{i === 0 ? <i className="dd-opt__dot" aria-hidden /> : null}<span className="dd-label">{i === 0 ? "PROPOSED" : "ALTERNATIVE"}</span></div>
                  <h3 className="dd-opt__title">{o.title}</h3>
                  {o.good || o.watch ? <div className="dd-rule" aria-hidden /> : null}
                  {o.good ? <div className="dd-opt__field"><span className="dd-label">GOOD FOR</span><p>{o.good}</p></div> : null}
                  {o.watch ? <div className="dd-opt__field"><span className="dd-label">WATCH FOR</span><p>{o.watch}</p></div> : null}
                </article>
              ))}
            </div>
            <p className="dd-note" data-m="up">Create AI can compare options for you. Your team decides.</p>
          </>
        ) : null}
        {columns.length ? (
          <Card className="dd-cols">
            <div className="dd-columns">
              {columns.map((c, i) => (
                <Fragment key={c.label}>
                  {i > 0 ? <i className="dd-columns__rule" aria-hidden /> : null}
                  <div className="dd-col"><h3 className="dd-label">{c.label}</h3><p>{c.text}</p></div>
                </Fragment>
              ))}
            </div>
          </Card>
        ) : null}
        {d.files.length ? (
          <section className="dd-files" id="dd-files" data-m="up">
            <h2 className="dd-label">SUPPORTING INFORMATION</h2>
            <ul className="dd-rows">
              {d.files.map((f) => {
                const page = projectFiles.find((x) => x.name === f.name);
                const inner = <><span className="dd-row__text"><span className="dd-row__title">{f.name}</span><span className="dd-row__status">{f.meta}</span></span>{page || f.href ? <span className="dd-row__act"><span className="dd-row__open">Open</span><UpRight /></span> : null}</>;
                return <li key={f.name}>{page ? <Link href={fileHref(projectId, page)} className="dd-row dd-row--link">{inner}</Link> : f.href ? <a href={f.href} className="dd-row dd-row--link" target="_blank" rel="noreferrer">{inner}</a> : <div className="dd-row">{inner}</div>}</li>;
              })}
            </ul>
          </section>
        ) : null}
        {d.discussion.length ? (
          <Card title="DISCUSSION" className="dd-discussion">
            <ul className="dd-comments">
              {d.discussion.map((c, i) => (
                <li key={i} className="dd-comment">
                  <span className="dd-av" aria-hidden>{initialsOf(nameOf(c.who))}</span>
                  <div className="dd-comment__text"><p className="dd-comment__name">{nameOf(c.who)}</p><p className="dd-comment__line">{c.text}</p></div>
                </li>
              ))}
            </ul>
            <CwLink href={discussHref} className="dd-link">Open discussion</CwLink>
          </Card>
        ) : null}
        <Card title="DECISION OUTCOME" className="dd-outcome">
          <p className="dd-outcome__status"><i className={cn("dd-dot", done ? d.status === "approved" && "dd-dot--done" : "dd-dot--amber")} aria-hidden /><span>{DECISION_STATUS[d.status]}</span></p>
          <p className="dd-outcome__text">{done ? `${d.outcome ?? ""}${d.outcomeAt ? ` Recorded ${dayMonth(d.outcomeAt)}.` : ""}`.trim() : `Not decided yet. Still needed: ${list(waiting.map((m) => m.name))}.`}</p>
        </Card>
      </div>
      <AcknowledgeDialog open={asking} onClose={() => setAsking(false)} d={d} onAcknowledge={acknowledge} />
    </WorkspaceFrame>
  );
}

export default function Decision({ projectId, slug }: { projectId: string; slug: string }) {
  return <DecisionPage projectId={projectId} slug={slug} />;
}
