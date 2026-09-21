import type { CreativeDna } from "@/lib/types";

export type PrivacyKey = keyof CreativeDna["privacy"];

/** Plain-language explanations for every Creative DNA consent toggle. */
export const PRIVACY_OPTIONS: { key: PrivacyKey; label: string; on: string; off: string }[] = [
  {
    key: "inferFromBehaviour",
    label: "Learn from what I do on Artelia",
    on: "Artelia may suggest DNA values from the rooms you join, the stories you open and the introductions you accept. Every suggestion is labelled “AI” and you can overwrite it.",
    off: "Only your own answers shape your Creative DNA. Nothing is inferred from your activity.",
  },
  {
    key: "useJournalThemes",
    label: "Use themes from my public journal",
    on: "Topics from entries you've made public (never private or circle-only ones) can inform matching — for example “indigo” or “migration”.",
    off: "Your journal is never read for matching, even the public entries.",
  },
  {
    key: "visibleToMatches",
    label: "Show my Creative DNA to people I'm introduced to",
    on: "When you're introduced to someone, they see your intents and dimensions so they understand why you were matched.",
    off: "People you're introduced to only see your name, practice and the reasons for the match.",
  },
  {
    key: "visibleToCurators",
    label: "Let verified curators see it when I apply",
    on: "Verified curators reviewing your applications can see your Creative DNA alongside your statement.",
    off: "Curators only see what you submit with each application.",
  },
];

/**
 * What the member answered at onboarding for each dimension — the values the
 * "reset AI-inferred values" action returns to.
 */
export const ONBOARDING_ANSWERS: Record<string, number> = {
  curiosity: 38,
  storytelling: 60,
  history: 82,
  material: 92,
  emotion: 45,
  tradition: 58,
  form: 24,
  collaboration: 55,
  voice: 50,
};
