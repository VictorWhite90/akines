import type { PhotoKey } from "./images";
import type { PersonId } from "./people";
import type { ImageSource } from "@/lib/images";

/* ---------- KinMessage: relationship-aware messaging ---------- */

export type ConvoKind = "direct" | "cliq" | "circle" | "project";

export const KIND_LABEL: Record<ConvoKind, string> = { direct: "Person", cliq: "Cliq", circle: "KinCircle", project: "Collaboration" };
/** One quiet tone for every kind: the label says which kind it is (product design, November 2026). */
export const KIND_COLOR: Record<ConvoKind, string> = { direct: "#6E6E6E", cliq: "#6E6E6E", circle: "#6E6E6E", project: "#6E6E6E" };

export const INTENTS = [
  { id: "checkin", label: "Check in", glyph: "wellbeing", tint: "#FEF6EC", color: "#995A0A", hint: "Just seeing how they are. No agenda." },
  { id: "plan", label: "Plan", glyph: "event", tint: "#FEF6EC", color: "#995A0A", hint: "Pick a time, a place, a next step." },
  { id: "create", label: "Create", glyph: "spark", tint: "#FEF6EC", color: "#995A0A", hint: "Make or decide something together." },
  { id: "support", label: "Support", glyph: "support", tint: "#FEF6EC", color: "#995A0A", hint: "Someone needs care or advice." },
  { id: "celebrate", label: "Celebrate", glyph: "celebrate", tint: "#FEF6EC", color: "#995A0A", hint: "Share good news, mark a moment." },
] as const;
export type IntentId = (typeof INTENTS)[number]["id"];

export type KMsg =
  | { id: string; from: PersonId; at: string; kind: "text"; text: string; react?: string[]; sender?: string }
  | { id: string; from: PersonId; at: string; kind: "voice"; length: string; text?: string }
  | { id: string; from: PersonId; at: string; kind: "photo"; photo: PhotoKey | (string & {}) | ImageSource; text?: string }
  | { id: string; from: PersonId; at: string; kind: "poll"; question: string; options: string[]; votes: number[] }
  | { id: string; from: PersonId; at: string; kind: "invite"; invite: "meetup" | "banter" | "game" | "project"; title: string; detail: string; href?: string }
  | { id: string; from: "ai"; at: string; kind: "spark"; title: string; body: string; action: "collab" | "circle" };

export type Convo = {
  id: string;
  kind: ConvoKind;
  name: string;
  members: PersonId[];
  intent: IntentId;
  photo?: PhotoKey | (string & {});
  /** The line under the name, as the design writes it ("Friend", "Cliq · 9 members"). */
  sub?: string;
  /** The time shown in the list ("6d", "Today"). */
  meta?: string;
  /** What the composer starts with (the design's sample message). */
  draft?: string;
  /** Waiting on the member to reply. */
  needsYou?: boolean;
  unread?: number;
  last: string;
  /** How the relationship is going, never a popularity score. */
  health: { label: "Growing" | "Strong" | "Steady" | "Quiet"; value: number; exchanges: number; shared: number; reciprocity: string; lastMet: string };
  memories: { title: string; body: string }[];
  msgs: KMsg[];
};

/**
 * The product design's conversations (Messages, /messages/<id>), word for word. A message's `at` is the day it falls
 * under; Kemi (ME) writes the outgoing ones. Group messages name their sender as the design does.
 */
const AV = (name: string) => `/kin/design/home/community/av-${name}.jpg`;
export const CONVOS: Convo[] = [
  {
    id: "amara", kind: "direct", name: "Amara", members: ["amara-okafor"], intent: "create", sub: "Community Health Initiative", meta: "6d",
    last: "No rush. Tell me when you would like to talk it through.", draft: "I am ready to look at the plan. Could we talk tomorrow?",
    health: { label: "Steady", value: 60, exchanges: 0, shared: 0, reciprocity: "Balanced", lastMet: "Not yet" }, memories: [],
    msgs: [
      { id: "am1", from: "amara-okafor", at: "Thursday", kind: "text", text: "I mapped out the three clinics we could visit first. Want to look at it together?" },
      { id: "am2", from: "kemi", at: "Thursday", kind: "text", text: "Yes please. I will send my draft of the outreach plan this week." },
      { id: "am3", from: "amara-okafor", at: "Six days ago", kind: "text", text: "No rush. Tell me when you would like to talk it through." },
    ],
  },
  {
    id: "folake", kind: "direct", name: "Folake", members: ["folake"], intent: "plan", sub: "Friend", meta: "9d",
    last: "Yes, I would love that. Let me check my week.", draft: "Yes, Sunday works. Shall we say 8:00 AM?",
    health: { label: "Steady", value: 60, exchanges: 0, shared: 0, reciprocity: "Balanced", lastMet: "Not yet" }, memories: [],
    msgs: [
      { id: "fo1", from: "folake", at: "Nine days ago", kind: "text", text: "Are we still on for the Sunday walk? No pressure if this week has been busy." },
      { id: "fo2", from: "kemi", at: "Nine days ago", kind: "text", text: "Yes, I would love that. Let me check my week and come back to you." },
    ],
  },
  {
    id: "food-systems-cliq", kind: "cliq", name: "Food Systems Cliq", members: ["tunde-bakare", "ngozi"], intent: "create", photo: AV("health"), sub: "Cliq · 9 members", meta: "Today",
    last: "I will bring the budget questions to the 2:00 PM call.", draft: "Thanks both. See you at 2:00 PM.",
    health: { label: "Steady", value: 60, exchanges: 0, shared: 0, reciprocity: "Balanced", lastMet: "Not yet" }, memories: [],
    msgs: [
      { id: "fs1", from: "tunde-bakare", at: "Today", kind: "text", text: "Notes from the last call are in the shared folder.", sender: "Tunde" },
      { id: "fs2", from: "ngozi", at: "Today", kind: "text", text: "I will bring the budget questions to the 2:00 PM call.", sender: "Ngozi" },
    ],
  },
  {
    id: "kincircle-reflection", kind: "circle", name: "KinCircle Reflection", members: ["ngozi", "tunde-bakare"], intent: "checkin", photo: AV("kincircle"), sub: "KinCircle · Tomorrow, 12:30 PM", meta: "1d",
    last: "Tomorrow we will begin with one thing that went well.", draft: "Looking forward to it.",
    health: { label: "Steady", value: 60, exchanges: 0, shared: 0, reciprocity: "Balanced", lastMet: "Not yet" }, memories: [],
    msgs: [
      { id: "kr1", from: "ngozi", at: "Yesterday", kind: "text", text: "Tomorrow we will begin with one thing that went well this week. No preparation needed.", sender: "Facilitator" },
    ],
  },
  {
    id: "university-friends", kind: "cliq", name: "University friends", members: ["chuka", "folake"], intent: "celebrate", photo: AV("friends"), sub: "Group · 7 members", meta: "Today",
    last: "I am bringing the Ludo board.", draft: "Count me in for Friday.",
    health: { label: "Steady", value: 60, exchanges: 0, shared: 0, reciprocity: "Balanced", lastMet: "Not yet" }, memories: [],
    msgs: [
      { id: "uf1", from: "chuka", at: "Today", kind: "text", text: "Game night on Friday. Bring snacks, not strategy.", sender: "Chuka" },
      { id: "uf2", from: "folake", at: "Today", kind: "text", text: "I am bringing the Ludo board.", sender: "Folake" },
    ],
  },
];

export const QUICK_REPLIES: Record<IntentId, string[]> = {
  checkin: ["Thinking of you today.", "How did it go?", "No need to reply, just saying hi."],
  plan: ["Does Saturday work?", "I can host.", "Let's keep it to six people."],
  create: ["I can take the first draft.", "What if we tried it the other way?", "Let's decide by Friday."],
  support: ["That sounds hard. I'm here.", "Want to talk it through on a call?", "Take your time."],
  celebrate: ["This is wonderful!", "So proud of you.", "We should mark this properly."],
};
