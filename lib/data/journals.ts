import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

export type JournalEntry = {
  id: string;
  kind: "work" | "life";
  by: PersonId;
  title: string;
  text: string;
  date: string;
  mood?: string;
  photo?: PhotoKey;
};

export const JOURNAL: JournalEntry[] = [
  { id: "j1", kind: "work", by: "kwame", title: "Broke the release, kept going", text: "Shipped a bug to every user before lunch. Fixed it by two. I keep asking whether I'm allowed to admit mistakes out loud at work. Today I did, and nobody minded.", date: "Today", mood: "Restless", photo: "studioBusy" },
  { id: "j2", kind: "work", by: "ayo", title: "Night shift 7: the quiet patient", text: "The man in bed four didn't speak all week. Tonight he asked me my name. I'd planned to rush through the round. Instead I sat with him for ten minutes, and it was the best part of the shift.", date: "Yesterday", mood: "Tender", photo: "calmBench" },
  { id: "j3", kind: "life", by: "leila", title: "Where the family eats now", text: "We eat in the kitchen now, not the dining room. The dining room was for guests. The kitchen is where my daughter tells me about her day while I cook. I think that's where home really is.", date: "2 days ago", mood: "Open", photo: "journalCoffee" },
  { id: "j4", kind: "work", by: "thandi", title: "Twelve years, one lesson", text: "Taught fractions for the twelfth September in a row. Halfway through, the class stopped fighting it. That's the whole job: keep going until they stop being scared.", date: "3 days ago", mood: "Grounded", photo: "talkYoung" },
  { id: "j5", kind: "life", by: "amara", title: "Why I said yes to Lagos", text: "It reminded me of my mother's stories about the city. I'd found a flat before I'd even accepted the job. My friends laughed. I think that's how you know a move is right.", date: "Last week", mood: "Open", photo: "kincircleHero" },
  { id: "j6", kind: "life", by: "zuri", title: "What changed when I put the phone down", text: "I stopped scrolling in the evenings. Now I call one person a week and ask them three real questions. It's changed what I notice in people.", date: "Last week", mood: "Grounded", photo: "journalWindow" },
];
