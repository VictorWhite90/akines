import { PEOPLE, type Person, type PersonId } from "@/lib/data/people";
import { designImg } from "./discover";

/**
 * Connect people: what a member's public profile shows beyond their name, role and city (product design 11.73).
 * Shaped like the REST resource the backend will serve (GET /connect/people/:slug). Seeded word for word with the design's
 * nine profiles; a real member without these fields still gets a page (intro falls back to their about line, empty lists
 * are left out). `connections` ("126 Kin connections") is the design's sample count: Akines shows it in preview only.
 */
export type ProfileExtras = {
  /** The line under the role, in the primary colour. */
  intro: string;
  /** The three pills under the intro. */
  tags: string[];
  about: string;
  interests: string[];
  /** The portrait the profile shows, where it differs from the member's face. */
  portrait?: string;
  connections?: string;
};

/** The design's profile addresses ("anaya-smith"), by member id. Other members are addressed by their id. */
const SLUGS: Partial<Record<PersonId, string>> = {
  anaya: "anaya-smith",
  "tunde-bakare": "tunde-bakare",
  ngozi: "ngozi-eze",
  "amara-okafor": "amara-okafor",
  folake: "folake-adeniran",
  chuka: "chuka-nwosu",
  "ayo-balogun": "ayo-balogun",
  "yusuf-umar": "yusuf-umar",
  thandi: "thandi-dlamini",
};
const BY_SLUG = new Map(Object.entries(SLUGS).map(([id, slug]) => [slug as string, id as PersonId]));

const EXTRAS: Partial<Record<PersonId, ProfileExtras>> = {
  anaya: {
    portrait: designImg("discover/person-anaya"), connections: "126 Kin connections",
    intro: "Exploring memory, fabric and the everyday. I work with worn cloth and the stories people keep in it.", tags: ["Textiles", "Memory", "Everyday"],
    about: "Anaya is a textile artist in Ibadan. She makes hanging pieces from worn garments and hosts the artist talk Memory and Cloth. She likes meeting people who keep objects for the stories they hold.",
    interests: ["Textiles", "Memory", "Adire", "Natural dyes", "Slow making"],
  },
  "tunde-bakare": {
    portrait: designImg("community/av-tunde"), connections: "84 Kin connections",
    intro: "Designing care that begins with listening. I work with small teams on health services that fit how people live.", tags: ["Health", "Listening", "Design"],
    about: "Tunde designs community health services in Abuja. He begins with long conversations and small trials, and he prefers practical work in small groups.",
    interests: ["Community health", "Listening", "Service design", "Small groups"],
  },
  ngozi: {
    portrait: designImg("community/av-ngozi"), connections: "212 Kin connections",
    intro: "Writing small books about the places we pass through. I make zines about neighbourhoods and the people in them.", tags: ["Zines", "Memory", "Cities"],
    about: "Ngozi writes and prints zines in Lagos. Her recent issues follow bus routes and market streets. She writes to remember the people in her life.",
    interests: ["Zines", "Memory", "Cities", "Print", "Short writing"],
  },
  "amara-okafor": {
    portrait: designImg("community/amara"), connections: "97 Kin connections",
    intro: "Painting rooms where conversations happen. I am interested in how a place changes what people say.", tags: ["Painting", "Conversation", "Place"],
    about: "Amara is a visual artist in Abuja. She paints interiors and the talk that fills them. She believes a poem can host a whole evening.",
    interests: ["Painting", "Conversation", "Place", "Poetry"],
  },
  folake: {
    portrait: designImg("community/folake"), connections: "109 Kin connections",
    intro: "I tell stories out loud and on paper, usually after a slow walk.", tags: ["Stories", "Walking", "Lagos"],
    about: "Folake is a storyteller in Lagos. She collects stories on long walks and shares them at small gatherings. Sunday is for slow walks and long talks.",
    interests: ["Storytelling", "Walking", "Oral history", "Lagos"],
  },
  chuka: {
    portrait: designImg("community/chuka"), connections: "64 Kin connections",
    intro: "Starting something of my own, one conversation at a time.", tags: ["Making", "Founders", "Ideas"],
    about: "Chuka is a founder and maker in Port Harcourt. He is building a small studio and likes to think an idea through with one person at a time.",
    interests: ["Making", "Founders", "Ideas", "Craft"],
  },
  "ayo-balogun": {
    portrait: designImg("workspace/ayo"), connections: "143 Kin connections",
    intro: "Textiles are living archives. I follow dye, cloth and the people who keep them.", tags: ["Textiles", "Cultural heritage", "Visual storytelling"],
    about: "Ayo is a textile artist in Ibadan. She spends time at a dye yard and records how the craft is passed from one person to the next.",
    interests: ["Textiles", "Cultural heritage", "Visual storytelling", "Natural dyes"],
  },
  "yusuf-umar": {
    portrait: designImg("workspace/yusuf"), connections: "71 Kin connections",
    intro: "I want collaboration that challenges an idea without flattening it.", tags: ["Collaboration", "Sound", "Craft"],
    about: "Yusuf is a multidisciplinary artist in Kwara. He works across sound and craft, and likes to test an idea in a day before he builds it.",
    interests: ["Collaboration", "Sound", "Craft", "Prototyping"],
  },
  thandi: {
    portrait: designImg("workspace/ayo"), connections: "88 Kin connections",
    intro: "Making vessels you can hear. I fire in small batches and share every step.", tags: ["Ceramics", "Studio visits", "Craft"],
    about: "Thandi is a ceramicist in Maboneng, Johannesburg. She fires vessels in small batches and walks visitors through her workshop. Firing day vase is one of hers.",
    interests: ["Ceramics", "Studio visits", "Craft", "Firing"],
  },
};

export type Profile = Person & ProfileExtras;

/** The member a profile address names: a design slug ("anaya-smith") or a member id. */
export const idOfProfile = (slugOrId: string): string => BY_SLUG.get(slugOrId) ?? slugOrId;

/** The profile at an address (slug or member id), or undefined when we know nothing about them. */
export function profileOf(slugOrId: string): Profile | undefined {
  const id = idOfProfile(slugOrId);
  const p = PEOPLE[id as PersonId] as Person | undefined;
  if (!p || (!p.role && !p.about && p.name === "A member")) return undefined;
  const extra = EXTRAS[id as PersonId];
  return { ...p, intro: extra?.intro ?? p.about, tags: extra?.tags ?? [], about: extra?.about ?? "", interests: extra?.interests ?? [], portrait: extra?.portrait, connections: extra?.connections };
}

export const profilePath = (id: string) => `/connect/people/${SLUGS[id as PersonId] ?? id}`;
