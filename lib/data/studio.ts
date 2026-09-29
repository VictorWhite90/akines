import type { CSSProperties } from "react";
import { STUDIOS } from "./community";
import type { PhotoKey } from "./images";
import { PEOPLE, type PersonId } from "./people";

/**
 * "My studio": the member's own studio, saved in localStorage under STUDIO_KEY.
 * Everything a studio holds (works, notes, visits, visitors) lives on the one
 * object, so a later backend, or extra fields, only touch this file.
 * Follower and like counts are left out on purpose: this product hides them.
 */
export const STUDIO_KEY = "ac:studio";

export const DISCIPLINES = ["Painting", "Sculpture", "Textile", "Fashion", "Ceramics", "Photography", "Digital", "Beadwork", "Mixed media"] as const;

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
export const COVER_CHOICES: PhotoKey[] = ["studioEasel", "studioDim", "studioBusy", "brushes", "paintingHand", "clayWheelTop", "clayVases", "clayHands", "textileHang", "textileRolls", "kenteVest", "galleryHall", "beadsHung", "woodFigure", "carvedRelief", "collabArt"];
/** Photos for works and notes. */
export const MAKE_CHOICES: PhotoKey[] = [
  "paintingWoman", "paintingDancers", "collabArt", "circleInner", "circleIndigo", "studioEasel", "paintingHand", "brushes",
  "clayVases", "clayBrown", "clayBowl", "clayWet", "clayHands", "stoneBoy", "woodFigure", "carvedGroup", "carvedRelief", "bronzeHead",
  "textileHang", "textileStack", "textileRolls", "waxPrint", "kenteVest", "headwrapOrange", "beadsRed", "beadsGold", "beadsHung", "photoAlbum", "journalOpen", "notebookWhite",
];

/* ---------- The door ---------- */
export type VisitingStyle = "open" | "appointment" | "private";
export const VISITING: Record<VisitingStyle, { label: string; blurb: string }> = {
  open: { label: "Open door", blurb: "Anyone may drop in during posted hours." },
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
  { id: "w-indigo", title: "Room with the blue door", medium: "Oil on linen", size: "90 × 70 cm", year: "2025", photo: "paintingWoman", story: "Painted from a memory of my aunt's front room in Enugu. I kept repainting the door until it felt like the colour of waiting." },
  { id: "w-dancers", title: "Three at the gate", medium: "Acrylic on canvas", size: "120 × 90 cm", year: "2025", photo: "paintingDancers", story: "Made the week after a wedding I nearly skipped. The figures are nobody in particular, and everyone I danced beside." },
  { id: "w-bowls", title: "Morning bowls, set of four", medium: "Stoneware", size: "14 cm each", year: "2024", photo: "clayBowl", story: "My first ceramics that I trusted enough to eat from. Each glaze came out a little differently and I stopped minding." },
  { id: "w-cloth", title: "Cloth for a long wall", medium: "Hand-dyed cotton", size: "3 m", year: "2024", photo: "textileHang", story: "A test piece for a bigger commission. It taught me how much the dye yard's weather decides." },
];
export const sampleNotes = (base: string): Note[] => [
  { id: "n-1", kind: "note", date: addDays(base, -1), text: "Second coat on the blue door is drying. Wondering if it wants a warmer edge, or if that's me being scared of finishing." },
  { id: "n-2", kind: "sketch", date: addDays(base, -3), photo: "notebookWhite", text: "Thumbnail sketches for the gate series. Keeping the figures unfinished on purpose." },
  { id: "n-3", kind: "note", date: addDays(base, -6), photo: "brushes", text: "Cleared the brushes and the desk. A tidy start is half the work." },
];
export const sampleVisits = (base: string): Visit[] => [
  { id: "v-1", title: "Open studio evening", date: addDays(base, 5), time: "17:00", mode: "Live", seats: 6, rsvps: ["leila", "zuri", "chidi"] },
  { id: "v-2", title: "A walk through the gate series", date: addDays(base, 12), time: "18:30", mode: "Virtual", seats: 6, rsvps: ["efua"] },
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
    cover: "studioEasel",
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
    name: "Room with a blue door",
    tagline: "Paintings, bowls and cloth, made slowly in a back room in Yaba.",
    city: "Lagos",
    country: "Nigeria",
    disciplines: ["Painting", "Ceramics", "Textile"],
    cover: "studioEasel",
    theme: "forest",
    visiting: "open",
    hours: { days: ["Wed", "Fri"], from: "16:00", to: "19:00" },
    about: "I collected for years before I made anything. This studio is where I finally started. Come in, sit down, tell me what you see. I'd rather have a conversation than a compliment.",
    now: "Finishing the second coat on the blue door, and firing the last set of bowls.",
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
    name: "The Clay Yard", tagline: "Figures that look back at you, fired in a small yard in Yaba.", disciplines: ["Sculpture", "Ceramics"], theme: "clay", visiting: "open", hours: "Wed, Sat · 15:00–18:00",
    about: "Most days I am covered in clay and talking to the kiln. Visitors are welcome to watch, ask, and hold the offcuts.",
    now: "A seated figure in three parts, and a firing at six.",
    taken: ["leila", "zuri", "chidi"],
    works: [
      ["Listener, seated", "Fired clay", "62 cm", "2025", "woodFigure", "A figure made to be spoken to. I keep the ears large on purpose."],
      ["Two heads, one turned", "Terracotta", "34 cm", "2024", "stoneBoy", "Started as a portrait of my nephew and stopped being about him halfway."],
      ["Wheel study 12", "Stoneware", "28 cm", "2025", "clayWheelTop", "One of a long run of throwing exercises. This is the one that didn't collapse."],
      ["Small gathering", "Fired clay", "9 to 14 cm", "2024", "carvedGroup", "Pocket-sized figures, made in the gaps between bigger jobs."],
      ["Crown study", "Cast bronze", "48 cm", "2023", "bronzeHead", "My first bronze. I still don't trust how heavy it is."],
    ],
    notes: [["Kiln packed and lidded. Six hours of waiting and pretending not to check the pyrometer.", "clayWet"], ["The left shoulder is wrong. Everyone says it's fine. It is wrong.", null]],
  },
  thandi: {
    name: "Slow Bowls", tagline: "Everyday vessels, made slowly, used daily.", disciplines: ["Ceramics"], theme: "cream", visiting: "open", hours: "Tue, Thu · 10:00–14:00",
    about: "A shared workshop in Maboneng with two wheels and one temperamental kiln. Come and throw a bowl with me.",
    now: "A run of tea bowls with a wood-ash glaze I keep getting wrong.",
    taken: ["efua", "chidi"],
    works: [
      ["Tea bowl, ash glaze", "Stoneware", "10 cm", "2025", "clayBowl", "The third version of this glaze. The first two ran off the shelf."],
      ["Vase set, grey", "Stoneware", "18 to 30 cm", "2025", "clayVases", "Three vases that live together. Sold separately, but they'd rather not be."],
      ["Wet rim", "Stoneware", "22 cm", "2024", "clayWet", "The moment before the rim is trimmed. I photograph it because it never lasts."],
      ["Brown jars", "Earthenware", "20 cm", "2024", "clayBrown", "Made with local clay that fights you the whole way. Worth it."],
      ["Hands in", "Photograph", "A4 print", "2025", "clayHands", "A picture of my teacher's hands, which I'm still learning to copy."],
    ],
    notes: [["Glaze tests tiled on the shelf. Number 7 is the one, I can feel it.", "clayBrown"], ["Note to self: wedge longer.", null]],
  },
  kwame: {
    name: "Third Layer", tagline: "Portraits of people who raised me, painted slowly.", disciplines: ["Painting"], theme: "indigo", visiting: "appointment", hours: "By appointment",
    about: "A small studio above a print shop in Osu. I paint in layers and I'm never quite finished, so visits are about the unfinished ones.",
    now: "The third layer of my mother's portrait. Still unsure.",
    taken: ["nandi", "wanjiru", "ayo", "leila"],
    works: [
      ["Mother at the window", "Oil on canvas", "100 × 80 cm", "2025", "paintingWoman", "Started three times. This is the version where she stopped looking at me and looked out."],
      ["Gate", "Acrylic on canvas", "120 × 90 cm", "2024", "paintingDancers", "A celebration painted from the outside, the way I usually attend them."],
      ["Layer study", "Oil on board", "40 × 30 cm", "2025", "circleIndigo", "A test of how many glazes a face can take before it turns into weather."],
      ["Purple afternoon", "Acrylic", "60 × 60 cm", "2023", "circleInner", "Painted in an afternoon, which is unusual for me. I've been suspicious of it since."],
      ["Easel, Tuesday", "Photograph", "A4 print", "2025", "studioEasel", "A corner of the studio, in the light I paint by."],
    ],
    notes: [["Third layer drying. If it dulls, I scrape back to the second.", "paintingHand"], ["Colour note: less green in the shadows.", null]],
  },
  ayo: {
    name: "Indigo Yard", tagline: "Indigo, resist-dye and the memory a cloth keeps.", disciplines: ["Textile"], theme: "indigo", visiting: "appointment", hours: "By appointment",
    about: "A dye yard behind my house in Bodija with tubs, poles and a lot of sky. Visits are best in the morning, when the cloth is wet.",
    now: "Dyeing panel 7, and learning patience from a cassava resist.",
    taken: ["fatou"],
    works: [
      ["Panel 6", "Hand-dyed cotton", "3 m", "2025", "textileHang", "Dipped nine times. Each dip changed my mind about the pattern."],
      ["Rolled stock", "Hand-dyed cotton", "Various", "2025", "textileRolls", "The reserve: rolls waiting for a project to decide what they are."],
      ["Green by mistake", "Hand-dyed cotton", "2 m", "2024", "textileStack", "The second bath came out greener than expected. I've decided it was on purpose."],
      ["Blue skirt", "Wax print, sewn", "Size 12", "2024", "waxPrint", "Made with Fatou for a fitting. The cloth is not mine but the cut is a joint decision."],
      ["Long wall", "Hand-dyed cotton", "10 m", "2025", "textileHang", "The piece that moves in the wind when you step into the yard."],
    ],
    notes: [["Panel 7 is in the third bath. Not touching it until tomorrow.", "textileHang"], ["Ask the elders about the older cassava resist recipe.", null]],
  },
  fatou: {
    name: "The Cutting Table", tagline: "Cut, cloth and the politics of what we wear.", disciplines: ["Fashion", "Textile"], theme: "lime", visiting: "open", hours: "Mon, Fri · 14:00–18:00",
    about: "A fitting room, a cutting table and fabric bins I refuse to organise. Come and watch a garment go from a pattern to a person.",
    now: "A gold kente vest for a friend's wedding, and a pattern I keep redrafting.",
    taken: ["thandi", "efua"],
    works: [
      ["Gold vest", "Kente, cotton lining", "Size 10", "2025", "kenteVest", "Cut and sewn in six days. The stripes had to meet at the back, which took two of them."],
      ["Orange wrap", "Printed cotton", "Size 12", "2025", "headwrapOrange", "A headwrap and dress pair. The print did most of the talking."],
      ["Red robe", "Patterned cotton", "One size", "2024", "redPatterned", "A gift for my mother, who told me the sleeves were too short. She was right."],
      ["Blue matched pair", "Print cotton", "Sizes 8, 10", "2024", "blueOutfits", "Two sisters, one cloth. I love it when the pair walk in step."],
      ["Yellow print dress", "Print cotton", "Size 12", "2025", "yellowPrint", "Made to be worn sitting down, among baskets, all day."],
    ],
    notes: [["The collar sits wrong on the left. Unpicking it again.", null], ["Fabric came in. Three colours I did not order. All good.", "textileStack"]],
  },
  efua: {
    name: "The Archive Room", tagline: "Following objects home, one archive at a time.", disciplines: ["Mixed media"], theme: "cream", visiting: "appointment", hours: "By appointment",
    about: "A study room in Kumasi full of carved panels, notebooks and provenance files. I don't make the work; I keep track of where it has been.",
    now: "Tracing a carved panel back through three owners.",
    taken: ["chidi"],
    works: [
      ["Ship panel", "Carved wood", "80 cm", "Undated", "carvedRelief", "An intricate wooden panel of figures and a ship. I've spent a year on its journey."],
      ["Crowned head", "Bronze", "38 cm", "Undated", "bronzeHead", "Holds a tall conical crown and a long story about who has held it."],
      ["Figures in black and white", "Carved wood", "Various", "Undated", "tribalCarving", "A group I photograph often, because the light on them keeps changing my reading."],
      ["Family album", "Photographs", "A4", "1970s", "photoAlbum", "An album a family lent me. The captions are as important as the pictures."],
      ["Field notes", "Notebook", "A5", "2025", "journalOpen", "The notebook where every object gets a page of doubts."],
    ],
    notes: [["Found a name on the back of the panel. Not sure if it's the maker or an owner.", "notebookWhite"], ["Reading list for the room on Friday.", null]],
  },
  nandi: {
    name: "The Long Wall", tagline: "A curator's walk through a hang in progress.", disciplines: ["Mixed media"], theme: "forest", visiting: "open", hours: "Tue, Thu · 16:00–19:00",
    about: "A borrowed gallery hall where I try hangs, get them wrong and try again. Come to argue with the order.",
    now: "Rehanging the east wall so the small works stop shouting at the big one.",
    taken: ["zuri", "leila"],
    works: [
      ["East wall, version 3", "Installation view", "Full wall", "2025", "galleryHall", "The current hang. It changes about once a week."],
      ["Visitor", "Photograph", "A3", "2025", "galleryViewer", "I keep a picture of the first person to walk in each morning."],
      ["Group before the big one", "Photograph", "A3", "2025", "galleryGroup", "What a large painting does to a room of strangers."],
      ["Seated on the floor", "Photograph", "A3", "2024", "gallerySeated", "The best way to look at framed work is from the floor. I won't apologise for this."],
      ["Paper wall", "Installation view", "Wall", "2024", "frameWall", "Framing choices matter more than we admit."],
    ],
    notes: [["Moved the blue painting six inches left. Everyone can breathe now.", "galleryTwo"], ["Wall text should say less.", null]],
  },
  leila: {
    name: "The Hallway", tagline: "A small collection and how it lives with a family.", disciplines: ["Mixed media"], theme: "cream", visiting: "private", hours: "Invited guests",
    about: "A collector's hallway in Casablanca. It's private, because it's also where my children do their homework, but I open it for small invited visits.",
    now: "Deciding whether the new purchase goes in the hallway or the kitchen.",
    taken: ["zuri", "efua"],
    works: [
      ["The loveseat wall", "Collection view", "Wall", "Ongoing", "frameWall", "Twelve pieces, all bought with an argument at breakfast."],
      ["Reading wall", "Collection view", "Wall", "Ongoing", "galleryTwo", "Where my youngest reads. The art is at her eye level on purpose."],
      ["Bronze head, borrowed", "Bronze", "38 cm", "Loan", "bronzeHead", "On loan from a friend. I'm terrified of dusting it."],
      ["Mounted photographs", "Prints", "A4", "Ongoing", "photoAlbum", "A shelf of family pictures I hang beside the art."],
      ["Wall of paintings", "Collection view", "Wall", "Ongoing", "galleryHall", "My dream hall. Not mine yet."],
    ],
    notes: [["New piece arrives Friday. I have moved three frames to make room and regret nothing.", null], ["Asked my daughter which she likes best. She picked the ugly one.", "frameWall"]],
  },
  wanjiru: {
    name: "Contact Sheets", tagline: "Photographs of what people keep in their pockets.", disciplines: ["Photography"], theme: "indigo", visiting: "appointment", hours: "By appointment",
    about: "A quiet room with a lightbox, a wall of prints and coffee. We look at how one picture gets chosen from three hundred.",
    now: "Sequencing a set of pocket photographs I've collected for two years.",
    taken: ["kwame", "zuri", "chidi"],
    works: [
      ["Album, page 12", "Silver gelatin print", "20 × 25 cm", "2024", "photoAlbum", "Someone else's family album, which I was allowed to photograph, page by page."],
      ["Man in the gallery", "Archival print", "A3", "2025", "galleryViewer", "He stood in front of one painting for eleven minutes. I stood behind him for ten."],
      ["Studio in low light", "Archival print", "A3", "2025", "studioDim", "Taken with the lights off, waiting for the window to do the work."],
      ["Notebook, white", "Archival print", "A4", "2025", "notebookWhite", "A blank page is the hardest photograph."],
      ["Hands and pen", "Archival print", "A4", "2024", "journalPen", "The same pen in three different hands."],
    ],
    notes: [["Chose picture 88 out of 300. It's the boring one, and it's the right one.", "photoAlbum"], ["The pocket series wants a plainer title.", null]],
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
