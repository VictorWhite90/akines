import { ME } from "./me";
import { DEMO } from "@/lib/demo/mode";
import { discoverProject, listedOn, type ProjectType } from "./projects";
import type { Application, CollabCall, Project } from "./types";
import { PEOPLE } from "@/lib/data/people";

/*
 * Opportunities (the design's collaborate/opportunities): the open roles on projects looking for people, one card
 * per role, best match to your profile first. Read from the open calls you have not applied to and do not host,
 * so it follows the backend; the order is how closely a role's name matches what you do.
 */

export type OpenRole = { id: string; role: string; summary: string; type: ProjectType; project: string; commitment: string; owner: string; href: string };

const words = (s: string) => s.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2);

/** The demo shows the design's eight open roles, in its order (project id and role). */
const SAMPLE_ORDER = [
  "a-better-way-to-learn:Product Designer", "market-women-ledger:UX Researcher", "clinic-queue:UX Writer", "voices-of-lagos:Cinematographer",
  "voices-of-lagos:Sound Designer", "stories-for-small-hands:Illustrator", "a-better-way-to-learn:Education Researcher", "market-women-ledger:Mobile Developer",
];

/** "Shapes how students move through each lesson. A few hours a week." → the role's work, and the time it asks for. */
function splitNeed(detail: string, fallback: string) {
  const parts = detail.split(/(?<=\.)\s+/);
  return parts.length > 1 ? { summary: parts.slice(0, -1).join(" "), commitment: parts.at(-1)! } : { summary: detail, commitment: fallback };
}

export function openRoles(calls: CollabCall[], projects: Project[], appFor: (callId: string) => Application | undefined): OpenRole[] {
  const mine = new Set(words(PEOPLE[ME]?.role ?? ""));
  const onTeam = (c: CollabCall) => projects.some((p) => p.callId === c.id && p.members.some((m) => m.id === ME));
  const out: (OpenRole & { score: number; order: number })[] = [];
  calls.filter((c) => listedOn(c, "discover") && !c.postedByMe && c.host !== ME && c.closesInDays > 0 && !appFor(c.id) && !onTeam(c)).forEach((c) => {
    const p = discoverProject(c, projects);
    p.needs.forEach((n) => {
      const score = words(n.title).filter((w) => mine.has(w)).length;
      const { summary, commitment } = splitNeed(n.detail, p.commitment);
      out.push({ id: `${c.id}:${n.title}`, role: n.title, summary, type: p.type, project: p.title, commitment, owner: p.owner, href: `/collaborate/projects/${c.id}`, score, order: out.length });
    });
  });
  const sorted = DEMO && out.some((r) => SAMPLE_ORDER.includes(r.id))
    ? SAMPLE_ORDER.flatMap((id) => out.filter((r) => r.id === id))
    : out.sort((a, b) => b.score - a.score || a.order - b.order);
  return sorted.map((r) => ({ id: r.id, role: r.role, summary: r.summary, type: r.type, project: r.project, commitment: r.commitment, owner: r.owner, href: r.href }));
}
