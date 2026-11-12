import type { PersonId } from "./people";

/* ---------- Banter: an open conversation, as the product design's Banter page shows it (/community/banter) ---------- */

export type BanterNow = {
  id: string;
  topic: string;
  host: PersonId;
  /** Host first, then the people the page names. */
  people: PersonId[];
  minutes: number;
  context: string;
  live: boolean;
  startsIn?: string;
  /** The line under the title, as written (e.g. "Today · 6:00 PM · 45 minutes"). */
  when?: string;
  /** People taking part beyond those named ("and 10 others"). */
  more?: number;
  /** What joining says (e.g. "You are in. We will remind you at 5:45 PM."). */
  joined?: string;
  /** The page's photo. */
  photo?: string;
};

/** The design's one Banter (its hero cards and Banter section open it). */
export const BANTER_NOW: BanterNow[] = [
  {
    id: "rest",
    topic: "Can ambition and rest coexist?",
    host: "folake",
    people: ["folake", "amara-okafor", "chuka"],
    minutes: 45,
    context: "Open conversation",
    live: false,
    when: "Today · 6:00 PM · 45 minutes",
    more: 10,
    joined: "You are in. We will remind you at 5:45 PM.",
    photo: "/kin/design/home/community/friends.jpg",
  },
];
