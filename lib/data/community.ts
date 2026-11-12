import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/* ---------- Connection Intent Engine ---------- */
export type Intent = {
  id: string;
  label: string;
  headline: string;
  body: string;
  cta: { label: string; href: string };
  also: { label: string; href: string };
  photo: PhotoKey;
};

export const INTENTS: Intent[] = [
  { id: "inspiration", label: "I want to see how others do their work", headline: "Look inside other people's working lives.", body: "Read this week's open journals: first tries, doubts and small wins from people in every line of work.", cta: { label: "Read work journals", href: "/make-sell/journal" }, also: { label: "Visit an Open door", href: "/explore/studio-visits" }, photo: "studioBusy" },
  { id: "blocked", label: "I feel stuck or burnt out", headline: "Start smaller than a big plan.", body: "A two-minute breathing pause, a low-stakes prompt, and a way to check in on how you are, privately.", cta: { label: "Open Wellbeing", href: "/wellbeing/reflect" }, also: { label: "Take the burnout check", href: "/care" }, photo: "calmBench" },
  { id: "heals", label: "I want to write about my life", headline: "Your life already has a story.", body: "Write about where you've been, what changed and who helped. Keep it private, or share it with your circles.", cta: { label: "Write a journal entry", href: "/make-sell/journal" }, also: { label: "Read members' stories", href: "/explore/stories" }, photo: "journalPen" },
  { id: "identity", label: "I'm far from home", headline: "Sit with people who understand.", body: "The Diaspora circle meets in small rooms. Nobody needs the right answers, only an honest one.", cta: { label: "Join the Diaspora circle", href: "/connect/kincircle" }, also: { label: "Tonight's room on home", href: "/connect/rooms" }, photo: "kincircleHero" },
  { id: "lonely", label: "I'm lonely and want to talk", headline: "Six chairs. One conversation. Tonight.", body: "No audience, no recording, no followers. Take a seat in a Presence Room and just talk.", cta: { label: "Find a seat", href: "/connect/rooms" }, also: { label: "Meet kindred people", href: "/connect/discover/suggestions" }, photo: "talkTwo" },
  { id: "artists", label: "I want to meet people like me", headline: "Meet people through what you share.", body: "Introductions come with a reason: the things you both care about, do or have lived through. Not a wall of profiles.", cta: { label: "See who you'd click with", href: "/connect/discover/suggestions" }, also: { label: "Browse KinCircles", href: "/connect/kincircle" }, photo: "talkLaugh" },
  { id: "history", label: "I want to learn something new", headline: "Learn from someone who's done it.", body: "Classes, mentors and members happy to share what they know. Create AI can help you find the right one.", cta: { label: "Browse classes", href: "/explore" }, also: { label: "Ask in a Presence Room", href: "/connect/rooms" }, photo: "notebookWhite" },
  { id: "fashion", label: "I'm starting a business", headline: "Open your doors.", body: "Set up a store to sell your products or services in a few minutes, and start taking your first orders.", cta: { label: "Open your store", href: "/make-sell/store" }, also: { label: "Ask for advice in a Banter", href: "/community/banter" }, photo: "talkCafe" },
  { id: "collaborators", label: "I'm looking for collaborators", headline: "Make something neither of you could make alone.", body: "Clear roles and fair credit agreed up front, and a shared room for the work.", cta: { label: "Explore collaborations", href: "/collaborate" }, also: { label: "See open calls", href: "/collaborate/discover" }, photo: "talkGroup" },
];

/* ---------- Art Presence Rooms ---------- */
export type Room = {
  id: string;
  title: string;
  host: PersonId;
  when: string;
  status: "soon" | "live" | "later";
  blurb: string;
  seated: PersonId[];
  photo: PhotoKey;
  tag: string;
  /** Rooms a member creates: who can come in, which circle it belongs to, and their own prompts. */
  mine?: boolean;
  visibility?: "public" | "circle" | "private";
  circle?: string;
  prompts?: string[];
  approve?: boolean;
};

/* ---------- KinCircles ---------- */
export type Circle = {
  id: string;
  name: string;
  blurb: string;
  members: number;
  active: number;
  photo: PhotoKey | (string & {});
  joined?: boolean;
  starter: string;
};

/** The product design's circles (Community Home, "Your circles"): both joined. */
export const CIRCLES: Circle[] = [
  { id: "textiles", name: "Textiles & Adire", blurb: "Makers working with cloth, dye and pattern.", members: 416, active: 8, photo: "/kin/design/home/feed/circle-textiles.jpg", joined: true, starter: "Seven dye baths in: what are you chasing this year?" },
  { id: "poetry", name: "Poetry and Wine talk", blurb: "Poems, honest conversations and a glass of wine.", members: 20, active: 4, photo: "/kin/design/home/feed/circle-poetry.jpg", joined: true, starter: "What poem would you bring to the table, and what story would you tell behind it?" },
];

/* ---------- Shared creation ---------- */
export type Collab = {
  id: string;
  title: string;
  route: string;
  medium: string;
  blurb: string;
  photo: PhotoKey;
  progress: number;
  stage: 0 | 1 | 2 | 3;
  makers: PersonId[];
  next: string;
};

export const STAGES = ["Spark", "Sketch", "Making", "Showing"] as const;

export type OpenCall = {
  id: string;
  title: string;
  by: PersonId;
  org: string;
  city: string;
  days: number;
  blurb: string;
  tags: string[];
  photo: PhotoKey;
};

/* ---------- Wellbeing ---------- */
export type Mood = { id: string; word: string; hue: string; text: string; reply: string };

/* ---------- Studio visits ---------- */
export type StudioVisit = { id: string; artist: PersonId; place: string; mode: "Live" | "Virtual" | "360°" | "VR"; when: string; photo: PhotoKey; blurb: string };
