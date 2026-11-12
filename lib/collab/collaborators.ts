"use client";

import { useSyncExternalStore } from "react";
import {
  answerIntroduction, dismiss as dismissRemote, matchingSnapshot, saveIntention, sendIntroduction, setSaved, useMatchingStore,
  useRemoteCollaboratorById, withdrawIntroduction,
} from "@/lib/api/matching";
import { ME } from "@/lib/collab/me";
import { useCollab } from "@/lib/collab/useCollab";
import { isMine, phaseOf } from "@/lib/collab/workspace";
import type { CollabCall, Project } from "@/lib/collab/types";
import { DEMO } from "@/lib/demo/mode";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

/*
 * Collaborators: people recommended to work with, why, what you saved, and the introductions you asked for.
 * A real build talks to the backend's matching app through lib/api/matching.ts (every route is listed there):
 *   GET|PUT /matching/intention · GET /matching/recommendations · GET /matching/collaborators/:id
 *   POST /matching/dismissals (DELETE to undo) · GET|POST|DELETE /matching/saved[/:id]
 *   GET|POST /matching/introductions · POST /matching/introductions/:id/withdraw|restore (the sender)
 *   GET /matching/introductions/incoming · POST /matching/introductions/:id/accept|not-now|reopen (the recipient)
 * Recommendations there are computed from what members chose to share, with the reasons and where each one comes
 * from. The demo (NEXT_PUBLIC_DEMO_MODE=1) keeps everything in the browser with the sample people below.
 */

// ── Types ──

export type Intention = "project" | "skills" | "interest";
export type PrefKey = "skills" | "experience" | "availability" | "communication" | "rhythm" | "location" | "interests";
export type MatchPrefs = Record<PrefKey, string[]>;

/** The member's collaboration intention (the matching step): what they want, for which project, and what matters. */
/** `need` is the help asked for in Create AI's Explore collaborators chat (a Start a project need id), when matching started there. */
export type MatchIntention = { intention: Intention; projectId: string | null; prefs: MatchPrefs | null; updatedAt: number | null; need?: string | null };

export type Pronoun = "she" | "he" | "they";
export type MatchReason = { category: string; text: string; source: string };

/** A recommended collaborator: one of our members plus what they chose to share for matching. */
export type Collaborator = {
  id: PersonId;
  pronoun: Pronoun;
  availability: string;
  keySkills: string[];
  intro: string;
  /** "Why you may work well together". */
  compat: string;
  /** One line of relevant experience, and one of working preferences, for the card. */
  experience: string;
  preference: string;
  about: string;
  experienceList: { title: string; detail: string }[];
  skills: string[];
  interests: string[];
  preferences: { label: string; value: string }[];
  /** Shown when no project of ours records their work. */
  contributions: { title: string; detail: string }[];
  matchContext: string;
  reasons: MatchReason[];
  /** Ask Akines: the answer to "Why is X recommended?". */
  ask: string[];
  /** For the suggested message: "Your experience … seems closely aligned with what we’re building." */
  aligned: string;
  /** The message the introduction request starts with, when the sample person has their own. */
  requestMessage?: string;
  /** How Collaborate Home's carousel words them, when it differs from the discovery card (sample people). */
  home?: { availability: string; skills: string; purpose: string; skill: string; preference: string; match: string };
  /** Their photographs where the design uses another crop: Collaborate Home's carousel and Why this match. */
  photos?: { home?: string; wide?: string };
};

export type IntroStatus = "pending" | "accepted" | "notnow";
/** An introduction you asked for. `seenAt` is when they opened it, `answeredAt` when they replied; a withdrawn one is kept with `withdrawnAt` and left out of your list. */
export type Introduction = { id: string; to: PersonId; projectId: string | null; projectTitle: string; message: string; status: IntroStatus; sentAt: number; seenAt?: number; answeredAt?: number; withdrawnAt?: number };

/** Someone who asked to be introduced to you, around one of your projects. */
export type IncomingStatus = "waiting" | "accepted" | "notnow";
export type IncomingIntroduction = { id: string; from: PersonId; projectId: string | null; projectTitle: string; purpose: string; note: string; status: IncomingStatus; receivedAt: number; answeredAt?: number };

// ── Copy helpers ──

const P = { she: { subj: "she", obj: "her", poss: "her" }, he: { subj: "he", obj: "him", poss: "his" }, they: { subj: "they", obj: "them", poss: "their" } } as const;
/** "she does" / "they do": the pronoun with its verb, so sentences read as the design's and stay right for "they". */
const acts = (pronoun: Pronoun, singular: string, plural: string) => `${P[pronoun].subj} ${pronoun === "they" ? plural : singular}`;
/** Pronouns of people we write sentences about who are not among the recommendations (the seeded introductions). */
const PRONOUNS: Partial<Record<PersonId, Pronoun>> = {};
export const pronounOf = (id: PersonId): Pronoun => (DEMO ? SAMPLE.find((c) => c.id === id)?.pronoun ?? PRONOUNS[id] : matchingSnapshot().people[id]?.pronoun) ?? "they";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const firstName = (id: PersonId) => PEOPLE[id].name.split(" ")[0];

/** The sentences the design writes around one person, with their name and pronouns. */
export function wordsFor(c: Collaborator) {
  const f = firstName(c.id), { subj, poss } = P[c.pronoun];
  return {
    first: f,
    seeing: `${f}’s public profile and the details ${subj} chose to share for matching. Private information stays private.`,
    requestNotice: `${f} will see your message and your public profile, then decide whether to connect. Neither of you is added to a project automatically.`,
    confirm: `${cap(subj)} will see your message and your public profile, then decide whether to connect. Nothing is sent until you confirm.`,
    sentSupport: `${f} can now review your message and decide whether ${subj}’d like to connect.`,
    sentNote: `${f} hasn’t responded yet. You’ll see ${poss} decision here when ${acts(c.pronoun, "does", "do")}.`,
    privacyNote: `Explanations use only what ${f} has chosen to share. This is a reason to explore, not a promise of compatibility.`,
    notRelevant: `Your answer is optional and ${f} won’t be notified.`,
    askUser: `Why is ${f} recommended for this project?`,
    askChips: [`What does ${poss} experience include?`, `How does ${poss} working rhythm fit?`, "What is shared with me?"],
    tiers: [
      { icon: "eye" as const, title: "Public profile", text: `Information ${f} intentionally made available on ${poss} public profile.`, tags: ["Name", "Professional role", "Public skills", "Selected experience", "Public interests"] },
      { icon: "share" as const, title: "Shared for this match", text: `Information ${f} agreed to share for collaboration matching.`, tags: ["Availability", "Working preferences", "Project interests", "Collaboration preferences"] },
      { icon: "lock" as const, title: "Stays private", text: "Information that remains private and is never used in explanations.", tags: ["Private conversations", "Unshared personal details", "Sensitive profile information"] },
    ],
    visible: [
      { label: "Availability", text: `${f} agreed to share ${poss} availability for collaboration matching.` },
      { label: "Skills", text: `${cap(poss)} skills are part of ${poss} public profile.` },
      { label: "Working preferences", text: `${f} shared these for this match so you can see how ${acts(c.pronoun, "likes", "like")} to collaborate.` },
    ],
  };
}

export const suggestedMessage = (c: Collaborator, brief: Brief | null) => c.requestMessage ??
  `Hi ${firstName(c.id)},\n\n${brief ? `I’m working on ${brief.name}. ${brief.summary}` : "I’m starting a new project."}\n\nYour experience ${c.aligned} seems closely aligned with what we’re building.\n\nI’d love to connect and explore whether we could work together.`;

// ── Sample recommendations (demo): the design's four people (features/collaborate/people/data.ts), word for word ──

const PHOTO = "/kin/design/people";
/** The eight reasons of Why this match, in the design's order. */
const CATEGORIES = ["Shared purpose", "Complementary skills", "Relevant experience", "Preferred communication style", "Availability", "Working rhythm", "Geographic or cultural relevance", "Previous trusted contributions"];
const rows = (r: [string, string][]): MatchReason[] => r.map(([text, source], i) => ({ category: CATEGORIES[i]!, text, source }));
const requestMessage = (first: string, experience: string) =>
  `Hi ${first},\n\nI’m working on a career guidance platform for Nigerian students.\n\n${experience} closely aligned with what we’re building.\n\nI’d love to connect and explore whether we could work together.`;

const SAMPLE: Collaborator[] = [
  {
    id: "amina", pronoun: "she", availability: "Available for new projects", keySkills: ["Research", "Education", "Career Development"],
    intro: "I study how students choose their paths and turn the findings into guidance they can use.",
    compat: "Amina’s research experience may complement your product design and technology skills, helping your team understand the needs of students.",
    experience: "Researched career decisions of secondary school students in Lagos.",
    preference: "Structured weekly collaboration with written updates.",
    about: "Amina researches how students in Nigeria make decisions about what to study and where to work. She turns interviews and surveys into practical guidance for schools, families and the students themselves, and cares about making that guidance reach students who are usually left out of it.",
    experienceList: [
      { title: "Career decisions of secondary school students", detail: "Lead researcher, Lagos State education research programme" },
      { title: "Pathways to university", detail: "Research consultant for an education non-profit" },
      { title: "Guidance counsellor toolkit", detail: "Co-author and researcher" },
    ],
    skills: ["Career research", "Student interviews", "Survey design", "Education policy"],
    interests: ["Access to education", "Youth development", "Career guidance", "Inclusive design"],
    preferences: [
      { label: "Communication style", value: "Clear expectations and structured communication" },
      { label: "Preferred working rhythm", value: "Weekly, with asynchronous updates between sessions" },
      { label: "Availability", value: "Currently open to new collaborations" },
      { label: "Collaboration preferences", value: "Written briefs, shared documents and one live session each week" },
    ],
    contributions: [
      { title: "Education-focused research project", detail: "Acknowledged by the project team. Shared with Amina’s consent." },
      { title: "Student guidance toolkit", detail: "Reviewer. Shared with Amina’s consent." },
    ],
    matchContext: "You both care about making career guidance more accessible to students, and Amina’s research experience may complement your product design skills.",
    reasons: rows([
      ["You both care about making career guidance more accessible to students.", "From her public profile"],
      ["Your product design experience may complement Amina’s career research expertise.", "From your project brief and her public skills"],
      ["Amina has experience researching student career decisions.", "From her public experience"],
      ["You both prefer clear expectations and structured communication.", "Shared for this match"],
      ["Amina is currently open to new collaborations.", "Shared for this match"],
      ["You both prefer a weekly working rhythm with asynchronous updates between sessions.", "Shared for this match"],
      ["Amina has experience working with student communities in Nigeria.", "From her public profile"],
      ["Amina has previously contributed to education-focused research projects.", "Shared with her consent"],
    ]),
    ask: [
      "Amina is recommended because your project requires career research expertise, and she has relevant experience in that area.",
      "You also share an interest in improving access to career guidance for students.",
      "Her preferred working rhythm may complement the structured weekly collaboration you selected for this project.",
    ],
    aligned: "in career research and your interest in education access",
    requestMessage: requestMessage("Amina", "Your experience in career research and your interest in education access seem"),
    home: {
      availability: "Available for new projects.", skills: "Research · Education · Career Development", purpose: "Making career guidance more accessible to students.",
      skill: "Experience researching student career decisions.", preference: "Structured weekly collaboration.",
      match: "Amina’s research experience may complement your product design and technology skills, helping your team better understand the needs of students.",
    },
    photos: { home: `${PHOTO}/collab-start/collab-amina.jpg`, wide: `${PHOTO}/collab-people/amina-wide.jpg` },
  },
  {
    id: "kunle", pronoun: "he", availability: "Open to new collaborations", keySkills: ["Engineering", "Mobile", "Low-bandwidth design"],
    intro: "I build learning and community tools that work on the phones and connections students actually have.",
    compat: "Kunle’s engineering experience may help turn your product design into a platform that works reliably for students on mobile.",
    experience: "Built a homework help app used in secondary schools across Lagos and Ibadan.",
    preference: "Short weekly check-ins and a shared task board.",
    about: "Kunle builds learning and community tools for students who rely on basic phones and unreliable connections. He starts from how people really use their devices, keeps each tool light enough to work anywhere, and enjoys turning a designer’s idea into something students can use every day.",
    experienceList: [
      { title: "Homework help app", detail: "Lead engineer, used in secondary schools across Lagos and Ibadan" },
      { title: "Low-bandwidth lesson player", detail: "Engineer at an education non-profit" },
      { title: "Community noticeboard", detail: "Volunteer developer" },
    ],
    skills: ["Mobile development", "Low-bandwidth design", "APIs", "Offline-first apps"],
    interests: ["Learning tools", "Student access", "Open source", "Community technology"],
    preferences: [
      { label: "Communication style", value: "Short, regular updates and clear task ownership" },
      { label: "Preferred working rhythm", value: "Weekly check-ins, with a shared task board between them" },
      { label: "Availability", value: "Currently open to new collaborations" },
      { label: "Collaboration preferences", value: "A shared task board, short calls and written decisions" },
    ],
    contributions: [
      { title: "Student homework app", detail: "Acknowledged by the project team. Shared with Kunle’s consent." },
      { title: "Open learning tools", detail: "Reviewer. Shared with Kunle’s consent." },
    ],
    matchContext: "You both want students to reach career guidance on the phones they already have, and Kunle’s engineering experience may help turn your product design into a platform that works reliably on mobile.",
    reasons: rows([
      ["You both want students to reach career guidance on the phones they already have.", "From his public profile"],
      ["Your product design experience may complement Kunle’s engineering and low-bandwidth design skills.", "From your project brief and his public skills"],
      ["Kunle has built a homework help app used in secondary schools across Lagos and Ibadan.", "From his public experience"],
      ["You both prefer short, regular updates and clear task ownership.", "Shared for this match"],
      ["Kunle is currently open to new collaborations.", "Shared for this match"],
      ["You both prefer a weekly check-in with a shared task board between sessions.", "Shared for this match"],
      ["Kunle has experience building tools for schools across Lagos and Ibadan.", "From his public profile"],
      ["Kunle has previously reviewed open learning tools for students.", "Shared with his consent"],
    ]),
    ask: [
      "Kunle is recommended because your project needs engineering skills, and he has built learning tools for students who rely on basic phones.",
      "You also share an interest in helping students reach career guidance on the devices they already have.",
      "His preference for short weekly check-ins and a shared task board may fit the structured weekly collaboration you selected for this project.",
    ],
    aligned: "building learning tools that work on basic phones",
    requestMessage: requestMessage("Kunle", "Your experience building learning tools that work on basic phones seems"),
    home: {
      availability: "Open to one new project.", skills: "Web Development · Accessibility · Product Engineering", purpose: "Building simple, accessible tools for learners.",
      skill: "Experience turning early prototypes into reliable products.", preference: "Asynchronous updates with a weekly call.",
      match: "Kunle’s engineering background may complement your design experience, helping your team move from an agreed idea to a working first version.",
    },
    photos: { home: `${PHOTO}/collab-start/collab-kunle.jpg`, wide: `${PHOTO}/collab-people/kunle-wide.jpg` },
  },
  {
    id: "funmi", pronoun: "she", availability: "Available from next month", keySkills: ["Learning design", "Facilitation", "Content"],
    intro: "I design learning journeys that help young people reflect on who they are and what they want to do.",
    compat: "Funmi’s learning design experience may complement your focus on student decisions, shaping how guidance is presented and understood.",
    experience: "Designed an after-school career curriculum for community learning centres.",
    preference: "Workshop-style sessions with asynchronous feedback.",
    about: "Funmi designs learning journeys for young people in community learning centres. She runs workshops, writes the activities and listens closely to what students say, so that guidance helps them reflect on who they are and not only on which job to pick.",
    experienceList: [
      { title: "After-school career curriculum", detail: "Lead designer for community learning centres" },
      { title: "Reflection workshops for students", detail: "Facilitator, secondary school programme" },
      { title: "Facilitator handbook", detail: "Author and trainer" },
    ],
    skills: ["Learning design", "Workshop facilitation", "Content writing", "Curriculum planning"],
    interests: ["Student reflection", "Youth development", "Community learning", "Inclusive design"],
    preferences: [
      { label: "Communication style", value: "Honest, early feedback in workshop-style sessions" },
      { label: "Preferred working rhythm", value: "Workshop-style sessions, with asynchronous feedback between them" },
      { label: "Availability", value: "Available from next month" },
      { label: "Collaboration preferences", value: "Shared documents, live workshops and written feedback" },
    ],
    contributions: [
      { title: "Career curriculum for community centres", detail: "Acknowledged by the learning centres. Shared with Funmi’s consent." },
      { title: "Facilitator handbook", detail: "Co-author. Shared with Funmi’s consent." },
    ],
    matchContext: "You both want students to understand their options, and Funmi’s learning design experience may complement your focus on student decisions.",
    reasons: rows([
      ["You both want students to understand their options before they decide.", "From her public profile"],
      ["Your product design experience may complement Funmi’s learning design and facilitation skills.", "From your project brief and her public skills"],
      ["Funmi has designed an after-school career curriculum for community learning centres.", "From her public experience"],
      ["You both prefer honest, early feedback.", "Shared for this match"],
      ["Funmi is available from next month.", "Shared for this match"],
      ["Funmi prefers workshop-style sessions with asynchronous feedback between them.", "Shared for this match"],
      ["Funmi has experience working with community learning centres.", "From her public profile"],
      ["Funmi has previously co-authored a facilitator handbook.", "Shared with her consent"],
    ]),
    ask: [
      "Funmi is recommended because your project needs help with how guidance is presented, and she has designed learning journeys for young people.",
      "You also share an interest in helping students understand their options before they decide.",
      "Her preference for workshop-style sessions with asynchronous feedback may complement the structured weekly collaboration you selected for this project.",
    ],
    aligned: "designing learning journeys for young people",
    requestMessage: requestMessage("Funmi", "Your experience designing learning journeys for young people seems"),
    home: {
      availability: "Available for new projects.", skills: "Learning Design · Facilitation · Storytelling", purpose: "Helping young people see more possibilities for their future.",
      skill: "Experience designing workshops and guided learning journeys.", preference: "Hands-on working sessions twice a week.",
      match: "Funmi’s learning design experience may complement your product skills, helping your team shape how students move through the experience, step by step.",
    },
    photos: { home: `${PHOTO}/collab-start/collab-funmi.jpg`, wide: `${PHOTO}/collab-people/funmi-wide.jpg` },
  },
  {
    id: "chidi", pronoun: "he", availability: "Available for new projects", keySkills: ["Partnerships", "Student outreach", "Facilitation"],
    intro: "I connect schools, community groups and young people so good ideas reach the students who need them.",
    compat: "Chidi’s work with school and student communities in Nigeria may help your team reach, and learn from, the students you want to support.",
    experience: "Led a student mentorship network across eight schools in Enugu and Abuja.",
    preference: "Regular conversations with clear shared expectations.",
    about: "Chidi builds lasting relationships between schools, community groups and young people. He has led student networks across several states and enjoys introductions that turn into real programmes for students.",
    experienceList: [
      { title: "Student mentorship network", detail: "Lead, eight schools in Enugu and Abuja" },
      { title: "School partnerships programme", detail: "Partnerships manager at an education non-profit" },
      { title: "Community outreach days", detail: "Organiser and facilitator" },
    ],
    skills: ["Partnership building", "Student outreach", "Facilitation", "Programme coordination"],
    interests: ["Access to education", "Student mentorship", "Community networks", "Youth leadership"],
    preferences: [
      { label: "Communication style", value: "Regular conversations with clear shared expectations" },
      { label: "Preferred working rhythm", value: "Regular conversations, with a short written summary after each one" },
      { label: "Availability", value: "Currently open to new collaborations" },
      { label: "Collaboration preferences", value: "Short calls, clear written expectations and an open channel for questions" },
    ],
    contributions: [
      { title: "Student mentorship network", detail: "Acknowledged by partner schools. Shared with Chidi’s consent." },
      { title: "School partnerships programme", detail: "Reviewer. Shared with Chidi’s consent." },
    ],
    matchContext: "Chidi’s work with school and student communities in Nigeria may help your team reach, and learn from, the students you want to support.",
    reasons: rows([
      ["You both want career guidance to reach the students who need it.", "From his public profile"],
      ["Your product design experience may complement Chidi’s partnerships and student outreach skills.", "From your project brief and his public skills"],
      ["Chidi has led a student mentorship network across eight schools in Enugu and Abuja.", "From his public experience"],
      ["You both prefer regular conversations and clear shared expectations.", "Shared for this match"],
      ["Chidi is currently available for new projects.", "Shared for this match"],
      ["Chidi prefers regular conversations with a short written summary after each one.", "Shared for this match"],
      ["Chidi has experience working with school and student communities in Nigeria.", "From his public profile"],
      ["Chidi has previously reviewed a school partnerships programme.", "Shared with his consent"],
    ]),
    ask: [
      "Chidi is recommended because your project needs to reach students, and he has led a mentorship network across eight schools.",
      "You also share an interest in making career guidance reach the students who need it most.",
      "His preference for regular conversations with clear shared expectations may complement the structured weekly collaboration you selected for this project.",
    ],
    aligned: "connecting schools and student communities",
    requestMessage: requestMessage("Chidi", "Your experience connecting schools and student communities seems"),
    photos: { wide: `${PHOTO}/collab-people/chidi-wide.jpg` },
  },
];

const nov = (month: number, day: number) => new Date(2026, month - 1, day, 9).getTime();
const CAREER = { projectId: "career-guidance-for-everyone", projectTitle: "Career Guidance for Everyone" };
const SEED_SAVED: PersonId[] = DEMO ? ["kunle", "funmi"] : [];
/** The introductions Kemi asked for (12.47): Amina's still pending, and Chidi's first request, answered Not now. */
const SEED_INTROS: Introduction[] = DEMO ? [
  { id: "in-amina", to: "amina", ...CAREER, message: "Hi Amina, I’m working on a career guidance platform for Nigerian students. Your experience in career research seems closely aligned with what we’re building.", status: "pending", sentAt: nov(11, 1) },
  { id: "in-chidi", to: "chidi", ...CAREER, message: "Hi Chidi, I’m building a guidance platform for students and would value your view on the learning side of the product.", status: "notnow", sentAt: nov(10, 28), answeredAt: nov(11, 2) },
] : [];
/** Demo: Amina asked to be introduced to Kemi, around Career Guidance for Everyone (received the day before the visit). */
const SEED_INCOMING: IncomingIntroduction[] = DEMO ? [
  { id: "ii-amina", from: "amina", ...CAREER, purpose: "Helping students make informed career choices",
    note: "Hello Kemi. I read your brief for Career Guidance for Everyone. I research how students choose careers and I would like to talk about the first screens.", status: "waiting", receivedAt: Date.now() - 86_400_000 },
] : [];

// ── The project you're matching for ──

/** What the matching screens say about the project: from the member's open call (or a project they host). */
export type Brief = { id: string; name: string; stage: string; line: string; summary: string; roles: string[]; fields: string[]; city: string };

const article = (w: string) => (/^[aeiou]/i.test(w) ? "an" : "a");
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

function briefFromCall(c: CollabCall): Brief {
  const close = c.timeline.find((t) => /close/i.test(t.label));
  const roles = c.roles.map((r) => r.toLowerCase());
  return {
    id: c.id, name: c.title, stage: close ? `Open call, closes ${close.when}` : "Open call",
    line: `Open call. Looking for ${list(roles.map((r) => `${article(r)} ${r}`))}.`,
    summary: c.summary, roles: c.roles, fields: [...c.fields], city: c.city,
  };
}
/**
 * What the sample projects are looking for, in the design's words (Matching context and Change project): their
 * stage line, and the skills and experience their matching preferences start with.
 */
const SAMPLE_BRIEFS: Record<string, Pick<Brief, "stage" | "line" | "roles" | "fields">> = DEMO ? {
  "career-guidance-for-everyone": { stage: "Ready to plan", line: "Ready to plan. Looking for collaborators and research.", roles: ["Research", "Engineering", "Product design"], fields: ["Education", "Student communities"] },
  "adire-stories": { stage: "Building", line: "Building. Looking for collaborators and distribution.", roles: [], fields: [] },
  "community-learning-initiative": { stage: "Planning", line: "Planning. Looking for collaborators.", roles: [], fields: [] },
  "mentorship-circle": { stage: "Planning", line: "Planning. Looking for collaborators.", roles: [], fields: [] },
} : {};

function briefFromProject(p: Project): Brief {
  const phase = phaseOf(p) === "PLANNING" ? "Planning" : "Building";
  const own = SAMPLE_BRIEFS[p.id];
  return { id: p.id, name: p.title, stage: own?.stage ?? phase, line: own?.line ?? `${phase}. ${p.summary}`, summary: p.summary, roles: own?.roles ?? [], fields: own?.fields ?? [], city: "" };
}

/** The projects matching can be for (Change project): the projects you lead or belong to, then the open calls you host. */
export function matchProjects(c: Pick<ReturnType<typeof useCollab>, "hostedCalls" | "projects">): Brief[] {
  const calls = c.hostedCalls.filter((x) => !c.projects.some((p) => p.callId === x.id));
  return [...c.projects.filter(isMine).map(briefFromProject), ...calls.map(briefFromCall)];
}

// ── Matching preferences ──

export type PrefRow = { key: PrefKey; label: string; desc: string; options: string[]; defaults: string[] };

/** The preference rows; the project's own roles, fields and city come first where the design had theirs. */
export function prefRows(b: Brief | null): PrefRow[] {
  const skills = b?.roles.length ? b.roles : ["Research", "Design", "Engineering"];
  const exp = [...(b?.fields ?? []), "Early-stage products"].slice(0, 3);
  const place = b?.city ? [b.city, "Nigeria", "Anywhere"] : ["Nigeria", "West Africa", "Anywhere"];
  return [
    { key: "skills", label: "Skills", desc: "Skills required for the project.", options: skills, defaults: skills },
    { key: "experience", label: "Experience", desc: "Relevant experience or expertise.", options: exp, defaults: exp.slice(0, 1) },
    { key: "availability", label: "Availability", desc: "Current availability for new collaborations.", options: ["Open now", "From next month", "Flexible"], defaults: ["Open now"] },
    { key: "communication", label: "Communication style", desc: "Preferred communication approach.", options: ["Structured and written", "Conversational", "Asynchronous updates"], defaults: ["Structured and written"] },
    { key: "rhythm", label: "Working rhythm", desc: "Preferred collaboration cadence.", options: ["Weekly", "Fortnightly", "Intensive sprints"], defaults: ["Weekly"] },
    { key: "location", label: "Location", desc: "Geographic relevance, when applicable.", options: place, defaults: place.slice(0, 1) },
    { key: "interests", label: "Shared interests", desc: "Relevant interests or shared purpose.", options: ["Access to education", "Youth development", "Career guidance"], defaults: ["Career guidance"] },
  ];
}
const defaultPrefs = (rows: PrefRow[]) => Object.fromEntries(rows.map((r) => [r.key, [...r.defaults]])) as MatchPrefs;

/** "Research, engineering, product design" from the chosen skills. */
export function skillsLine(p: MatchPrefs) {
  const s = (p.skills ?? []).map((x) => x.toLowerCase());
  return s.length ? cap(s.join(", ")) : "Not specified";
}

export const INTENTIONS: { id: Intention; label: string; title: string; text: string }[] = [
  { id: "project", label: "For a project", title: "For a project", text: "Find people whose skills and experience complement a specific project." },
  { id: "skills", label: "For my skills", title: "For my skills", text: "Discover projects and people that align with my interests and expertise." },
  { id: "interest", label: "For a shared interest", title: "For a shared interest", text: "Find people who share an interest, purpose or creative direction." },
];

// ── Hooks ──

const NO_INTENTION: MatchIntention = { intention: "project", projectId: null, prefs: null, updatedAt: null };

/** What the matching screens read for intention `m`: the project it's for, the preference rows and the chosen prefs. */
function useMatchingContext(m: MatchIntention) {
  const c = useCollab();
  const projects = matchProjects(c);
  // the chosen one, else a project you host, else the first open call you host, else any of yours
  const brief = projects.find((b) => b.id === m.projectId) ?? projects.find((b) => c.projects.some((p) => p.id === b.id && p.host === ME)) ?? projects.find((b) => c.hostedCalls.some((x) => x.id === b.id)) ?? projects[0] ?? null;
  const rows = prefRows(brief);
  return { brief, rows, prefs: m.prefs ?? defaultPrefs(rows), projects };
}

/** The matching step: intention, the project it's for, and preferences. */
export const useMatching = DEMO ? useLocalMatching : useRemoteMatching;

function useRemoteMatching() {
  const s = useMatchingStore(["intention"]);
  const m = s.intention ?? NO_INTENTION;
  const { brief, rows, prefs, projects } = useMatchingContext(m);
  const save = (next: Parameters<typeof saveIntention>[0]) => { void saveIntention(next, s.intention); };
  return {
    intention: m.intention, need: m.need ?? null, brief, rows, prefs, projects,
    setNeed: (need: string) => save({ need, intention: "project" }),
    setIntention: (intention: Intention) => save({ intention }),
    setPrefs: (next: MatchPrefs) => save({ prefs: next }),
    /** Match for another project (Change project); returns an undo. */
    setProject: (projectId: string) => {
      const before = m.projectId;
      save({ projectId });
      return () => { void saveIntention({ projectId: before }, matchingSnapshot().intention); };
    },
  };
}

function useLocalMatching() {
  const [m, setM] = useLocal<MatchIntention>("ak:collab-match:v2", NO_INTENTION);
  const { brief, rows, prefs, projects } = useMatchingContext(m);
  return {
    intention: m.intention, need: m.need ?? null, brief, rows, prefs, projects,
    /** Matching for a need named elsewhere (Create AI): every need is help for a project, so the choice becomes "For a project". */
    setNeed: (need: string) => setM((cur) => ({ ...cur, need, intention: "project", updatedAt: Date.now() })),
    setIntention: (intention: Intention) => setM((cur) => ({ ...cur, intention, updatedAt: Date.now() })),
    setPrefs: (next: MatchPrefs) => setM((cur) => ({ ...cur, prefs: next, updatedAt: Date.now() })),
    /** Match for another project (Change project); returns an undo. */
    setProject: (projectId: string) => {
      const before = m;
      setM((cur) => ({ ...cur, projectId, updatedAt: Date.now() }));
      return () => setM(before);
    },
  };
}

/** Projects that record someone's work, as the profile's contributions. */
function useContributions(id: PersonId) {
  const { projects } = useCollab();
  return projects.flatMap((p) => p.members.filter((m) => m.id === id).map((m) => ({ title: p.title, detail: `${m.role}, ${m.contribution.charAt(0).toLowerCase()}${m.contribution.slice(1)}. Shared with ${firstName(id)}’s consent.` })));
}

/** One collaborator. Null when not available to this member. */
export const useCollaborator = DEMO ? useLocalCollaborator : useRemoteCollaborator;

/** Shown for the moment a collaborator opened by address is loading (their name and photo come from PEOPLE). */
const loadingCollaborator = (id: string): Collaborator => ({
  id: id as PersonId, pronoun: "they", availability: "", keySkills: [], intro: "", compat: "", experience: "", preference: "", about: "",
  experienceList: [], skills: [], interests: [], preferences: [], contributions: [], matchContext: "", reasons: [], ask: [], aligned: "",
});

function useRemoteCollaborator(id: string | undefined): Collaborator | null {
  const c = useRemoteCollaboratorById(id);
  return c === undefined && id ? loadingCollaborator(id) : c ?? null;
}

/** The demo: a sample person, with contributions read from our projects. */
function useLocalCollaborator(id: string | undefined) {
  const base = SAMPLE.find((c) => c.id === id) ?? null;
  const fromProjects = useContributions((base?.id ?? "") as PersonId);
  if (!DEMO || !base) return null;
  const contributions = fromProjects.length ? fromProjects : base.contributions;
  const titles = fromProjects.map((x) => x.title);
  const f = firstName(base.id), poss = P[base.pronoun].poss;
  const lc = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const pref = (label: string) => base.preferences.find((x) => x.label === label)?.value;
  // Written reasons where we have them; otherwise the reasons follow from what they shared.
  const derived: MatchReason[] = [
    { category: "Shared purpose", text: base.matchContext, source: `From ${poss} public profile` },
    { category: "Complementary skills", text: `Your skills may complement ${f}’s ${list(base.keySkills.map(lc))}.`, source: `From your open call and ${poss} public skills` },
    { category: "Relevant experience", text: base.experience, source: `From ${poss} public experience` },
    ...(pref("Communication style") ? [{ category: "Preferred communication style", text: `${f} prefers ${lc(pref("Communication style")!)}.`, source: "Shared for this match" }] : []),
    ...(pref("Availability") ? [{ category: "Availability", text: `${f} is ${lc(pref("Availability")!)}.`, source: "Shared for this match" }] : []),
    ...(pref("Preferred working rhythm") ? [{ category: "Working rhythm", text: `${f} prefers ${lc(pref("Preferred working rhythm")!)}.`, source: "Shared for this match" }] : []),
  ];
  const reasons = [
    ...(base.reasons.length ? base.reasons : derived),
    ...(titles.length ? [{ category: "Previous trusted contributions", text: `${f} has contributed to ${list(titles)}.`, source: `Shared with ${poss} consent` }] : []),
  ];
  return { ...base, contributions, reasons };
}

/** The first recommendation: the person the design's single-person addresses (profile-preview, request…) show. */
export const leadId = (): PersonId | null => (DEMO ? SAMPLE[0].id : matchingSnapshot().recs?.[0] ?? null);
export const collaboratorIds = (): PersonId[] => (DEMO ? SAMPLE.map((c) => c.id) : matchingSnapshot().recs ?? []);
/** A collaborator already known on this page (the demo's samples; or recommended, saved or opened from the API). */
export const sampleCollaborator = (id: string): Collaborator | null => (DEMO ? SAMPLE.find((c) => c.id === id) : matchingSnapshot().people[id]) ?? null;

/** Recommendations, without the people the member said weren't relevant. */
export const useRecommendations = DEMO ? useLocalRecommendations : useRemoteRecommendations;

function useRemoteRecommendations() {
  const s = useMatchingStore(["recs"]);
  return {
    list: (s.recs ?? []).map((id) => s.people[id]).filter((c): c is Collaborator => !!c),
    /** Returns an undo. */
    dismiss: (id: PersonId) => dismissRemote(id),
  };
}

function useLocalRecommendations() {
  const [dismissed, setDismissed] = useLocal<PersonId[]>("ak:collab-dismissed:v2", []);
  const all = DEMO ? SAMPLE : [];
  return {
    list: all.filter((c) => !dismissed.includes(c.id)),
    /** Returns an undo. */
    dismiss: (id: PersonId) => { const before = dismissed; setDismissed((cur) => (cur.includes(id) ? cur : [...cur, id])); return () => setDismissed(before); },
  };
}

// "Saved" on the discovery cards is for this visit only, as in the design; the saved list itself is kept.
let session: PersonId[] = [];
const subs = new Set<() => void>();
const setSession = (next: PersonId[]) => { session = next; subs.forEach((f) => f()); };
const useSession = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => session, () => session);

export const useSavedCollaborators = DEMO ? useLocalSavedCollaborators : useRemoteSavedCollaborators;

function useRemoteSavedCollaborators() {
  const s = useMatchingStore(["saved"]);
  const savedNow = useSession();
  const saved = s.saved ?? [];
  const change = (id: PersonId, on: boolean) => {
    const before = { was: saved.includes(id), session };
    setSaved(id, on);
    setSession(on ? (session.includes(id) ? session : [...session, id]) : session.filter((x) => x !== id));
    return () => { if (before.was !== on) setSaved(id, before.was); setSession(before.session); };
  };
  return {
    saved, savedNow,
    /** Both return an undo. */
    save: (id: PersonId) => change(id, true),
    unsave: (id: PersonId) => change(id, false),
  };
}

function useLocalSavedCollaborators() {
  const [saved, setSaved] = useLocal<PersonId[]>("ak:collab-saved:v2", SEED_SAVED);
  const savedNow = useSession();
  return {
    saved, savedNow,
    /** Both return an undo. */
    save: (id: PersonId) => {
      const before = { saved, session };
      setSaved((cur) => (cur.includes(id) ? cur : [...cur, id]));
      setSession(session.includes(id) ? session : [...session, id]);
      return () => { setSaved(before.saved); setSession(before.session); };
    },
    unsave: (id: PersonId) => {
      const before = { saved, session };
      setSaved((cur) => cur.filter((x) => x !== id));
      setSession(session.filter((x) => x !== id));
      return () => { setSaved(before.saved); setSession(before.session); };
    },
  };
}

export const useIntroductions = DEMO ? useLocalIntroductions : useRemoteIntroductions;

function useRemoteIntroductions() {
  const s = useMatchingStore(["sent"]);
  const list = (s.sent ?? []).filter((x) => !x.withdrawnAt);
  return {
    list, ready: s.sent !== null,
    /** The one you sent to this person (withdrawn ones don't count). */
    get: (to: string) => list.find((x) => x.to === to) ?? null,
    send: (input: Pick<Introduction, "to" | "projectId" | "projectTitle" | "message">) => sendIntroduction(input),
    /** Take back a request that is still pending: it leaves the list. Returns an undo that puts it back. */
    withdraw: (id: string) => withdrawIntroduction(id),
  };
}

function useLocalIntroductions() {
  const [all, setAll, ready] = useLocal<Introduction[]>("ak:collab-intros:v2", SEED_INTROS);
  const list = all.filter((x) => !x.withdrawnAt);
  return {
    list, ready,
    /** The one you sent to this person (withdrawn ones don't count). */
    get: (to: string) => list.find((x) => x.to === to) ?? null,
    /** A new request replaces an earlier one to the same person. */
    send: (input: Pick<Introduction, "to" | "projectId" | "projectTitle" | "message">) => {
      const intro: Introduction = { ...input, id: newId("in"), status: "pending", sentAt: Date.now() };
      setAll((cur) => [intro, ...cur.filter((x) => x.to !== input.to)]);
      return intro;
    },
    /** Take back a request that is still pending: it leaves the list. Returns an undo that puts it back. */
    withdraw: (id: string) => {
      setAll((cur) => cur.map((x) => (x.id === id ? { ...x, withdrawnAt: Date.now() } : x)));
      return () => setAll((cur) => cur.map((x) => (x.id === id ? { ...x, withdrawnAt: undefined } : x)));
    },
  };
}

export const INTRO_STATUS: Record<IntroStatus, string> = { pending: "Pending", accepted: "Accepted", notnow: "Not now" };
const longDate = (at: number) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "Sun 1 Nov", as the timeline dates its steps. */
const shortDay = (at: number) => { const d = new Date(at); return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`; };
export const sentOn = (at: number) => `Sent ${longDate(at)}`;

// ── One introduction request's page ──

export type RequestStep = { title: string; note: string; state: "done" | "upcoming" | "ended" };
/** What the page of a request you sent says at each stage: the card's date line, the heading, where it stands, and what is shared. */
export type RequestPage = { stage: IntroStatus; sent: string; headline: string; support: string; steps: RequestStep[]; notice: { title: string; text: string } };

/**
 * The page copy for `intro` at `stage` (its own status, or the one a review address shows). A reply with no
 * recorded date (only on those review addresses) reads as today.
 */
export function requestPage(intro: Introduction, stage: IntroStatus = intro.status): RequestPage {
  const pronoun = pronounOf(intro.to), f = firstName(intro.to), { poss } = P[pronoun];
  const replied = intro.answeredAt ?? Date.now();
  if (stage === "accepted") {
    const seen = intro.seenAt ?? replied;
    return {
      stage, sent: `${sentOn(intro.sentAt)}. Accepted ${longDate(replied)}.`,
      headline: `${f} accepted your request.`, support: "You can start a conversation whenever you are ready.",
      steps: [
        { title: "Sent", note: shortDay(intro.sentAt), state: "done" },
        { title: "Seen", note: shortDay(seen), state: "done" },
        { title: "Reply", note: `${f} accepted, ${shortDay(replied)}`, state: "done" },
      ],
      notice: { title: "You are connected.", text: `${f} has agreed to talk with you. You are not added to each other’s projects until you both choose to be.` },
    };
  }
  if (stage === "notnow") {
    return {
      stage, sent: `${sentOn(intro.sentAt)}. Reply ${longDate(replied)}.`,
      headline: `${f} is not available to connect right now.`, support: "This is not a reflection on you or your project. You can look for other collaborators, or try again another time.",
      steps: [
        { title: "Sent", note: shortDay(intro.sentAt), state: "done" },
        { title: "Not now", note: shortDay(replied), state: "ended" },
      ],
      notice: { title: "Nothing changes for your project.", text: `Your note stays between you and ${f}. You can send a new request later, or look at other people who may fit.` },
    };
  }
  return {
    stage, sent: sentOn(intro.sentAt),
    headline: `Waiting for ${f}.`, support: `${f} has not replied yet. You will see ${poss} decision here when ${acts(pronoun, "does", "do")}.`,
    steps: [
      { title: "Sent", note: shortDay(intro.sentAt), state: "done" },
      intro.seenAt ? { title: "Seen", note: shortDay(intro.seenAt), state: "done" } : { title: "Seen", note: `You will see when ${f} has opened it`, state: "upcoming" },
      { title: "Reply", note: `${f} decides whether to connect`, state: "upcoming" },
    ],
    notice: { title: `Nothing more is shared until ${f} agrees.`, text: `${f} can see your note and your public profile. Neither of you is added to a project automatically. You can withdraw this request before ${acts(pronoun, "replies", "reply")}.` },
  };
}

// ── Introductions people asked of you ──

/** People waiting for your answer, and what you answered. Accept and Not now each return an undo (back to waiting). */
export const useIncomingIntroductions = DEMO ? useLocalIncomingIntroductions : useRemoteIncomingIntroductions;

function useRemoteIncomingIntroductions() {
  const s = useMatchingStore(["incoming"]);
  const list = s.incoming ?? [];
  return {
    list, ready: s.incoming !== null,
    waiting: list.filter((x) => x.status === "waiting"),
    accept: (id: string) => answerIntroduction(id, "accepted"),
    notNow: (id: string) => answerIntroduction(id, "notnow"),
    /** Back to waiting (Undo). */
    reopen: (id: string) => { answerIntroduction(id, "waiting"); },
  };
}

function useLocalIncomingIntroductions() {
  const [list, setList, ready] = useLocal<IncomingIntroduction[]>("ak:collab-intros-in:v2", SEED_INCOMING);
  const answer = (id: string, status: IncomingStatus) => {
    setList((cur) => cur.map((x) => (x.id === id ? { ...x, status, answeredAt: status === "waiting" ? undefined : Date.now() } : x)));
    return () => setList((cur) => cur.map((x) => (x.id === id ? { ...x, status: "waiting", answeredAt: undefined } : x)));
  };
  return {
    list, ready,
    waiting: list.filter((x) => x.status === "waiting"),
    accept: (id: string) => answer(id, "accepted"),
    notNow: (id: string) => answer(id, "notnow"),
    /** Back to waiting (Undo). */
    reopen: (id: string) => { answer(id, "waiting"); },
  };
}
/** "Received yesterday", "Received 3 days ago", "Received 2 November". */
export function receivedOn(at: number) {
  const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(at).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days <= 0) return "Received today";
  if (days === 1) return "Received yesterday";
  if (days < 7) return `Received ${days} days ago`;
  return `Received ${new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}

/** Where each person's pages live. */
export const collabHref = (id: string) => ({
  profile: `/collaborate/collaborators/${id}`,
  request: `/collaborate/collaborators/${id}/request`,
  sent: `/collaborate/collaborators/${id}/request-sent`,
  why: `/collaborate/collaborators/${id}/why-this-match`,
});
/** Where a person's profile is: their collaborator profile when they are recommended to you, otherwise their Akines profile. */
export const profileHref = (id: string) => (sampleCollaborator(id) ? collabHref(id).profile : `/connect/people/${id}`);
/** The page of the introduction you sent to someone; the Not now one has its own address, as in the design. */
export const requestHref = (to: string, status: IntroStatus = "pending") => `/collaborate/introduction-requests/${to}${status === "notnow" ? "/not-now" : ""}`;
export const CC = {
  start: "/collaborate/start",
  entry: "/collaborate/collaborators",
  matching: "/collaborate/collaborators/matching",
  discovery: "/collaborate/collaborators/discovery",
  saved: "/collaborate/saved-collaborators",
  savedEmpty: "/collaborate/saved-collaborators/state-empty",
  requests: "/collaborate/introduction-requests",
  requestsEmpty: "/collaborate/introduction-requests/state-empty",
  introductions: "/collaborate/introductions",
  introductionsEmpty: "/collaborate/introductions/state-empty",
  myProjects: "/collaborate/my-projects",
};
