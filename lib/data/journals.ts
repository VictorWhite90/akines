import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

export type JournalEntry = {
  id: string;
  kind: "artist" | "collector";
  by: PersonId;
  title: string;
  text: string;
  date: string;
  mood?: string;
  photo?: PhotoKey;
};

export const JOURNAL: JournalEntry[] = [
  { id: "j1", kind: "artist", by: "kwame", title: "Failed panel #3, kept anyway", text: "Scraped it back to the second layer. It's uglier, and more true. I keep asking whether I'm allowed to show work that looks like an accident. Today I decided yes.", date: "Today", mood: "Tender", photo: "studioDim" },
  { id: "j2", kind: "artist", by: "ayo", title: "Dyeing day 7: the green surprise", text: "The third bath came out greener than any bath I've ever mixed. I'd planned to be annoyed. Instead I hung it in the yard and watched the light change it for an hour.", date: "Yesterday", mood: "Open", photo: "textileHang" },
  { id: "j3", kind: "collector", by: "leila", title: "Where the painting lives", text: "It's in the hallway now, not the living room. The living room was for guests. The hallway is where my daughter stops every morning to look. She says it looks different every day.", date: "Yesterday", mood: "Grounded", photo: "galleryTwo" },
  { id: "j4", kind: "artist", by: "thandi", title: "Twelve years, one bowl", text: "I threw the same bowl eight times today. On the eighth my hands stopped arguing with the clay. That's the whole job: keep going until they stop arguing.", date: "2 days ago", mood: "Grounded", photo: "clayBowl" },
  { id: "j5", kind: "collector", by: "amara", title: "Why I bought the indigo cloth", text: "It reminded me of my mother's wrapper. I'd hung it on the wall before I'd even paid. The seller laughed. I think that's how you know.", date: "3 days ago", mood: "Tender", photo: "journalCoffee" },
  { id: "j6", kind: "collector", by: "zuri", title: "What changed after the first purchase", text: "I stopped scrolling in the evenings. I now sit with one picture and try to describe it to myself in three sentences. It's harder than it sounds and I like it more than television.", date: "4 days ago", mood: "Open", photo: "journalWindow" },
];
