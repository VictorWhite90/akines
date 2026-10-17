import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/**
 * Akines's Home feed, section 8–9 of the brief: typed posts (not one generic "post"),
 * and reactions that are a gateway to human interaction rather than a popularity count.
 */
export type PostType = "share" | "ask" | "discuss" | "invite" | "help" | "collaborate";

export const POST_TYPES: Record<PostType, { glyph: string; label: string; verb: string; placeholder: string }> = {
  share: { glyph: "✦", label: "Share", verb: "shared", placeholder: "I visited an incredible exhibition today…" },
  ask: { glyph: "❔", label: "Ask", verb: "asked", placeholder: "Does anyone know a good framer in Lagos?" },
  discuss: { glyph: "💬", label: "Discuss", verb: "started a discussion", placeholder: "Why are African galleries struggling with digital distribution?" },
  invite: { glyph: "✉", label: "Invite", verb: "invited people", placeholder: "Anyone interested in visiting the gallery this Saturday?" },
  help: { glyph: "🤲", label: "Help", verb: "asked for help", placeholder: "I need advice preparing for my first exhibition." },
  collaborate: { glyph: "⌘", label: "Collaborate", verb: "is looking for collaborators", placeholder: "I'm developing a documentary and looking for…" },
};

export type ReactionKey = "appreciate" | "interesting" | "canHelp" | "inspired" | "discuss" | "connect";

export const REACTIONS: Record<ReactionKey, { glyph: string; label: string }> = {
  appreciate: { glyph: "❤️", label: "Appreciate" },
  interesting: { glyph: "💡", label: "Interesting" },
  canHelp: { glyph: "🤝", label: "I can help" },
  inspired: { glyph: "🌱", label: "Inspired me" },
  discuss: { glyph: "💬", label: "Let's discuss" },
  connect: { glyph: "👋", label: "Connect" },
};

export type Post = {
  id: string;
  by: PersonId;
  type: PostType;
  text: string;
  photo?: PhotoKey;
  circle?: string;
  collab?: string;
  at: string;
  reactions: Partial<Record<ReactionKey, PersonId[]>>;
  replies: number;
};

export const POSTS: Post[] = [
  {
    id: "p1",
    by: "ayo",
    type: "share",
    text: "Twelve-hour shift done, and a patient's daughter brought the whole ward jollof. Some days this job gives back more than it takes.",
    photo: "talkCafe",
    circle: "textiles",
    at: "2h",
    reactions: { appreciate: ["kwame", "leila", "zuri"], inspired: ["chidi", "thandi"] },
    replies: 6,
  },
  {
    id: "p2",
    by: "tunde",
    type: "collaborate",
    text: "Starting a weekend coding club for teenagers in Lagos. Looking for two volunteers who can teach basic web development and one who can organise.",
    photo: "studioBusy",
    collab: "threads-of-return",
    at: "4h",
    reactions: { canHelp: ["zuri", "efua"], interesting: ["nandi", "wanjiru", "chidi"] },
    replies: 11,
  },
  {
    id: "p3",
    by: "leila",
    type: "discuss",
    text: "My daughter asked why I work so late. I didn't have a good answer. How do you explain your job to a seven-year-old?",
    photo: "journalWindow",
    at: "6h",
    reactions: { discuss: ["nandi", "efua", "amara"], appreciate: ["ayo"] },
    replies: 18,
  },
  {
    id: "p4",
    by: "nandi",
    type: "invite",
    text: "Tonight's Presence Room in New in the City: “What does home mean to you now?” Six seats. Bring one place, smell or memory.",
    photo: "talkMugs",
    circle: "diaspora",
    at: "8h",
    reactions: { connect: ["kwame", "leila"], interesting: ["chidi"] },
    replies: 4,
  },
  {
    id: "p5",
    by: "wanjiru",
    type: "ask",
    text: "Planning my first solo trip and I'm nervous about going alone. Anyone done this in West Africa? Where would you start?",
    photo: "calmWater",
    circle: "photography",
    at: "9h",
    reactions: { canHelp: ["zuri"], interesting: ["efua", "tunde"] },
    replies: 7,
  },
  {
    id: "p6",
    by: "thandi",
    type: "share",
    text: "Finished my first half-marathon this morning. Slow, sweaty, and the proudest I've felt all year.",
    photo: "talkLaugh",
    circle: "ceramics",
    at: "Yesterday",
    reactions: { appreciate: ["ayo", "fatou", "amara"], inspired: ["chidi", "wanjiru"] },
    replies: 5,
  },
  {
    id: "p7",
    by: "fatou",
    type: "help",
    text: "Launching my small catering business next month and I still don't know how to price fairly. Would love advice from anyone who's done this.",
    photo: "talkGroup",
    circle: "african-fashion",
    at: "Yesterday",
    reactions: { canHelp: ["leila", "zuri"], appreciate: ["thandi"] },
    replies: 9,
  },
  {
    id: "p8",
    by: "efua",
    type: "discuss",
    text: "Companies are finally offering four-day weeks in Lagos. Is that overdue, or does it just squeeze five days of work into four?",
    photo: "journalCoffee",
    circle: "traditional-arts",
    at: "2 days ago",
    reactions: { discuss: ["tunde", "nandi", "amara"], interesting: ["zuri"] },
    replies: 14,
  },
  {
    id: "p9",
    by: "kwame",
    type: "share",
    text: "Rewrote my CV from scratch and left out the polite version of my career. That's the real story now, gaps and all.",
    photo: "journalOpen",
    at: "2 days ago",
    reactions: { appreciate: ["leila", "chidi"], inspired: ["ayo", "amara"] },
    replies: 8,
  },
  {
    id: "p10",
    by: "zuri",
    type: "invite",
    text: "Book club this Thursday, six people at a table. We're reading something short, so come even if you haven't finished.",
    photo: "talkYoung",
    circle: "curators",
    at: "3 days ago",
    reactions: { connect: ["nandi", "efua"], interesting: ["amara"] },
    replies: 3,
  },
  {
    id: "p11",
    by: "chidi",
    type: "ask",
    text: "Student budget, first real job offer. Do you take the higher salary, or the role where you'll learn more?",
    photo: "talkTwo",
    circle: "collectors",
    at: "3 days ago",
    reactions: { canHelp: ["leila", "amara"], appreciate: ["thandi"] },
    replies: 12,
  },
  {
    id: "p12",
    by: "amara",
    type: "share",
    text: "Wrote down my goals for the year for the first time. It changed how I look at my calendar every morning.",
    photo: "notebookWhite",
    at: "4 days ago",
    reactions: { appreciate: ["ayo", "leila", "zuri"], inspired: ["chidi"] },
    replies: 5,
  },
  {
    id: "p13",
    by: "ayo",
    type: "collaborate",
    text: "Our community clean-up is in six days. If you're in Johannesburg that week and want to help, say the word.",
    photo: "kincircleHero",
    collab: "beads-cloth",
    at: "5 days ago",
    reactions: { interesting: ["fatou", "thandi"], connect: ["zuri"] },
    replies: 6,
  },
  {
    id: "p14",
    by: "tunde",
    type: "discuss",
    text: "Remote work keeps getting discussed as a productivity question. What about the people who are just lonely at home? That part rarely makes the conversation.",
    photo: "calmBench",
    circle: "traditional-arts",
    at: "1 week ago",
    reactions: { discuss: ["efua", "nandi", "zuri"], appreciate: ["amara"] },
    replies: 21,
  },
];

export const postsFor = (circleId: string) => POSTS.filter((p) => p.circle === circleId);
