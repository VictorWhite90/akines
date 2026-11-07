import { ME } from "./me";
import type { Application, CollabCall, Project } from "./types";
import { STAGE_LABEL } from "./useCollab";
import { workspaceHref } from "./workspace";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { listOf } from "./projects";

/*
 * My Contributions (the design's collaborate/contributions): a record of your work with others, with the context
 * it came from, most recent first. Read from what the backend already keeps: the work you delivered and who
 * approved it, the milestones and agreements on the projects you are part of, and your interest in open calls.
 */

export type ContributionType = "Work submitted" | "Milestone completed" | "Decision influenced" | "Joined the team" | "Interest sent";
export type Contribution = { id: string; type: ContributionType; at: number; date: string; title: string; context: string; relatedWork: string; project: string; acknowledgement?: string; href?: string };

const name = (id: PersonId) => PEOPLE[id]?.name ?? "A teammate";
const first = (id: PersonId) => name(id).split(" ")[0];
export const longDate = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function contributionsOf(projects: Project[], myApps: Application[], call: (id: string) => CollabCall | undefined): Contribution[] {
  const out: Omit<Contribution, "date">[] = [];
  const mine = projects.filter((p) => p.members.some((m) => m.id === ME));

  for (const p of mine) {
    const others = p.members.filter((m) => m.id !== ME).map((m) => name(m.id));
    for (const d of p.deliverables ?? []) {
      if (d.owner !== ME) continue;
      const sent = [...d.thread].reverse().find((t) => t.kind === "submitted");
      if (d.status === "approved") {
        out.push({ id: `${p.id}-${d.id}`, type: "Work submitted", at: d.approvedAt ?? sent?.at ?? p.createdAt, title: d.title, context: `Submitted to the shared workspace and approved by ${first(d.approver)}.`, relatedWork: d.proof[0]?.title ?? d.title, project: p.title, acknowledgement: `Acknowledged by ${name(d.approver)}.`, href: workspaceHref(p.id, "tasks") });
      } else if (d.status === "review" && sent) {
        out.push({ id: `${p.id}-${d.id}`, type: "Work submitted", at: sent.at, title: d.title, context: `Submitted to the shared workspace for ${first(d.approver)} to review.`, relatedWork: d.proof[0]?.title ?? d.title, project: p.title, href: workspaceHref(p.id, "tasks") });
      }
    }
    for (const e of p.ledger) {
      const done = e.what.match(/^Milestone done: (.+)$/);
      if (done) out.push({ id: `${p.id}-m-${e.at}`, type: "Milestone completed", at: e.at, title: cap(done[1]!), context: others.length ? `Completed with ${listOf(others)}.` : "Completed.", relatedWork: "Project milestones", project: p.title, href: workspaceHref(p.id, "tasks") });
      else if (e.who === ME && /^Signed the charter/.test(e.what)) out.push({ id: `${p.id}-c-${e.at}`, type: "Decision influenced", at: e.at, title: "The team's agreement", context: "You signed the terms the team agreed before work started.", relatedWork: "Project charter", project: p.title, href: workspaceHref(p.id, "agreements") });
    }
    if (p.host !== ME && !myApps.some((a) => a.projectId === p.id)) {
      const role = p.members.find((m) => m.id === ME)?.role ?? "";
      out.push({ id: `${p.id}-joined`, type: "Joined the team", at: p.createdAt, title: p.title, context: `Joined ${first(p.host)}’s project${role ? ` as ${role.toLowerCase()}` : ""}.`, relatedWork: role || "Team member", project: p.title, href: workspaceHref(p.id) });
    }
  }

  for (const a of myApps) {
    if (a.stage === "withdrawn") continue;
    const c = call(a.callId);
    const title = c?.title ?? "An open call";
    const last = a.history.at(-1);
    if (a.stage === "joined") {
      out.push({ id: a.id, type: "Joined the team", at: last?.at ?? Date.now(), title, context: `${last?.note ?? "You accepted, and joined the team."}`, relatedWork: a.role, project: title, acknowledgement: c ? `Chosen by ${name(c.host)}.` : undefined, href: a.projectId ? workspaceHref(a.projectId) : `/collaborate/projects/${a.callId}` });
    } else {
      const label = STAGE_LABEL[a.stage].applicant;
      out.push({ id: a.id, type: "Interest sent", at: a.history[0]?.at ?? Date.now(), title, context: a.stage === "not-selected" && a.feedback ? `${label}. ${a.feedback}` : `${label}.${last?.note ? ` ${last.note}` : ""}`, relatedWork: a.role, project: title, href: `/collaborate/projects/${a.callId}` });
    }
  }

  return out.sort((x, y) => y.at - x.at).map((c) => ({ ...c, date: longDate(c.at) }));
}
