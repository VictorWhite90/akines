"use client";

import { useSyncExternalStore } from "react";
import { ME } from "@/lib/collab/me";
import { useCollab } from "@/lib/collab/useCollab";
import type { CollabCall, Project } from "@/lib/collab/types";
import { DEMO } from "@/lib/demo/mode";
import { MATCHES } from "@/lib/data/matches";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";

/*
 * Collaborators: people recommended to work with, why, what you saved, and the introductions you asked for.
 * Shaped like the REST resources a backend would serve, so the screens don't change when it does:
 *   GET  /collab/collaborators?intention=&project=   → Collaborator[] (recommendations, with reasons)
 *   GET  /collab/collaborators/:id                   → Collaborator
 *   PUT  /collab/match-intention                     → MatchIntention
 *   GET|POST|DELETE /collab/saved-collaborators[/:id]
 *   GET|POST /collab/introductions                   → Introduction
 * Until those exist everything is kept in the browser. Recommendations are sample content in the demo only;
 * a real member sees none yet rather than people who aren't on Akines.
 */

// ── Types ──

export type Intention = "project" | "skills" | "interest";
export type PrefKey = "skills" | "experience" | "availability" | "communication" | "rhythm" | "location" | "interests";
export type MatchPrefs = Record<PrefKey, string[]>;

/** The member's collaboration intention (the matching step): what they want, for which project, and what matters. */
export type MatchIntention = { intention: Intention; projectId: string | null; prefs: MatchPrefs | null; updatedAt: number | null };

export type Pronoun = "she" | "he";
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
};

export type IntroStatus = "pending" | "accepted" | "notnow";
export type Introduction = { id: string; to: PersonId; projectId: string | null; projectTitle: string; message: string; status: IntroStatus; sentAt: number };

// ── Copy helpers ──

const P = { she: { subj: "she", obj: "her", poss: "her" }, he: { subj: "he", obj: "him", poss: "his" } } as const;
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
    sentNote: `${f} hasn’t responded yet. You’ll see ${poss} decision here when ${subj} does.`,
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
      { label: "Working preferences", text: `${f} shared these for this match so you can see how ${subj} likes to collaborate.` },
    ],
  };
}

export const suggestedMessage = (c: Collaborator, brief: Brief | null) =>
  `Hi ${firstName(c.id)},\n\n${brief ? `I’m working on ${brief.name}. ${brief.summary}` : "I’m starting a new project."}\n\nYour experience ${c.aligned} seems closely aligned with what we’re building.\n\nI’d love to connect and explore whether we could work together.`;

// ── Sample recommendations (demo) ──

const reason = (id: PersonId) => MATCHES.find((m) => m.id === id)?.reason;

const SAMPLE: Collaborator[] = [
  {
    id: "efua", pronoun: "she", availability: "Available for new projects", keySkills: ["Interviews", "Oral history", "Storytelling"],
    intro: "I follow stories home, one archive at a time, and help people tell theirs in their own words.",
    compat: "Efua’s interviewing experience may complement your design skills, helping your guests say what starting out really feels like.",
    experience: "Recorded and captioned the trader interviews for the Market Light photo book.",
    preference: "Structured weekly collaboration with written updates.",
    about: "Efua is a historian who records how ordinary people remember their lives. She runs long, unhurried interviews, turns hours of tape into short pieces people want to hear, and cares about the voices that are usually left out of the record.",
    experienceList: [
      { title: "Market Light", detail: "Trader interviews and captions for a photo book of Wuse Market" },
      { title: "Family archives of Kumasi", detail: "Oral historian, recorded with families across the city" },
      { title: "Final-year project, Kubwa", detail: "Supervisor for a student research project" },
    ],
    skills: ["Interviewing", "Oral history", "Editing tape", "Archival research"],
    interests: ["Identity", "Storytelling", "Young people’s voices", "Local history"],
    preferences: [
      { label: "Communication style", value: "Clear expectations and structured communication" },
      { label: "Preferred working rhythm", value: "Weekly, with asynchronous updates between sessions" },
      { label: "Availability", value: "Currently open to new collaborations" },
      { label: "Collaboration preferences", value: "Written briefs, shared documents and one live session each week" },
    ],
    contributions: [{ title: "Market Light", detail: "Acknowledged by the project team. Shared with Efua’s consent." }],
    matchContext: "You both love a good story, and Efua’s interviewing experience may help your guests say what starting out is really like.",
    reasons: [
      { category: "Shared purpose", text: reason("efua") ?? "You both want ordinary people’s stories heard in their own words.", source: "From her public profile" },
      { category: "Complementary skills", text: "Your design experience may complement Efua’s interviewing and storytelling.", source: "From your open call and her public skills" },
      { category: "Relevant experience", text: "Efua recorded and captioned the trader interviews for Market Light.", source: "From her public experience" },
      { category: "Preferred communication style", text: "You both prefer clear expectations and structured communication.", source: "Shared for this match" },
      { category: "Availability", text: "Efua is currently open to new collaborations.", source: "Shared for this match" },
      { category: "Working rhythm", text: "You both prefer a weekly working rhythm with asynchronous updates between sessions.", source: "Shared for this match" },
      { category: "Geographic or cultural relevance", text: "Efua has recorded stories with families and traders in Ghana and Nigeria.", source: "From her public profile" },
    ],
    ask: [
      "Efua is recommended because your project needs someone who can draw stories out of guests, and she has relevant experience in that area.",
      "You have both been journaling about identity this month, and you both love a good story.",
      "Her preferred working rhythm may complement the weekly recording schedule you set for this project.",
    ],
    aligned: "recording people’s stories in their own words",
  },
  {
    id: "zuri", pronoun: "she", availability: "Open to new collaborations", keySkills: ["Community", "Events", "Outreach"],
    intro: "I bring diaspora people together, online and around real tables, and help them keep coming back.",
    compat: "Zuri’s community work may help your project find its guests and its first listeners, in Abuja and beyond.",
    experience: "Organised the open call for a 20-metre mural at Jabi Lake Arts Week.",
    preference: "Short weekly check-ins and a shared task board.",
    about: "Zuri organises gatherings for Africans in the diaspora, from supper clubs to online talks. She knows how to find the right people, get them in a room and make them feel welcome, and she enjoys turning one good conversation into something that lasts.",
    experienceList: [
      { title: "Jabi Lake Arts Week", detail: "Organiser of the open call for a 20-metre mural" },
      { title: "Diaspora supper club", detail: "Founder, monthly gatherings in London" },
      { title: "Online talks series", detail: "Host and programmer" },
    ],
    skills: ["Community building", "Event hosting", "Guest outreach", "Social media"],
    interests: ["Diaspora stories", "Young people", "Community networks", "Live events"],
    preferences: [
      { label: "Communication style", value: "Short, regular updates and clear task ownership" },
      { label: "Preferred working rhythm", value: "Weekly check-ins, with a shared task board between them" },
      { label: "Availability", value: "Currently open to new collaborations" },
      { label: "Collaboration preferences", value: "A shared task board, short calls and written decisions" },
    ],
    contributions: [{ title: "Jabi Lake Arts Week", detail: "Organiser. Shared with Zuri’s consent." }],
    matchContext: "You both want young people to hear from someone a few steps ahead of them, and Zuri’s community work may help your project reach them.",
    reasons: [],
    ask: [
      "Zuri is recommended because your project needs guests and listeners, and she has relevant experience bringing people together.",
      "You both care about young people starting out well.",
      "Her preferred working rhythm may complement the weekly schedule you set for this project.",
    ],
    aligned: "bringing people together around real tables",
  },
  {
    id: "tunde", pronoun: "he", availability: "Available from next month", keySkills: ["Coaching", "Mentoring", "Speaking"],
    intro: "I coach under-15s on Saturdays and spend the rest of the week talking with them about what comes next.",
    compat: "Tunde’s years of talking with young people may make him an easy, honest voice for your project, while you shape it around them.",
    experience: "Coaches an under-15 team in Lagos and mentors players leaving school.",
    preference: "Conversations in person, with voice notes in between.",
    about: "Tunde coaches young footballers in Lagos and has watched many of them leave school for first jobs, apprenticeships and small businesses. He talks with them plainly about money, work and confidence, and he is good at getting quiet people to speak.",
    experienceList: [
      { title: "Under-15 squad", detail: "Head coach, Saturday league in Lagos" },
      { title: "After-school mentoring", detail: "Mentor for players finishing secondary school" },
      { title: "Matchday radio", detail: "Guest commentator on a local station" },
    ],
    skills: ["Coaching", "Mentoring young people", "Public speaking", "Interviewing"],
    interests: ["Youth development", "Sport", "First jobs", "Lagos and Abuja"],
    preferences: [
      { label: "Communication style", value: "Honest conversations, with voice notes in between" },
      { label: "Preferred working rhythm", value: "Sessions after training, with asynchronous feedback between them" },
      { label: "Availability", value: "Available from next month" },
      { label: "Collaboration preferences", value: "Short calls, voice notes and a shared plan" },
    ],
    contributions: [],
    matchContext: "You both want young people to start out with more confidence, and Tunde’s mentoring may make him a natural voice for your project.",
    reasons: [],
    ask: [
      "Tunde is recommended because your project speaks to young people starting out, and he talks with them every week.",
      "You both care about young people finding their feet.",
      "His preferred working rhythm may suit sessions that fit around his training.",
    ],
    aligned: "talking with young people about what comes after school",
  },
  {
    id: "thandi", pronoun: "she", availability: "Available for new projects", keySkills: ["Teaching", "Facilitation", "Mentoring"],
    intro: "I teach, run a small pottery class and like helping people say what they mean.",
    compat: "Thandi’s teaching experience may help each part of your project leave people with something they can use.",
    experience: "Leads the evening course in product design basics at Abuja Tech Hub.",
    preference: "Regular conversations with clear shared expectations.",
    about: "Thandi is a primary school teacher who also runs courses for adults starting out. She plans sessions that people remember, asks good questions and is patient with nerves, which makes her good company for anyone speaking up for the first time.",
    experienceList: [
      { title: "Evening course: product design basics", detail: "Course lead at Abuja Tech Hub" },
      { title: "Primary school", detail: "Class teacher in Johannesburg" },
      { title: "Pottery evenings", detail: "Runs a small class for beginners" },
    ],
    skills: ["Lesson planning", "Facilitation", "Mentoring", "Clear writing"],
    interests: ["Learning", "Making by hand", "Young people", "Encouragement"],
    preferences: [
      { label: "Communication style", value: "Regular conversations with clear shared expectations" },
      { label: "Preferred working rhythm", value: "Regular conversations, with a short written summary after each one" },
      { label: "Availability", value: "Currently open to new collaborations" },
      { label: "Collaboration preferences", value: "Short calls, clear written expectations and an open channel for questions" },
    ],
    contributions: [],
    matchContext: `${reason("thandi") ?? "You both teach in different ways."} Thandi’s experience may help your project leave people with something useful.`,
    reasons: [],
    ask: [
      "Thandi is recommended because your project hopes to leave people with something useful, and she plans learning for a living.",
      reason("thandi") ?? "You both teach in different ways.",
      "Her preferred working rhythm may complement the weekly schedule you set for this project.",
    ],
    aligned: "helping people learn and speak up",
  },
];

const SEED_SAVED: PersonId[] = DEMO ? ["zuri", "tunde"] : [];
const SEED_INTROS: Introduction[] = DEMO ? [
  { id: "in-leila", to: "leila", projectId: "youth-podcast", projectTitle: "Abuja Youth Podcast: season one", message: "Hi Leila, I’m starting a podcast with young people in Abuja. You’ve hosted founders on stage, and I’d love your view on how to run a good conversation.", status: "pending", sentAt: Date.UTC(2026, 10, 1) },
  { id: "in-wanjiru", to: "wanjiru", projectId: "youth-podcast", projectTitle: "Abuja Youth Podcast: season one", message: "Hi Wanjiru, I’m putting together the cover for a podcast about starting out in Abuja and would love to see whether your portraits could be part of it.", status: "notnow", sentAt: Date.UTC(2026, 9, 28) },
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
function briefFromProject(p: Project): Brief {
  return { id: p.id, name: p.title, stage: "In progress", line: p.summary, summary: p.summary, roles: [], fields: [], city: "" };
}

// ── Matching preferences ──

export type PrefRow = { key: PrefKey; label: string; desc: string; options: string[]; defaults: string[] };

/** The preference rows; the project's own roles, fields and city come first where the design had theirs. */
export function prefRows(b: Brief | null): PrefRow[] {
  const skills = b?.roles.length ? b.roles : ["Research", "Design", "Engineering"];
  const exp = [...(b?.fields ?? []), "Early-stage projects"].slice(0, 3);
  const place = b?.city ? [b.city, "Nigeria", "Anywhere"] : ["Nigeria", "West Africa", "Anywhere"];
  return [
    { key: "skills", label: "Skills", desc: "Skills required for the project.", options: skills, defaults: skills },
    { key: "experience", label: "Experience", desc: "Relevant experience or expertise.", options: exp, defaults: exp.slice(0, 1) },
    { key: "availability", label: "Availability", desc: "Current availability for new collaborations.", options: ["Open now", "From next month", "Flexible"], defaults: ["Open now"] },
    { key: "communication", label: "Communication style", desc: "Preferred communication approach.", options: ["Structured and written", "Conversational", "Asynchronous updates"], defaults: ["Structured and written"] },
    { key: "rhythm", label: "Working rhythm", desc: "Preferred collaboration cadence.", options: ["Weekly", "Fortnightly", "Intensive sprints"], defaults: ["Weekly"] },
    { key: "location", label: "Location", desc: "Geographic relevance, when applicable.", options: place, defaults: place.slice(0, 1) },
    { key: "interests", label: "Shared interests", desc: "Relevant interests or shared purpose.", options: ["Youth development", "Storytelling", "Community"], defaults: ["Youth development"] },
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

/** The matching step: intention, the project it's for, and preferences. */
export function useMatching() {
  const c = useCollab();
  const [m, setM] = useLocal<MatchIntention>("ak:collab-match", { intention: "project", projectId: null, prefs: null, updatedAt: null });
  const call = c.hostedCalls.find((x) => x.id === m.projectId) ?? c.hostedCalls[0];
  const hosted = c.projects.find((p) => p.id === m.projectId) ?? c.projects.find((p) => p.host === ME);
  const brief = call ? briefFromCall(call) : hosted ? briefFromProject(hosted) : null;
  const rows = prefRows(brief);
  const prefs = m.prefs ?? defaultPrefs(rows);
  return {
    intention: m.intention, brief, rows, prefs,
    setIntention: (intention: Intention) => setM((cur) => ({ ...cur, intention, updatedAt: Date.now() })),
    setPrefs: (next: MatchPrefs) => setM((cur) => ({ ...cur, prefs: next, updatedAt: Date.now() })),
  };
}

/** Projects that record someone's work, as the profile's contributions. */
function useContributions(id: PersonId) {
  const { projects } = useCollab();
  return projects.flatMap((p) => p.members.filter((m) => m.id === id).map((m) => ({ title: p.title, detail: `${m.role}, ${m.contribution.charAt(0).toLowerCase()}${m.contribution.slice(1)}. Shared with ${firstName(id)}’s consent.` })));
}

/** One collaborator, with contributions read from our projects. Null when not recommended to this member. */
export function useCollaborator(id: string | undefined) {
  const base = SAMPLE.find((c) => c.id === id) ?? null;
  const fromProjects = useContributions((base?.id ?? "amara") as PersonId);
  if (!DEMO || !base) return null;
  const contributions = fromProjects.length ? fromProjects : base.contributions;
  const titles = fromProjects.map((x) => x.title);
  const f = firstName(base.id), poss = P[base.pronoun].poss;
  const lc = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const pref = (label: string) => base.preferences.find((x) => x.label === label)?.value;
  // Written reasons where we have them; otherwise the reasons follow from what they shared.
  const derived: MatchReason[] = [
    { category: "Shared purpose", text: reason(base.id) ?? base.matchContext, source: `From ${poss} public profile` },
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
export const leadId = (): PersonId | null => (DEMO ? SAMPLE[0].id : null);
export const collaboratorIds = (): PersonId[] => (DEMO ? SAMPLE.map((c) => c.id) : []);
export const sampleCollaborator = (id: string) => SAMPLE.find((c) => c.id === id) ?? null;

/** Recommendations, without the people the member said weren't relevant. */
export function useRecommendations() {
  const [dismissed, setDismissed] = useLocal<PersonId[]>("ak:collab-dismissed", []);
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

export function useSavedCollaborators() {
  const [saved, setSaved] = useLocal<PersonId[]>("ak:collab-saved", SEED_SAVED);
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

export function useIntroductions() {
  const [list, setList] = useLocal<Introduction[]>("ak:collab-intros", SEED_INTROS);
  return {
    list,
    /** A new request replaces an earlier one to the same person. */
    send: (input: Pick<Introduction, "to" | "projectId" | "projectTitle" | "message">) => {
      const intro: Introduction = { ...input, id: newId("in"), status: "pending", sentAt: Date.now() };
      setList((cur) => [intro, ...cur.filter((x) => x.to !== input.to)]);
      return intro;
    },
  };
}

export const INTRO_STATUS: Record<IntroStatus, string> = { pending: "Pending", accepted: "Accepted", notnow: "Not now" };
export const sentOn = (at: number) => `Sent ${new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;

/** Where each person's pages live. */
export const collabHref = (id: string) => ({
  profile: `/collaborate/collaborators/${id}`,
  request: `/collaborate/collaborators/${id}/request`,
  sent: `/collaborate/collaborators/${id}/request-sent`,
  why: `/collaborate/collaborators/${id}/why-this-match`,
});
export const CC = {
  start: "/collaborate/start",
  entry: "/collaborate/collaborators",
  matching: "/collaborate/collaborators/matching",
  discovery: "/collaborate/collaborators/discovery",
  saved: "/collaborate/saved-collaborators",
  savedEmpty: "/collaborate/saved-collaborators/state-empty",
  requests: "/collaborate/introduction-requests",
  requestsEmpty: "/collaborate/introduction-requests/state-empty",
  myProjects: "/collaborate/my-projects",
};
