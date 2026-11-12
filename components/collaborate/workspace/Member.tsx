"use client";

import { useState } from "react";
import Link from "next/link";
import { useDecisions } from "@/lib/collab/decisions";
import { decisionHref, workHref } from "@/lib/collab/conversations";
import { useNextSession } from "@/lib/collab/session";
import { contributionsOf, creditsRow, sampleMember, skillsOf, usedSkills, type Contribution } from "@/lib/collab/team";
import { AVAILABILITY_TEXT, workspaceHref } from "@/lib/collab/workspace";
import { cn } from "@/lib/cn";
import { PageHead, WorkspaceFrame } from "./Frame";
import { Card, Metric, Metrics } from "./blocks";
import { BackLink, IconUpRight } from "./parts";
import { memberSlug, SkillList, useTeamPeople } from "./Team";
import "../styles/team.css";
import "../styles/member.css";

/*
 * A team member's page in the project workspace, mirrored from the product design (classes mb-* in
 * ../styles/member.css): open tasks, contributions, acknowledgements and the next session, contributions by
 * week, availability, their role, skills and contribution history. Everything is read from the project.
 */

const WEEK = 7 * 24 * 3_600_000;
const short = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const lcFirst = (s: string) => (s ? s[0]!.toLowerCase() + s.slice(1) : s);
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** Monday 00:00 of the week `at` falls in. */
function weekStart(at: number) {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

function Row({ row }: { row: Contribution }) {
  const inner = (
    <>
      <span className="mb-row__text"><span className="mb-row__title">{row.title}</span><span className="mb-row__status">{row.status}</span></span>
      {row.href ? <span className="mb-row__act"><span className="mb-row__open">Open</span><IconUpRight size={16} /></span> : null}
    </>
  );
  return row.href ? <Link href={row.href} className="mb-row mb-row--link">{inner}</Link> : <div className="mb-row">{inner}</div>;
}

export default function Member({ projectId, slug }: { projectId: string; slug: string }) {
  const { ws, people } = useTeamPeople(projectId);
  const decisions = useDecisions(projectId);
  const { session } = useNextSession(projectId);
  const [today] = useState(() => Date.now());
  const m = people.find((x) => memberSlug(x.name) === slug || x.id === slug);
  if (!ws.project) return null;
  const p = ws.project;
  if (!m) {
    return (
      <WorkspaceFrame projectId={projectId} active="team" rail="full">
        <div className="mb-page"><PageHead back={<BackLink href={ws.href("team")}>Back to team</BackLink>} label="TEAM MEMBER" title="Not on this team." lead="This person is not a member of this project." /></div>
      </WorkspaceFrame>
    );
  }

  const first = m.name.split(" ")[0];
  const owned = (p.deliverables ?? []).filter((d) => d.owner === m.id);
  const openTasks = p.tasks.filter((t) => t.who === m.id && t.status !== "done").length + owned.filter((d) => d.status !== "approved").length;
  const rows = contributionsOf(p, m.id, decisions.list, { work: (d) => workHref(projectId, d), decision: (d) => decisionHref(projectId, d) });
  const acknowledged = owned.filter((d) => d.status === "approved").length;
  const since = rows.length ? short(Math.min(...rows.map((r) => r.at))) : null;

  // The last four weeks, this one included.
  const now = weekStart(today);
  const weeks = [3, 2, 1, 0].map((k) => { const start = now - k * WEEK; return { start, n: rows.filter((r) => r.at >= start && r.at < start + WEEK).length }; });
  const inWeeks = weeks.reduce((a, w) => a + w.n, 0);
  const max = Math.max(...weeks.map((w) => w.n), 1);
  const fromLabel = short(weeks[0]!.start);

  const sessionOn = session.status !== "none";
  const sessionTime = session.when.split(", ")[1] ?? session.time;
  const used = usedSkills(projectId, m.id);
  const skills = skillsOf(m.id, projectId);
  const sample = sampleMember(projectId, m.id);
  const fields = sample?.fields ?? [
    { label: "PROJECT ROLE", value: m.role },
    { label: "EXPECTED", value: m.contribution },
    owned.length ? { label: "RESPONSIBLE FOR", value: list(owned.map((d) => d.title)) } : null,
  ].filter((x): x is { label: string; value: string } => !!x);

  return (
    <WorkspaceFrame projectId={projectId} active="team" rail="full">
      <div className="mb-page">
        <PageHead back={<><BackLink href={ws.href("team")}>Back to team</BackLink><span className="mb-avatar" aria-hidden>{m.initials}</span></>} label="TEAM MEMBER" title={m.you ? `${m.name} (you)` : m.name} lead={sample?.lead ?? `${m.role}, ${lcFirst(m.contribution.replace(/\.$/, ""))}.`} />
        <Metrics>
          <Metric label="OPEN TASKS" value={openTasks} caption="in this project" href={ws.href("tasks")} />
          <Metric label="CONTRIBUTIONS" value={rows.length} caption={since ? `since ${since}` : "none yet"} scrollTo="mb-history" />
          <Metric label="ACKNOWLEDGED" value={acknowledged} caption={acknowledged === 1 ? "by a teammate" : "by teammates"} scrollTo="mb-history" />
          {sessionOn ? <Metric label="NEXT SESSION" value={session.status === "ongoing" ? "Now" : session.when.split(", ")[0]!.slice(0, 3)} caption={session.status === "ongoing" ? `Started ${session.startedAt ?? ""}`.trim() : sessionTime} dot href={`${workspaceHref(projectId)}/meet`} /> : null}
        </Metrics>
        <div className="mb-pair">
          <Card title="CONTRIBUTIONS BY WEEK" className="mb-week">
            <p className="mb-total"><span>{inWeeks}</span>logged since {fromLabel}</p>
            <div className="mb-chart" role="img" aria-label={`${inWeeks} logged since ${fromLabel}, by week from ${fromLabel} to ${short(now)}`}>
              {weeks.map((w, i) => {
                const isNow = i === weeks.length - 1;
                return (
                  <span className="mb-day" key={w.start}>
                    <i className={cn("mb-bar", isNow && "mb-bar--now")} style={{ height: `${w.n ? Math.round(12 + (48 * w.n) / max) : 4}px` }} />
                    <span className={cn("mb-day__label", isNow && "is-now")}>{short(w.start)}</span>
                  </span>
                );
              })}
            </div>
          </Card>
          <Card title="AVAILABILITY" className="mb-avail">
            <p className="mb-status"><i className="mb-status__dot" aria-hidden /><span>{AVAILABILITY_TEXT[m.availability]}</span></p>
            {sessionOn ? (
              <>
                <div className="mb-rule" aria-hidden />
                <p className="mb-label">NEXT SESSION</p>
                <p className="mb-session">{session.name}</p>
                <p className="mb-meta">{session.status === "ongoing" ? `Started ${session.startedAt ?? ""}`.trim() : session.when.replace(", ", " at ")}</p>
              </>
            ) : null}
            <p className="mb-meta">Shown because {m.you ? "you" : first} chose to share it.</p>
          </Card>
        </div>
        <Card title="ROLE IN THIS PROJECT" className="mb-role">
          <dl className="mb-fields">{fields.map((f) => <div className="mb-field" key={f.label}><dt className="mb-label">{f.label}</dt><dd>{f.value}</dd></div>)}</dl>
        </Card>
        {skills.length ? (
          <Card title="SKILLS" className="mb-skills">
            <SkillList labels={skills.map((label) => ({ label, used: used.includes(label) }))} wrap />
            <p className="mb-meta">A dot marks a skill {m.you ? "you have" : `${first} has`} used in project work.</p>
          </Card>
        ) : null}
        <section id="mb-history" className="mb-history" data-m="up">
          <h2 className="mb-label">CONTRIBUTION HISTORY</h2>
          <p className="mb-meta">Recognises meaningful work. Hours online and message counts are never recorded.</p>
          <ul className="mb-rows">
            {[...rows, creditsRow(p, ws.href("agreements"))].map((r) => <li key={r.id}><Row row={r} /></li>)}
          </ul>
        </section>
      </div>
    </WorkspaceFrame>
  );
}
