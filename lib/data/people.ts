import type { FaceKey } from "./images";

/** Creative presence: what someone is doing, not whether they are "online". */
export type Presence = "studio" | "room" | "quiet" | "open";

export const PRESENCE: Record<Presence, { label: string; dot: string }> = {
  studio: { label: "At work", dot: "bg-ochre-400" },
  room: { label: "In a room", dot: "bg-clay-400" },
  quiet: { label: "Quiet mode", dot: "bg-ink-300" },
  open: { label: "Open to chat", dot: "bg-moss-500" },
};

export type Person = {
  id: string;
  name: string;
  role: string;
  city: string;
  face?: FaceKey;
  presence: Presence;
  note?: string;
  about: string;
  /** A real member's photo URL (members from the backend have no catalogue face). */
  photo?: string | null;
};

const SAMPLE = {
  amara: { id: "amara", name: "Amara Okafor", role: "Product designer", city: "Lagos", face: "amaraFace", presence: "open", about: "I design apps by day and host a Sunday supper for people new to the city." },
  ayo: { id: "ayo", name: "Ayo Balogun", role: "Nurse", city: "Ibadan", face: "ayoFace", presence: "studio", note: "On shift till 8", about: "Night shifts, early mornings, and a soft spot for people who need someone to talk to." },
  kwame: { id: "kwame", name: "Kwame Mensah", role: "Software engineer", city: "Accra", face: "kwameFace", presence: "studio", note: "Shipping a release", about: "Building payments tools and learning to slow down." },
  leila: { id: "leila", name: "Leila Benali", role: "Startup founder", city: "Casablanca", face: "leilaFace", presence: "room", about: "Second-time founder. I like honest feedback and strong coffee." },
  zuri: { id: "zuri", name: "Zuri Nwosu", role: "Community organiser", city: "London", face: "mayaFace", presence: "open", about: "I bring diaspora people together, online and around real tables." },
  nandi: { id: "nandi", name: "Nandi Moyo", role: "Therapist", city: "Harare", face: "w5", presence: "room", note: "Hosting tonight", about: "I host small rooms where nobody has to perform." },
  tunde: { id: "tunde", name: "Tunde Adeyemi", role: "Football coach", city: "Lagos", face: "m2", presence: "studio", note: "At training till 6", about: "Coaching under-15s on Saturdays and arguing about Arsenal the rest of the week." },
  wanjiru: { id: "wanjiru", name: "Wanjiru Kamau", role: "Photographer", city: "Nairobi", face: "w8", presence: "quiet", about: "Photographs of what people keep in their pockets." },
  thandi: { id: "thandi", name: "Thandi Dlamini", role: "Teacher", city: "Johannesburg", face: "w3", presence: "studio", note: "Marking homework", about: "Primary school teacher, part-time potter, full-time encourager." },
  fatou: { id: "fatou", name: "Fatou Diop", role: "Chef", city: "Dakar", face: "w10", presence: "open", about: "Running a small kitchen and teaching people the dishes their grandmothers made." },
  efua: { id: "efua", name: "Efua Boateng", role: "Historian", city: "Kumasi", face: "w6", presence: "open", about: "Following stories home, one archive at a time." },
  chidi: { id: "chidi", name: "Chidi Eze", role: "University student", city: "Enugu", presence: "open", about: "Final-year engineering student looking for mentors and good study groups." },
} satisfies Record<string, Person>;

/**
 * Real members from the backend, keyed by user id. Collaboration screens look people up by id, so the API layer
 * registers everyone it sees here and PEOPLE[id] then works for sample and real members alike.
 */
const REAL: Record<string, Person> = {};
export function registerPerson(p: Person) { REAL[p.id] = { ...REAL[p.id], ...p }; }
const unknown = (id: string): Person => ({ id, name: "A member", role: "", city: "", presence: "open", about: "" });

export const PEOPLE = new Proxy(SAMPLE, {
  get: (t, k) => (typeof k !== "string" || k in t ? t[k as keyof typeof t] : REAL[k] ?? unknown(k)),
}) as typeof SAMPLE;

/** Sample ids are typed; a real member's id is a string from the API, cast at that boundary. */
export type PersonId = keyof typeof SAMPLE;
export const ME = PEOPLE.amara;
export const person = (id: PersonId): Person => PEOPLE[id];
export const allPeople = Object.values(SAMPLE) as Person[];
