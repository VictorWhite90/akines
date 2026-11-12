"use client";

import { remoteCall } from "@/lib/api/collab";
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
/** The five stages Discover filters by, and "Planning", which Collaborate Home's open calls also use. */
export type ProjectStage = (typeof PROJECT_STAGES)[number] | "Planning";
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
  /** What the project page says first, when it says more than the summary. */
  intro?: string;
  /** Where the team works, in the project's own words ("Remote, with occasional meetings in Lagos"). */
  location?: string;
  /** Who is on the team so far, when the call names them. */
  team?: ProfileMember[];
  /** Why Akines suggests the project, in the project's own words. */
  fit?: string;
  /** The screens that list the call (sample calls only); none named means every screen. */
  listed?: Listing[];
};

/** A member of the team as a project's card and page show them, when the call says who they are (sample calls). */
/** `id` is a member id; someone the design names only by initials has a placeholder id of their own. */
export type ProfileMember = { id: string; role: string; name?: string; initials?: string };

/** The screens that list a sample call: Discover projects (and Opportunities, Saved) or Collaborate Home's open calls. */
export type Listing = "discover" | "home";

/** The sample calls' profiles (lib/collab/seed.ts), word for word from the design's projects/data.ts and start/home-data.ts. */
export const CALL_PROFILES: Record<string, CallProfile> = {
  "a-better-way-to-learn": {
    stage: "Exploring", type: "Application", commitment: "Flexible, based on agreed contribution.", commitmentCat: "flexible",
    rhythm: "A weekly check-in, with shared documents in between", openTo: "Individuals and small teams",
    location: "Remote, with occasional meetings in Lagos",
    intro: "A digital learning initiative exploring more accessible ways for students to learn. The team is testing simple lesson tools with students in Lagos and is looking for people who care about how young people learn.",
    needs: { "Product Designer": "Shapes how students move through each lesson. A few hours a week.", "Software Engineer": "Builds the first lesson tool that works on a basic phone. Flexible hours.", "Education Researcher": "Runs short student interviews and turns them into clear findings. Weekends." },
    skillCats: ["Design", "Engineering", "Research"], skillTags: ["Product design", "Software engineering", "Education research", "Learning design"],
    team: [{ id: "ngozi", role: "Project owner" }, { id: "obinna", role: "Learning designer" }],
    progress: [{ title: "Student interviews in Lagos", detail: "Held with a small group of students and teachers." }, { title: "First lesson sketches", detail: "Reviewed with two teachers. The next step is a simple prototype." }],
    fit: "Your product design experience could help this project make lessons easier to follow. Akines suggests it because you care about education and learning tools.",
    listed: ["discover", "home"],
  },
  "craft-memory-archive": {
    stage: "Planning", type: "Community", commitment: "Two hours a week, agreed together.", commitmentCat: "week",
    needs: { Photographer: "Photographs the artisans and their techniques.", Researcher: "Records how each technique is passed on.", "Web Developer": "Build a simple, accessible home for the archive where artisans can share their techniques." },
    team: [{ id: "tunde-bello", role: "Project owner" }, { id: "folake", role: "Team member", initials: "FO" }],
    listed: ["home"],
  },
  "neighbourhood-story-map": {
    stage: "Exploring", type: "Community", commitment: "Flexible, based on agreed contribution.", commitmentCat: "flexible",
    team: [{ id: "chioma", role: "Project owner" }], listed: ["home"],
  },
  "voices-of-the-market": {
    stage: "Exploring", type: "Research", commitment: "Flexible, based on agreed contribution.", commitmentCat: "flexible",
    team: [{ id: "emeka-anozie", role: "Project owner" }, { id: "bukola", role: "Team member" }], listed: ["home"],
  },
  "learning-in-two-languages": {
    stage: "Planning", type: "Course", commitment: "Three hours a week, agreed together.", commitmentCat: "week",
    team: [{ id: "halima-sani", role: "Project owner" }], listed: ["home"],
  },
  "the-weaving-lab": {
    stage: "Exploring", type: "Research", commitment: "Flexible, based on agreed contribution.", commitmentCat: "flexible",
    team: [{ id: "adaora", role: "Project owner" }, { id: "kehinde", role: "Team member" }], listed: ["home"],
  },
  "voices-of-lagos": {
    stage: "Building", type: "Film", commitment: "Weekends, over three months.", commitmentCat: "weekend",
    rhythm: "A short call on Sunday evenings, with shared folders in between", openTo: "Individuals and small crews",
    location: "On location in Lagos neighbourhoods",
    intro: "A documentary series capturing everyday stories from Lagos neighbourhoods. The team has filmed first test shoots and is looking for people who can shoot, record and edit them into episodes.",
    needs: { Cinematographer: "Films the street and home scenes for each episode. Weekends.", "Sound Designer": "Records and cleans the audio so every voice is easy to hear. Weekends.", "Documentary Editor": "Cuts the footage into short episodes and agrees the story with the team. Flexible hours." },
    skillCats: ["Film and sound"], skillTags: ["Filmmaking", "Documentary", "Sound design", "Storytelling"],
    team: [{ id: "tunde-bakare", role: "Project owner" }, { id: "kehinde", role: "Producer" }, { id: "efe", role: "Researcher" }],
    progress: [{ title: "Test shoots in three neighbourhoods", detail: "Short films made with local residents who agreed to be recorded." }, { title: "First episode outline", detail: "Reviewed with a local editor. The next step is a rough cut." }],
    fit: "Akines shows it because you saved it. The team needs film roles, so your product design experience may help most with how the series is presented.",
    listed: ["discover"],
  },
  "clean-water-mapping": {
    stage: "Ready to plan", type: "Social impact", commitment: "About ten hours a month.", commitmentCat: "month",
    location: "Kaduna and Abuja",
    skillCats: ["Research", "Engineering", "Community"], skillTags: [],
    // The card shows four people, the second "SA"; the design names only the owner.
    team: [{ id: "halima-yusuf", role: "Project owner" }, ...[2, 3, 4].map((n) => ({ id: `clean-water-mapping-${n}`, role: "Team member", name: "A team member", initials: n === 2 ? "SA" : "" }))],
    listed: ["discover"],
  },
  "market-women-ledger": {
    stage: "Building", type: "Application", commitment: "Flexible, based on agreed contribution.", commitmentCat: "flexible",
    rhythm: "Two short check-ins a week, with shared designs in between", openTo: "Individuals and small teams",
    intro: "A simple mobile ledger helping market traders record sales and savings. The team is building a first version and is looking for people who can shape it around how traders already work.",
    needs: { "Mobile Developer": "Builds the first version of the ledger so it works on a basic phone. Flexible hours.", "UX Researcher": "Runs short interviews with traders and turns them into clear findings. Weekends.", "Finance Advisor": "Checks that the savings features are simple and safe for traders. A few hours a month." },
    skillCats: ["Engineering", "Research", "Design"], skillTags: ["Mobile development", "User research", "Financial inclusion", "Small business"],
    team: [{ id: "amaka", role: "Project owner" }, { id: "bukola", role: "Business analyst" }],
    progress: [{ title: "Trader interviews", detail: "Held with twelve market traders about how they record sales today." }, { title: "First ledger screens", detail: "Reviewed with three traders. The next step is a simple prototype." }],
    fit: "Your product design experience could help this project make a mobile ledger simple for traders to use. Akines suggests it because the team needs user research and design thinking.",
    listed: ["discover"],
  },
  "stories-for-small-hands": {
    stage: "Exploring", type: "Book", commitment: "Flexible, based on agreed contribution.", commitmentCat: "flexible",
    rhythm: "A fortnightly review of drafts and illustrations", openTo: "Individuals",
    location: "Remote, with occasional meetings in Kano",
    intro: "An illustrated book series helping young students learn kindness in Hausa and English. The team is exploring the first story and is looking for people to bring it to life.",
    needs: { Illustrator: "Draws the pictures for each page in a warm, simple style. Flexible hours.", "Hausa Translator": "Writes the Hausa version so it reads naturally for young children. Weekends.", "Children’s Book Editor": "Shapes the stories so they are clear and kind. A few hours a week." },
    skillCats: ["Design", "Writing"], skillTags: ["Illustration", "Translation", "Children’s books", "Education"],
    team: [{ id: "ifeoma", role: "Project owner" }, { id: "musa", role: "Storyteller" }],
    progress: [{ title: "First story drafted", detail: "Written in English and shared with two teachers." }, { title: "Sample illustrations", detail: "Three pages sketched. The next step is a Hausa version of the text." }],
    fit: "The team’s main needs are illustration, translation and editing. Your product design experience could still help with page layout. Akines shows it because the project is open to new people.",
    listed: ["discover"],
  },
  "clinic-queue": {
    stage: "Exploring", type: "Application", commitment: "Two evenings a week, for six weeks.", commitmentCat: "week",
    rhythm: "Two evening sessions a week, with notes shared in between", openTo: "Individuals and small teams",
    location: "Remote, with occasional clinic visits",
    intro: "A queue and appointment tool for busy primary health centres. The team is exploring how it could work and is looking for people who can build, write and advise.",
    needs: { "Mobile Developer": "Builds the first queue screen so it works on a basic phone. Flexible hours.", "Health Informatics Lead": "Advises on how patient information should be handled with care. Two evenings a week.", "UX Writer": "Writes short, clear messages for patients and nurses. A few hours a week." },
    skillCats: ["Engineering", "Writing", "Research"], skillTags: ["Mobile development", "Health informatics", "UX writing", "Public health"],
    team: [{ id: "dayo", role: "Project owner" }, { id: "esther", role: "Clinic operations lead" }, { id: "femi", role: "Backend engineer" }],
    progress: [{ title: "Clinic visits", detail: "Observed how queues work at two primary health centres." }, { title: "Queue flow sketched", detail: "Reviewed with a clinic manager. The next step is a simple prototype." }],
    fit: "Your product design experience could help this project make queues clear for patients and nurses. Akines suggests it because the team needs design and writing skills.",
    listed: ["discover"],
  },
  "community-learning-initiative": {
    stage: "Ready to plan", type: "Community", commitment: "Flexible, based on agreed contribution.", commitmentCat: "flexible",
    needs: { "Product Designer": "Help define the learning experience and design the initial product structure." },
    team: [{ id: "daniel", role: "Project owner" }, { id: "community-learning-initiative-2", role: "Team member", name: "A team member", initials: "TA" }, { id: "community-learning-initiative-3", role: "Team member", name: "A team member", initials: "NY" }],
    listed: [],
  },
  "mapping-the-market-road": {
    stage: "Exploring", type: "Research", commitment: "Agreed with the team.", commitmentCat: "flexible",
    needs: { Writer: "Interviews traders along the road and writes their stories.", Photographer: "Photographs the traders and the markets along the road." },
  },
};

/** Whether a call belongs on a screen: every call does, unless its profile names the screens it is listed on. */
export const listedOn = (call: CollabCall, where: Listing) => profileOf(call).listed?.includes(where) ?? true;

const TYPE_BY_FIELD: Record<string, ProjectType> = { Tech: "Application", Media: "Film", Business: "Business", Community: "Community", Food: "Event", Arts: "Event", Design: "Application" };
const CATS_BY_FIELD: Record<string, SkillCat> = { Design: "Design", Tech: "Engineering", Media: "Film and sound", Arts: "Design", Community: "Community", Business: "Research", Food: "Community" };

/** A call's profile: its own, or what its fields and timeline say. */
/** The profile a host gave their call (outside the demo), in the shape the screens read. */
function remoteProfile(callId: string): CallProfile | undefined {
  const p = remoteCall(callId)?.profile;
  if (!p) return undefined;
  return {
    stage: p.stage as ProjectStage, type: p.type as ProjectType, commitment: p.commitment,
    commitmentCat: (p.commitment_cat ?? "flexible") as CommitmentCat, rhythm: p.rhythm || undefined, openTo: p.open_to || undefined,
    needs: p.needs, skillCats: p.skill_cats as SkillCat[] | undefined, skillTags: p.skill_tags, progress: p.progress,
  };
}

export function profileOf(call: CollabCall): CallProfile {
  const own = CALL_PROFILES[call.id] ?? remoteProfile(call.id);
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
  /** Why Akines suggests it, when the project says so in its own words. */
  fit?: string;
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
  const team: TeamMember[] = pr.team
    ? pr.team.map((m) => { const name = m.name ?? PEOPLE[m.id as PersonId]?.name ?? "A member"; return { id: m.id as PersonId, name, initials: m.initials ?? initialsOf(name), role: m.role }; })
    : [{ id: call.host, name: owner, initials: initialsOf(owner), role: "Project owner" }];
  if (!pr.team) for (const m of joined?.members ?? []) {
    if (m.id === call.host || !PEOPLE[m.id]) continue;
    team.push({ id: m.id, name: PEOPLE[m.id].name, initials: initialsOf(PEOPLE[m.id].name), role: m.role });
  }
  const location = pr.location ?? (call.where === "Remote" ? "Remote" : call.where === "Hybrid" ? `Remote, with meetings in ${call.city}` : `In person, in ${call.city}`);
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
    intro: pr.intro ?? call.summary,
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
    fit: pr.fit,
  };
}

/** Why Akines shows you this project: from the roles it needs and what you do, never a score. */
export function fitOf(p: DiscoverProject, saved: boolean) {
  if (p.fit) return p.fit;
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
