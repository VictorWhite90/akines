import type { PhotoKey } from "@/lib/data/images";
import type { PersonId } from "@/lib/data/people";

/**
 * Connect interests: Explore by interest, All interests and one page per interest (product design 11.68 and 11.69).
 * Shaped like the REST resource the backend will serve (GET /connect/interests, GET /connect/interests/:id with the
 * ids of the people, circles, projects and events filed under it). Seeded with the design's twelve interests and our
 * own people, circles (lib/data/community), open calls (lib/collab/seed) and events (lib/connect/events).
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

export const INTERESTS: Interest[] = [
  { id: "visual-arts", title: "Visual Arts", text: "Painters, illustrators, photographers and other visual creatives.", photo: "/kin/discover/interest-visual-arts.jpg", people: ["wanjiru", "thandi", "zuri"], circles: ["photography", "traditional-arts"], projects: ["jabi-mural"], events: ["memory-and-cloth", "open-studio-afternoon", "zine-making-for-beginners"] },
  { id: "music", title: "Music", text: "Musicians, producers, sound artists and music enthusiasts.", photo: "/kin/discover/interest-music.jpg", people: ["kwame", "nandi"], circles: ["traditional-arts"], projects: ["youth-podcast"], events: ["poetry-and-wine-evening"] },
  { id: "film-media", title: "Film & Media", text: "Filmmakers, editors, storytellers and media creatives.", photo: "/kin/discover/interest-film.jpg", people: ["wanjiru", "efua"], circles: ["photography"], projects: ["kubwa-bread", "youth-podcast"], events: ["writing-the-everyday"] },
  { id: "design", title: "Design", text: "Designers, product thinkers and UX creatives.", photo: "/kin/discover/interest-design.jpg", people: ["leila", "kwame"], circles: ["digital-art", "african-fashion"], projects: ["clinic-app"], events: [] },
  { id: "writing", title: "Writing", text: "Writers, essayists, editors and zine makers.", photo: "journalPen", people: ["efua", "zuri"], circles: ["collectors"], projects: [], events: ["writing-the-everyday", "zine-making-for-beginners"] },
  { id: "textiles", title: "Textiles", text: "Weavers, dyers, adire makers and textile artists.", photo: "textileHang", people: ["ayo", "efua"], circles: ["traditional-arts"], projects: ["indigo-futures"], events: ["memory-and-cloth", "indigo-dye-day"] },
  { id: "craft", title: "Craft", text: "Potters, leatherworkers, woodworkers and makers by hand.", photo: "clayHands", people: ["thandi", "fatou"], circles: ["traditional-arts"], projects: ["indigo-futures"], events: ["open-studio-afternoon", "indigo-dye-day"] },
  { id: "food", title: "Food", text: "Cooks, growers and people who turn meals into stories.", photo: "/kin/discover/interest-food.jpg", people: ["fatou", "tunde"], circles: ["textiles", "diaspora"], projects: ["matchday-food", "kubwa-bread"], events: [] },
  { id: "photography", title: "Photography", text: "Photographers, image makers and visual documentarians.", photo: "photoAlbum", people: ["wanjiru"], circles: ["photography"], projects: ["kubwa-bread"], events: ["zine-making-for-beginners"] },
  { id: "architecture", title: "Architecture", text: "Architects, builders and people who shape spaces.", photo: "/kin/discover/interest-architecture.jpg", people: ["zuri"], circles: ["textiles"], projects: ["jabi-mural"], events: [] },
  { id: "dance", title: "Dance", text: "Dancers, choreographers and movement artists.", photo: "paintingDancers", people: ["tunde", "nandi"], circles: ["young-artists"], projects: [], events: ["poetry-and-wine-evening"] },
  { id: "poetry", title: "Poetry", text: "Poets, spoken word artists and lovers of verse.", photo: "journalWindow", people: ["nandi", "efua"], circles: ["collectors"], projects: [], events: ["poetry-and-wine-evening", "writing-the-everyday"] },
];

export const interestById = (id: string) => INTERESTS.find((i) => i.id === id);
