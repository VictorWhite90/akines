import type { PersonId } from "@/lib/data/people";
import { SOON, soon } from "@/lib/soon";

/**
 * Connect Discover's sample content, word for word from the product design (connect/discover/data.ts): the people, circles,
 * artwork, projects, studio visits and stories of For you, and the people of "People whose journeys complement yours".
 * Shaped like what the backend will serve (GET /connect/discover, GET /connect/recommendations). Photos are the design's,
 * copied under /public/kin/design/connect/<their folder>/<their file>.jpg.
 */
export const designImg = (ref: string) => `/kin/design/connect/${ref}.jpg`;

/** A person card: our member id, the design's photo, line and Kin connections count (shown in preview only). */
export type DiscoverPerson = { person: PersonId; image: string; text: string; connections: string };
/** The six people of For you, then Yusuf Umar (the Visual Arts interest page only). */
export const DISCOVER_PEOPLE: DiscoverPerson[] = [
  { person: "anaya", image: designImg("discover/person-anaya"), text: "Exploring memory, fabric and the everyday.", connections: "126 Kin connections" },
  { person: "tunde-bakare", image: designImg("community/av-tunde"), text: "Designing care that begins with listening.", connections: "84 Kin connections" },
  { person: "ngozi", image: designImg("community/av-ngozi"), text: "Writing small books about the places we pass through.", connections: "212 Kin connections" },
  { person: "amara-okafor", image: designImg("community/av-amara"), text: "Painting rooms where conversations happen.", connections: "97 Kin connections" },
  { person: "folake", image: designImg("community/av-folake"), text: "Collecting the stories families tell at the table.", connections: "143 Kin connections" },
  { person: "chuka", image: designImg("community/av-chuka"), text: "Building tools for small workshops.", connections: "61 Kin connections" },
  { person: "yusuf-umar", image: designImg("workspace/yusuf"), text: "Making work across sound, craft and collaboration.", connections: "73 Kin connections" },
];
/** How many of DISCOVER_PEOPLE For you shows (Yusuf is the interest page's). */
export const FOR_YOU_PEOPLE = 6;

export type DiscoverCircle = { id: string; name: string; image: string; members: number; active: number; text: string; access: "open" | "approval" };
export const DISCOVER_CIRCLES: DiscoverCircle[] = [
  { id: "textiles", name: "Textiles & Adire", image: designImg("feed/circle-textiles"), members: 416, active: 6, text: "A community for lovers of indigo, dyeing and fabric culture.", access: "open" },
  { id: "poetry", name: "Poetry and Wine talk", image: designImg("feed/circle-poetry"), members: 20, active: 4, text: "Slow evenings of verse, wine and good company.", access: "approval" },
  { id: "makers", name: "Lagos Makers", image: designImg("community/zine"), members: 310, active: 12, text: "Makers sharing process, tools and Saturday studio notes.", access: "open" },
  { id: "health", name: "Community Health Circle", image: designImg("community/health"), members: 128, active: 9, text: "Practical conversations about care in our neighbourhoods.", access: "approval" },
  { id: "university", name: "University friends", image: designImg("community/kincircle"), members: 54, active: 7, text: "A circle for staying close after graduation.", access: "open" },
  { id: "food", name: "Food Systems Cliq", image: designImg("feed/journal-2"), members: 72, active: 5, text: "Talking about food, farming and fair prices.", access: "open" },
];

export const DISCOVER_ARTWORK = {
  id: "vase", tag: "CERAMICS", title: "Firing day vase", maker: "thandi" as PersonId, price: "$10,000", edition: "1 of 1", image: designImg("feed/product-3"), href: soon(SOON.shop, "Firing day vase"),
};

/**
 * Project, studio visit and story cards. Each opens the built page that shows it (a project, a collaboration) or, where that page
 * is not built yet, its section's Coming soon page with the card's name (lib/soon).
 */
export type DiscoverItem = { id: string; title: string; text: string; meta: string; image: string; href: string };
export const DISCOVER_PROJECTS: DiscoverItem[] = [
  { id: "better-way", title: "A Better Way to Learn", text: "A digital learning initiative exploring more accessible ways for students to learn.", meta: "Ngozi Eze · 2 people", image: designImg("feed/journal-1"), href: "/collaborate/projects/a-better-way-to-learn" },
  { id: "zine", title: "Lagos Makers Zine", text: "A shared zine collecting maker stories from across the city.", meta: "Obinna Adeyemi · 3 people", image: designImg("community/zine"), href: "/community/collaborations/lagos-makers-zine" },
  { id: "health", title: "Community Health Initiative", text: "Mapping simple, trusted health information for neighbourhoods.", meta: "Amara Okafor · 4 people", image: designImg("community/health"), href: "/community/collaborations" },
];
export const DISCOVER_STUDIOS: DiscoverItem[] = [
  { id: "tunde", title: "Tunde's studio", text: "Ceramics, clay and slow making in Ibadan.", meta: "Ibadan · Saturdays", image: designImg("feed/studio-1"), href: soon(SOON.studioVisits, "Tunde's studio") },
  { id: "chidi", title: "Chidi's studio", text: "Weaving and natural dyes in Abuja.", meta: "Abuja · By appointment", image: designImg("feed/studio-2"), href: soon(SOON.studioVisits, "Chidi's studio") },
  { id: "amina", title: "Amina's studio", text: "Printmaking and paper in Lagos.", meta: "Lagos · Fridays", image: designImg("feed/studio-3"), href: soon(SOON.studioVisits, "Amina's studio") },
];
export const DISCOVER_STORIES: DiscoverItem[] = [
  { id: "dye-yard", title: "The dye yard in Ibadan", text: "Anaya Smith follows the cloth from the vat to the line.", meta: "By Anaya Smith", image: designImg("feed/story-1"), href: soon(SOON.stories, "The dye yard in Ibadan") },
  { id: "saturday", title: "A year of Saturday studios", text: "What changed when one studio opened its doors every week.", meta: "By Tunde Bakare", image: designImg("feed/story-2"), href: soon(SOON.stories, "A year of Saturday studios") },
  { id: "loom", title: "What the loom remembers", text: "A weaver on patterns passed down and patterns broken.", meta: "By Ngozi Eze", image: designImg("feed/story-3"), href: soon(SOON.stories, "What the loom remembers") },
];

/**
 * "Someone to meet": one suggested person, the design's tags and conversation prompt, and the match score (shown in preview only).
 * `image` is the photo the design puts on this card where it differs from the member's face.
 */
export type Recommendation = { id: PersonId; tags: string[]; match: number; prompt: string; image?: string };
/** The eight people of All suggestions; Discover shows the first four. */
export const RECOMMENDATIONS: Recommendation[] = [
  { id: "ayo-balogun", image: designImg("workspace/ayo"), tags: ["#Textiles", "#CulturalHeritage", "#VisualStorytelling"], match: 95, prompt: "Ask about the dye yard in Ibadan: what does it smell like, and who taught her?" },
  { id: "amara-okafor", image: designImg("workspace/amara"), tags: ["#Painting", "#Conversation", "#Place"], match: 91, prompt: "Ask how a room changes what people say to each other." },
  { id: "yusuf-umar", image: designImg("workspace/yusuf"), tags: ["#Collaboration", "#Sound", "#Craft"], match: 88, prompt: "Ask what he would build first if the idea could be tested in a day." },
  { id: "ngozi", image: designImg("community/av-ngozi"), tags: ["#Zines", "#Memory", "#Cities"], match: 86, prompt: "Ask which neighbourhood she has not written about yet, and why." },
  { id: "tunde-bakare", image: designImg("community/av-tunde"), tags: ["#Health", "#Listening", "#Design"], match: 84, prompt: "Ask how he decides which small group to start with." },
  { id: "chuka", image: designImg("community/av-chuka"), tags: ["#Making", "#Founders", "#Ideas"], match: 82, prompt: "Ask what he would make first if no one were watching." },
  { id: "folake", image: designImg("community/av-folake"), tags: ["#Stories", "#Walking", "#Lagos"], match: 80, prompt: "Ask where her slow Sunday walks usually end up." },
  { id: "anaya", image: designImg("discover/person-anaya"), tags: ["#Textiles", "#Memory", "#Everyday"], match: 78, prompt: "Ask what she has learned from keeping old cloth in use." },
];
