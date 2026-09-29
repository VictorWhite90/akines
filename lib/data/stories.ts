import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

export type StoryKind = "Studio journal" | "Collector reflection" | "Curator's note" | "Process story";

export type Story = {
  id: string;
  kind: StoryKind;
  title: string;
  excerpt: string;
  by: PersonId;
  photo: PhotoKey;
  voice?: string;
  reflections: number;
  read: string;
};

export const STORIES: Story[] = [
  { id: "indigo-room", kind: "Studio journal", title: "I almost painted over this", excerpt: "A work about my grandmother, indigo cloth, and the things families leave unsaid.", by: "kwame", photo: "paintingHand", voice: "1:42", reflections: 24, read: "6 min" },
  { id: "breakfast-question", kind: "Collector reflection", title: "The painting that made my daughter ask", excerpt: "One question at breakfast changed how our family speaks about identity.", by: "leila", photo: "exhibitionAfrican", reflections: 18, read: "4 min" },
  { id: "five-voices", kind: "Curator's note", title: "Five voices reshaping portraiture", excerpt: "Beyond the gaze: a personal walk through the artists changing the conversation.", by: "zuri", photo: "galleryModern", reflections: 37, read: "9 min" },
  { id: "clay-remembers", kind: "Process story", title: "How clay remembers hands", excerpt: "Twelve years of throwing the same bowl, and what the last one taught me.", by: "thandi", photo: "clayWet", voice: "2:08", reflections: 12, read: "5 min" },
  { id: "mask-photograph", kind: "Process story", title: "The mask I was allowed to photograph", excerpt: "Three visits, one conversation with the custodians, and the frame I didn't take.", by: "wanjiru", photo: "tribalCarving", reflections: 15, read: "7 min" },
  { id: "mothers-cloth", kind: "Studio journal", title: "What my mother's cloth taught me about patience", excerpt: "Seven dye baths, one green surprise, and an afternoon of watching the light change it.", by: "ayo", photo: "textileHang", voice: "2:31", reflections: 21, read: "5 min" },
  { id: "first-purchase", kind: "Collector reflection", title: "Buying my first work, slowly", excerpt: "Eleven months of instalments and the morning it finally came off the wall's waiting list.", by: "chidi", photo: "gallerySeated", reflections: 9, read: "4 min" },
];

/* ---------- One artwork, told in full ("Story behind every artwork" + "Art Legacy") ---------- */
export const ARTWORK = {
  id: "indigo-room",
  title: "Indigo Room",
  artist: "kwame" as PersonId,
  medium: "Oil and indigo pigment on linen",
  size: "90 × 120 cm",
  year: 2024,
  price: "$1,900",
  photo: "paintingWoman" as PhotoKey,
  voice: { length: "1:42", caption: "Kwame on the day he almost painted over it" },
  inspiration: "My grandmother dyed cloth in a yard behind her house. I remember the smell before I remember her face. This painting is the room I keep returning to in my head, not the room as it was.",
  challenges: "The third layer killed it. Everything went flat and polite. For two weeks I wouldn't look at it. I turned it to the wall and painted something easier.",
  meaning: "It taught me that finished isn't the same as true. I scraped back to the second layer and left the ruin showing. That's the painting now.",
  music: { title: "Juju on my grandmother's old cassette", note: "Played on repeat through the whole third layer." },
  poem: ["The cloth keeps the hand", "that pressed it into the dye,", "the way a name keeps a mouth", "long after the mouth is quiet."],
  sketches: ["studioEasel", "brushes", "paintingHand", "studioDim"] as PhotoKey[],
  evolution: [
    { step: "Sketch", note: "Charcoal study from memory: the yard, the poles, the cloth." },
    { step: "First layer", note: "Warm ground and indigo washes. Confident, too confident." },
    { step: "The third layer", note: "Everything went flat. I turned it to the wall." },
    { step: "Scraped back", note: "Found the second layer underneath. Kept the damage." },
  ],
  legacy: [
    { year: "Mar 2024", title: "Made", place: "Accra, studio at Osu", note: "Begun from a charcoal sketch.", who: "Kwame Mensah" },
    { year: "Nov 2024", title: "First shown", place: "“Cloth & Memory”, Accra group show", note: "Hung between two textile works.", who: "Nandi Moyo (curator)" },
    { year: "Feb 2025", title: "Acquired", place: "Casablanca", note: "“I bought it because I couldn't stop arguing with it.”", who: "Leila Benali" },
    { year: "Sep 2025", title: "Shortlisted", place: "Emerging Voices Prize", note: "One of twelve works chosen from 480.", who: "Prize jury" },
    { year: "Today", title: "At home", place: "A hallway in Casablanca", note: "Her daughter now asks about it every morning.", who: "Leila's reflection" },
  ],
};

/** Short bodies for the stories that don't have a full artwork page. */
export const STORY_BODY: Record<string, string[]> = {
  "mask-photograph": [
    "I asked three times before anyone answered. The first visit was only to be seen; I left my camera in the car.",
    "The custodians said I could photograph the mask, but not on the day it was worn. I could photograph the room it rests in, and the hands that keep it.",
    "The frame I didn't take is the one I think about most. Some pictures are better kept as a promise.",
  ],
  "mothers-cloth": [
    "My mother dyed cloth in a yard behind our house. I remember the smell before I remember her face.",
    "Seven baths in, the green came out stronger than I'd ever mixed. I'd planned to be annoyed. Instead I hung it in the yard and watched the light change it for an hour.",
    "Patience isn't waiting. It's staying interested while the cloth decides.",
  ],
  "first-purchase": [
    "I couldn't afford it, so I asked whether I could pay over eleven months. The artist said yes before I'd finished the sentence.",
    "Every instalment felt like a small conversation with the painting. By the last one I knew it better than I know most people.",
    "It arrived on a Thursday. I hung it, stepped back, and then sat on the floor for a long time.",
  ],
  "breakfast-question": [
    "I bought the painting for its colours. That was the honest reason. It hangs in our hallway, and one morning my daughter stopped on her way to school and asked, “Who is she waiting for?”",
    "I had no answer. I'd been walking past her for months. We stood there until she was late, and it turned into the longest conversation we'd had about who we are and where the women in our family come from.",
    "The artist wrote to me afterwards, and told me the woman isn't waiting for anyone. But she let my daughter keep her version.",
  ],
  "five-voices": [
    "Portraiture in Africa has never been one thing. It's the studio photograph and the commissioned oil, the passport picture and the memorial cloth.",
    "These five artists are changing the terms: who looks, who is looked at, and who gets to say when the picture is finished.",
    "What they share isn't style. It's that each of them has made a portrait in which the sitter looks back and isn't in a hurry.",
  ],
  "clay-remembers": [
    "I've thrown the same bowl for twelve years. It's a simple shape: a wide mouth and a low foot. People say it's boring, and they're right, and that's the point.",
    "Clay remembers everything you do to it. Every hurried pull, every doubt. You can see a bad week in a bowl.",
    "The last bowl I made this month has no memory of anger in it. That took twelve years to learn, and it's the only thing I'm proud of.",
  ],
};
