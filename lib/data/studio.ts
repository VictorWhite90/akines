import type { CSSProperties } from "react";
import { STUDIOS } from "./community";
import type { PhotoKey } from "./images";
import { PEOPLE, type PersonId } from "./people";

/**
 * "My studio" (My space): who you are and what you do (My space), the journey as it happens
 * (Work in public) and live sessions you host (Open doors). The member's own studio, saved in localStorage under STUDIO_KEY.
 * Everything a studio holds (works, notes, visits, visitors) lives on the one
 * object, so a later backend, or extra fields, only touch this file.
 * Follower and like counts are left out on purpose: this product hides them.
 */
export const STUDIO_KEY = "ac:studio";

export const DISCIPLINES = ["Food & cooking", "Tech & code", "Design", "Coaching & sport", "Teaching", "Health & care", "Business", "Music", "Photography", "Fashion", "Art & craft", "Writing"] as const;

/* ---------- Look & feel ---------- */
export type ThemeId = "forest" | "indigo" | "clay" | "cream" | "lime";
export type Theme = {
  id: ThemeId;
  name: string;
  wall: string; // the wall colour: hero band
  deep: string; // a darker (or lighter) shade for the action bar
  on: string; // text on the wall
  onSoft: string; // secondary text on the wall
  accent: string; // primary button on the wall
  accentOn: string;
  mark: string; // accent on light paper: tabs, eyebrows
  tint: string; // a soft wash of the theme for chips and cards
};

export const THEMES: Theme[] = [
  { id: "forest", name: "Forest", wall: "#173c32", deep: "#0f2a23", on: "#ffffff", onSoft: "#b9c8c2", accent: "#d8eb6e", accentOn: "#18231f", mark: "#173c32", tint: "#e3ede6" },
  { id: "indigo", name: "Indigo ink", wall: "#232d55", deep: "#161d3b", on: "#ffffff", onSoft: "#b8bfdc", accent: "#f3c95f", accentOn: "#18231f", mark: "#2c3a78", tint: "#e6e8f3" },
  { id: "clay", name: "Clay", wall: "#b4481c", deep: "#8f3813", on: "#ffffff", onSoft: "#f7d3c1", accent: "#d8eb6e", accentOn: "#18231f", mark: "#d0561f", tint: "#fbe3d6" },
  { id: "cream", name: "Cream", wall: "#e7e0cf", deep: "#d8cfb9", on: "#18231f", onSoft: "#5d6762", accent: "#ef743f", accentOn: "#ffffff", mark: "#a8431a", tint: "#f2ecdc" },
  { id: "lime", name: "Lime", wall: "#d8eb6e", deep: "#c4d85a", on: "#18231f", onSoft: "#4a5a1a", accent: "#173c32", accentOn: "#d8eb6e", mark: "#6f8012", tint: "#eef4c4" },
];
export const themeOf = (id: string): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0];

/** CSS custom properties that recolour a studio's hero and accents. */
export const themeVars = (id: string): CSSProperties => {
  const t = themeOf(id);
  return { "--sd-wall": t.wall, "--sd-deep": t.deep, "--sd-on": t.on, "--sd-on-soft": t.onSoft, "--sd-accent": t.accent, "--sd-accent-on": t.accentOn, "--sd-mark": t.mark, "--sd-tint": t.tint } as CSSProperties;
};

/** Catalogue photos a member may choose as a cover. */
export const COVER_CHOICES: PhotoKey[] = [ "talkCafe", "talkGroup", "talkLaugh", "studioBusy", "journalCoffee", "calmWater", "studioEasel", "studioDim", "brushes", "paintingHand", "clayWheelTop", "clayVases", "clayHands", "textileHang", "textileRolls", "kenteVest", "galleryHall", "beadsHung", "woodFigure", "carvedRelief", "collabArt" ];
/** Photos for works and notes. */
export const MAKE_CHOICES: PhotoKey[] = [ "talkCafe", "talkGroup", "talkLaugh", "talkTwo", "talkMugs", "studioBusy", "journalCoffee", "calmBench", "calmWater", "paintingWoman", "paintingDancers", "collabArt", "circleInner", "circleIndigo", "studioEasel", "paintingHand", "brushes", "clayVases", "clayBrown", "clayBowl", "clayWet", "clayHands", "stoneBoy", "woodFigure", "carvedGroup", "carvedRelief", "bronzeHead", "textileHang", "textileStack", "textileRolls", "waxPrint", "kenteVest", "headwrapOrange", "beadsRed", "beadsGold", "beadsHung", "photoAlbum", "journalOpen", "notebookWhite" ];

/* ---------- The door ---------- */
export type VisitingStyle = "open" | "appointment" | "private";
export const VISITING: Record<VisitingStyle, { label: string; blurb: string }> = {
  open: { label: "Open door", blurb: "Anyone may drop in to your live sessions during posted hours." },
  appointment: { label: "By appointment", blurb: "Visitors ask first, and you choose who comes." },
  private: { label: "Private", blurb: "Invited guests only." },
};

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Hours = { days: string[]; from: string; to: string };
export const hoursText = (h: Hours) => (h.days.length ? `${[...h.days].sort((a, b) => DAYS.indexOf(a as (typeof DAYS)[number]) - DAYS.indexOf(b as (typeof DAYS)[number])).join(", ")} · ${h.from}–${h.to}` : "No fixed hours");

/* ---------- What a studio holds ---------- */
export type Work = { id: string; title: string; medium: string; size: string; year: string; photo: PhotoKey; story: string };
export type Note = { id: string; text: string; photo?: PhotoKey; date: string; kind: "note" | "sketch" };
export type VisitMode = "Live" | "Virtual" | "360°";
export const VISIT_MODES: VisitMode[] = ["Live", "Virtual", "360°"];
export const MAX_SEATS = 6;
export type Visit = { id: string; title: string; date: string; time: string; mode: VisitMode; seats: number; rsvps: PersonId[] };
export type Visitor = { who: PersonId; when: string };

export type Studio = {
  version: 1;
  owner: PersonId;
  name: string;
  tagline: string;
  city: string;
  country: string;
  disciplines: string[];
  cover: PhotoKey;
  theme: ThemeId;
  visiting: VisitingStyle;
  hours: Hours;
  about: string;
  now: string;
  doorOpen: boolean;
  works: Work[];
  notes: Note[];
  visits: Visit[];
  visitors: Visitor[];
  visitsThisMonth: number;
  createdAt: string;
};

/* ---------- Dates (deterministic, so server and browser agree) ---------- */
const at = (iso: string) => new Date(`${iso}T12:00:00Z`);
export const addDays = (iso: string, n: number) => new Date(at(iso).getTime() + n * 86400000).toISOString().slice(0, 10);
export const todayIso = () => new Date().toISOString().slice(0, 10);
export const fmtDate = (iso: string) => at(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
export const fmtShort = (iso: string) => at(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/* ---------- Starting points ---------- */
export const blankHours = (): Hours => ({ days: ["Wed", "Fri"], from: "16:00", to: "19:00" });

export const sampleWorks = (): Work[] => [
  { id: "w-indigo", title: "Health app for nurses", medium: "Product design", size: "12 screens", year: "2025", photo: "studioBusy", story: "Designed with six nurses on night shift. They wanted fewer taps, not more features." },
  { id: "w-dancers", title: "Sunday supper", medium: "Monthly gathering", size: "10 seats", year: "2025", photo: "talkCafe", story: "Started with four strangers at my table. Now there's a waiting list." },
  { id: "w-bowls", title: "Market price tracker", medium: "Side project", size: "Web app", year: "2024", photo: "journalOpen", story: "A tiny tool my mum uses to compare tomato prices across three markets." },
  { id: "w-cloth", title: "Design mentoring", medium: "Mentoring", size: "4 mentees", year: "2024", photo: "talkTwo", story: "Weekly calls with junior designers. I learn as much as they do." },
];
export const sampleNotes = (base: string): Note[] => [
  { id: "n-1", kind: "note", date: addDays(base, -1), text: "Second round of testing with the nurses. Two screens can go. Wondering if I'm brave enough to cut them." },
  { id: "n-2", kind: "sketch", date: addDays(base, -3), photo: "notebookWhite", text: "Rough sketches for the new home screen. Keeping it simple on purpose." },
  { id: "n-3", kind: "note", date: addDays(base, -6), photo: "journalCoffee", text: "Cleared my desk and my calendar. A tidy start is half the work." },
];
export const sampleVisits = (base: string): Visit[] => [
  { id: "v-1", title: "Open evening: design Q&A", date: addDays(base, 5), time: "17:00", mode: "Live", seats: 6, rsvps: ["leila", "zuri", "chidi"] },
  { id: "v-2", title: "Supper planning call", date: addDays(base, 12), time: "18:30", mode: "Virtual", seats: 6, rsvps: ["efua"] },
];
export const sampleVisitors = (): Visitor[] => [
  { who: "leila", when: "Yesterday" },
  { who: "zuri", when: "Sat" },
  { who: "kwame", when: "Fri" },
  { who: "chidi", when: "Wed" },
  { who: "nandi", when: "Last week" },
  { who: "wanjiru", when: "Last week" },
];

export function blankStudio(): Studio {
  return {
    version: 1,
    owner: "amara",
    name: "",
    tagline: "",
    city: "Lagos",
    country: "Nigeria",
    disciplines: [],
    cover: "talkCafe",
    theme: "forest",
    visiting: "open",
    hours: blankHours(),
    about: "",
    now: "",
    doorOpen: true,
    works: [],
    notes: [],
    visits: [],
    visitors: [],
    visitsThisMonth: 0,
    createdAt: todayIso(),
  };
}

/** A fully seeded studio for `?demo=1`. Fixed dates keep server and browser identical. */
export const DEMO_BASE = "2026-09-25";
export function demoStudio(): Studio {
  return {
    ...blankStudio(),
    name: "Amara's Table",
    tagline: "Product designer by day, Sunday-supper host for people new to Lagos.",
    city: "Lagos",
    country: "Nigeria",
    disciplines: ["Design", "Food & cooking"],
    cover: "talkCafe",
    theme: "forest",
    visiting: "open",
    hours: { days: ["Wed", "Fri"], from: "16:00", to: "19:00" },
    about: "I design apps for a living and host a Sunday supper for people who've just moved to the city. Come in, sit down, tell me what you're working on. I'd rather have a conversation than a compliment.",
    now: "Redesigning a health app for nurses, and planning next Sunday's supper.",
    works: sampleWorks(),
    notes: sampleNotes(DEMO_BASE),
    visits: sampleVisits(DEMO_BASE),
    visitors: sampleVisitors(),
    visitsThisMonth: 11,
    createdAt: DEMO_BASE,
  };
}

/* ---------- Public view (what a visitor sees) ---------- */
export type PublicStudio = {
  id: string;
  own?: boolean;
  /** Carries `?demo=` through the preview so the back link keeps working. */
  demo?: string;
  owner: PersonId;
  name: string;
  tagline: string;
  place: string;
  disciplines: string[];
  cover: PhotoKey;
  theme: ThemeId;
  visiting: VisitingStyle;
  hours: string;
  about: string;
  now: string;
  doorOpen: boolean;
  works: Work[];
  notes: Note[];
  visit?: { id: string; title: string; when: string; mode: string; seats: number; taken: PersonId[] };
};

export function studioToPublic(s: Studio): PublicStudio {
  const next = [...s.visits].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  return {
    id: "me",
    own: true,
    owner: s.owner,
    name: s.name || "My studio",
    tagline: s.tagline,
    place: [s.city, s.country].filter(Boolean).join(", "),
    disciplines: s.disciplines,
    cover: s.cover,
    theme: s.theme,
    visiting: s.visiting,
    hours: hoursText(s.hours),
    about: s.about,
    now: s.now,
    doorOpen: s.doorOpen,
    works: s.works,
    notes: s.notes,
    visit: next && { id: next.id, title: next.title, when: `${fmtDate(next.date)} · ${next.time}`, mode: next.mode, seats: next.seats, taken: next.rsvps },
  };
}

type Seed = {
  name: string;
  tagline: string;
  disciplines: string[];
  theme: ThemeId;
  visiting: VisitingStyle;
  hours: string;
  about: string;
  now: string;
  taken: PersonId[];
  works: [string, string, string, string, PhotoKey, string][]; // title, medium, size, year, photo, story
  notes: [string, PhotoKey | null][];
};

const SEEDS: Record<string, Seed> = {
  tunde: {
    name: "Saturday Pitch", tagline: "Coaching under-15s, one Saturday at a time.", disciplines: ["Coaching & sport"], theme: "clay", visiting: "open", hours: "Wed, Sat · 15:00–18:00",
    about: "Most days I'm on a dusty pitch in Yaba with twenty teenagers. Come and watch a session, or bring your kid to try.",
    now: "Getting the team ready for the inter-school cup.",
    taken: ["leila", "zuri", "chidi"],
    works: [
      ["The 4-3-3 that finally worked", "Training plan", "8 weeks", "2025", "talkYoung", "Took a season of losing to get here. The secret was passing, not shooting."],
      ["Exams and football", "Programme", "1 term", "2025", "journalOpen", "Homework club before training. Six of my players passed every exam."],
      ["Kit drive", "Community project", "200 kits", "2024", "talkGroup", "Collected boots and shirts from all over Lagos for kids who had none."],
    ],
    notes: [["Lost 3–1 today. Proud of how they kept their heads up.", "talkLaugh"], ["Need a volunteer goalkeeping coach on Wednesdays.", null]],
  },
  thandi: {
    name: "Room 4B", tagline: "A primary school teacher who believes every child can read.", disciplines: ["Teaching"], theme: "cream", visiting: "open", hours: "Tue, Thu · 15:00–17:00",
    about: "My classroom in Maboneng, and the reading corner I built from donated books. Parents and volunteers welcome.",
    now: "A reading challenge: 30 books in a term for my class of 28.",
    taken: ["ayo", "efua"],
    works: [
      ["The reading corner", "Classroom project", "120 books", "2025", "journalCoffee", "Every book donated by a parent or neighbour."],
      ["Pottery Fridays", "After-school club", "10 weeks", "2024", "clayHands", "My other love. The kids made bowls for their mums."],
    ],
    notes: [["Thabo read a whole chapter book today. Cried in the staffroom.", null]],
  },
  kwame: {
    name: "Ship Small", tagline: "Building payments tools in Accra, and teaching others to code.", disciplines: ["Tech & code"], theme: "indigo", visiting: "appointment", hours: "By appointment",
    about: "I build fintech for small traders and run a free evening class for new developers. Ask me anything about getting started.",
    now: "A mobile wallet for market traders.",
    taken: ["chidi", "amara"],
    works: [
      ["Market wallet", "Mobile app", "Beta", "2025", "studioBusy", "Built with twelve traders in Makola. They designed half of it."],
      ["Code club curriculum", "Course", "8 lessons", "2024", "journalOpen", "Free, in plain English, for anyone over 14."],
    ],
    notes: [["Shipped version 0.3. Two bugs, one happy trader.", "studioBusy"], ["Thinking about whether to quit my job and do this full-time.", null]],
  },
  ayo: {
    name: "Night Shift Notes", tagline: "A nurse in Ibadan, looking after people and learning to look after myself.", disciplines: ["Health & care"], theme: "indigo", visiting: "appointment", hours: "By appointment",
    about: "I run a free blood-pressure check at church on Sundays and a support group for new nurses.",
    now: "Organising a free health day for our street.",
    taken: ["thandi", "nandi"],
    works: [
      ["Sunday health checks", "Community clinic", "Weekly", "2025", "talkMugs", "Forty neighbours checked last month. Three found out they needed help."],
      ["New nurses' circle", "Support group", "Monthly", "2024", "calmBench", "For the first-year nurses who cry in the car park. I was one."],
    ],
    notes: [["Three night shifts in a row. Sleeping all of Saturday.", null]],
  },
  fatou: {
    name: "Fatou's Table", tagline: "Cooking the dishes our grandmothers made, in Dakar.", disciplines: ["Food & cooking"], theme: "lime", visiting: "open", hours: "Mon, Fri · 14:00–18:00",
    about: "My small restaurant kitchen. Come for a cooking class or just to taste what we're testing this week.",
    now: "Opening night menu for the new restaurant.",
    taken: ["leila", "zuri", "amara"],
    works: [
      ["Thieboudienne, properly", "Recipe", "Serves 6", "2025", "talkCafe", "My grandmother's version. The secret is patience with the rice."],
      ["Supper club", "Monthly event", "24 seats", "2024", "talkLaugh", "Strangers at one long table. Half of them leave as friends."],
    ],
    notes: [["Tested the new menu on my sisters. Two dishes survived.", "talkCafe"]],
  },
  efua: {
    name: "The Archive Room", tagline: "A historian following family stories home.", disciplines: ["Writing"], theme: "cream", visiting: "appointment", hours: "By appointment",
    about: "I help families record their elders' stories before they're lost. Bring your questions and old photos.",
    now: "A book of twelve family histories from Kumasi.",
    taken: ["zuri", "wanjiru"],
    works: [
      ["Twelve families", "Book in progress", "180 pages", "2025", "photoAlbum", "Interviews with grandparents about the street they grew up on."],
    ],
    notes: [["Found my own grandmother in a 1962 photograph today.", "photoAlbum"]],
  },
  nandi: {
    name: "The Quiet Room", tagline: "A therapist hosting small rooms where nobody has to perform.", disciplines: ["Health & care"], theme: "forest", visiting: "open", hours: "Tue, Thu · 16:00–19:00",
    about: "I run free listening circles on Tuesdays and talks on looking after your mind.",
    now: "A six-week course on burnout for young professionals.",
    taken: ["ayo", "amara"],
    works: [
      ["Burnout, honestly", "Course", "6 weeks", "2025", "calmBench", "For people who are always busy and never rested."],
      ["Listening circles", "Weekly sessions", "6 seats", "2024", "talkMugs", "No advice. Just being heard."],
    ],
    notes: [["Reminder to myself: rest is part of the work.", null]],
  },
  leila: {
    name: "Second Start", tagline: "A second-time founder sharing what I'd do differently.", disciplines: ["Business"], theme: "cream", visiting: "private", hours: "Invited guests",
    about: "Office hours for first-time founders. I'll read your pitch deck and be honest.",
    now: "Raising a small round for my second company.",
    taken: ["kwame", "amara"],
    works: [
      ["Founder office hours", "Mentoring", "Fridays", "2025", "talkTwo", "Thirty minutes, one honest question, no pitch required."],
    ],
    notes: [["Said no to an investor today. Felt right.", null]],
  },
  wanjiru: {
    name: "Contact Sheets", tagline: "Photographs of what people keep in their pockets.", disciplines: ["Photography"], theme: "indigo", visiting: "appointment", hours: "By appointment",
    about: "Portrait sessions and a slow photo walk most Sundays. Bring one object that matters to you.",
    now: "A series on the people who run Nairobi's markets.",
    taken: ["zuri", "efua"],
    works: [
      ["Pocket portraits", "Photo series", "24 portraits", "2025", "gallerySeated", "Strangers, and the one thing they always carry."],
      ["Market dawn", "Photo walk", "Weekly", "2024", "journalCoffee", "Gikomba at 5am, before the noise."],
    ],
    notes: [["Shot 300 frames this morning. Three are good.", "gallerySeated"]],
  },
};

const NOTE_DATES = ["2026-09-24", "2026-09-21"];

export const SEEDED_IDS = STUDIOS.map((s) => s.id);

export function seededStudio(id: string): PublicStudio | null {
  const v = STUDIOS.find((s) => s.id === id);
  const seed = SEEDS[id];
  if (!v || !seed) return null;
  const artist = PEOPLE[v.artist];
  return {
    id,
    owner: v.artist,
    name: seed.name,
    tagline: seed.tagline,
    place: v.place,
    disciplines: seed.disciplines,
    cover: v.photo,
    theme: seed.theme,
    visiting: seed.visiting,
    hours: seed.hours,
    about: `${seed.about} ${artist.about}`,
    now: seed.now,
    doorOpen: seed.visiting !== "private",
    works: seed.works.map(([title, medium, size, year, photo, story], i) => ({ id: `${id}-w${i}`, title, medium, size, year, photo, story })),
    notes: seed.notes.map(([text, photo], i) => ({ id: `${id}-n${i}`, kind: photo ? "sketch" : "note", text, photo: photo ?? undefined, date: NOTE_DATES[i] ?? NOTE_DATES[1] })),
    visit: { id: `${id}-v`, title: v.blurb.split(".")[0], when: v.when, mode: v.mode, seats: MAX_SEATS, taken: seed.taken },
  };
}
