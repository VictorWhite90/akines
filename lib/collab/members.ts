import { collabApi, peopleFull } from "@/lib/api/collab";
import { DEMO } from "@/lib/demo/mode";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { listOf, type DiscoverProject } from "./projects";

/*
 * A member's page as seen from a project they lead or work on (the design's collaborate/members/<slug>), shaped
 * like the resource the backend would serve (GET /collab/members/<id>?project=<callId>). The public profile is
 * what the member chose to share; someone who shares less gets the design's limited page.
 */

export type Pronoun = "she" | "he" | "they";
export type MemberProfile = {
  pronoun: Pronoun;
  headline: string;
  keySkills: string[];
  about: string;
  experience: { title: string; detail: string }[];
  skills: string[];
  interests: string[];
  preferences: { label: string; value: string }[];
  contributions: { title: string; detail: string }[];
  /** How the member's page names their role and place, and their portrait, when it differs from their Akines profile. */
  role?: string;
  place?: string;
  portrait?: string;
};

/** The profiles the sample members share (the design's projects/data.ts, word for word). Everyone else shares only their role and skills. */
export const MEMBER_PROFILES: Partial<Record<PersonId, MemberProfile>> = {
  ngozi: {
    pronoun: "she", role: "Product Designer", place: "Lagos", portrait: "/kin/design/people/collab-projects/ngozi-eze.jpg",
    headline: "I design simple tools that help students keep up in class. I started A Better Way to Learn to make lessons easier to follow on a basic phone.",
    keySkills: ["Product design", "Education technology", "User research"],
    about: "Ngozi designs learning tools for secondary school students in Lagos. She started A Better Way to Learn after seeing how many students fall behind when lessons are not built for the phones and data they have.",
    experience: [{ title: "Study tool for secondary school students", detail: "Lead designer, education start-up in Lagos" }, { title: "Teacher feedback dashboard", detail: "Product designer" }, { title: "Reading habits research", detail: "Researcher and designer" }],
    skills: ["Product design", "Interaction design", "User research", "Prototyping"],
    interests: ["Access to education", "Youth development", "Inclusive design", "Community learning"],
    preferences: [{ label: "Communication style", value: "Short written updates and a weekly call" }, { label: "Preferred working rhythm", value: "Weekly, with shared notes between calls" }, { label: "Availability", value: "Open to new collaborators on A Better Way to Learn" }, { label: "Collaboration preferences", value: "Shared documents and one live session each week" }],
    contributions: [{ title: "Lesson sketch reviews", detail: "Led two sessions with teachers. Shared with Ngozi’s consent." }, { title: "Study tool for secondary school students", detail: "Lead designer. Shared with Ngozi’s consent." }],
  },
  obinna: {
    pronoun: "he", role: "Learning Designer", place: "Abuja", portrait: "/kin/design/people/collab-projects/obinna-adeyemi.jpg",
    headline: "I turn classroom ideas into short, clear lessons. On A Better Way to Learn I shape how each lesson is written and tested with students.",
    keySkills: ["Learning design", "Curriculum writing", "Teacher training"],
    about: "Obinna has spent years writing lessons and training teachers in Abuja and Kaduna. He joined A Better Way to Learn to make sure every lesson is clear for students who learn at different speeds.",
    experience: [{ title: "Primary school reading programme", detail: "Curriculum writer, Kaduna" }, { title: "Teacher training course", detail: "Trainer and course designer" }, { title: "Literacy radio lessons", detail: "Script writer" }],
    skills: ["Learning design", "Lesson writing", "Teacher training", "Assessment design"],
    interests: ["Early literacy", "Teacher support", "Low-data learning", "Community education"],
    preferences: [{ label: "Communication style", value: "Clear briefs and quick written replies" }, { label: "Preferred working rhythm", value: "Two focused sessions each week" }, { label: "Availability", value: "Part of the team, a few hours a week" }, { label: "Collaboration preferences", value: "Shared documents and short voice notes" }],
    contributions: [{ title: "Lesson structure for A Better Way to Learn", detail: "Wrote the first three lesson outlines. Shared with Obinna’s consent." }, { title: "Teacher guide", detail: "Co-author. Shared with Obinna’s consent." }],
  },
};

/** The design's addresses of the sample members' pages (collaborate/members/ngozi-eze). Everyone else's is their id. */
const MEMBER_SLUGS: Partial<Record<PersonId, string>> = { ngozi: "ngozi-eze", obinna: "obinna-adeyemi" };
export const memberSlug = (id: PersonId) => MEMBER_SLUGS[id] ?? id;
export const memberIdOf = (slug: string): PersonId => (Object.entries(MEMBER_SLUGS).find(([, s]) => s === slug)?.[0] ?? slug) as PersonId;

export type MemberPage = {
  id: PersonId;
  name: string;
  first: string;
  initials: string;
  role: string;
  place: string;
  portraitId: PersonId;
  /** Their portrait on this page, when it is not their profile photo. */
  portrait?: string;
  kind: "owner" | "team";
  limited: boolean;
  headline: string;
  limitedIntro: string;
  keySkills: string[];
  profile?: MemberProfile;
  onProject: string;
  seeing: string;
};

const POSSESSIVE: Record<Pronoun, string> = { she: "her", he: "his", they: "their" };

/**
 * Outside the demo: what the member's published work profile shares (GET work/people/<id>), asked for the first
 * time their page opens. Someone who hasn't published one gets the limited page.
 */
function remoteProfile(id: PersonId): MemberProfile | undefined {
  if (DEMO) return undefined;
  collabApi.person(id);
  const p = peopleFull[id];
  if (!p) return undefined;
  return {
    pronoun: "they", headline: p.headline, keySkills: p.skills.slice(0, 3), about: p.about,
    experience: p.projects.map((x) => ({ title: x.title, detail: [x.role, x.kind, x.year].filter(Boolean).join(", ") })),
    skills: p.skills, interests: [], preferences: p.experience ? [{ label: "Experience", value: p.experience }] : [], contributions: [],
  };
}

/** The member as the project's page shows them; undefined if they are not on its team. */
export function memberPage(id: PersonId, project: DiscoverProject): MemberPage | undefined {
  const person = PEOPLE[id];
  const onTeam = project.team.find((t) => t.id === id);
  if (!person || !onTeam) return undefined;
  const first = person.name.split(" ")[0]!;
  const profile = MEMBER_PROFILES[id] ?? remoteProfile(id);
  const pro = profile?.pronoun ?? "they";
  const kind = id === project.ownerId ? "owner" : "team";
  const looking = listOf(project.roles.map((r) => `${/^[aeiou]/i.test(r) ? "an" : "a"} ${r.toLowerCase()}`));
  const role = profile?.role ?? (kind === "owner" ? person.role || "Project owner" : onTeam.role);
  return {
    id, name: person.name, first, initials: person.name.split(" ").map((w) => w[0]).join(""),
    role: role.charAt(0).toUpperCase() + role.slice(1), place: profile?.place ?? person.city, portraitId: id, portrait: profile?.portrait, kind, limited: !profile,
    headline: profile?.headline ?? "",
    limitedIntro: `${first} shares only a few details with other members. You can see ${POSSESSIVE[pro]} role on this project and the skills ${pro} ${pro === "they" ? "list" : "lists"}.`,
    keySkills: profile?.keySkills ?? [...new Set([onTeam.role, person.role].filter(Boolean))],
    profile,
    onProject: kind === "owner"
      ? `${first} started ${project.title} and is looking for ${looking}.`
      : `${first} is on the ${project.title} team as the ${onTeam.role.toLowerCase()}. The project is looking for ${looking}.`,
    seeing: profile
      ? `${first}’s public profile and the details ${pro} shared on this project. Private information stays private.`
      : `${first} chose to share fewer details. Private information stays private.`,
  };
}
