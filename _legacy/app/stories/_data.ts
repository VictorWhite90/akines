import type { ArtworkStory } from "@/lib/types";
import { IMG, STORIES } from "@/lib/data";

/**
 * Two more stories, local to the stories route, so the index has enough range
 * across media to make the filter meaningful. Same shape as `STORIES`.
 */
const EXTRA_STORIES: ArtworkStory[] = [
  {
    id: "market-at-first-light", title: "Market at First Light", artistId: "wanjiru", image: IMG.photography, year: "2025", medium: "Pigment print on kikoy cloth", dimensions: "90 × 120 cm, edition of 5", price: "US$1,350",
    meaning: "The hour before Gikomba market opens, when the traders still belong to themselves.",
    voiceNote: { duration: "2:36", transcript: "I go at 4:30, before anyone is selling. Mama Njeri lets me stand behind her stall. There's a minute when she says a prayer over her tomatoes and I never photograph that minute — the picture is the one right after." },
    studioVideo: { duration: "5:12", poster: IMG.photography, caption: "Printing on kikoy cloth in the Kariokor studio, Nairobi" },
    evolution: [
      { stage: "Contact sheets", note: "Forty mornings, eleven rolls. Only two frames had the light.", date: "Jun" },
      { stage: "Print failure", note: "First prints on paper looked like postcards. Too clean.", date: "Aug" },
      { stage: "Cloth test", note: "Printed on the same kikoy the traders wrap their goods in.", date: "Sep" },
      { stage: "Finished", note: "Edition of five, each hemmed by a market tailor.", date: "Nov" },
    ],
    materials: ["Pigment inks", "Cotton kikoy from Gikomba", "Hand-hemmed edges"],
    influences: [
      { kind: "place", text: "Gikomba market, Nairobi" },
      { kind: "artist", text: "Seydou Keïta's studio portraits" },
      { kind: "music", text: "Ayub Ogada — “Kothbiro”" },
      { kind: "memory", text: "Walking to the market with my aunt before school" },
    ],
    challenges: "Ink bleeds unevenly on cloth, and for months every print came out blurred at the edges. I stopped fighting it — the market is never sharp at that hour either.",
    legacy: [
      { date: "Nov 2025", kind: "created", text: "Edition printed in Nairobi", personId: "wanjiru", place: "Nairobi", source: "verified" },
      { date: "Feb 2026", kind: "exhibited", text: "Shown at the Nairobi Photo Week open studios", place: "Nairobi", source: "self-declared" },
      { date: "Apr 2026", kind: "acquired", text: "Print 2/5 acquired by Zuri Okello", personId: "zuri", place: "Kampala", source: "verified" },
      { date: "Jun 2026", kind: "reflection", text: "Collector's journal entry added", personId: "zuri", source: "self-declared" },
    ],
    collectorEntries: [
      { personId: "zuri", date: "Jun 2026", livesIn: "Kitchen wall, beside the window", text: "I bought it after a year I'd rather forget. The woman in the photo is waiting for her day to start, and so was I. I have coffee in front of her every morning. My nephew asked if she's someone we know — I said, sort of." },
    ],
  },
  {
    id: "adire-armour", title: "Adire Armour", artistId: "ayo", image: IMG.womensWear, year: "2026", medium: "Cassava-paste adire on cotton, structured tailoring", dimensions: "Garment, UK size 12 on form", price: "US$2,100",
    meaning: "A jacket that holds you upright — made by eleven women who were told adire was for their grandmothers.",
    voiceNote: { duration: "3:05", transcript: "Adire was the cloth our mothers wore to market. I wanted to cut it like a suit — sharp shoulders, straight back. Each panel was resisted by a different woman in the studio, so the pattern changes as it goes round your body. You're wearing eleven hands." },
    studioVideo: { duration: "4:48", poster: IMG.fashion, caption: "Cutting day at the studio in Yaba, Lagos" },
    evolution: [
      { stage: "First sketch", note: "Shoulder line borrowed from a 1970s agbada.", date: "Jan" },
      { stage: "Collapsed toile", note: "The cotton was too soft to hold the shoulder. Two weeks of interlining tests.", date: "Feb" },
      { stage: "Dye day", note: "Cassava-paste patterns drawn freehand by each maker.", date: "Mar" },
      { stage: "Finished", note: "Worn once, at the studio's own fitting party.", date: "May" },
    ],
    materials: ["Hand-drawn adire (cassava-paste resist)", "Abeokuta indigo", "Horsehair interlining", "Brass buttons cast in Ikorodu"],
    influences: [
      { kind: "memory", text: "My mother's market wrapper" },
      { kind: "place", text: "Itoku market, Abeokuta" },
      { kind: "artist", text: "Nike Davies-Okundaye" },
      { kind: "poem", text: "Niyi Osundare — “I Sing of Change”" },
    ],
    challenges: "The first toile collapsed on the form in front of the whole studio. I nearly went back to plain cotton. One of the makers said, ‘Then it's just a jacket’ — so we kept going.",
    legacy: [
      { date: "May 2026", kind: "created", text: "Completed in Lagos by Ayo Adeyemi and the studio", personId: "ayo", place: "Lagos", source: "verified" },
      { date: "Jul 2026", kind: "award", text: "Selected for Lagos Fashion Week craft showcase", place: "Lagos", source: "verified" },
    ],
    collectorEntries: [],
  },
];

export const ALL_STORIES: ArtworkStory[] = [...STORIES, ...EXTRA_STORIES];

export function getAnyStory(id: string) {
  return ALL_STORIES.find((story) => story.id === id);
}

export type StoryMedium = "Textiles" | "Ceramics" | "Painting" | "Photography" | "Fashion";

/** Medium used by the index filter. */
export const STORY_MEDIUM: Record<string, StoryMedium> = {
  "indigo-crossing": "Textiles",
  "vessel-for-rain": "Ceramics",
  "street-saints": "Painting",
  "market-at-first-light": "Photography",
  "adire-armour": "Fashion",
};

export function mediumOf(story: ArtworkStory): StoryMedium {
  return STORY_MEDIUM[story.id] ?? "Textiles";
}

/** "3:42" → 222 seconds. */
export function toSeconds(duration: string) {
  const [m, s] = duration.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
