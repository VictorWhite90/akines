import type { PhotoKey } from "@/lib/data/images";
import type { PersonId } from "@/lib/data/people";

/**
 * Connect interests: Explore by interest, All interests and one page per interest (product design 11.68 and 11.69).
 * Shaped like the REST resource the backend will serve (GET /connect/interests, GET /connect/interests/:id with the
 * ids of the people, circles, projects and events filed under it). Seeded with the design's twelve interests and the
 * people, circles, projects (lib/connect/discover) and events (lib/connect/events) of its Discover.
 */
export type Interest = {
  id: string;
  title: string;
  text: string;
  photo: PhotoKey | string;
  people: PersonId[];
  circles: string[];
  projects: string[];
  events: string[];
};

const img = (ref: string) => `/kin/design/connect/${ref}.jpg`;

/** The design's twelve interests, with its words and photos. Visual Arts holds what the design's interest page draws; the others file the same people, circles, projects and events by subject. */
export const INTERESTS: Interest[] = [
  { id: "visual-arts", title: "Visual Arts", text: "Painters, illustrators, photographers and other visual creatives.", photo: img("discover/interest-visual-arts"), people: ["amara-okafor", "anaya", "yusuf-umar"], circles: ["textiles", "makers"], projects: [], events: ["memory-and-cloth", "indigo-dye-day", "open-studio-afternoon"] },
  { id: "music", title: "Music", text: "Musicians, producers, sound artists and music enthusiasts.", photo: img("discover/interest-music"), people: ["yusuf-umar"], circles: ["poetry"], projects: [], events: ["poetry-and-wine-evening"] },
  { id: "film-media", title: "Film & Media", text: "Filmmakers, editors, storytellers and media creatives.", photo: img("discover/interest-film"), people: ["folake", "ngozi"], circles: ["university"], projects: ["zine"], events: ["writing-the-everyday"] },
  { id: "design", title: "Design", text: "Designers, product thinkers and UX creatives.", photo: img("discover/interest-design"), people: ["tunde-bakare", "chuka"], circles: ["makers"], projects: ["better-way", "health"], events: [] },
  { id: "writing", title: "Writing", text: "Writers, essayists, editors and zine makers.", photo: img("feed/hero-card-6"), people: ["ngozi", "folake"], circles: ["poetry"], projects: ["zine"], events: ["writing-the-everyday", "zine-making-for-beginners"] },
  { id: "textiles", title: "Textiles", text: "Weavers, dyers, adire makers and textile artists.", photo: img("feed/hero-card-4"), people: ["anaya"], circles: ["textiles"], projects: [], events: ["memory-and-cloth", "indigo-dye-day"] },
  { id: "craft", title: "Craft", text: "Potters, leatherworkers, woodworkers and makers by hand.", photo: img("feed/studio-1"), people: ["chuka", "yusuf-umar"], circles: ["makers"], projects: [], events: ["open-studio-afternoon", "indigo-dye-day"] },
  { id: "food", title: "Food", text: "Cooks, growers and people who turn meals into stories.", photo: img("discover/interest-food"), people: ["folake"], circles: ["food"], projects: [], events: [] },
  { id: "photography", title: "Photography", text: "Photographers, image makers and visual documentarians.", photo: img("feed/story-2"), people: ["amara-okafor"], circles: ["makers"], projects: ["zine"], events: ["zine-making-for-beginners"] },
  { id: "architecture", title: "Architecture", text: "Architects, builders and people who shape spaces.", photo: img("discover/interest-architecture"), people: ["amara-okafor"], circles: ["university"], projects: [], events: ["open-studio-afternoon"] },
  { id: "dance", title: "Dance", text: "Dancers, choreographers and movement artists.", photo: img("feed/journal-2"), people: ["folake"], circles: ["poetry"], projects: [], events: ["poetry-and-wine-evening"] },
  { id: "poetry", title: "Poetry", text: "Poets, spoken word artists and lovers of verse.", photo: img("feed/circle-poetry"), people: ["amara-okafor", "ngozi"], circles: ["poetry"], projects: [], events: ["poetry-and-wine-evening", "writing-the-everyday"] },
];

export const interestById = (id: string) => INTERESTS.find((i) => i.id === id);
