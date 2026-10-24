import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/* ---------- Play Together: the game is a comfortable reason to connect ---------- */

export const PLAY_PURPOSES = [
  { id: "fun", label: "Have fun together", glyph: "play" },
  { id: "reconnect", label: "Reconnect with old friends", glyph: "↺" },
  { id: "know", label: "Know one another better", glyph: "people" },
  { id: "welcome", label: "Welcome a new member", glyph: "invite" },
  { id: "team", label: "Strengthen a team", glyph: "team" },
  { id: "ideas", label: "Generate creative ideas", glyph: "spark" },
  { id: "tension", label: "Gently resolve tension", glyph: "≈" },
  { id: "culture", label: "Learn about art and culture", glyph: "creative" },
  { id: "support", label: "Support someone who feels isolated", glyph: "wellbeing" },
] as const;
export type PlayPurpose = (typeof PLAY_PURPOSES)[number]["id"];

export const PLAY_MODES = [
  { id: "live", label: "Live Play", body: "Everyone joins at once, with voice, video or text." },
  { id: "slow", label: "Slow Play", body: "Answer whenever you're free. No rush." },
  { id: "person", label: "In-person Mode", body: "One device leads a game for people in the same room." },
  { id: "team", label: "Team Mode", body: "Small teams solve or create something together." },
  { id: "pair", label: "Private Pair", body: "Two people: friends, mentors, partners or family." },
] as const;
export type PlayMode = (typeof PLAY_MODES)[number]["id"];

export const PLAY_AUDIENCES = ["Individual friends", "A private Cliq", "KinCircle members", "Existing collaborators", "Family members", "People from a Presence Room", "A meaningful match (with consent)"];

export const GAME_CATEGORIES = [
  { id: "icebreakers", label: "Icebreakers", purpose: "Reduce social pressure" },
  { id: "reconnection", label: "Reconnection", purpose: "Revive dormant relationships" },
  { id: "know", label: "Know Me Better", purpose: "Build emotional understanding" },
  { id: "creative", label: "Creative Play", purpose: "Generate ideas together" },
  { id: "art", label: "Art Discovery", purpose: "Explore art and culture" },
  { id: "collab", label: "Collaboration", purpose: "Understand working styles" },
  { id: "family", label: "Family", purpose: "Preserve memories" },
  { id: "friendship", label: "Friendship", purpose: "Create warmth and laughter" },
  { id: "couples", label: "Couples", purpose: "Encourage thoughtful conversation" },
  { id: "team", label: "Team Trust", purpose: "Improve cooperation" },
  { id: "wellbeing", label: "Wellbeing", purpose: "Gentle expression" },
  { id: "exchange", label: "Cultural Exchange", purpose: "Learn across backgrounds" },
] as const;
export type GameCategory = (typeof GAME_CATEGORIES)[number]["id"];

export type Game = {
  id: string;
  name: string;
  category: GameCategory;
  purposes: PlayPurpose[];
  players: string;
  minutes: number;
  modes: PlayMode[];
  photo: PhotoKey;
  blurb: string;
  cards: string[];
  reflection: string[];
  /** Made by a member rather than Akines. */
  by?: PersonId;
  mine?: boolean;
};

const REFLECT = ["What surprised you?", "What made you laugh?", "Did you learn something new about someone?", "Is there something you'd like to keep talking about?"];

export const GAMES: Game[] = [
  {
    id: "two-truths",
    name: "Two truths and a story",
    category: "icebreakers",
    purposes: ["fun", "welcome", "know"],
    players: "3–8",
    minutes: 20,
    modes: ["live", "person", "slow"],
    photo: "talkLaugh",
    blurb: "Share two true things and one story. The group guesses which is which, then asks about the story.",
    cards: ["Two truths and a story about your first job.", "Two truths and a story about a place you've lived.", "Two truths and a story about a skill you learned.", "Two truths and a story about a teacher you remember."],
    reflection: REFLECT,
  },
  {
    id: "remember",
    name: "Do you remember when…?",
    category: "reconnection",
    purposes: ["reconnect", "fun"],
    players: "2–8",
    minutes: 30,
    modes: ["live", "slow"],
    photo: "photoAlbum",
    blurb: "Prompts that pull old shared memories back into the conversation, gently and with laughter.",
    cards: ["The first time we all met. Who remembers it differently?", "A day that went completely wrong, and why it's funny now.", "Something one of us said that the rest still quote.", "A place we always ended up, and what it smelled like."],
    reflection: [...REFLECT.slice(0, 2), "Would you like to turn one of tonight's memories into a private group story?"],
  },
  {
    id: "supported",
    name: "What makes you feel supported?",
    category: "know",
    purposes: ["know", "support"],
    players: "2–6",
    minutes: 25,
    modes: ["live", "slow", "pair"],
    photo: "talkTwo",
    blurb: "Low-pressure questions about how each of you likes to be encouraged, and what doesn't help.",
    cards: ["A small thing someone did that meant a lot to you.", "What do you need on a hard day?", "How do you prefer to receive feedback?", "Something you wish people asked you more often."],
    reflection: REFLECT,
  },
  {
    id: "unfinished-artwork",
    name: "Build a story together",
    category: "creative",
    purposes: ["ideas", "fun"],
    players: "3–6",
    minutes: 30,
    modes: ["live", "team", "slow"],
    photo: "studioEasel",
    blurb: "One person starts a sentence. Each player adds one line until the story feels finished.",
    cards: ["Start with one sentence. Pass it on.", "Add a twist that changes the mood.", "Bring in someone nobody expected.", "Give it a title nobody would guess."],
    reflection: [...REFLECT.slice(0, 2), "Should this become a real piece in the Collaboration Studio?"],
  },
  {
    id: "story-behind",
    name: "Guess the story behind the photo",
    category: "art",
    purposes: ["culture", "fun", "know"],
    players: "2–8",
    minutes: 20,
    modes: ["live", "slow", "person"],
    photo: "bronzeHead",
    blurb: "Someone shares a photo without context. Everyone guesses the story, then the real one is revealed.",
    cards: ["An old family photo: who are these people?", "A street scene: what happened just before this?", "A messy desk: whose is it, and what are they working on?", "A table set for many: what is being celebrated?"],
    reflection: REFLECT,
  },
  {
    id: "ten-decisions",
    name: "Plan an event in ten decisions",
    category: "collab",
    purposes: ["team", "ideas"],
    players: "3–6",
    minutes: 40,
    modes: ["live", "team"],
    photo: "galleryHall",
    blurb: "A pretend event, planned together in ten quick rounds. You'll learn how each person likes to work.",
    cards: ["Decision 1: the theme, in five words.", "Decision 2: the first thing a guest sees.", "Decision 3: the music and the mood.", "Decision 4: one thing you'd fight to include."],
    reflection: [...REFLECT.slice(0, 2), "What did you learn about how each of you decides?"],
  },
  {
    id: "family-story",
    name: "Who remembers this family story?",
    category: "family",
    purposes: ["reconnect", "know"],
    players: "2–10",
    minutes: 30,
    modes: ["slow", "live", "person"],
    photo: "journalWindow",
    blurb: "Each person tells their version of the same family story. The differences are the best part.",
    cards: ["The wedding story everyone tells.", "Grandma's kitchen on a Sunday.", "The journey someone made to get here.", "An object in the house with a history."],
    reflection: [...REFLECT.slice(0, 2), "Would you like to save this story to a group journal?"],
  },
  {
    id: "most-likely",
    name: "Most likely to…",
    category: "friendship",
    purposes: ["fun", "reconnect"],
    players: "3–8",
    minutes: 15,
    modes: ["live", "person"],
    photo: "talkYoung",
    blurb: "Kind, funny “most likely to” prompts. No votes are kept and no one is the punchline.",
    cards: ["Most likely to start a business in their living room.", "Most likely to make friends with a stranger on a bus.", "Most likely to cry at a wedding.", "Most likely to remember everyone's birthday."],
    reflection: REFLECT,
  },
  {
    id: "experience-together",
    name: "What should we experience together?",
    category: "couples",
    purposes: ["know", "fun"],
    players: "2",
    minutes: 20,
    modes: ["pair", "slow"],
    photo: "talkCafe",
    blurb: "Gentle prompts for two people to imagine and plan things they'd love to do together.",
    cards: ["A place you'd like to see together.", "A small weekly ritual we could start.", "Something you've never told me you wanted to try.", "A memory we haven't made yet."],
    reflection: REFLECT,
  },
  {
    id: "impossible-brief",
    name: "Solve the impossible brief",
    category: "team",
    purposes: ["team", "ideas", "tension"],
    players: "4–8",
    minutes: 30,
    modes: ["team", "live"],
    photo: "collabArt",
    blurb: "An absurd creative brief that's only solvable if everybody's strength is used.",
    cards: ["Launch a product with no money and one week.", "Plan a concert where no one can make sound.", "Plan a party for 50 people in a tiny flat.", "Sell silence at a market."],
    reflection: [...REFLECT.slice(0, 2), "Whose idea unlocked it? Say thank you."],
  },
  {
    id: "colour-today",
    name: "Choose a colour for today",
    category: "wellbeing",
    purposes: ["support", "know"],
    players: "2–6",
    minutes: 10,
    modes: ["slow", "live", "pair"],
    photo: "calmWater",
    blurb: "Pick a colour for how you are, and say as much or as little as you like. Skipping is always fine.",
    cards: ["A colour for how you woke up.", "A colour for what you need today.", "A colour you'd give someone in this circle.", "A colour for tomorrow."],
    reflection: ["How did it feel to name it?", "Is there anything you'd like support with?"],
  },
  {
    id: "tradition",
    name: "A tradition I want you to understand",
    category: "exchange",
    purposes: ["culture", "know", "welcome"],
    players: "2–8",
    minutes: 30,
    modes: ["live", "slow"],
    photo: "kenteVest",
    blurb: "Each person shares one tradition from where they're from, and why it matters to them.",
    cards: ["A food that only tastes right on one day of the year.", "Something your family does that outsiders find strange.", "A song, a dance or a cloth with a meaning.", "A tradition you'd like to change, or keep forever."],
    reflection: REFLECT,
  },
  {
    id: "city-eyes",
    name: "The City Through My Eyes",
    category: "creative",
    purposes: ["ideas", "culture", "know"],
    players: "4",
    minutes: 45,
    modes: ["slow", "live"],
    photo: "talkGroup",
    blurb: "Everyone gets the same photo challenge. The group combines the images into one shared visual story.",
    cards: ["Share a photograph that represents home without showing a building.", "A photograph of a sound.", "Something that has been in your city longer than you.", "A colour that only your city has."],
    reflection: [...REFLECT.slice(0, 2), "Move this story into a shared project?"],
    by: "wanjiru",
  },
];

/* ---------- Game nights happening now, and relationship outcomes ---------- */

export type GameSession = { id: string; game: string; title: string; host: PersonId; players: PersonId[]; mode: PlayMode; when: string; why: string; live?: boolean };

export const GAME_SESSIONS: GameSession[] = [
  { id: "uni-night", game: "remember", title: "How Well Do We Remember?", host: "kwame", players: ["kwame", "amara", "tunde", "efua"], mode: "live", when: "Tonight · 20:00", why: "Kwame invited you because he'd like the university group to reconnect and share some good memories.", live: true },
  { id: "welcome-chidi", game: "two-truths", title: "Welcome, Chidi!", host: "nandi", players: ["nandi", "chidi", "thandi", "zuri"], mode: "live", when: "Sat · 18:00", why: "Nandi is welcoming Chidi to the Curators' circle and thought you'd make him feel at home." },
  { id: "city", game: "city-eyes", title: "The City Through My Eyes", host: "wanjiru", players: ["wanjiru", "ayo", "fatou", "amara"], mode: "slow", when: "Slow play · 2 of 4 shared", why: "Wanjiru invited you because you collect photography and know Lagos well." },
];

export const PLAY_OUTCOMES = [
  { value: "38", label: "Shared moments created" },
  { value: "6", label: "Friends reconnected" },
  { value: "4", label: "Collaborations started" },
  { value: "3", label: "Group traditions formed" },
];

export const GAME_SAFEGUARDS = [
  "Skip without explanation",
  "Pause or leave quietly",
  "No forced personal disclosure",
  "Private reporting",
  "Host moderation controls",
  "Consent before saving responses",
  "No public humiliation or popularity scores",
  "Extra care for wellbeing games",
];

export const AFTER_GAME = [
  { id: "memory", label: "Save a shared memory", glyph: "save" },
  { id: "private", label: "Continue privately", glyph: "message", href: "/messages" },
  { id: "again", label: "Schedule another game", glyph: "↺" },
  { id: "circle", label: "Start a KinCircle", glyph: "circle", href: "/circles/new" },
  { id: "collab", label: "Create a collaboration", glyph: "collaborate", href: "/collaborate" },
  { id: "journal", label: "Add to a group journal", glyph: "journal", href: "/journal" },
];

/** A member-built or AI-drafted game, saved locally. */
export type GameDraft = {
  name: string;
  purpose: PlayPurpose;
  category: GameCategory;
  players: number;
  mode: PlayMode;
  cards: string[];
  turns: "round" | "free" | "host";
  privacy: "invited" | "circle" | "cliq";
  end: "cards" | "time" | "host";
  reflection: string[];
  reuse: "me" | "invited" | "community";
};

/**
 * The AI Game Creator, simulated: turns a plain-English request into an editable draft.
 * It reads a few cues from the request; the host always reviews before inviting anyone.
 */
export function draftGameFromPrompt(prompt: string): GameDraft & { warmups: string[] } {
  const p = prompt.toLowerCase();
  const num = Number(p.match(/\b(\d{1,2})\b/)?.[1] ?? (p.match(/\b(two|three|four|five|six|seven|eight)\b/)?.[1] ? ["two", "three", "four", "five", "six", "seven", "eight"].indexOf(p.match(/\b(two|three|four|five|six|seven|eight)\b/)![1]) + 2 : 5));
  const collab = /collab|exhibit|project|work together/.test(p);
  const reconnect = /old friends|reconnect|university|school|haven't spoken/.test(p);
  const family = /family|grand|cousin/.test(p);
  const purpose: PlayPurpose = collab ? "ideas" : reconnect ? "reconnect" : family ? "know" : /new|just met|welcome/.test(p) ? "welcome" : "fun";
  const category: GameCategory = collab ? "collab" : reconnect ? "reconnection" : family ? "family" : "icebreakers";
  const name = collab ? "Making Before We Make" : reconnect ? "Back Where We Left Off" : family ? "Stories We Share" : "Gentle Beginnings";
  return {
    name,
    purpose,
    category,
    players: Math.min(Math.max(num, 2), 12),
    mode: /slow|whenever|busy|different time/.test(p) ? "slow" : "live",
    warmups: [
      "Introduce yourself with an object you can reach right now.",
      "What drew you here today?",
      "One thing you're curious about this month.",
      "A piece of art, song or place that stayed with you.",
      "What do you need from this group to feel comfortable?",
      "A small win from this week.",
    ],
    cards: collab
      ? ["Describe a work you're proud of in one sentence.", "Which part of making do you love most, and avoid most?", "Pitch a tiny exhibition in 60 seconds.", "Name one skill someone else here has that you'd love to learn."]
      : ["Share a memory connected to the word “home”.", "What made you laugh this week?", "Something you've changed your mind about.", "A question you'd like this group to answer."],
    turns: "round",
    privacy: "invited",
    end: "cards",
    reflection: ["What surprised you?", "What did you learn about someone?", collab ? "Would you like to open a Collaboration Studio together?" : "Would you like to play again?"],
    reuse: "me",
  };
}
