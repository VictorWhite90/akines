import type { FaceKey } from "./images";

/** Creative presence: what someone is doing, not whether they are "online". */
export type Presence = "studio" | "room" | "quiet" | "open";

export const PRESENCE: Record<Presence, { label: string; dot: string }> = {
  studio: { label: "In the studio", dot: "bg-ochre-400" },
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
};

export const PEOPLE = {
  amara: { id: "amara", name: "Amara Okafor", role: "Collector", city: "Lagos", face: "amaraFace", presence: "open", about: "I collect because a room with a painting in it feels less lonely." },
  ayo: { id: "ayo", name: "Ayo Balogun", role: "Textile artist", city: "Ibadan", face: "ayoFace", presence: "studio", note: "Dyeing panel 7", about: "Indigo, resist-dye and the memory a cloth keeps." },
  kwame: { id: "kwame", name: "Kwame Mensah", role: "Painter", city: "Accra", face: "kwameFace", presence: "studio", note: "Third layer, still unsure", about: "Portraits of people who raised me, painted slowly." },
  leila: { id: "leila", name: "Leila Benali", role: "Collector", city: "Casablanca", face: "leilaFace", presence: "room", about: "I buy work I can argue with at breakfast." },
  zuri: { id: "zuri", name: "Zuri Nwosu", role: "Curator", city: "London", face: "mayaFace", presence: "open", about: "Curating the conversation between diaspora and home." },
  nandi: { id: "nandi", name: "Nandi Moyo", role: "Curator", city: "Harare", face: "w5", presence: "room", note: "Hosting tonight", about: "I host small rooms where nobody performs." },
  tunde: { id: "tunde", name: "Tunde Adeyemi", role: "Sculptor", city: "Lagos", face: "m2", presence: "studio", note: "Firing at 6pm", about: "Clay, bronze and figures that look back at you." },
  wanjiru: { id: "wanjiru", name: "Wanjiru Kamau", role: "Photographer", city: "Nairobi", face: "w8", presence: "quiet", about: "Photographs of what people keep in their pockets." },
  thandi: { id: "thandi", name: "Thandi Dlamini", role: "Ceramicist", city: "Johannesburg", face: "w3", presence: "studio", note: "Throwing bowls", about: "Everyday vessels, made slowly, used daily." },
  fatou: { id: "fatou", name: "Fatou Diop", role: "Fashion designer", city: "Dakar", face: "w10", presence: "open", about: "Cut, cloth and the politics of what we wear." },
  efua: { id: "efua", name: "Efua Boateng", role: "Art historian", city: "Kumasi", face: "w6", presence: "open", about: "Following objects home, one archive at a time." },
  chidi: { id: "chidi", name: "Chidi Eze", role: "Student", city: "Enugu", presence: "open", about: "Learning to look before I learn to make." },
} satisfies Record<string, Person>;

export type PersonId = keyof typeof PEOPLE;
export const ME = PEOPLE.amara;
export const person = (id: PersonId): Person => PEOPLE[id];
export const allPeople = Object.values(PEOPLE) as Person[];
