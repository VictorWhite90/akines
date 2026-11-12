import { DEMO } from "@/lib/demo/mode";
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

export type ContributionType = "Work submitted" | "Milestone completed" | "Decision influenced" | "Joined the team" | "Interest sent" | "Peer acknowledgement" | "Skill demonstrated" | "Final credit";
export type Contribution = { id: string; type: ContributionType; at: number; date: string; title: string; context: string; relatedWork: string; project: string; acknowledgement?: string; href?: string };

const name = (id: PersonId) => PEOPLE[id]?.name ?? "A teammate";
const first = (id: PersonId) => name(id).split(" ")[0];
export const longDate = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The demo's record (the design's 12.32 My Contributions, word for word): what Kemi did on Career Guidance for Everyone
 * and an earlier project. What she does in the demo (interest sent, teams joined) is added on top.
 */
const CAREER = "/collaborate/my-projects/career-guidance-for-everyone";
const at = (month: number, day: number) => new Date(2026, month - 1, day, 12).getTime();
const SAMPLE: Omit<Contribution, "date">[] = [
  { id: "brief-acknowledged", type: "Peer acknowledgement", at: at(11, 2), title: "Acknowledgement of the project brief", context: "Tobi Adeyemi acknowledged the shared project brief.", relatedWork: "Shared project brief", project: "Career Guidance for Everyone", href: `${CAREER}/brief` },
  { id: "journey-map", type: "Work submitted", at: at(10, 29), title: "Student journey map", context: "Submitted to the shared workspace and reviewed by two team members.", relatedWork: "Map the student journey", project: "Career Guidance for Everyone", acknowledgement: "Acknowledged by Adaeze Okoye." },
  { id: "onboarding-decision", type: "Decision influenced", at: at(10, 27), title: "Choose the onboarding approach", context: "Your comments on the two onboarding options were part of the discussion before the decision.", relatedWork: "Decision discussion", project: "Career Guidance for Everyone", href: `${CAREER}/conversations/decision-discussion` },
  { id: "product-design", type: "Skill demonstrated", at: at(10, 24), title: "Product design", context: "Shown in the student journey map and the onboarding sketches.", relatedWork: "Map the student journey", project: "Career Guidance for Everyone" },
  { id: "brief-approved", type: "Milestone completed", at: at(10, 12), title: "Project brief approved", context: "Completed with Tobi Adeyemi and Adaeze Okoye.", relatedWork: "Shared project brief", project: "Career Guidance for Everyone", acknowledgement: "Acknowledged by Ngozi Eze.", href: `${CAREER}/brief` },
  { id: "wayfinding", type: "Final credit", at: at(8, 14), title: "Campus wayfinding study", context: "Credited as Product Designer when the project closed.", relatedWork: "Final project record", project: "Campus Wayfinding Study" },
];
/** The sample applications and projects the record above already covers. */
const SEEDED = new Set(["career-guidance-for-everyone", "community-learning-initiative", "mentorship-circle", "adire-stories", "community-learning-initiative-kemi", "craft-memory-archive-kemi", "a-better-way-to-learn-kemi"]);

export function contributionsOf(projects: Project[], myApps: Application[], call: (id: string) => CollabCall | undefined): Contribution[] {
  const out: Omit<Contribution, "date">[] = [];
  const mine = projects.filter((p) => p.members.some((m) => m.id === ME) && !(DEMO && SEEDED.has(p.id)));
  if (DEMO) { out.push(...SAMPLE); myApps = myApps.filter((a) => !SEEDED.has(a.id)); }

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
