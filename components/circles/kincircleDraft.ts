import type { CircleInput, CircleKind } from "@/lib/api/community";
import type { PersonId } from "@/lib/data/people";

/** Circle types shown on the older sample KinCircle screens (MyKinCircles, KinCirclesPage). */
export type CircleType = { id: string; label: string; glyph: string; body: string };
export const CIRCLE_TYPES: CircleType[] = [
  { id: "creative", label: "Creative Circle", glyph: "creative", body: "Make art, stories or new ideas together." },
  { id: "friendship", label: "Friendship Circle", glyph: "friendship", body: "Create shared experiences that can grow into friendship." },
  { id: "project", label: "Project Circle", glyph: "project", body: "Bring complementary people around a defined outcome." },
  { id: "mentorship", label: "Mentorship Circle", glyph: "mentorship", body: "Learn, guide and grow through clear goals." },
  { id: "support", label: "Support Circle", glyph: "support", body: "Share experience and encouragement safely." },
  { id: "family", label: "Family Circle", glyph: "family", body: "Preserve stories, presence and mutual care." },
];

export type KinCircleDraft = { type: string; name: string; purpose: string; invitees: PersonId[]; agreements: string[] };
/** A small circle saved by the older sample screens (parentId: the community it sits in, if any). */
export type SavedKinCircle = KinCircleDraft & { id: string; createdAt: string; parentId?: string };

/**
 * "Turn into a KinCircle" (from a Banter, a game or a chat) leaves a half-filled circle here, then opens
 * /circles/new?size=small. Once a community is chosen, the start-a-circle form picks it up.
 */
export const KINCIRCLE_PREFILL = "ak:kincircle-prefill";

const KINDS: CircleKind[] = ["creative", "friendship", "project", "study", "mentorship", "support"];

/** Reads the handed-over draft, as values for the start-a-circle form (clearCirclePrefill once it's used). */
export function readCirclePrefill(): Partial<CircleInput> | null {
  try {
    const raw = localStorage.getItem(KINCIRCLE_PREFILL);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<KinCircleDraft>;
    const kind = KINDS.includes(d.type as CircleKind) ? (d.type as CircleKind) : "friendship";
    return { name: (d.name ?? "").slice(0, 60), purpose: (d.purpose ?? "").slice(0, 500), kind };
  } catch {
    return null;
  }
}

export function clearCirclePrefill() {
  try {
    localStorage.removeItem(KINCIRCLE_PREFILL);
  } catch {
    /* storage unavailable */
  }
}

/** True if a draft is waiting (without using it up). */
export function hasCirclePrefill() {
  try {
    return !!localStorage.getItem(KINCIRCLE_PREFILL);
  } catch {
    return false;
  }
}
