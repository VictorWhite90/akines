"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import Button from "@/components/kin/Button";
import NotFound from "@/components/kin/NotFound";
import { CtxBlock, Dot, PageHead, WorkspaceFrame } from "@/components/collaborate/workspace/Frame";
import { DECISION_STATUS, isDecided, useDecisions } from "@/lib/collab/decisions";
import { ME } from "@/lib/collab/me";
import { useNextSession } from "@/lib/collab/session";
import { useTasks, type WorkItem } from "@/lib/collab/tasks";
import { useWorkspace } from "@/lib/collab/workspace";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { cn } from "@/lib/cn";
import { Arrow, BackLink, Band, CwLink, PeopleBlock } from "../brief/parts";

/*
 * One milestone, mirrored from the product design (collaborate-my-projects-…-milestones-…): its state and due
 * date, the completion criteria, the work behind it and what is still to be settled, with who is responsible,
 * the next session and an unresolved decision beside it. Read from our Project: the milestone is one of
 * milestonesOf(project) (a deliverable stands as one in projects without milestones), and its work is the tasks
 * and deliverables filed under it (lib/collab/tasks.ts).
 */

type Step = { title: string; caption?: string; status: "Completed" | "In progress" | "Next" };
const STEP_LABEL: Record<Step["status"], string> = { Completed: "COMPLETED", "In progress": "IN PROGRESS", Next: "NEXT" };
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const first = (id?: PersonId) => (id ? PEOPLE[id]?.name.split(" ")[0] ?? "A member" : "the reviewer");
const name = (id: PersonId) => PEOPLE[id]?.name ?? "A member";
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);
/** "Due 6 Nov", "Due week 4", "Due this week". */
const dueText = (due: string) => `Due ${/^(This|Next|Later|Week)\b/.test(due) ? lowerFirst(due) : due}`;
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="cw-steps">
      {steps.map((s, i) => (
        <li key={`${s.title}-${i}`} className={cn("cw-step", `cw-step--${s.status === "In progress" ? "doing" : s.status === "Next" ? "next" : "done"}`)}>
          <span className="cw-step__mark" aria-hidden>{s.status === "Completed" ? <Check size={14} strokeWidth={1.5} /> : s.status === "In progress" ? <i /> : null}</span>
          <div className="cw-step__text">
            <p className="cw-step__title">{s.title}</p>
            {s.caption ? <p className="cw-step__cap">{s.caption}</p> : null}
          </div>
          <span className="cw-step__right"><span>{STEP_LABEL[s.status]}</span><Arrow /></span>
        </li>
      ))}
    </ol>
  );
}

/** A piece of work behind the milestone; the whole row opens its task page. */
function WorkRow({ item, href, phase }: { item: WorkItem; href: string; phase: string }) {
  const next = item.criteria.find((c) => !c.done);
  const status = item.status === "In review" && item.reviewer === ME ? "Needs your review" : item.status;
  const action = item.status === "Not started" ? "Open work" : "Continue working";
  return (
    <Link href={href} className="cw-work cw-work--link">
      <div className="cw-work__content">
        <h3 className="cw-work__title">{item.title}</h3>
        <p className="cw-work__next">{next ? `Next: ${sentence(next.title)}` : `${dueText(item.dueText)}.`}</p>
        <p className="cw-work__meta">
          <span className="cw-work__status"><Dot tone="accent" size={7} />{status}</span>
          <span>{name(item.owner)}</span>
          <span>{phase}</span>
        </p>
      </div>
      <span className="cw-work__act">
        <span className="k-btn k-btn--md k-btn--secondary"><span className="k-btn__label">{action}</span><span className="k-btn__icon k-btn__icon--right"><Arrow /></span></span>
      </span>
    </Link>
  );
}

export default function MilestonePage({ id, milestone }: { id: string; milestone: string }) {
  const ws = useWorkspace(id);
  const tasks = useTasks(ws.project, ws.collab);
  const decisions = useDecisions(id);
  const { session } = useNextSession(id);

  if (!ws.ready || !decisions.ready) return null;
  if (!ws.project) return <NotFound />;
  const index = ws.milestones.findIndex((m) => m.id === milestone);
  const m = ws.milestones[index];
  if (!m) return <NotFound />;

  const project = ws.project;
  const current = ws.milestones.find((x) => !x.done);
  const state = m.done ? { label: "COMPLETED", tone: "green" as const } : m.id === current?.id ? { label: "IN PROGRESS", tone: "accent" as const } : { label: "UPCOMING", tone: "gray" as const };
  const items = tasks.items.filter((t) => t.milestone?.id === m.id);
  // In a project without milestones the milestone is a deliverable, and that deliverable is its work.
  const own = !project.milestones.length ? items.find((t) => t.id === m.id) : undefined;
  const phase = ws.phase === "PLANNING" ? "Planning" : "Building";
  const taskHref = (t: WorkItem) => `${ws.href("tasks")}/${t.slug}`;

  // What done looks like: the deliverable's own steps, or the deliverables promised for this milestone.
  let steps: Step[];
  if (own) {
    const firstOpen = own.criteria.findIndex((c) => !c.done);
    steps = own.criteria.map((c, i) => ({ title: c.title, status: c.done ? "Completed" : i === firstOpen && own.status !== "Not started" ? "In progress" : "Next" }));
  } else {
    steps = items.filter((t) => t.kind === "deliverable").map((t) => ({
      title: t.title,
      status: t.status === "Completed" ? "Completed" : t.status === "Not started" ? "Next" : "In progress",
      caption: t.status === "Completed" ? `Approved by ${first(t.reviewer)}` : t.status === "In review" ? `Waiting for ${first(t.reviewer)}'s review` : t.status === "In progress" ? `${first(t.owner)} is working on it` : `${first(t.owner)}, ${lowerFirst(dueText(t.dueText))}`,
    }));
  }
  // The work behind it: tasks under way, and deliverables waiting for review (the others are criteria above).
  const work = own ? (own.status !== "Completed" ? [own] : []) : items.filter((t) => t.status !== "Completed" && (t.kind === "task" ? t.status !== "Not started" : t.status === "In review"));
  const open = decisions.pending.filter((d) => d.milestone === m.title);
  const outstanding = [
    ...open.map((d) => ({ key: d.id, title: d.title, caption: `Decision. ${DECISION_STATUS[d.status]}.` })),
    ...items.filter((t) => t.kind === "task" && t.status === "Not started").map((t) => ({ key: t.id, title: t.title, caption: `Task. ${dueText(t.dueText)}.` })),
  ];

  const responsible = new Set(items.flatMap((t) => [t.owner, ...(t.support ? [t.support] : [])]));
  const people = ws.members.filter((p) => !p.you && responsible.has(p.id));
  const others = ws.members.filter((p) => !p.you).map((p) => p.name.split(" ")[0]);
  const decision = open[0] ?? decisions.pending.find((d) => !isDecided(d.status));

  const context = (
    <>
      <PeopleBlock label="RESPONSIBLE" people={people} />
      {session.status === "upcoming" ? (
        <CtxBlock label="UPCOMING SESSION">
          <p className="cw-session__title">{session.name}</p>
          <p className="cw-ctx__line">{session.when}, {session.minutes} minutes</p>
          {others.length ? <p className="cw-ctx__line">With {list(others)}</p> : null}
        </CtxBlock>
      ) : null}
      {decision ? (
        <CtxBlock label="UNRESOLVED DECISIONS">
          <p className="cw-ctx__item">{decision.title}</p>
          <p className="cw-ctx__status"><Dot tone="accent" size={7} />{DECISION_STATUS[decision.status]}</p>
          <CwLink href={`${ws.href("decisions")}/${decision.slug}`} arrow>Review decision</CwLink>
        </CtxBlock>
      ) : null}
    </>
  );

  return (
    <WorkspaceFrame projectId={id} active="overview" context={context}>
      <PageHead back={<BackLink href={ws.href()}>Back to overview</BackLink>} label="MILESTONE" title={m.title.replace(/\.$/, "")}>
        <div className="cw-mstatus">
          <span className="cw-mstatus__state"><Dot tone={state.tone} />{state.label}</span>
          <span>{dueText(m.due)}</span>
        </div>
        {own?.description ? <p className="cw-pagehead__lead">{own.description}</p> : null}
      </PageHead>
      {steps.length ? (
        <Band label="COMPLETION CRITERIA" title="What done looks like." support={`The milestone is complete when ${steps.length === 1 ? "this is" : `all ${WORDS[steps.length] ?? steps.length} are`} true.`}>
          <Steps steps={steps} />
        </Band>
      ) : null}
      {work.length ? (
        <Band label="RELATED WORK" title="The work behind this milestone." support="Open any item to continue where it stands.">
          <div className="cw-rows">{work.map((t) => <WorkRow key={t.id} item={t} href={taskHref(t)} phase={phase} />)}</div>
        </Band>
      ) : null}
      {outstanding.length ? (
        <Band label="OUTSTANDING ITEMS" title="Still to be settled." support="Items that need attention before the milestone closes.">
          <ul className="cw-outstanding">
            {outstanding.map((o) => (
              <li key={o.key}><Dot tone="accent" /><div><p className="cw-outstanding__title">{o.title}</p><p className="cw-outstanding__cap">{o.caption}</p></div></li>
            ))}
          </ul>
        </Band>
      ) : null}
      {!steps.length && !work.length && !outstanding.length ? (
        <Band label="RELATED WORK" title="Nothing is filed under this milestone yet." support="Give a task this milestone and it will show here.">
          <div><Button variant="secondary" href={ws.href("tasks")} arrow="right">Open tasks</Button></div>
        </Band>
      ) : null}
    </WorkspaceFrame>
  );
}
