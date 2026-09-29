import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/**
 * Kinnect's Home feed, section 8–9 of the brief: typed posts (not one generic "post"),
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
    text: "Seven dye baths in, and the green finally came out the way I've been chasing all year. Hung it in the yard for an hour just to watch the light change it.",
    photo: "textileHang",
    circle: "textiles",
    at: "2h",
    reactions: { appreciate: ["kwame", "leila", "zuri"], inspired: ["chidi", "thandi"] },
    replies: 6,
  },
  {
    id: "p2",
    by: "tunde",
    type: "collaborate",
    text: "I'm developing a short documentary about disappearing bronze-casting workshops in Lagos. Looking for a researcher and an editor who can work with archive footage.",
    photo: "bronzeHead",
    collab: "threads-of-return",
    at: "4h",
    reactions: { canHelp: ["zuri", "efua"], interesting: ["nandi", "wanjiru", "chidi"] },
    replies: 11,
  },
  {
    id: "p3",
    by: "leila",
    type: "discuss",
    text: "My daughter asked who the woman in our hallway painting is waiting for. I didn't have an answer. Do the stories we tell about a work change what we see in it?",
    photo: "frameWall",
    at: "6h",
    reactions: { discuss: ["nandi", "efua", "amara"], appreciate: ["ayo"] },
    replies: 18,
  },
  {
    id: "p4",
    by: "nandi",
    type: "invite",
    text: "Tonight's Presence Room in the African Art & Culture circle: “What does home mean in African art?” Six seats. Bring one work, place or memory.",
    photo: "galleryHall",
    circle: "diaspora",
    at: "8h",
    reactions: { connect: ["kwame", "leila"], interesting: ["chidi"] },
    replies: 4,
  },
  {
    id: "p5",
    by: "wanjiru",
    type: "ask",
    text: "Editing a book from ten years of contact sheets and it's harder than shooting them. Anyone been through a first photobook edit? What would you do differently?",
    photo: "photoAlbum",
    circle: "photography",
    at: "9h",
    reactions: { canHelp: ["zuri"], interesting: ["efua", "tunde"] },
    replies: 7,
  },
  {
    id: "p6",
    by: "thandi",
    type: "share",
    text: "The last bowl I made this month has no memory of anger in it. That took twelve years to learn, and it's the only thing I'm proud of this week.",
    photo: "clayVases",
    circle: "ceramics",
    at: "Yesterday",
    reactions: { appreciate: ["ayo", "fatou", "amara"], inspired: ["chidi", "wanjiru"] },
    replies: 5,
  },
  {
    id: "p7",
    by: "fatou",
    type: "help",
    text: "First standalone show in three weeks and I still don't know how to price the made-to-order pieces fairly. Would love advice from anyone who's done this.",
    photo: "kenteVest",
    circle: "african-fashion",
    at: "Yesterday",
    reactions: { canHelp: ["leila", "zuri"], appreciate: ["thandi"] },
    replies: 9,
  },
  {
    id: "p8",
    by: "efua",
    type: "discuss",
    text: "Museums are starting to credit the individual maker, not just the region, on object labels. Is that overdue, or does it flatten a collective tradition?",
    photo: "carvedRelief",
    circle: "traditional-arts",
    at: "2 days ago",
    reactions: { discuss: ["tunde", "nandi", "amara"], interesting: ["zuri"] },
    replies: 14,
  },
  {
    id: "p9",
    by: "kwame",
    type: "share",
    text: "Scraped the third layer back to the second and left the ruin showing. That's the painting now, not the polite version I almost kept.",
    photo: "paintingHand",
    at: "2 days ago",
    reactions: { appreciate: ["leila", "chidi"], inspired: ["ayo", "amara"] },
    replies: 8,
  },
  {
    id: "p10",
    by: "zuri",
    type: "invite",
    text: "Curators' walk-through of “Cloth & Memory” this Thursday, six visitors at a time. Come see why we hung the textile pieces between the paintings.",
    photo: "galleryTwo",
    circle: "curators",
    at: "3 days ago",
    reactions: { connect: ["nandi", "efua"], interesting: ["amara"] },
    replies: 3,
  },
  {
    id: "p11",
    by: "chidi",
    type: "ask",
    text: "Student budget, first real purchase. How do you choose between a small work you love now and saving for something bigger later?",
    photo: "gallerySeated",
    circle: "collectors",
    at: "3 days ago",
    reactions: { canHelp: ["leila", "amara"], appreciate: ["thandi"] },
    replies: 12,
  },
  {
    id: "p12",
    by: "amara",
    type: "share",
    text: "Wrote a proper collector's entry for the first time: why I bought it, and where it lives now. It changed how I look at the wall every morning.",
    photo: "journalOpen",
    at: "4 days ago",
    reactions: { appreciate: ["ayo", "leila", "zuri"], inspired: ["chidi"] },
    replies: 5,
  },
  {
    id: "p13",
    by: "ayo",
    type: "collaborate",
    text: "Beads & Cloth opens in six days. If you're in Johannesburg that week and want a preview walk-through before the crowd, say the word.",
    photo: "beadsRed",
    collab: "beads-cloth",
    at: "5 days ago",
    reactions: { interesting: ["fatou", "thandi"], connect: ["zuri"] },
    replies: 6,
  },
  {
    id: "p14",
    by: "tunde",
    type: "discuss",
    text: "Return and restitution keep getting discussed as a legal question. What about the living casters who still know how it's made? That part rarely makes the headline.",
    photo: "carvedGroup",
    circle: "traditional-arts",
    at: "1 week ago",
    reactions: { discuss: ["efua", "nandi", "zuri"], appreciate: ["amara"] },
    replies: 21,
  },
];

export const postsFor = (circleId: string) => POSTS.filter((p) => p.circle === circleId);
