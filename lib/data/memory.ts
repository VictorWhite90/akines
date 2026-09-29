import type { PersonId } from "./people";

/**
 * Relationship Memory (brief §14): quiet context Kinnect remembers about how a relationship
 * started, so reconnecting has a hook. Shown only to the member, about their own Kinnections.
 */
export type Memory = { metVia: string; since: string };

export const MEMORY: Partial<Record<PersonId, Memory>> = {
  ayo: { metVia: "the Textiles & Adire circle", since: "5 months ago" },
  kwame: { metVia: "a Presence conversation in the African Art & Culture circle", since: "8 months ago" },
  zuri: { metVia: "the Curators circle", since: "3 months ago" },
  wanjiru: { metVia: "a studio visit", since: "1 year ago" },
  leila: { metVia: "the Collectors circle", since: "7 months ago" },
  thandi: { metVia: "the Ceramics circle", since: "4 months ago" },
  tunde: { metVia: "a Presence conversation on Benin Bronze", since: "6 months ago" },
  nandi: { metVia: "a circle she hosted on belonging", since: "9 months ago" },
  fatou: { metVia: "the African Fashion circle", since: "2 months ago" },
  efua: { metVia: "a studio visit archive walk", since: "10 months ago" },
  chidi: { metVia: "the Young Artists circle", since: "1 month ago" },
};

export const memoryFor = (id: PersonId): Memory | null => MEMORY[id] ?? null;
