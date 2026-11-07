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
};

/** The profiles the sample hosts share. Everyone else shares only their role and skills. */
export const MEMBER_PROFILES: Partial<Record<PersonId, MemberProfile>> = {
  zuri: {
    pronoun: "she",
    headline: "I bring people together around real tables. I started this year's wall at Jabi Lake Arts Week so newcomers could see themselves in the city.",
    keySkills: ["Community organising", "Event production", "Public art"],
    about: "Zuri brings diaspora people together, online and in person. She runs the lakeside wall at Jabi Lake Arts Week, where every November a small team paints something new for the people who walk there.",
    experience: [{ title: "Jabi Lake Arts Week", detail: "Organiser, community festival in Abuja" }, { title: "Diaspora supper series", detail: "Host and organiser, London" }, { title: "Neighbourhood mural day", detail: "Producer" }],
    skills: ["Community organising", "Event production", "Fundraising", "Volunteer coordination"],
    interests: ["Public art", "Belonging", "Diaspora stories", "Festivals"],
    preferences: [{ label: "Communication style", value: "Voice notes and a short call when it matters" }, { label: "Preferred working rhythm", value: "Planning together first, then daily on site" }, { label: "Availability", value: "Open to new collaborators on the lakeside wall" }, { label: "Collaboration preferences", value: "Shared sketches and one review before painting" }],
    contributions: [{ title: "Lakeside wall, last year", detail: "Organiser. Shared with Zuri’s consent." }, { title: "Diaspora supper series", detail: "Host. Shared with Zuri’s consent." }],
  },
  fatou: {
    pronoun: "she",
    headline: "I run a small kitchen and teach the dishes our grandmothers made. I want people to meet the family behind Kubwa Bread Co.",
    keySkills: ["Cooking", "Small business", "Teaching"],
    about: "Fatou runs a small kitchen and teaches people to cook the food they grew up with. At Kubwa Bread Co. the family bakes from 4am, and she wants one honest minute of film to show who they are.",
    experience: [{ title: "Kubwa Bread Co.", detail: "Family bakery, Abuja" }, { title: "Grandmother’s dishes classes", detail: "Teacher and host" }, { title: "Market pop-up kitchen", detail: "Founder" }],
    skills: ["Cooking", "Running a small business", "Teaching", "Hosting"],
    interests: ["Family recipes", "Local food", "Small business", "Storytelling"],
    preferences: [{ label: "Communication style", value: "A quick chat at the bakery, then messages" }, { label: "Preferred working rhythm", value: "Early mornings, before the shop opens" }, { label: "Availability", value: "Open to a videographer and a photographer" }, { label: "Collaboration preferences", value: "Shared folders for photos and footage" }],
    contributions: [{ title: "Cooking classes for new arrivals", detail: "Teacher. Shared with Fatou’s consent." }],
  },
  ayo: {
    pronoun: "she",
    headline: "I care for patients for a living. I want the people who come to Garki Family Clinic to stop waiting outside from 6am.",
    keySkills: ["Patient care", "Clinic operations", "Health"],
    about: "Ayo is a nurse who has worked night shifts and early mornings for years. She is working with Garki Family Clinic on a simple booking app, so patients can see their place in the queue on their phones.",
    experience: [{ title: "Garki Family Clinic", detail: "Nurse and clinic lead, Abuja" }, { title: "Night shift handover notes", detail: "Wrote the ward’s handover guide" }, { title: "Patient check-in day", detail: "Organiser" }],
    skills: ["Patient care", "Clinic operations", "Training staff", "Listening"],
    interests: ["Access to health care", "Rest and wellbeing", "Simple tools", "Community health"],
    preferences: [{ label: "Communication style", value: "Short messages, and a call after shifts" }, { label: "Preferred working rhythm", value: "A weekly review with the clinic manager" }, { label: "Availability", value: "Open to a designer and a developer" }, { label: "Collaboration preferences", value: "Talk to patients first, then decide together" }],
    contributions: [{ title: "Garki Clinic booking app", detail: "Client. Shared with Ayo’s consent." }],
  },
  efua: {
    pronoun: "she",
    headline: "I follow stories home, one archive at a time. At the dye works I want young designers to learn adire from the women who know it best.",
    keySkills: ["Oral history", "Textile history", "Interviewing"],
    about: "Efua is a historian who records the stories behind everyday things. She works with Abeokuta Dye Works, where the dyers have made adire for forty years, on a residency for designers early in their careers.",
    experience: [{ title: "Indigo Futures Residency", detail: "Organiser, Abeokuta Dye Works" }, { title: "Market Light", detail: "Historian and interviewer" }, { title: "Cloth as archive", detail: "Researcher" }],
    skills: ["Oral history", "Interviewing", "Writing captions", "Archive research"],
    interests: ["Adire", "Family archives", "Craft", "Identity"],
    preferences: [{ label: "Communication style", value: "Long written notes and a monthly call" }, { label: "Preferred working rhythm", value: "Slow and steady, with time to listen" }, { label: "Availability", value: "Open to residents for January" }, { label: "Collaboration preferences", value: "Recorded interviews and shared transcripts" }],
    contributions: [{ title: "Trader interviews for Market Light", detail: "Historian. Shared with Efua’s consent." }],
  },
  thandi: {
    pronoun: "she",
    headline: "I teach primary school and encourage everyone I meet. With the parents’ forum I want 400 children in Kubwa to start term with what they need.",
    keySkills: ["Teaching", "Organising", "Volunteering"],
    about: "Thandi is a primary school teacher and part-time potter. With Kubwa Parents’ Forum she runs a back-to-school supply drive: last year 250 packs on one Saturday, this year 400.",
    experience: [{ title: "Back-to-school supply drive", detail: "Organiser, Kubwa Parents’ Forum" }, { title: "Primary school class teacher", detail: "Teacher" }, { title: "Saturday pottery for children", detail: "Volunteer" }],
    skills: ["Teaching", "Organising volunteers", "Planning", "Encouraging people"],
    interests: ["Education", "Children", "Pottery", "Community"],
    preferences: [{ label: "Communication style", value: "A phone call with everyone who offers to help" }, { label: "Preferred working rhythm", value: "A planning call, then the day itself" }, { label: "Availability", value: "Open to volunteers for two Saturdays" }, { label: "Collaboration preferences", value: "One shared checklist" }],
    contributions: [{ title: "Last year’s supply drive", detail: "Organiser. Shared with Thandi’s consent." }],
  },
  tunde: {
    pronoun: "he",
    headline: "I coach under-15s on Saturdays. For the league final I want local cooks, a photographer and good signs, so families stay all day.",
    keySkills: ["Coaching", "Event planning", "Youth sport"],
    about: "Tunde coaches young footballers and helps run the Area 1 Youth League. The final draws families from all over Garki, and this year he wants it to feel like a festival.",
    experience: [{ title: "Area 1 Youth League", detail: "Coach and organiser, Abuja" }, { title: "Under-15s team", detail: "Head coach" }, { title: "Holiday football camp", detail: "Organiser" }],
    skills: ["Coaching", "Event planning", "Working with families", "Team building"],
    interests: ["Youth sport", "Local food", "Community events", "Mentoring"],
    preferences: [{ label: "Communication style", value: "Group chat and a walk round the ground" }, { label: "Preferred working rhythm", value: "Evenings after training" }, { label: "Availability", value: "Open to cooks, a photographer and a designer" }, { label: "Collaboration preferences", value: "Everyone meets at the ground before the day" }],
    contributions: [{ title: "Last season’s final", detail: "Organiser. Shared with Tunde’s consent." }],
  },
};

export type MemberPage = {
  id: PersonId;
  name: string;
  first: string;
  initials: string;
  role: string;
  place: string;
  portraitId: PersonId;
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

/** The member as the project's page shows them; undefined if they are not on its team. */
export function memberPage(id: PersonId, project: DiscoverProject): MemberPage | undefined {
  const person = PEOPLE[id];
  const onTeam = project.team.find((t) => t.id === id);
  if (!person || !onTeam) return undefined;
  const first = person.name.split(" ")[0]!;
  const profile = MEMBER_PROFILES[id];
  const pro = profile?.pronoun ?? "they";
  const kind = id === project.ownerId ? "owner" : "team";
  const looking = listOf(project.roles.map((r) => `${/^[aeiou]/i.test(r) ? "an" : "a"} ${r.toLowerCase()}`));
  const role = kind === "owner" ? person.role || "Project owner" : onTeam.role;
  return {
    id, name: person.name, first, initials: person.name.split(" ").map((w) => w[0]).join(""),
    role: role.charAt(0).toUpperCase() + role.slice(1), place: person.city, portraitId: id, kind, limited: !profile,
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
