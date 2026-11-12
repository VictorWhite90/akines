import type { IconName } from "@/components/ui/Icon";
import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/**
 * Akines's Home feed, section 8–9 of the brief: typed posts (not one generic "post"),
 * and reactions that are a gateway to human interaction rather than a popularity count.
 */
export type PostType = "share" | "ask" | "discuss" | "invite" | "help" | "collaborate";

export const POST_TYPES: Record<PostType, { icon: IconName; label: string; verb: string; placeholder: string }> = {
  share: { icon: "share", label: "Share", verb: "shared", placeholder: "Share something from your week…" },
  ask: { icon: "ask", label: "Ask", verb: "asked", placeholder: "Does anyone know a good mechanic in Lagos?" },
  discuss: { icon: "discuss", label: "Discuss", verb: "started a discussion", placeholder: "Is remote work better for young people starting out?" },
  invite: { icon: "invite", label: "Invite", verb: "invited people", placeholder: "Anyone up for a walk on Saturday morning?" },
  help: { icon: "help", label: "Help", verb: "asked for help", placeholder: "I need advice preparing for my first interview." },
  collaborate: { icon: "collaborate", label: "Collaborate", verb: "is looking for collaborators", placeholder: "I'm starting a small project and looking for…" },
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
  photos?: string[];
  circle?: string;
  collab?: string;
  at: string;
  reactions: Partial<Record<ReactionKey, PersonId[]>>;
  replies: number;
};

/** The product design's circle posts (Community Home, "Your circles' feed"). */
export const POSTS: Post[] = [
  {
    id: "ayo",
    by: "ayo-balogun",
    type: "share",
    text: "Seven dye baths in, and the blue finally came out the way I've been chasing all year. Hung it in the yard for an hour just to watch the light change it.",
    photos: ["/kin/design/home/feed/post1-a.jpg", "/kin/design/home/feed/post1-b.jpg"],
    circle: "textiles",
    at: "2h",
    reactions: { appreciate: ["folake", "chuka"], inspired: ["ngozi", "tunde-bakare", "amara-okafor"] },
    replies: 2,
  },
  {
    id: "amara",
    by: "amara-okafor",
    type: "discuss",
    text: "There's something about a glass of wine, a room full of honest conversations, and poetry that says the things we struggle to admit out loud. Sometimes, the words of a stranger feel like they were written from the pages of our own lives.\nIf we hosted a poetry and wine evening, what poem would you bring to the table, and what story would you tell behind it?",
    photos: ["/kin/design/home/feed/post2-a.jpg", "/kin/design/home/feed/post2-b.jpg", "/kin/design/home/feed/post2-c.jpg"],
    circle: "poetry",
    at: "3h",
    reactions: { appreciate: ["folake", "ngozi", "chuka"], interesting: ["tunde-bakare", "yusuf-umar"] },
    replies: 12,
  },
  {
    id: "yusuf",
    by: "yusuf-umar",
    type: "discuss",
    text: "One thing I'm learning is that collaboration isn't about finding people who think exactly like you. It's about finding people who can challenge your ideas without making you feel you have to abandon them.\nHow do you know when a creative partnership is worth pursuing?",
    at: "5h",
    reactions: { interesting: ["ngozi", "chuka", "folake"] },
    replies: 0,
  },
];

export const postsFor = (circleId: string) => POSTS.filter((p) => p.circle === circleId);
