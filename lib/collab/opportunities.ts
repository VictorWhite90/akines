import { ME } from "./me";
import { discoverProject, type ProjectType } from "./projects";
import type { Application, CollabCall, Project } from "./types";
import { PEOPLE } from "@/lib/data/people";

/*
 * Opportunities (the design's collaborate/opportunities): the open roles on projects looking for people, one card
 * per role, best match to your profile first. Read from the open calls you have not applied to and do not host,
 * so it follows the backend; the order is how closely a role's name matches what you do.
 */

export type OpenRole = { id: string; role: string; summary: string; type: ProjectType; project: string; commitment: string; owner: string; href: string };

const words = (s: string) => s.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2);

export function openRoles(calls: CollabCall[], projects: Project[], appFor: (callId: string) => Application | undefined): OpenRole[] {
  const mine = new Set(words(PEOPLE[ME]?.role ?? ""));
  const onTeam = (c: CollabCall) => projects.some((p) => p.callId === c.id && p.members.some((m) => m.id === ME));
  const out: (OpenRole & { score: number; order: number })[] = [];
  calls.filter((c) => !c.postedByMe && c.host !== ME && c.closesInDays > 0 && !appFor(c.id) && !onTeam(c)).forEach((c) => {
    const p = discoverProject(c, projects);
    p.needs.forEach((n) => {
      const score = words(n.title).filter((w) => mine.has(w)).length;
      out.push({ id: `${c.id}:${n.title}`, role: n.title, summary: n.detail, type: p.type, project: p.title, commitment: p.commitment, owner: p.owner, href: `/collaborate/projects/${c.id}`, score, order: out.length });
    });
  });
  return out.sort((a, b) => b.score - a.score || a.order - b.order).map((r) => ({ id: r.id, role: r.role, summary: r.summary, type: r.type, project: r.project, commitment: r.commitment, owner: r.owner, href: r.href }));
}
