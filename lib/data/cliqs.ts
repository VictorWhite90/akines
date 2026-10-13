import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/** A Cliq: the five to eight people someone genuinely wants to hear from. */
export type Cliq = {
  id: string;
  name: string;
  why: string;
  people: PersonId[];
  active: string;
  photo?: PhotoKey;
  /** A small recurring habit the Cliq keeps. */
  ritual?: string;
  /** What happened most recently, in plain words. */
  latest?: { by: PersonId; text: string; ago: string; kind: "banter" | "voice" | "game" | "photo" };
  /** Someone the Cliq hasn't heard from in a while. */
  quiet?: PersonId;
  mine?: boolean;
};

export const CLIQS: Cliq[] = [
  {
    id: "photo-lagos",
    name: "Photography Lagos",
    why: "Honest eyes on everything I shoot in the city.",
    people: ["wanjiru", "tunde", "chidi", "zuri", "efua", "leila"],
    active: "active today",
    photo: "gallerySeated",
    ritual: "One photo each, every Friday",
    latest: { by: "wanjiru", text: "shared 3 frames from Balogun market and asked which one feels most honest.", ago: "40m", kind: "photo" },
    quiet: "efua",
  },
  {
    id: "makers",
    name: "Makers' Cliq",
    why: "The people I trust with unfinished work.",
    people: ["thandi", "ayo", "fatou", "tunde", "kwame"],
    active: "active yesterday",
    photo: "studioEasel",
    ritual: "Sunday show-and-tell of something unfinished",
    latest: { by: "kwame", text: "asked: keep the painting unfinished, or am I just tired?", ago: "2h", kind: "banter" },
  },
  {
    id: "collectors",
    name: "Collectors Who Care",
    why: "We buy slowly and talk about why.",
    people: ["leila", "zuri", "efua", "nandi"],
    active: "quiet this week",
    photo: "frameWall",
    ritual: "A monthly 20-minute Banter Now",
    latest: { by: "leila", text: "left a voice note about the first year living with a painting.", ago: "4d", kind: "voice" },
    quiet: "nandi",
  },
];
