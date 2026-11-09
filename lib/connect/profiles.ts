import { PEOPLE, type Person, type PersonId } from "@/lib/data/people";

/**
 * Connect people: what a member's public profile shows beyond their name, role and city (product design 11.73).
 * Shaped like the REST resource the backend will serve (GET /connect/people/:id). Seeded for our sample people;
 * a real member without these fields still gets a page (intro falls back to their about line, empty lists are left out).
 * The design's "126 Kin connections" line is left out on purpose: Akines never shows a public count of someone's kin.
 */
export type ProfileExtras = {
  /** The line under the role, in the primary colour. */
  intro: string;
  /** The three pills under the intro. */
  tags: string[];
  about: string;
  interests: string[];
};

const EXTRAS: Partial<Record<PersonId, ProfileExtras>> = {
  amara: { intro: "I design apps by day and host a Sunday supper for people new to the city.", tags: ["Design", "Hosting", "Lagos"], about: "Amara is a product designer in Lagos. She designs booking and payments screens, and on Sundays she cooks for whoever is new in town.", interests: ["Product design", "Supper clubs", "Research", "Photo books"] },
  ayo: { intro: "Night shifts, early mornings, and a soft spot for people who need someone to talk to.", tags: ["Care", "Indigo", "Rest"], about: "Ayo is a nurse in Ibadan. Between shifts she dyes cloth with natural indigo and opens her dye yard to anyone who wants to learn.", interests: ["Nursing", "Natural dyes", "Textiles", "Slow mornings"] },
  kwame: { intro: "Building payments tools and learning to slow down.", tags: ["Tech", "Mentoring", "Accra"], about: "Kwame is a software engineer in Accra. He ships payments tools and wants to mentor someone new to the work this year.", interests: ["Payments", "Mentoring", "Journaling", "Music"] },
  leila: { intro: "Second-time founder. I like honest feedback and strong coffee.", tags: ["Founders", "Candour", "Travel"], about: "Leila is a startup founder in Casablanca. She is on her second company and likes to think a plan through with someone who will be honest.", interests: ["Startups", "Design", "Feedback", "Coffee"] },
  zuri: { intro: "I bring diaspora people together, online and around real tables.", tags: ["Community", "Diaspora", "Gatherings"], about: "Zuri is a community organiser in London. She hosts readings and dinners for people who live far from home.", interests: ["Organising", "Diaspora", "Readings", "Long dinners"] },
  nandi: { intro: "I host small rooms where nobody has to perform.", tags: ["Listening", "Rooms", "Poetry"], about: "Nandi is a therapist in Harare. She hosts small evening rooms, some with poems, all with time to listen.", interests: ["Listening", "Poetry", "Small rooms", "Rest"] },
  tunde: { intro: "Coaching under-15s on Saturdays and arguing about Arsenal the rest of the week.", tags: ["Football", "Coaching", "Lagos"], about: "Tunde is a football coach in Lagos. He trains an under-15 team on Saturdays and runs the food stalls on matchday.", interests: ["Football", "Coaching", "Street food", "Youth sport"] },
  wanjiru: { intro: "Photographs of what people keep in their pockets.", tags: ["Photography", "Everyday", "Zines"], about: "Wanjiru is a photographer in Nairobi. Her series follow the small things people carry, and she prints them as zines.", interests: ["Photography", "Zines", "Markets", "Walking"] },
  thandi: { intro: "Primary school teacher, part-time potter, full-time encourager.", tags: ["Ceramics", "Teaching", "Craft"], about: "Thandi is a teacher and potter in Johannesburg. She fires vessels in small batches and walks visitors through her studio.", interests: ["Ceramics", "Teaching", "Craft", "Firing"] },
  fatou: { intro: "Running a small kitchen and teaching people the dishes their grandmothers made.", tags: ["Food", "Teaching", "Dakar"], about: "Fatou is a chef in Dakar. She runs a small kitchen and teaches weekend classes on family dishes.", interests: ["Cooking", "Family recipes", "Teaching", "Markets"] },
  efua: { intro: "Following stories home, one archive at a time.", tags: ["History", "Archives", "Cloth"], about: "Efua is a historian in Kumasi. She keeps an archive of cloth and the stories that come with it, and she hosts the talk Memory and Cloth.", interests: ["History", "Archives", "Textiles", "Storytelling"] },
  chidi: { intro: "Final-year engineering student looking for mentors and good study groups.", tags: ["Engineering", "Study", "Enugu"], about: "Chidi is an engineering student in Enugu. He runs a study group and is looking for a mentor for his first job.", interests: ["Engineering", "Study groups", "Mentors", "Building things"] },
};

export type Profile = Person & ProfileExtras;

/** The profile of a member, or undefined when we know nothing about them. */
export function profileOf(id: string): Profile | undefined {
  const p = PEOPLE[id as PersonId] as Person | undefined;
  if (!p || (!p.role && !p.about && p.name === "A member")) return undefined;
  const extra = EXTRAS[id as PersonId];
  return { ...p, intro: extra?.intro ?? p.about, tags: extra?.tags ?? [], about: extra?.about ?? "", interests: extra?.interests ?? [] };
}

export const profilePath = (id: string) => `/connect/people/${id}`;
