import type { PersonId } from "./people";

/** A Cliq: the five to eight people someone genuinely wants to hear from. */
export type Cliq = { id: string; name: string; why: string; people: PersonId[]; active: string; mine?: boolean };

export const CLIQS: Cliq[] = [
  { id: "photo-lagos", name: "Photography Lagos", why: "Honest eyes on everything I shoot in the city.", people: ["wanjiru", "tunde", "chidi", "zuri", "efua", "leila"], active: "active today" },
  { id: "makers", name: "Makers' Cliq", why: "The people I trust with unfinished work.", people: ["thandi", "ayo", "fatou", "tunde", "kwame"], active: "active yesterday" },
  { id: "collectors", name: "Collectors Who Care", why: "We buy slowly and talk about why.", people: ["leila", "zuri", "efua", "nandi"], active: "quiet this week" },
];
