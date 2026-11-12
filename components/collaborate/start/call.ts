import type { CallMaterial, CollabCall, Field } from "@/lib/collab/types";
import type { DraftAnswers } from "@/lib/collab/drafts";
import type { WorkspaceKind } from "@/lib/collab/workspace";
import { ME } from "@/lib/collab/me";
import { PEOPLE } from "@/lib/data/people";
import type { Brief } from "./data";

/*
 * A finished builder becomes an open call for the people the member said they need (useCollab().postCall), so the
 * backend has it and people can express interest. The brief fills the call; the needs become its roles.
 */

const ROLE: Record<string, string> = {
  collaborators: "Collaborator", mentorship: "Mentor", technical: "Technical lead", research: "Researcher",
  funding: "Funding partner", distribution: "Distribution partner", customers: "Early user",
};
const FIELD: Record<string, Field> = {
  business: "Business", application: "Tech", film: "Media", research: "Community", community: "Community",
  book: "Arts", event: "Community", course: "Community", impact: "Community", other: "Arts",
};
const MATERIALS: CallMaterial[] = [
  { id: "works", label: "Up to three pieces of their work", hint: "Chosen from their work on Akines.", required: true },
  { id: "why", label: "Why this, and why them", hint: "A short note written for your call.", required: true },
  { id: "availability", label: "Their availability", hint: "For the dates in your timeline.", required: true },
];
const NONE = "Not added yet. Use Edit to add it.";
const dayMonth = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); };

export function callFrom(answers: DraftAnswers, brief: Brief, workspace: WorkspaceKind): Omit<CollabCall, "id" | "host" | "postedByMe" | "verified"> {
  const roles = answers.needs.map((n) => ROLE[n]).filter(Boolean);
  if (!roles.length) roles.push("Collaborator");
  const fields: Field[] = [FIELD[answers.type] ?? "Community"];
  // A visual project needs an art field, so the workspace it forms is the canvas (lib/collab/kits kindForFields).
  if (workspace === "art" && !fields.some((f) => f === "Arts" || f === "Design")) fields.push("Arts");
  const part = (s: string) => (s && s !== NONE ? s : "");
  const about = [part(brief.purpose), part(brief.problem), part(brief.audience) && `Who it is for: ${brief.audience}`, part(brief.outcome) && `Success looks like this: ${brief.outcome}`].filter(Boolean).join("\n\n");
  const summary = part(brief.overview) || part(brief.name) || "A new project on Akines.";
  return {
    title: brief.name.trim(), org: PEOPLE[ME]?.name ?? "Akines member", orgKind: "Independent project", city: PEOPLE[ME]?.city || "Lagos", where: "Hybrid",
    photo: workspace === "art" ? "collabArt" : "teamWork", summary: summary.length > 140 ? `${summary.slice(0, 137).trimEnd()}...` : summary, about: about || summary,
    roles, fields, level: "Any level", fee: "To be agreed together",
    rights: "Everyone is credited. You can each show your part anywhere.",
    selection: "I read every application. Shortlisted people get a 20-minute conversation, and everyone hears back.",
    teamSize: Math.max(2, roles.length + 1), materials: MATERIALS,
    timeline: [{ label: "Applications close", when: dayMonth(14) }, { label: "Work starts", when: dayMonth(21) }, { label: "Finished", when: "Agreed together" }],
    closesInDays: 14,
  };
}
