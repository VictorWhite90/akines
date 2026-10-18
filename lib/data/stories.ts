import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

export type StoryKind = "Work story" | "Life story" | "Community note" | "How I did it";

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
  { id: "indigo-room", kind: "Life story", title: "The kitchen I almost sold", excerpt: "My grandmother's twelve-seat kitchen, three generations, and the year I nearly let it go.", by: "fatou", photo: "talkCafe", voice: "1:42", reflections: 24, read: "6 min" },
  { id: "breakfast-question", kind: "Life story", title: "The question my daughter asked at breakfast", excerpt: "Why I left a safe job, explained to a nine-year-old over cold toast.", by: "leila", photo: "journalCoffee", reflections: 18, read: "4 min" },
  { id: "five-voices", kind: "Community note", title: "Five people who made London feel like home", excerpt: "A thank-you to the strangers who turned a new city into a neighbourhood.", by: "zuri", photo: "talkGroup", reflections: 37, read: "9 min" },
  { id: "clay-remembers", kind: "Work story", title: "Twelve years in the same classroom", excerpt: "What teaching the same lesson every September taught me about patience.", by: "thandi", photo: "talkYoung", voice: "2:08", reflections: 12, read: "5 min" },
  { id: "mask-photograph", kind: "Work story", title: "The photo I didn't take", excerpt: "Three visits, one conversation with a family, and the picture I left alone.", by: "wanjiru", photo: "journalWindow", reflections: 15, read: "7 min" },
  { id: "mothers-cloth", kind: "How I did it", title: "Surviving my first year of night shifts", excerpt: "Sleep, food, friends and the small rules that kept me well on the ward.", by: "ayo", photo: "calmBench", voice: "2:31", reflections: 21, read: "5 min" },
  { id: "first-purchase", kind: "How I did it", title: "Saving for my first laptop, slowly", excerpt: "Eleven months of small savings, and the morning I finally wrote my first line of code on it.", by: "chidi", photo: "notebookWhite", reflections: 9, read: "4 min" },
];

/* ---------- One story, told in full, with every chapter of its history ---------- */
export const ARTWORK = {
  id: "indigo-room",
  title: "The Blue Door",
  artist: "fatou" as PersonId,
  medium: "A twelve-seat family kitchen",
  size: "Médina, Dakar",
  year: 1987,
  price: "$30",
  photo: "talkCafe" as PhotoKey,
  voice: { length: "1:42", caption: "Fatou on the year she almost sold it" },
  inspiration: "My grandmother opened a kitchen behind a blue door so the women on our street had somewhere to eat and talk after the market. I remember the smell of the thieboudienne before I remember her face. I cook there now.",
  challenges: "In 2022 the rent doubled and I nearly sold it. For two months I stopped answering the door. I told myself a small kitchen couldn't survive in a city that was changing so fast.",
  meaning: "It taught me that keeping something going isn't the same as keeping it the same. I cut the menu to three dishes, opened a Sunday supper club and started teaching. The kitchen is busier now than it has ever been.",
  music: { title: "Youssou N'Dour on my grandmother's radio", note: "It still plays every morning while the rice is washed." },
  poem: ["The pot keeps the hand", "that stirred it every morning,", "the way a street keeps a name", "long after the sign is gone."],
  sketches: ["journalCoffee", "talkMugs", "talkLaugh", "kincircleHero"] as PhotoKey[],
  evolution: [
    { step: "The start", note: "My grandmother's six stools and one pot, for the market women." },
    { step: "Growing", note: "My mother added a second room and a lunch menu." },
    { step: "The hard year", note: "The rent doubled. I nearly closed the door." },
    { step: "Starting again", note: "Three dishes, a supper club and cooking classes." },
  ],
  legacy: [
    { year: "1987", title: "Opened", place: "Médina, Dakar", note: "Six stools behind a blue door.", who: "Awa Diop, grandmother" },
    { year: "2004", title: "Grew", place: "The room next door", note: "A second room and a proper lunch menu.", who: "Mariama Diop, mother" },
    { year: "2019", title: "Handed on", place: "Dakar", note: "“Keep the door blue. Everything else is yours to change.”", who: "Fatou Diop" },
    { year: "2022", title: "Nearly sold", place: "Dakar", note: "The rent doubled. Neighbours raised a month's rent between them.", who: "The street" },
    { year: "Today", title: "Full again", place: "Suppers, classes, regulars", note: "Members from three cities have eaten there this year.", who: "Akines members" },
  ],
};

/** Short bodies for the stories that don't have a full page. */
export const STORY_BODY: Record<string, string[]> = {
  "mask-photograph": [
    "I asked three times before the family said yes. The first visit was only to be seen; I left my camera in the car.",
    "They said I could photograph the house, the kitchen and the children playing, but not their grandfather's last week. I could photograph the people who looked after him.",
    "The picture I didn't take is the one I think about most. Some moments are better kept as a promise.",
  ],
  "mothers-cloth": [
    "My first month of night shifts, I lived on biscuits and coffee and slept through every phone call from my mother.",
    "By the third month I had rules: one proper meal before the shift, curtains that block the sun, and one friend I called every Sunday no matter how tired I was.",
    "The job didn't get easier. I got better at looking after the person doing it.",
  ],
  "first-purchase": [
    "I couldn't afford a laptop, so I put a little aside every week for eleven months. Some weeks it was the price of a bus fare.",
    "Every saving felt like a small promise to myself. By the end I'd planned every project I wanted to build.",
    "It arrived on a Thursday. I opened it, wrote my first line of code, and then sat on the floor for a long time.",
  ],
  "breakfast-question": [
    "I left a safe job to start a company. That was the honest reason I was tired all the time. One morning my daughter looked up from her toast and asked, “Are we poor now?”",
    "I had no quick answer. We sat there until she was late for school, and it turned into the longest conversation we'd had about money, work and why I wanted to build something of my own.",
    "She now asks how the company is doing every Friday. Some weeks her question is the hardest board meeting I have.",
  ],
  "five-voices": [
    "Moving to London, I knew one person and the way to the station. Home felt very far away.",
    "These five people changed that: a neighbour who left soup on my step, a barber who remembered my name, a pastor, a bus driver and a woman from my mother's town.",
    "None of them did anything big. Each of them made a little room for me, and together that became a home.",
  ],
  "clay-remembers": [
    "I've taught the same lesson on fractions every September for twelve years. People say that must be boring, and some years it was.",
    "Children remember everything you bring into the room. Every hurried explanation, every bad mood. You can see a bad week in a class.",
    "This year a girl who'd said she hated maths stayed behind to ask for harder questions. That took twelve years to earn, and it's the thing I'm proudest of.",
  ],
};
