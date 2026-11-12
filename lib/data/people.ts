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

/**
 * The designer's members, word for word from their prototype (Community Home, Messages, Connect Discover, Collaborate, Create AI).
 * Ids are the lower-case first name, or first-last when two members share a first name. Roles and cities are the ones their
 * screens show; a member some screens describe differently (Ngozi Eze) carries the Connect/Community line here.
 */
const SAMPLE = {
  // The signed-in member (their DUMMY in src/lib/auth.ts)
  kemi: { id: "kemi", name: "Kemi Adeyemi", role: "Product Designer", city: "Lagos", face: "p_kemi", presence: "open", about: "Leads the project and shapes the product direction." },

  // Community Home, Messages, Settings and Connect Discover
  "amara-okafor": { id: "amara-okafor", name: "Amara Okafor", role: "Visual artist", city: "Abuja", face: "p_amaraOkafor", presence: "open", about: "Amara is a visual artist in Abuja. She paints interiors and the talk that fills them. She believes a poem can host a whole evening." },
  folake: { id: "folake", name: "Folake Adeniran", role: "Storyteller", city: "Lagos", face: "p_folake", presence: "open", about: "Folake is a storyteller in Lagos. She collects stories on long walks and shares them at small gatherings. Sunday is for slow walks and long talks." },
  "tunde-bakare": { id: "tunde-bakare", name: "Tunde Bakare", role: "Community health designer", city: "Abuja", face: "p_tundeBakare", presence: "studio", about: "Tunde designs community health services in Abuja. He begins with long conversations and small trials, and he prefers practical work in small groups." },
  ngozi: { id: "ngozi", name: "Ngozi Eze", role: "Writer and zine maker", city: "Lagos", face: "p_ngozi", presence: "open", about: "Ngozi writes and prints zines in Lagos. Her recent issues follow bus routes and market streets. She writes to remember the people in her life." },
  chuka: { id: "chuka", name: "Chuka Nwosu", role: "Founder and maker", city: "Port Harcourt", face: "p_chuka", presence: "studio", about: "Chuka is a founder and maker in Port Harcourt. He is building a small studio and likes to think an idea through with one person at a time." },
  "ayo-balogun": { id: "ayo-balogun", name: "Ayo Balogun", role: "Textile artist", city: "Ibadan", face: "p_ayoBalogun", presence: "open", about: "Ayo is a textile artist in Ibadan. She spends time at a dye yard and records how the craft is passed from one person to the next." },
  "yusuf-umar": { id: "yusuf-umar", name: "Yusuf Umar", role: "Multidisciplinary artist", city: "Kwara", face: "p_yusufUmar", presence: "studio", about: "Yusuf is a multidisciplinary artist in Kwara. He works across sound and craft, and likes to test an idea in a day before he builds it." },
  anaya: { id: "anaya", name: "Anaya Smith", role: "Textile artist", city: "Ibadan", face: "p_anaya", presence: "open", note: "Hosting Memory and Cloth", about: "Anaya is a textile artist in Ibadan. She makes hanging pieces from worn garments and hosts the artist talk Memory and Cloth. She likes meeting people who keep objects for the stories they hold." },
  thandi: { id: "thandi", name: "Thandi Dlamini", role: "Ceramicist", city: "Johannesburg", face: "p_thandi", presence: "studio", about: "Thandi is a ceramicist in Maboneng, Johannesburg. She fires vessels in small batches and walks visitors through her workshop. Firing day vase is one of hers." },
  "tunde-adeyemi": { id: "tunde-adeyemi", name: "Tunde Adeyemi", role: "Sculptor", city: "Lagos", face: "p_tundeBakare", presence: "studio", about: "Watch a firing day. Ask anything. Buy from the shelf if something follows you home." },
  kwame: { id: "kwame", name: "Kwame Mensah", role: "Painter", city: "Accra", face: "p_chuka", presence: "studio", about: "A guided hour among works in progress, six visitors at a time." },

  // Collaborate: people to meet (Career Guidance for Everyone)
  amina: { id: "amina", name: "Amina Yusuf", role: "Career Researcher", city: "", face: "p_amina", presence: "open", note: "Available for new projects", about: "I study how students choose their paths and turn the findings into guidance they can use." },
  kunle: { id: "kunle", name: "Kunle Afolabi", role: "Software Engineer", city: "", face: "p_kunle", presence: "open", note: "Open to new collaborations", about: "I build learning and community tools that work on the phones and connections students actually have." },
  funmi: { id: "funmi", name: "Funmi Okoro", role: "Learning Experience Designer", city: "", face: "p_funmi", presence: "quiet", note: "Available from next month", about: "I design learning journeys that help young people reflect on who they are and what they want to do." },
  chidi: { id: "chidi", name: "Chidi Nwosu", role: "Community Partnerships Lead", city: "", face: "p_chidi", presence: "open", note: "Available for new projects", about: "I connect schools, community groups and young people so good ideas reach the students who need them." },

  // Collaborate: Career Guidance for Everyone team
  adaeze: { id: "adaeze", name: "Adaeze Okoye", role: "Product Designer", city: "", face: "p_adaeze", presence: "open", note: "Available for review", about: "Designs the student-facing screens and helps the team review work." },
  tobi: { id: "tobi", name: "Tobi Adeyemi", role: "Software Engineer", city: "", face: "p_tobi", presence: "studio", about: "Builds the student onboarding screens in code." },

  // Collaborate: Adire Stories team
  "amara-obi": { id: "amara-obi", name: "Amara Obi", role: "Illustrator", city: "", face: "p_amaraObi", presence: "open", about: "Draws the line work for each headwrap illustration." },
  "ayo-bello": { id: "ayo-bello", name: "Ayo Bello", role: "Colour Artist", city: "", face: "p_ayoBello", presence: "studio", about: "Chooses the colours and prepares the print proofs." },
  "yusuf-danjuma": { id: "yusuf-danjuma", name: "Yusuf Danjuma", role: "Textile Historian", city: "", face: "p_yusufDanjuma", presence: "quiet", about: "Researches the history behind each resist pattern." },
  "bisi-adeoye": { id: "bisi-adeoye", name: "Bisi Adeoye", role: "Adire Dyer, Abeokuta", city: "Abeokuta", face: "p_amina", presence: "open", about: "Wants to help draw the resist patterns for the next plates." },

  // Collaborate: Community Learning Initiative and Mentorship Circle (workspace overviews)
  tolu: { id: "tolu", name: "Tolu Okafor", role: "Volunteer Coordinator", city: "", face: "p_tolu", presence: "studio", about: "" },
  funke: { id: "funke", name: "Funke Adebayo", role: "Education Researcher", city: "", face: "p_funke", presence: "quiet", about: "" },
  "bisi-fashola": { id: "bisi-fashola", name: "Bisi Fashola", role: "Mentor Coordinator", city: "", face: "p_bisiFashola", presence: "open", about: "" },
  "emeka-nwosu": { id: "emeka-nwosu", name: "Emeka Nwosu", role: "Programme Support", city: "", face: "p_emekaNwosu", presence: "quiet", about: "" },
  daniel: { id: "daniel", name: "Daniel Okafor", role: "Project owner", city: "", presence: "open", about: "" },

  // Collaborate: Discover projects, open calls and invitations
  obinna: { id: "obinna", name: "Obinna Adeyemi", role: "Learning Designer", city: "Abuja", face: "p_obinna", presence: "open", about: "Obinna has spent years writing lessons and training teachers in Abuja and Kaduna. He joined A Better Way to Learn to make sure every lesson is clear for students who learn at different speeds." },
  "tunde-bello": { id: "tunde-bello", name: "Tunde Bello", role: "Photographer", city: "Ibadan", face: "p_tundeBello", presence: "quiet", note: "Available from next month", about: "I photograph working streets and the people on them. I know the Ibadan end of the road well." },
  kehinde: { id: "kehinde", name: "Kehinde Olawale", role: "Producer", city: "", presence: "open", about: "" },
  efe: { id: "efe", name: "Efe Okoro", role: "Researcher", city: "", presence: "open", about: "" },
  "halima-yusuf": { id: "halima-yusuf", name: "Halima Yusuf", role: "Project owner", city: "", presence: "open", about: "" },
  amaka: { id: "amaka", name: "Amaka Okafor", role: "Project owner", city: "Enugu", presence: "open", about: "" },
  bukola: { id: "bukola", name: "Bukola Ndukwe", role: "Business analyst", city: "", presence: "open", about: "" },
  ifeoma: { id: "ifeoma", name: "Ifeoma Obi", role: "Project owner", city: "Kano", presence: "open", about: "" },
  musa: { id: "musa", name: "Musa Aliyu", role: "Storyteller", city: "", presence: "open", about: "" },
  dayo: { id: "dayo", name: "Dayo Adebayo", role: "Project owner", city: "Ibadan", presence: "open", about: "" },
  esther: { id: "esther", name: "Esther Eze", role: "Clinic operations lead", city: "", presence: "open", about: "" },
  femi: { id: "femi", name: "Femi Alabi", role: "Backend engineer", city: "", presence: "open", about: "" },
  chioma: { id: "chioma", name: "Chioma Obi", role: "Project owner", city: "", presence: "open", about: "" },
  "emeka-anozie": { id: "emeka-anozie", name: "Emeka Anozie", role: "Project owner", city: "", presence: "open", about: "" },
  "halima-sani": { id: "halima-sani", name: "Halima Sani", role: "Project owner", city: "", presence: "open", about: "" },
  adaora: { id: "adaora", name: "Adaora Duru", role: "Project owner", city: "", presence: "open", about: "" },

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
export const ME = PEOPLE.kemi;
export const person = (id: PersonId): Person => PEOPLE[id];
export const allPeople = Object.values(SAMPLE) as Person[];
