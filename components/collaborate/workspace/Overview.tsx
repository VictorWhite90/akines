"use client";

import Link from "next/link";
import Button from "@/components/kin/Button";
import { Empty } from "@/components/kin/Overlay";
import { useBrief } from "@/lib/collab/brief";
import { useDecisions } from "@/lib/collab/decisions";
import { parseDue, dayMonth, useTasks, type TaskStatus } from "@/lib/collab/tasks";
import { useWorkspace, workspaceHref } from "@/lib/collab/workspace";
import type { Milestone, Project } from "@/lib/collab/types";
import { cn } from "@/lib/cn";
import { Card, Metric, Metrics } from "./blocks";
import { PageHead, WorkspaceFrame } from "./Frame";
import { CwLink, Dot, IconArrow, IconCheck, IconUpRight } from "./parts";
import { useNeedsReview } from "./Rail";
import { InterestRequestsBand } from "../applicants/band";
import "../styles/overview.css";

/*
 * A project's overview, mirrored from the product design (.ov in ../styles/overview.css, cd-* in workspace.css):
 * the four counts, the milestone progress, task status, this week's activity, the brief at a glance and what to
 * continue with. Everything is read from the project; a project with no work yet shows the design's empty state.
 */

export const milestoneHref = (projectId: string, m: Milestone) => `${workspaceHref(projectId)}/milestones/${encodeURIComponent(m.id)}`;

/** "12 OCT" from a milestone's due ("12 Oct", "Sat 2 Nov"), or its own words ("WEEK 4"). */
const dueCaps = (due: string) => { const at = parseDue(due); return (at ? dayMonth(at) : due).toUpperCase(); };

type Stage = { state: "done" | "doing" | "next"; when: string; title: string; href: string };
/** Three milestones around where the project is: the last one done, the current one, and the next. */
function stagesOf(p: Project, ms: Milestone[], doneAt: (m: Milestone) => number | undefined): Stage[] {
  const cur = ms.findIndex((m) => !m.done);
  const start = cur < 0 ? Math.max(0, ms.length - 3) : Math.max(0, Math.min(cur - 1, ms.length - 3));
  return ms.slice(start, start + 3).map((m, i) => {
    const idx = start + i;
    const state = m.done ? "done" : idx === cur ? "doing" : "next";
    const at = doneAt(m);
    const when = state === "done" ? `DONE ${at ? dayMonth(at).toUpperCase() : dueCaps(m.due)}` : state === "doing" ? `DUE ${dueCaps(m.due)}` : `PLANNED ${dueCaps(m.due)}`;
    return { state, when, title: m.title.replace(/\.$/, ""), href: milestoneHref(p.id, m) };
  });
}

function Stages({ stages }: { stages: Stage[] }) {
  return (
    <ol className="cd-stages" style={{ ["--cd-n" as string]: stages.length } as React.CSSProperties}>
      {stages.map((s) => (
        <li key={s.href} className="cd-stage" aria-current={s.state === "doing" ? "step" : undefined}>
          <Link href={s.href} className="cd-stage__body">
            <span className="cd-stage__rail">
              <span className={cn("cd-stage__mark", `cd-stage__mark--${s.state}`)} aria-hidden>{s.state === "done" ? <IconCheck size={13} sw={1.6} /> : s.state === "doing" ? <i /> : null}</span>
              <i className="cd-stage__line" aria-hidden />
            </span>
            <span className="cd-stage__when">{s.when}</span>
            <span className="cd-stage__title">{s.title}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

const TONES: { label: TaskStatus; tone: string }[] = [{ label: "Not started", tone: "gray" }, { label: "In progress", tone: "accent" }, { label: "In review", tone: "ink" }, { label: "Completed", tone: "green" }];
function Status({ counts }: { counts: Record<TaskStatus, number> }) {
  const items = TONES.map((t) => ({ ...t, label: t.label, n: counts[t.label] }));
  const total = items.reduce((a, b) => a + b.n, 0);
  return (
    <div className="cd-status">
      <div className="cd-status__bar" role="img" aria-label={items.map((i) => `${i.label} ${i.n}`).join(", ")}>
        {items.map((i) => <i key={i.label} className={`cd-tone--${i.tone}`} style={{ flexGrow: i.n }} hidden={i.n === 0} />)}
      </div>
      <ul className="cd-status__list">
        {items.map((i) => <li key={i.label}><span className="cd-status__name"><i className={cn("cd-status__dot", `cd-tone--${i.tone}`)} aria-hidden />{i.label}</span><span className="cd-status__n">{i.n}</span></li>)}
      </ul>
      <span className="sr-only">{total} in all</span>
    </div>
  );
}

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
/** Updates from the team this week, Monday to Sunday: everything dated in the ledger, check-ins and work threads. */
function weekOf(p: Project) {
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)).getTime();
  const stamps = [...p.ledger.map((l) => l.at), ...(p.checkins ?? []).map((c) => c.at), ...(p.deliverables ?? []).flatMap((d) => d.thread.map((t) => t.at))];
  const bars = [0, 0, 0, 0, 0, 0, 0];
  for (const at of stamps) { const i = Math.floor((at - monday) / 86400000); if (i >= 0 && i < 7) bars[i]++; }
  return { bars, total: bars.reduce((a, b) => a + b, 0), today: (now.getDay() + 6) % 7 };
}
function Week({ bars, total, today }: { bars: number[]; total: number; today: number }) {
  const top = Math.max(...bars, 1);
  const caption = "updates from the team";
  return (
    <div className="cd-week">
      <p className="cd-week__total"><span>{total}</span>{caption}</p>
      <div className="cd-week__bars" role="img" aria-label={`${caption}: ${bars.join(", ")} from Monday to Sunday`}>
        {bars.map((n, i) => (
          <span key={i} className="cd-week__col">
            <i className={cn("cd-week__bar", i === today && "cd-week__bar--today", n === 0 && "cd-week__bar--zero")} style={n ? { height: `${Math.round((n / top) * 100)}%` } : undefined} />
            <span className="cd-week__day">{DAY_LETTERS[i]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Row({ title, status, href }: { title: string; status: string; href: string }) {
  return (
    <Link href={href} className="cd-row">
      <span className="cd-row__text"><span className="cd-row__title">{title}</span><span className="cd-row__status"><Dot size={7} />{status}</span></span>
      <span className="cd-row__act"><span className="cd-row__lbl">Continue</span><IconUpRight /></span>
    </Link>
  );
}

const firstSentence = (s?: string) => s?.split(/(?<=\.)\s/)[0]?.replace(/\.$/, "");

export default function Overview({ projectId }: { projectId: string }) {
  const ws = useWorkspace(projectId);
  const tasks = useTasks(ws.project, ws.collab);
  const decisions = useDecisions(projectId);
  const review = useNeedsReview(projectId);
  const brief = useBrief(ws.project, ws.project ? ws.summary : "", ws.project?.callId ? ws.collab.call(ws.project.callId) : undefined);
  if (!ws.project) return <WorkspaceFrame projectId={projectId} active="overview" rail>{null}</WorkspaceFrame>;
  const p = ws.project;
  const base = workspaceHref(p.id);
  const ms = ws.milestones;
  const items = tasks.items;

  if (!items.length && !ms.length && !decisions.list.length) {
    return (
      <WorkspaceFrame projectId={projectId} active="overview" rail="short">
        <div className="ov">
          <PageHead label="OVERVIEW" title={ws.title} lead={ws.summary} />
          <Metrics>
            <Metric label="MILESTONES" value="0" caption="none yet" href={`${base}/tasks/milestones`} />
            <Metric label="OPEN TASKS" value="0" caption="none yet" href={`${base}/tasks`} />
            <Metric label="TO REVIEW" value="0" caption="all clear" href={`${base}/tasks`} />
            <Metric label="DECISIONS" value="0" caption="none yet" href={`${base}/decisions`} />
          </Metrics>
          <div data-m="up">
            <Empty className="cw-empty" title="Your project is ready for its next step." text="Once your team begins creating, you'll find your progress and priorities here."
              action={<Button href={`${base}/tasks`} iconRight={<IconArrow />}>Open tasks</Button>} />
          </div>
        </div>
      </WorkspaceFrame>
    );
  }

  const count = (s: TaskStatus) => items.filter((t) => t.status === s).length;
  const counts = { "Not started": count("Not started"), "In progress": count("In progress"), "In review": count("In review"), Completed: count("Completed") };
  const open = items.length - counts.Completed;
  const doneAt = (m: Milestone) => p.deliverables?.find((d) => d.id === m.id)?.approvedAt ?? p.ledger.find((l) => l.what === `Milestone done: ${m.title}`)?.at;
  const toReview = review.work.length;
  const toDecide = decisions.awaitingMe.length;
  const glance = [
    { label: "AUDIENCE", value: firstSentence(brief.parts.find((x) => x.key === "users")?.body) },
    { label: "GOAL", value: firstSentence(brief.parts.find((x) => x.key === "success")?.body) },
    { label: "SCOPE", value: firstSentence(brief.parts.find((x) => x.key === "scope")?.body) },
  ].filter((g) => g.value);
  const mine = items.find((t) => t.owner === ws.members.find((m) => m.you)?.id && t.status === "In progress");
  const work = [
    ...(review.work[0] ? [{ title: `Review ${review.work[0].title.charAt(0).toLowerCase()}${review.work[0].title.slice(1)}`, status: "Needs your review", href: review.work[0].href }] : []),
    ...(review.decisions[0] ? [{ title: review.decisions[0].title, status: "Waiting for your acknowledgement", href: review.decisions[0].href }] : mine ? [{ title: mine.title, status: "In progress", href: `${base}/tasks/${mine.slug}` }] : []),
  ];

  return (
    <WorkspaceFrame projectId={projectId} active="overview" rail>
      <div className="ov">
        <PageHead label="OVERVIEW" title={ws.title} lead={ws.summary} />
        <Metrics>
          <Metric label="MILESTONES" value={`${ms.filter((m) => m.done).length}/${ms.length}`} caption="complete" href={`${base}/tasks/milestones`} />
          <Metric label="OPEN TASKS" value={open} caption={`${counts["In review"]} in review`} href={`${base}/tasks`} />
          <Metric label="TO REVIEW" value={toReview} caption={toReview ? (toReview === 1 ? "needs you" : "need you") : "all clear"} dot={toReview > 0} href={`${base}/tasks`} />
          <Metric label="DECISIONS" value={toDecide} caption={toDecide ? "to make" : "none waiting"} dot={toDecide > 0} href={`${base}/decisions`} />
        </Metrics>
        {/* Interest requests (Figma 02b) sit between the metric cards and Project progress */}
        <InterestRequestsBand projectId={p.id} callId={p.callId} href={`${base}/applicants`} />
        {ms.length ? <Card title="PROJECT PROGRESS" id="progress"><Stages stages={stagesOf(p, ms, doneAt)} /></Card> : null}
        <div className="cd-pair">
          <Link href={`${base}/tasks/board`} className="cd-card ov-linkcard" data-m="up">
            <header className="cd-card__head"><h3 className="cd-card__title">TASK STATUS</h3></header>
            <Status counts={counts} />
          </Link>
          <Card title="THIS WEEK" id="this-week"><Week {...weekOf(p)} /></Card>
        </div>
        {glance.length ? (
          <Card title="BRIEF AT A GLANCE" id="brief-glance">
            <dl className="cd-glance">{glance.map((g) => <div key={g.label}><dt>{g.label}</dt><dd>{g.value}</dd></div>)}</dl>
            <CwLink href={`${base}/brief`}>View full brief</CwLink>
          </Card>
        ) : null}
        {work.length ? (
          <section className="ov-continue" data-m="up" aria-label="Continue working">
            <h3 className="cd-label">CONTINUE WORKING</h3>
            <div className="cd-rows">{work.map((w) => <Row key={w.href} {...w} />)}</div>
          </section>
        ) : null}
      </div>
    </WorkspaceFrame>
  );
}
