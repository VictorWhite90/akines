import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/* ---------- KinMessage: relationship-aware messaging ---------- */

export type ConvoKind = "direct" | "cliq" | "circle" | "project";

export const KIND_LABEL: Record<ConvoKind, string> = { direct: "Person", cliq: "Cliq", circle: "KinCircle", project: "Project" };
export const KIND_COLOR: Record<ConvoKind, string> = { direct: "#7b2ff7", cliq: "#e09a00", circle: "#00a86b", project: "#2547d0" };

export const INTENTS = [
  { id: "checkin", label: "Check in", glyph: "wellbeing", tint: "#fdf3fb", color: "#c2187a", hint: "Just seeing how they are. No agenda." },
  { id: "plan", label: "Plan", glyph: "event", tint: "#eef4ff", color: "#2547d0", hint: "Pick a time, a place, a next step." },
  { id: "create", label: "Create", glyph: "spark", tint: "#fff6e8", color: "#c26a00", hint: "Make or decide something together." },
  { id: "support", label: "Support", glyph: "support", tint: "#eefaf4", color: "#00845a", hint: "Someone needs care or advice." },
  { id: "celebrate", label: "Celebrate", glyph: "celebrate", tint: "#fffbe6", color: "#b08600", hint: "Share good news, mark a moment." },
] as const;
export type IntentId = (typeof INTENTS)[number]["id"];

export type KMsg =
  | { id: string; from: PersonId; at: string; kind: "text"; text: string; react?: string[] }
  | { id: string; from: PersonId; at: string; kind: "voice"; length: string; text?: string }
  | { id: string; from: PersonId; at: string; kind: "photo"; photo: PhotoKey; text?: string }
  | { id: string; from: PersonId; at: string; kind: "poll"; question: string; options: string[]; votes: number[] }
  | { id: string; from: PersonId; at: string; kind: "invite"; invite: "meetup" | "banter" | "game"; title: string; detail: string; href?: string }
  | { id: string; from: "ai"; at: string; kind: "spark"; title: string; body: string; action: "collab" | "circle" };

export type Convo = {
  id: string;
  kind: ConvoKind;
  name: string;
  members: PersonId[];
  intent: IntentId;
  photo?: PhotoKey;
  /** Waiting on the member to reply. */
  needsYou?: boolean;
  unread?: number;
  last: string;
  /** How the relationship is going, never a popularity score. */
  health: { label: "Growing" | "Strong" | "Steady" | "Quiet"; value: number; exchanges: number; shared: number; reciprocity: string; lastMet: string };
  memories: { title: string; body: string }[];
  msgs: KMsg[];
};

export const CONVOS: Convo[] = [
  {
    id: "zuri",
    kind: "direct",
    name: "Zuri Nwosu",
    members: ["zuri"],
    intent: "checkin",
    needsYou: true,
    unread: 2,
    last: "10:36",
    health: { label: "Strong", value: 82, exchanges: 12, shared: 2, reciprocity: "Balanced", lastMet: "3 weeks" },
    memories: [
      { title: "Community supper", body: "You met at Zuri's supper for newcomers · 14 March" },
      { title: "First talk together", body: "She invited you to share your story with the circle" },
    ],
    msgs: [
      { id: "z1", from: "zuri", at: "10:18", kind: "text", text: "I kept thinking about what you said, that you want to mentor young people outside the usual programmes. I found a small group in Surulere that might be the right place to start." },
      { id: "z2", from: "amara", at: "10:24", kind: "text", text: "That's timely. I'd want to keep it small enough that everyone is genuinely known. Not another big event.", react: ["💛"] },
      { id: "z3", from: "zuri", at: "10:27", kind: "voice", length: "0:24", text: "Why small groups work better for first-time mentors" },
      { id: "z4", from: "zuri", at: "10:31", kind: "photo", photo: "talkGroup", text: "This is the group I mentioned. Four different careers, the same reason for showing up." },
      { id: "z5", from: "ai", at: "10:32", kind: "spark", title: "A shared idea is taking shape", body: "You've discussed a purpose, the people and a first gathering. Turn this into a small collaboration?", action: "collab" },
      { id: "z6", from: "zuri", at: "10:36", kind: "poll", question: "When should we meet them?", options: ["Saturday morning", "Sunday afternoon", "A weekday evening"], votes: [4, 2, 1] },
    ],
  },
  {
    id: "markets",
    kind: "circle",
    name: "Weekend Coding Club",
    members: ["wanjiru", "efua", "fatou", "nandi", "tunde"],
    intent: "create",
    photo: "talkGroup",
    needsYou: true,
    unread: 4,
    last: "09:48",
    health: { label: "Growing", value: 64, exchanges: 38, shared: 1, reciprocity: "Mostly balanced", lastMet: "Thursday" },
    memories: [{ title: "Agreement signed", body: "All six agreed on safeguarding and roles before the first class" }],
    msgs: [
      { id: "m1", from: "wanjiru", at: "09:20", kind: "photo", photo: "studioBusy", text: "Three lesson plans for week one. Which one would a 14-year-old enjoy?" },
      { id: "m2", from: "efua", at: "09:31", kind: "text", text: "The second. They build something in the first ten minutes." },
      { id: "m3", from: "nandi", at: "09:40", kind: "invite", invite: "meetup", title: "Parents' meeting before we start", detail: "Thursday · 18:00 · Presence Room · 6 seats", href: "/rooms" },
      { id: "m4", from: "fatou", at: "09:48", kind: "poll", question: "What do we teach first?", options: ["A simple website", "A small game", "A chatbot"], votes: [3, 2, 1] },
    ],
  },
  {
    id: "makers",
    kind: "cliq",
    name: "Work Besties",
    members: ["thandi", "ayo", "fatou", "tunde", "kwame"],
    intent: "celebrate",
    photo: "studioEasel",
    last: "Yesterday",
    health: { label: "Steady", value: 58, exchanges: 21, shared: 0, reciprocity: "Balanced", lastMet: "Sunday" },
    memories: [{ title: "Sunday show-and-tell", body: "Kwame shared the job offer he almost turned down" }],
    msgs: [
      { id: "k1", from: "ayo", at: "Yesterday", kind: "text", text: "Got the promotion! Starting Monday." },
      { id: "k2", from: "thandi", at: "Yesterday", kind: "text", text: "Finally! This deserves a game night.", react: ["🎉", "💛"] },
      { id: "k3", from: "thandi", at: "Yesterday", kind: "invite", invite: "game", title: "Two truths and a story", detail: "Sunday · 18:00 · Live play · 5 players", href: "/play/two-truths" },
    ],
  },
  {
    id: "threads",
    kind: "project",
    name: "Supper Club Launch",
    members: ["ayo", "fatou"],
    intent: "plan",
    photo: "collabArt",
    last: "Yesterday",
    health: { label: "Strong", value: 76, exchanges: 46, shared: 1, reciprocity: "Balanced", lastMet: "Last week" },
    memories: [{ title: "Ownership agreed", body: "Costs and roles agreed before the first booking" }],
    msgs: [
      { id: "p1", from: "fatou", at: "Yesterday", kind: "text", text: "Venue confirmed. First supper in Lagos, then Dakar." },
      { id: "p2", from: "ayo", at: "Yesterday", kind: "voice", length: "1:04", text: "Ideas for the menu" },
      { id: "p3", from: "ai", at: "Yesterday", kind: "spark", title: "Milestone reached", body: "Planning is 68% done. Add the launch date to the project timeline?", action: "collab" },
    ],
  },
  {
    id: "kwame",
    kind: "direct",
    name: "Kwame Mensah",
    members: ["kwame"],
    intent: "support",
    last: "Tue",
    health: { label: "Strong", value: 79, exchanges: 17, shared: 0, reciprocity: "You give more", lastMet: "2 weeks" },
    memories: [{ title: "The job he took", body: "You told him to trust his gut" }],
    msgs: [
      { id: "w1", from: "kwame", at: "Mon", kind: "voice", length: "0:51", text: "Thinking out loud about the job offer" },
      { id: "w2", from: "amara", at: "Mon", kind: "text", text: "Listened twice. Take it. You've outgrown the old role." },
      { id: "w3", from: "kwame", at: "Tue", kind: "text", text: "That's what I needed to hear. Thank you." },
    ],
  },
  {
    id: "leila",
    kind: "direct",
    name: "Leila Benali",
    members: ["leila"],
    intent: "plan",
    last: "Sun",
    health: { label: "Quiet", value: 32, exchanges: 5, shared: 0, reciprocity: "Balanced", lastMet: "Never in person" },
    memories: [],
    msgs: [
      { id: "l1", from: "leila", at: "Sun", kind: "text", text: "Introduced through Akines! You're both building something of your own, apparently. Coffee when I'm in Lagos?" },
      { id: "l2", from: "leila", at: "Sun", kind: "invite", invite: "banter", title: "What's the best advice you ignored?", detail: "A private Banter between you two", href: "/banter" },
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
