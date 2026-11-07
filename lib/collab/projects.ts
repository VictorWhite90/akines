"use client";

import { ME } from "./me";
import type { Application, CollabCall, Project } from "./types";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * Discover Projects, Saved projects and a project's page, as the design shows them (components/collaborate/projects),
 * read from our open calls: their "project looking for people" is our CollabCall, and its id is the call's id.
 *
 * What a call does not carry yet (the project's stage and type, the time it asks for, how the team works, its
 * progress so far) is a small profile per call, shaped like the resource the backend would serve with the call
 * (GET /collab/calls/<id>/profile). The sample calls have one; any other call falls back to what it does say.
 */

export const PROJECT_STAGES = ["Just an idea", "Exploring", "Ready to plan", "Building", "Launching"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];
export const PROJECT_TYPES = ["Business", "Application", "Film", "Research", "Community", "Book", "Event", "Course", "Social impact"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];
export type CommitmentCat = "month" | "week" | "weekend" | "full" | "flexible";
export type SkillCat = "Design" | "Engineering" | "Research" | "Writing" | "Film and sound" | "Community";

export type CallProfile = {
  stage: ProjectStage;
  type: ProjectType;
  /** As the card says it, and as the project page's "Working together" says it. */
  commitment: string;
  commitmentCat: CommitmentCat;
  rhythm?: string;
  openTo?: string;
  /** What each role does, by role name. */
  needs?: Record<string, string>;
  skillCats?: SkillCat[];
  skillTags?: string[];
  progress?: { title: string; detail: string }[];
};

/** The sample calls' profiles (lib/collab/seed.ts), written the way the design writes its own. */
export const CALL_PROFILES: Record<string, CallProfile> = {
  "jabi-mural": {
    stage: "Ready to plan", type: "Event", commitment: "Nine days of painting, from 20 November.", commitmentCat: "full",
    rhythm: "A design review before painting starts, then daily on the wall", openTo: "Individuals",
    needs: { "Lead muralist": "Leads the design and the painting of the lakeside wall.", "Assistant painter": "Paints alongside the lead for the nine days.", "Graphic designer": "Turns the mural into the festival's posters and signs." },
    skillCats: ["Design", "Community"], skillTags: ["Mural painting", "Illustration", "Graphic design", "Public art"],
    progress: [{ title: "This year's theme", detail: "\"Arriving\": what Abuja looks like to people who came here to start again." }, { title: "The wall", detail: "Twenty metres on the lake walk, cleaned and primed. The next step is the design." }],
  },
  "kubwa-bread": {
    stage: "Ready to plan", type: "Film", commitment: "One early shoot day, then a week of edits.", commitmentCat: "weekend",
    rhythm: "A chat at the bakery first, then the shoot from 4am", openTo: "Pairs or individuals",
    needs: { Videographer: "Films one honest, warm minute about the family behind the bakery.", Photographer: "Takes ten photos for the bakery's page and the shop wall." },
    skillCats: ["Film and sound", "Design"], skillTags: ["Filmmaking", "Photography", "Storytelling", "Small business"],
    progress: [{ title: "The story", detail: "The family bakes from 4am, and most of Kubwa has eaten their agege bread." }, { title: "What the film should feel like", detail: "Warm, early, a bit sleepy. The next step is a shot list." }],
  },
  "clinic-app": {
    stage: "Exploring", type: "Application", commitment: "A few hours a week, until mid December.", commitmentCat: "week",
    rhythm: "Patient interviews first, then a weekly review with the clinic", openTo: "Individuals and pairs",
    needs: { "Product designer": "Talks to patients first, then shapes how booking and the queue work.", Developer: "Builds the first version, on the web, so it works on any phone." },
    skillCats: ["Design", "Engineering", "Research"], skillTags: ["Product design", "Web development", "User research", "Health"],
    progress: [{ title: "The problem", detail: "Patients queue outside the clinic from 6am to be seen." }, { title: "What the clinic wants", detail: "A simple booking app that shows each patient their place in the queue." }],
  },
  "youth-podcast": {
    stage: "Ready to plan", type: "Community", commitment: "Eight episodes, from 17 November.", commitmentCat: "week",
    rhythm: "A recording session each week, with edits shared in between", openTo: "Individuals",
    needs: { "Audio editor": "Cleans and cuts each episode.", "Cover designer": "Designs the cover for the season.", "Co-host": "Asks good questions with young people starting out in Abuja." },
    skillCats: ["Film and sound", "Design", "Community"], skillTags: ["Audio editing", "Cover design", "Hosting", "Storytelling"],
  },
  "indigo-futures": {
    stage: "Ready to plan", type: "Course", commitment: "Four weeks in January, living at the dye works.", commitmentCat: "full",
    rhythm: "Every day with the master dyers", openTo: "Individuals",
    needs: { Resident: "Learns adire with the dyers and makes one new piece with them." },
    skillCats: ["Design"], skillTags: ["Textile design", "Adire", "Dyeing", "Craft"],
    progress: [{ title: "The dyers", detail: "The women of the dye works have made adire for forty years." }],
  },
  "supply-drive": {
    stage: "Building", type: "Social impact", commitment: "Two Saturdays.", commitmentCat: "weekend",
    rhythm: "A planning call, then the packing day", openTo: "Individuals and small groups",
    needs: { "Volunteer lead": "Runs the packing day.", Logistics: "Plans the pick-ups and drop-offs.", "Social media": "Tells the story online, with families' consent." },
    skillCats: ["Community", "Writing"], skillTags: ["Organising", "Logistics", "Social media", "Volunteering"],
    progress: [{ title: "Last year", detail: "250 school packs, packed on one Saturday." }, { title: "This year", detail: "The goal is 400 packs before term starts." }],
  },
  "matchday-food": {
    stage: "Ready to plan", type: "Event", commitment: "The league final, on 29 November.", commitmentCat: "weekend",
    rhythm: "A walk round the ground before the final", openTo: "Individuals and small teams",
    needs: { Caterer: "Runs one of three food stalls on the day.", Photographer: "Photographs the final and the families who come.", "Event designer": "Designs the stall signs and menu boards." },
    skillCats: ["Community", "Design", "Film and sound"], skillTags: ["Catering", "Photography", "Event design", "Sport"],
    progress: [{ title: "The final", detail: "Families from all over Garki come; 2,000 people are expected." }],
  },
};

const TYPE_BY_FIELD: Record<string, ProjectType> = { Tech: "Application", Media: "Film", Business: "Business", Community: "Community", Food: "Event", Arts: "Event", Design: "Application" };
const CATS_BY_FIELD: Record<string, SkillCat> = { Design: "Design", Tech: "Engineering", Media: "Film and sound", Arts: "Design", Community: "Community", Business: "Research", Food: "Community" };

/** A call's profile: its own, or what its fields and timeline say. */
export function profileOf(call: CollabCall): CallProfile {
  const own = CALL_PROFILES[call.id];
  if (own) return own;
  const span = call.timeline.at(-1);
  return {
    stage: "Ready to plan",
    type: TYPE_BY_FIELD[call.fields[0] ?? ""] ?? "Community",
    commitment: span ? `Until ${span.when}.` : "Agreed with the team.",
    commitmentCat: "flexible",
    skillCats: [...new Set(call.fields.map((f) => CATS_BY_FIELD[f]).filter(Boolean))],
    skillTags: call.fields,
  };
}

export type TeamMember = { id: PersonId; name: string; initials: string; role: string };
export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
export const firstOf = (id: PersonId) => PEOPLE[id]?.name.split(" ")[0] ?? "The owner";

/** The project as the design's cards and page read it. */
export type DiscoverProject = {
  id: string;
  call: CollabCall;
  title: string;
  stage: ProjectStage;
  type: ProjectType;
  purpose: string;
  intro: string;
  about: string;
  roles: string[];
  skillCats: SkillCat[];
  skillTags: string[];
  needs: { title: string; detail: string }[];
  team: TeamMember[];
  teamCount: number;
  commitment: string;
  commitmentCat: CommitmentCat;
  locationCats: ("remote" | "state")[];
  owner: string;
  ownerId: PersonId;
  place: string;
  progress: { title: string; detail: string }[];
  working: { label: string; value: string }[];
  glanceLocation: string;
  closed: boolean;
};

/** "₦600,000 lead · ₦250,000 per teammate": the part of the fee line about one role, if it names it. */
function feeFor(call: CollabCall, role: string) {
  const parts = call.fee.split(" · ");
  const word = role.split(" ")[0]!.toLowerCase();
  return parts.find((p) => p.toLowerCase().includes(word));
}

export function discoverProject(call: CollabCall, projects: Project[]): DiscoverProject {
  const pr = profileOf(call);
  const host = PEOPLE[call.host];
  const owner = host?.name ?? call.org;
  // The team so far: the host, then whoever has joined the project the call opened.
  const joined = projects.find((p) => p.callId === call.id);
  const team: TeamMember[] = [{ id: call.host, name: owner, initials: initialsOf(owner), role: "Project owner" }];
  for (const m of joined?.members ?? []) {
    if (m.id === call.host || !PEOPLE[m.id]) continue;
    team.push({ id: m.id, name: PEOPLE[m.id].name, initials: initialsOf(PEOPLE[m.id].name), role: m.role });
  }
  const location = call.where === "Remote" ? "Remote" : call.where === "Hybrid" ? `Remote, with meetings in ${call.city}` : `In person, in ${call.city}`;
  const working = [
    { label: "Commitment", value: pr.commitment },
    { label: "Working rhythm", value: pr.rhythm ?? "" },
    { label: "Location", value: location },
    { label: "Open to", value: pr.openTo ?? "" },
  ].filter((w) => w.value);
  return {
    id: call.id,
    call,
    title: call.title,
    stage: pr.stage,
    type: pr.type,
    purpose: call.summary,
    intro: call.summary,
    about: call.about,
    roles: call.roles,
    skillCats: pr.skillCats ?? [],
    skillTags: pr.skillTags ?? call.fields,
    needs: call.roles.map((r) => {
      const fee = feeFor(call, r);
      const detail = [pr.needs?.[r], fee ? `${fee.charAt(0).toUpperCase()}${fee.slice(1)}.` : undefined].filter(Boolean).join(" ");
      return { title: r, detail: detail || call.level };
    }),
    team,
    teamCount: team.length,
    commitment: pr.commitment,
    commitmentCat: pr.commitmentCat,
    locationCats: [...(call.where !== "In person" ? ["remote" as const] : []), ...(PEOPLE[ME]?.city && call.city === PEOPLE[ME].city ? ["state" as const] : [])],
    owner,
    ownerId: call.host,
    place: call.city,
    progress: pr.progress ?? [],
    working,
    glanceLocation: location,
    closed: call.closesInDays <= 0,
  };
}

/** Why Akines shows you this project: from the roles it needs and what you do, never a score. */
export function fitOf(p: DiscoverProject, saved: boolean) {
  const mine = PEOPLE[ME]?.role?.toLowerCase() ?? "";
  const role = mine ? p.roles.find((r) => r.toLowerCase() === mine || mine.includes(r.split(" ")[0]!.toLowerCase())) : undefined;
  if (role) return `Your ${mine} experience could help this project as its ${role.toLowerCase()}. Akines suggests it because the team is looking for one.`;
  if (saved) return `Akines shows it because you saved it. The team is looking for ${listOf(p.roles.map(withArticle))}.`;
  return `Akines shows it because the project is open to new people. The team is looking for ${listOf(p.roles.map(withArticle))}.`;
}
export const withArticle = (role: string) => `${/^[aeiou]/i.test(role) ? "an" : "a"} ${role.toLowerCase()}`;
export const listOf = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

// ── Search and filters (the design's own rules) ──

export type Filters = { stage: string[]; looking: string[]; commitment: string[]; location: string[] };
export const FILTER_GROUPS: { key: keyof Filters; name: string; description: string; options: string[] }[] = [
  { key: "stage", name: "Project stage", description: "Where the project is today", options: [...PROJECT_STAGES] },
  { key: "looking", name: "Looking for", description: "Skills the project needs", options: ["Design", "Engineering", "Research", "Writing", "Film and sound", "Community"] },
  { key: "commitment", name: "Commitment", description: "How much time it asks of you", options: ["A few hours a month", "A few hours a week", "Weekends", "Full project"] },
  { key: "location", name: "Location", description: "Where the team works", options: ["Anywhere in Nigeria", "My state", "Remote"] },
];
export const noFilters = (): Filters => ({ stage: [], looking: [], commitment: [], location: [] });
/** What the dialog suggests the first time it opens. */
export const suggestedFilters = (): Filters => ({ stage: ["Exploring"], looking: [], commitment: ["A few hours a week"], location: ["Anywhere in Nigeria"] });
const COMMIT: Record<string, CommitmentCat> = { "A few hours a month": "month", "A few hours a week": "week", Weekends: "weekend", "Full project": "full" };
export const hasFilters = (f: Filters) => f.stage.length > 0 || f.looking.length > 0 || f.commitment.length > 0 || (f.location.length > 0 && !f.location.includes("Anywhere in Nigeria"));
export const filterLabels = (f: Filters) => [...f.stage, ...f.looking, ...f.commitment, ...(f.location.includes("Anywhere in Nigeria") ? [] : f.location)];

export function matchesFilters(p: DiscoverProject, f: Filters) {
  if (f.stage.length && !f.stage.includes(p.stage)) return false;
  if (f.looking.length && !f.looking.some((x) => (p.skillCats as string[]).includes(x))) return false;
  if (f.commitment.length && !(p.commitmentCat === "flexible" || f.commitment.some((c) => COMMIT[c] === p.commitmentCat))) return false;
  if (f.location.length && !f.location.includes("Anywhere in Nigeria") && !f.location.some((l) => (l === "My state" ? p.locationCats.includes("state") : p.locationCats.includes("remote")))) return false;
  return true;
}

/** Every word must match somewhere; a word in the title counts most. 0 means no match. */
export function searchScore(p: DiscoverProject, q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return 1;
  const fields: [string, number][] = [[p.title, 5], [p.purpose, 3], [p.roles.join(" "), 3], [p.type, 2], [p.stage, 2], [p.owner, 2], [p.place, 2], [p.commitment, 1]];
  let total = 0;
  for (const word of query.split(/\s+/)) {
    let best = 0;
    for (const [text, w] of fields) if (text.toLowerCase().includes(word)) best = Math.max(best, w);
    if (!best) return 0;
    total += best;
  }
  return total;
}

/** "Sent today", "Sent yesterday", "Sent 3 days ago", or the date. */
export function sentWhen(app: Application) {
  const at = app.history[0]?.at ?? Date.now();
  const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(at).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days <= 0) return "Sent today";
  if (days === 1) return "Sent yesterday";
  if (days < 7) return `Sent ${days} days ago`;
  return `Sent ${new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}

/** The design's three interest times; the first two match its wording for availability. */
export const INTEREST_TIMES = ["A few hours a week", "Weekends only", "Flexible"];
export const ANOTHER_WAY = "Another way I can help";
