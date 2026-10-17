import type { Circle } from "./community";
import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/**
 * "People bond more effectively when they do something together" (brief §6).
 * A Circle's Activities tab: a few in-person or virtual things members are doing together,
 * with a lightweight RSVP the member's browser remembers (see components/circles/CircleSpace.tsx).
 */
export type Activity = {
  id: string;
  title: string;
  when: string;
  where: string;
  mode: "In person" | "Virtual";
  blurb: string;
  going: PersonId[];
  photo: PhotoKey;
};

export const ACTIVITIES: Record<string, Activity[]> = {
  "african-fashion": [
    { id: "fo-pitch", title: "Pitch practice night", when: "Wed · 18:30", where: "Video call", mode: "Virtual", blurb: "Five minutes each, honest notes, no investors in the room.", going: ["leila", "kwame"], photo: "talkCafe" },
    { id: "fo-cofounder", title: "Co-founder coffee", when: "Sat · 10:00", where: "Terra Café, Lagos", mode: "In person", blurb: "For anyone looking for, or tired of, a co-founder.", going: ["leila", "amara", "chidi"], photo: "talkMugs" },
  ],
  "photography": [
    { id: "ph-golden-hour", title: "Golden-hour photo walk", when: "Sun · 17:15", where: "Meet at the old railway bridge", mode: "In person", blurb: "An hour of shooting, then tea and one favourite frame each.", going: ["wanjiru", "zuri"], photo: "gallerySeated" },
    { id: "ph-contact-sheet", title: "Photo review night", when: "Thu · 19:00", where: "Video call", mode: "Virtual", blurb: "Share your unedited set, not just the best one.", going: ["wanjiru", "efua"], photo: "photoAlbum" },
  ],
  "digital-art": [
    { id: "tc-hack", title: "Saturday build session", when: "Sat · 11:00", where: "Video call", mode: "Virtual", blurb: "Bring a side project or a bug. We pair up for two hours.", going: ["kwame", "chidi"], photo: "studioBusy" },
    { id: "tc-cv", title: "CV and portfolio swap", when: "Tue · 19:00", where: "Video call", mode: "Virtual", blurb: "Ten minutes each, screen-shared, kind but direct.", going: ["kwame", "amara"], photo: "journalOpen" },
  ],
  "textiles": [
    { id: "nc-supper", title: "Newcomers' supper", when: "Sun · 18:00", where: "Amara's place, Yaba", mode: "In person", blurb: "Bring a dish from wherever you're from. Ten seats.", going: ["amara", "zuri", "fatou"], photo: "talkCafe" },
    { id: "nc-walk", title: "Saturday city walk", when: "Sat · 09:00", where: "Meet at Freedom Park", mode: "In person", blurb: "Two hours, a few favourite spots, and lunch after.", going: ["tunde", "chidi"], photo: "talkLaugh" },
    { id: "nc-games", title: "Board games and suya", when: "Fri · 19:30", where: "The Hub, Ikeja", mode: "In person", blurb: "No experience needed. We teach every game.", going: ["ayo", "kwame"], photo: "talkYoung" },
  ],
  "ceramics": [
    { id: "hc-debrief", title: "After-shift debrief", when: "Thu · 21:00", where: "Video call", mode: "Virtual", blurb: "Thirty minutes to talk about the week. Cameras optional.", going: ["ayo", "nandi"], photo: "calmBench" },
    { id: "hc-walk", title: "Early-morning walk", when: "Sun · 07:00", where: "Lekki Conservation Centre", mode: "In person", blurb: "Fresh air before the week starts again.", going: ["ayo", "thandi"], photo: "calmWater" },
  ],
  "collectors": [
    { id: "bc-meet", title: "Monthly book night", when: "Thu · 19:00", where: "Terra Café", mode: "In person", blurb: "This month: a short novel. Come even if you didn't finish.", going: ["zuri", "efua", "amara"], photo: "journalCoffee" },
    { id: "bc-swap", title: "Book swap Saturday", when: "Sat · 14:00", where: "Video call", mode: "Virtual", blurb: "Pitch one book in a minute; swap by post.", going: ["leila", "chidi"], photo: "journalOpen" },
  ],
  "curators": [
    { id: "pt-playdate", title: "Park play-date", when: "Sat · 10:00", where: "Ikoyi park", mode: "In person", blurb: "Kids play, parents finally talk.", going: ["thandi", "fatou"], photo: "talkTwo" },
    { id: "pt-sleep", title: "Sleep tips swap", when: "Wed · 21:00", where: "Video call", mode: "Virtual", blurb: "For tired parents of under-fives. Pyjamas welcome.", going: ["thandi", "nandi"], photo: "calmBench" },
  ],
  "diaspora": [
    { id: "di-dinner", title: "Home-cooked dinner & stories", when: "Sun · 18:00", where: "Nandi's place", mode: "In person", blurb: "Everyone brings a dish their family makes.", going: ["nandi", "zuri", "leila"], photo: "talkCafe" },
    { id: "di-return", title: "Return journeys: a listening circle", when: "Wed · 19:30", where: "Video call", mode: "Virtual", blurb: "For anyone who's gone back, or is thinking about it.", going: ["zuri", "efua"], photo: "talkMugs" },
  ],
  "young-artists": [
    { id: "sg-study", title: "Exam study group", when: "Mon · 18:00", where: "Video call", mode: "Virtual", blurb: "Two-hour focus sessions with breaks.", going: ["chidi", "thandi"], photo: "journalOpen" },
    { id: "sg-interview", title: "Mock interview morning", when: "Sat · 10:00", where: "Video call", mode: "Virtual", blurb: "Practise with people who've hired before.", going: ["chidi", "leila", "kwame"], photo: "talkTwo" },
  ],
  "traditional-arts": [
    { id: "cm-wip", title: "Work-in-progress night", when: "Fri · 19:00", where: "The back room, Freedom Park", mode: "In person", blurb: "Show something unfinished. Get kind, honest notes.", going: ["wanjiru", "fatou"], photo: "studioEasel" },
    { id: "cm-jam", title: "Open jam", when: "Sun · 16:00", where: "Community hall", mode: "In person", blurb: "Musicians, poets and anyone who wants to try.", going: ["tunde", "ayo"], photo: "talkLaugh" },
  ],
};

/** A circle's activities, or a small generic fallback if one hasn't been seeded yet. */
export function circleActivities(circle: Circle): Activity[] {
  return (
    ACTIVITIES[circle.id] ?? [
      { id: `${circle.id}-meetup`, title: `${circle.name} meetup`, when: "Sat · 11:00", where: "Video call", mode: "Virtual", blurb: "An informal get-together for whoever's free. Details firm up closer to the date.", going: [], photo: circle.photo },
    ]
  );
}
