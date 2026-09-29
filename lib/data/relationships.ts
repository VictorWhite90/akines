import type { PersonId } from "./people";

/**
 * Kinnect's fundamental unit is the relationship, not the follower.
 * Kinnections are relationships the member has chosen to acknowledge — never a public follower count.
 */
export const KINNECTIONS_KEY = "kn:kinnections";

/** Seed: who Amara has already acknowledged, so Messages isn't empty on first load. */
export const SEED_KINNECTIONS: PersonId[] = ["ayo", "kwame", "zuri", "wanjiru", "leila"];
