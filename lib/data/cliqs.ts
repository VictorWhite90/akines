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
    name: "Lagos Weekend Crew",
    why: "The friends I actually see on Saturdays.",
    people: ["wanjiru", "tunde", "chidi", "zuri", "efua", "leila"],
    active: "active today",
    photo: "gallerySeated",
    ritual: "Plan the weekend every Thursday",
    latest: { by: "wanjiru", text: "shared photos from Saturday's beach trip and asked where we go next.", ago: "40m", kind: "photo" },
    quiet: "efua",
  },
  {
    id: "makers",
    name: "Work Besties",
    why: "The people I trust with the hard weeks at work.",
    people: ["thandi", "ayo", "fatou", "tunde", "kwame"],
    active: "active yesterday",
    photo: "studioEasel",
    ritual: "Friday wins-and-fails check-in",
    latest: { by: "kwame", text: "asked: should I take the new job offer, or am I just tired?", ago: "2h", kind: "banter" },
  },
  {
    id: "collectors",
    name: "Money Talk Circle",
    why: "We talk about money honestly, without judgement.",
    people: ["leila", "zuri", "efua", "nandi"],
    active: "quiet this week",
    photo: "frameWall",
    ritual: "A monthly 20-minute Banter Now",
    latest: { by: "leila", text: "left a voice note about her first year saving for a house.", ago: "4d", kind: "voice" },
    quiet: "nandi",
  },
];
