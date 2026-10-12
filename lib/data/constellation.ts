import type { PersonId } from "./people";

/* ---------- The Constellation: your relationships, not a feed ---------- */

/** Inner orbit = your Cliq; middle = KinCircle members; outer = new introductions waiting for consent. */
export type Orbit = "cliq" | "kin" | "new";

export const ORBITS: { id: Orbit; label: string; body: string; radius: number }[] = [
  { id: "cliq", label: "Your Cliq", body: "The people you genuinely want to hear from.", radius: 21 },
  { id: "kin", label: "KinCircles", body: "People you're on a journey with.", radius: 33 },
  { id: "new", label: "New introductions", body: "Suggested for a reason. Nothing happens without both yeses.", radius: 45 },
];

export type Star = {
  id: PersonId;
  orbit: Orbit;
  /** Degrees around the orbit, 0 = right, clockwise. */
  angle: number;
  /** 1 = faint, 3 = bright. Grows with shared moments, never with likes. */
  strength: 1 | 2 | 3;
  why: string;
  last: string;
  shared: string[];
  /** Set when a relationship has gone quiet and might like some care. */
  quiet?: string;
  circle?: string;
};

export const STARS: Star[] = [
  { id: "ayo", orbit: "cliq", angle: 300, strength: 3, why: "You both keep returning to memory in cloth.", last: "Voice note about panel 7 · this morning", shared: ["Makers' Cliq", "3 Banters", "1 studio visit"] },
  { id: "kwame", orbit: "cliq", angle: 30, strength: 3, why: "He trusts you with unfinished work.", last: "Asked you about an unfinished painting · 2h", shared: ["Makers' Cliq", "Painters' KinCircle"] },
  { id: "zuri", orbit: "cliq", angle: 150, strength: 2, why: "You argue about diaspora art, warmly.", last: "Banter Now on “home” · tonight", shared: ["Collectors Who Care", "2 rooms"] },
  { id: "thandi", orbit: "cliq", angle: 225, strength: 2, why: "Her bowls live on your table.", last: "Game night · last Saturday", shared: ["Makers' Cliq", "1 purchase"] },
  { id: "tunde", orbit: "kin", angle: 345, strength: 2, why: "Same KinCircle, very different practice.", last: "Debated the currency redesign · 5h", shared: ["African Art KinCircle"], circle: "African Art" },
  { id: "wanjiru", orbit: "kin", angle: 75, strength: 2, why: "Her markets project needs a collector's eye.", last: "Invited you to The City Through My Eyes", shared: ["Photography Lagos"], circle: "West African Markets" },
  { id: "fatou", orbit: "kin", angle: 130, strength: 1, why: "Her exhibition opens in Paris today.", last: "You left her a message · 6h", shared: ["Curators' KinCircle"], circle: "Curators" },
  { id: "nandi", orbit: "kin", angle: 195, strength: 2, why: "She hosts the rooms you come back to.", last: "Room: Creating through uncertainty · Tue", shared: ["2 Presence Rooms"], circle: "Diaspora" },
  { id: "efua", orbit: "kin", angle: 262, strength: 1, why: "An archive mind for your collection.", last: "Last spoke 3 weeks ago", shared: ["West African Markets"], quiet: "3 weeks", circle: "West African Markets" },
  { id: "leila", orbit: "new", angle: 105, strength: 1, why: "You both collect work you can argue with. She's in Casablanca, you're in Lagos.", last: "Suggested introduction", shared: ["Collecting", "Diaspora"] },
  { id: "chidi", orbit: "new", angle: 285, strength: 1, why: "A student who wants to learn to look. You could be the collector he learns from.", last: "Suggested introduction", shared: ["Mentorship"] },
];

/** Private, never shown to others: how bright you feel tonight. Shapes suggestions only. */
export const BRIGHTNESS = [
  { level: 1, label: "Dim", hint: "Gentle things only. Quiet company, nothing to prepare." },
  { level: 2, label: "Flickering", hint: "Small, low-pressure moments. A voice note, a slow game." },
  { level: 3, label: "Steady", hint: "A good night for a Banter or a six-seat room." },
  { level: 4, label: "Bright", hint: "Make something. Open a KinCircle or join a game night." },
  { level: 5, label: "Blazing", hint: "Host something. Your energy could light up a room." },
];

export type SkyEvent = { id: string; kind: "room" | "banter" | "game" | "now" | "circle"; when: string; title: string; who: PersonId[]; href: string; live?: boolean };

/** What's happening in your sky tonight, drawn only from your own relationships. */
export const TONIGHT: SkyEvent[] = [
  { id: "t1", kind: "now", when: "Live now", title: "Is AI helping or damaging African art?", who: ["tunde", "kwame", "zuri"], href: "/banter/now/ai-art", live: true },
  { id: "t2", kind: "banter", when: "Waiting for you", title: "Kwame asked: keep the painting unfinished?", who: ["kwame"], href: "/banter/unfinished" },
  { id: "t3", kind: "game", when: "20:00", title: "How Well Do We Remember?", who: ["kwame", "tunde", "efua"], href: "/play/session/uni-night" },
  { id: "t4", kind: "room", when: "21:00", title: "What does home remember?", who: ["zuri", "nandi"], href: "/rooms" },
  { id: "t5", kind: "circle", when: "Week 4 of 8", title: "West African Markets · Make", who: ["wanjiru", "efua", "fatou"], href: "/circles" },
];
