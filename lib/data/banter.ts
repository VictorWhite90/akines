import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/* ---------- Banter: light, intentional conversation with people who matter ---------- */

export const BANTER_FORMATS = [
  { id: "ask", label: "Ask something", glyph: "?" },
  { id: "thought", label: "Share a thought", glyph: "✎" },
  { id: "debate", label: "Debate playfully", glyph: "⇄" },
  { id: "wip", label: "Show what you're working on", glyph: "✦" },
  { id: "story", label: "Tell a story", glyph: "❝" },
  { id: "photo", label: "Share a photograph", glyph: "▣" },
  { id: "voice", label: "Drop a voice note", glyph: "◉" },
  { id: "predict", label: "Make a prediction", glyph: "↗" },
  { id: "celebrate", label: "Celebrate someone", glyph: "✺" },
  { id: "honest", label: "Request an honest opinion", glyph: "◐" },
] as const;
export type BanterFormat = (typeof BANTER_FORMATS)[number]["id"];

export const BANTER_AUDIENCES = [
  { id: "one", label: "One person", body: "A private Banter with someone you trust." },
  { id: "selected", label: "Selected people", body: "Hand-pick who hears it." },
  { id: "circle", label: "One KinCircle", body: "Everyone in a circle you belong to." },
  { id: "circles", label: "Several related KinCircles", body: "Circles that share an interest." },
  { id: "community", label: "The wider Akines community", body: "Best for safe, constructive subjects." },
] as const;
export type BanterAudience = (typeof BANTER_AUDIENCES)[number]["id"];

/** The mood tells people how to respond, which prevents most misunderstandings. */
export const BANTER_MOODS = [
  { id: "fun", label: "Just for fun", tone: "bg-ochre-200 text-ink-900", hint: "Keep it light." },
  { id: "honest", label: "Honest opinions", tone: "bg-ink-100 text-ink-800", hint: "Constructive criticism is welcome." },
  { id: "debate", label: "Friendly debate", tone: "bg-clay-100 text-clay-700", hint: "Disagree warmly. Nobody “wins”." },
  { id: "think", label: "Help me think", tone: "bg-moss-100 text-moss-700", hint: "Questions help more than answers." },
  { id: "encourage", label: "Encouragement needed", tone: "bg-rose-300/40 text-ink-900", hint: "Not the moment for harsh critique." },
  { id: "feedback", label: "Creative feedback", tone: "bg-sand-200 text-ink-900", hint: "Be specific about the work." },
  { id: "sensitive", label: "Sensitive subject", tone: "bg-ruby-100 text-ruby-700", hint: "Go gently. Listen first." },
  { id: "celebrate", label: "Celebrate with me", tone: "bg-gold-300/50 text-ink-900", hint: "Share the joy." },
] as const;
export type BanterMood = (typeof BANTER_MOODS)[number]["id"];

export const BANTER_LIFETIMES = [
  { id: "24h", label: "24 hours", short: "Ends in 24h" },
  { id: "3d", label: "Three days", short: "Ends in 3 days" },
  { id: "1w", label: "One week", short: "Ends in a week" },
  { id: "keep", label: "Keep inside the KinCircle", short: "Kept in circle" },
  { id: "manual", label: "Until I close it", short: "Open until closed" },
] as const;
export type BanterLifetime = (typeof BANTER_LIFETIMES)[number]["id"];

export const BANTER_TYPES = [
  { id: "everyday", label: "Everyday" },
  { id: "creative", label: "Creative" },
  { id: "culture", label: "Culture" },
  { id: "debate", label: "Friendly debate" },
  { id: "memory", label: "Memory" },
  { id: "collab", label: "Collaboration" },
  { id: "support", label: "Support" },
  { id: "celebration", label: "Celebration" },
] as const;
export type BanterType = (typeof BANTER_TYPES)[number]["id"];

export type BanterReply = {
  id: string;
  by: PersonId;
  kind: "text" | "voice" | "photo";
  text?: string;
  /** Voice-note length, e.g. "0:42". */
  length?: string;
  photo?: PhotoKey;
  ago: string;
};

export type Banter = {
  id: string;
  by: PersonId;
  format: BanterFormat;
  type: BanterType;
  mood: BanterMood;
  audience: BanterAudience;
  audienceLabel: string;
  lifetime: BanterLifetime;
  prompt: string;
  photo?: PhotoKey;
  ago: string;
  reactions: Record<string, number>;
  replies: BanterReply[];
  /** Set when Akines notices a shared intention forming. */
  spark?: { text: string; suggestion: string; people: PersonId[] };
  closed?: boolean;
  mine?: boolean;
  /** A quick poll attached to the Banter. */
  poll?: { options: string[]; votes: number[] };
  /** A song or short video shared with it (a label, in the prototype). */
  media?: { kind: "music" | "video"; label: string };
  /** People who said “I want to explore this”. Resonance, not likes. */
  resonance?: PersonId[];
  /** How many people received it. */
  reach?: number;
};

export const REACTIONS = ["😂", "🔥", "🤔", "❤️", "👏"] as const;

export const TODAYS_BANTER = "Show us something unfinished that you are afraid to share.";

export const BANTERS: Banter[] = [
  {
    id: "unfinished",
    by: "kwame",
    format: "honest",
    type: "creative",
    mood: "honest",
    audience: "circle",
    audienceLabel: "Painters' KinCircle",
    lifetime: "3d",
    prompt: "Be honest: should I keep this painting unfinished, or am I simply tired?",
    photo: "paintingWoman",
    ago: "2h",
    reactions: { "🤔": 6, "❤️": 4, "🔥": 2 },
    replies: [
      { id: "r1", by: "zuri", kind: "text", text: "The unfinished section is actually the most emotionally powerful part. Leave the left edge open.", ago: "1h" },
      { id: "r2", by: "tunde", kind: "voice", length: "0:48", text: "Why the empty space works, from a sculptor's point of view.", ago: "54m" },
      { id: "r3", by: "ayo", kind: "photo", photo: "textileHang", text: "I left this panel half-dyed on purpose. Absence carries memory.", ago: "30m" },
    ],
    resonance: ["zuri", "tunde", "ayo"],
    reach: 7,
    spark: {
      text: "Kwame, Zuri, Tunde and Ayo all keep returning to absence and memory in their work.",
      suggestion: "The Art of Absence",
      people: ["kwame", "zuri", "tunde", "ayo"],
    },
  },
  {
    id: "currency",
    by: "tunde",
    format: "debate",
    type: "culture",
    mood: "debate",
    audience: "circle",
    audienceLabel: "African Art KinCircle",
    lifetime: "1w",
    prompt: "Which Nigerian artist would you trust to redesign the national currency, and why?",
    poll: { options: ["A textile artist", "A painter", "A sculptor", "A photographer"], votes: [9, 4, 3, 2] },
    resonance: ["amara", "efua"],
    reach: 11,
    ago: "5h",
    reactions: { "😂": 9, "🔥": 7, "🤔": 3 },
    replies: [
      { id: "c1", by: "amara", kind: "text", text: "Someone who works in adire. Money should feel like cloth your grandmother kept.", ago: "4h" },
      { id: "c2", by: "efua", kind: "text", text: "Respectfully, the historian in me says: anyone who'll put women traders on the notes.", ago: "3h" },
      { id: "c3", by: "ayo", kind: "voice", length: "1:12", ago: "2h" },
    ],
  },
  {
    id: "markets",
    by: "wanjiru",
    format: "ask",
    type: "collab",
    mood: "think",
    audience: "circles",
    audienceLabel: "Photography + Archives circles",
    lifetime: "1w",
    prompt: "Would anyone be interested in documenting disappearing markets across West Africa?",
    photo: "talkGroup",
    ago: "1d",
    reactions: { "🔥": 14, "❤️": 6 },
    replies: [
      { id: "m1", by: "efua", kind: "text", text: "I have oral-history notes from Kumasi's Kejetia market. Count me in.", ago: "20h" },
      { id: "m2", by: "fatou", kind: "text", text: "Dakar's Sandaga is half gone already. I can cover textiles and tailors.", ago: "18h" },
      { id: "m3", by: "nandi", kind: "text", text: "I'd host a room for anyone who wants to talk through consent with traders first.", ago: "12h" },
    ],
    resonance: ["efua", "fatou", "nandi", "tunde"],
    reach: 14,
    spark: {
      text: "This Banter has developed a clear shared intention. Five people bring complementary skills: photography, oral history, textiles and hosting.",
      suggestion: "West African Markets",
      people: ["wanjiru", "efua", "fatou", "nandi"],
    },
  },
  {
    id: "proverb",
    by: "efua",
    format: "story",
    type: "memory",
    mood: "fun",
    audience: "community",
    audienceLabel: "Wider Akines community",
    lifetime: "3d",
    prompt: "Which African proverb has become more meaningful as you grew older?",
    ago: "1d",
    reactions: { "❤️": 21, "🤔": 5 },
    replies: [
      { id: "p1", by: "thandi", kind: "text", text: "“Umuntu ngumuntu ngabantu.” I used to think it was a slogan. Now it's how I run my studio.", ago: "22h" },
      { id: "p2", by: "chidi", kind: "text", text: "“When the music changes, so does the dance.” Art school taught me that one the hard way.", ago: "19h" },
    ],
  },
  {
    id: "blocked",
    by: "chidi",
    format: "ask",
    type: "support",
    mood: "encourage",
    audience: "selected",
    audienceLabel: "4 people",
    lifetime: "24h",
    prompt: "I have been creatively blocked for two weeks. What usually helps you restart?",
    ago: "3h",
    reactions: { "❤️": 8 },
    replies: [
      { id: "b1", by: "thandi", kind: "text", text: "Make something useless on purpose. A bowl nobody will ever see. The pressure goes.", ago: "2h" },
      { id: "b2", by: "nandi", kind: "voice", length: "0:35", ago: "1h" },
    ],
  },
  {
    id: "mariam",
    by: "zuri",
    format: "celebrate",
    type: "celebration",
    mood: "celebrate",
    audience: "circle",
    audienceLabel: "Curators' KinCircle",
    lifetime: "24h",
    prompt: "Fatou's first international exhibition opens today in Paris. Leave her a message! 🎉",
    photo: "galleryHall",
    ago: "6h",
    reactions: { "👏": 18, "❤️": 12, "🔥": 6 },
    replies: [{ id: "f1", by: "leila", kind: "text", text: "From Casablanca with so much pride. Wear the indigo coat.", ago: "5h" }],
  },
  {
    id: "explain",
    by: "leila",
    format: "debate",
    type: "debate",
    mood: "debate",
    audience: "community",
    audienceLabel: "Wider Akines community",
    lifetime: "3d",
    prompt: "Should artists explain their work, or should the art speak for itself?",
    poll: { options: ["Explain it", "Let it speak", "Explain the making only"], votes: [5, 8, 11] },
    reach: 40,
    ago: "2d",
    reactions: { "🤔": 16, "🔥": 4 },
    replies: [
      { id: "e1", by: "kwame", kind: "text", text: "Explain the making, never the meaning.", ago: "1d" },
      { id: "e2", by: "amara", kind: "text", text: "As a collector: I want the story, but I want to find the meaning myself.", ago: "1d" },
    ],
  },
  {
    id: "happy",
    by: "thandi",
    format: "thought",
    type: "everyday",
    mood: "fun",
    audience: "circle",
    audienceLabel: "Ceramics KinCircle",
    lifetime: "24h",
    prompt: "What is one small thing that made you happy today?",
    media: { kind: "music", label: "Fela Kuti · Water No Get Enemy" },
    reach: 9,
    photo: "clayBowl",
    ago: "4h",
    reactions: { "❤️": 11 },
    replies: [{ id: "h1", by: "ayo", kind: "text", text: "The indigo vat finally turned that copper colour on top. Small victory.", ago: "3h" }],
  },
];

/* ---------- Banter Now: a short, spontaneous, equal conversation ---------- */

export type BanterNow = {
  id: string;
  topic: string;
  host: PersonId;
  people: PersonId[];
  minutes: number;
  context: string;
  live: boolean;
  startsIn?: string;
};

export const BANTER_NOW: BanterNow[] = [
  { id: "ai-art", topic: "Is AI helping or damaging African art?", host: "tunde", people: ["tunde", "kwame", "zuri", "wanjiru", "chidi"], minutes: 20, context: "Creative KinCircle", live: true },
  { id: "first-sale", topic: "The first piece you ever sold, and how it felt", host: "thandi", people: ["thandi", "ayo", "fatou"], minutes: 15, context: "Makers' Cliq", live: true },
  { id: "diaspora", topic: "What does “home” look like in your work?", host: "zuri", people: ["zuri", "leila", "efua", "amara"], minutes: 25, context: "Diaspora circle", live: false, startsIn: "in 40 min" },
];

export const BANTER_NOW_RULES = [
  "Two to eight invited people",
  "No public audience",
  "No follower counts",
  "No permanent speaker stage",
  "Equal participation",
  "A clear topic and duration",
  "Not recorded by default",
  "A simple closing reflection",
];

/** Words that can read as personal rather than playful. Used by the gentle tone check. */
export const TONE_FLAGS = ["stupid", "idiot", "ugly", "useless", "pathetic", "dumb", "shut up", "hate", "worst", "trash", "loser"];

/** Sweeping judgements about a whole group, which read as attacks even without rude words. */
const SWEEPING = [
  /\b(all|every|those|these)\b[^.?!]{0,40}\b(need to|should|must)\b[^.?!]{0,20}\b(go|leave|replaced|removed|banned|stop|quit)\b/i,
  /\b(are|is)\s+not\s+(real\s+)?(professionals?|artists?|serious|talented|good enough)\b/i,
  /\b(no|none of the)\s+\w+\s+(can|knows?|is|are)\b/i,
];

export type ToneIssue = "harsh" | "sweeping" | null;

/** What, if anything, might make this land badly. */
export const toneIssue = (text: string): ToneIssue => {
  const t = text.toLowerCase();
  if (TONE_FLAGS.some((w) => t.includes(w))) return "harsh";
  if (SWEEPING.some((re) => re.test(text))) return "sweeping";
  return null;
};

export const toneCheck = (text: string) => toneIssue(text) !== null;

/** Shared look for each mood: the colour a Banter card takes on. */
export const MOOD_LOOK: Record<BanterMood, { bg: string; ink: string }> = {
  fun: { bg: "#ffb000", ink: "#14121a" },
  honest: { bg: "#1f1b2b", ink: "#ffffff" },
  debate: { bg: "#e5007e", ink: "#ffffff" },
  think: { bg: "#2547d0", ink: "#ffffff" },
  encourage: { bg: "#00a86b", ink: "#ffffff" },
  feedback: { bg: "#ff6b1a", ink: "#ffffff" },
  sensitive: { bg: "#7b2ff7", ink: "#ffffff" },
  celebrate: { bg: "#ffd23f", ink: "#14121a" },
};

/** How much of a Banter's life is left, for the ring and the label. Mock values until the backend tracks real time. */
export const lifeLeft = (b: { lifetime: BanterLifetime; closed?: boolean }): { label: string; pct: number } => {
  if (b.closed) return { label: "Closed", pct: 0 };
  return (
    {
      "24h": { label: "Ends tonight", pct: 0.28 },
      "3d": { label: "2 days left", pct: 0.62 },
      "1w": { label: "5 days left", pct: 0.74 },
      keep: { label: "Kept in the circle", pct: 1 },
      manual: { label: "Open until closed", pct: 1 },
    } as const
  )[b.lifetime];
};

/* ---------- Composer helpers ---------- */

/** Starting points when someone isn't sure what to ask. One set per Banter type. */
export const PROMPT_SPARKS: Record<BanterType, string[]> = {
  everyday: ["What is one small thing that makes you happy today?", "What did you notice on your walk this morning?", "What are you avoiding this week, honestly?"],
  creative: ["Which version of this feels more honest?", "Can an unfinished artwork still be honest?", "What part of your practice do you hide because it doesn't look productive?"],
  culture: ["Which African proverb has become more meaningful as you grew older?", "What song would you play to explain your city to a stranger?", "What tradition do you wish more people understood?"],
  debate: ["Should artists explain their work, or should the art speak for itself?", "Is AI helping or damaging African art?", "Should galleries hide sales figures?"],
  memory: ["What object from your childhood home do you still remember clearly?", "What smell takes you straight back to your grandmother's house?", "A photo you wish you had taken?"],
  collab: ["What could five artists from five African countries create together?", "Would anyone document disappearing markets with me?", "Who wants to make something about water?"],
  support: ["I've been creatively blocked for two weeks. What helps you restart?", "How do you handle rejection from an open call?", "What do you do on days the studio feels lonely?"],
  celebration: ["Someone in this circle just finished something big. Leave them a message.", "Share a small win from this month.", "Who helped you this year without being asked?"],
};

/** Plain-language reasons Akines gives for each recipient, so nobody gets a Banter without knowing why. */
export const RECIPIENT_REASON: Record<string, string> = {
  ayo: "Works with memory in textiles",
  kwame: "Paints the people who raised him",
  leila: "Collects work she can argue with",
  zuri: "Curates diaspora conversations",
  nandi: "Hosts small, gentle rooms",
  tunde: "Sculptor in Lagos, likes a debate",
  wanjiru: "Photographs everyday objects",
  thandi: "Ceramicist who shares process",
  fatou: "Designer interested in culture",
  efua: "Art historian, loves an archive",
  chidi: "Student, learning to look",
};

const SOFTER: [RegExp, string][] = [
  [/\bstupid\b/gi, "unexpected"],
  [/\bidiot\b/gi, "friend"],
  [/\bugly\b/gi, "unusual"],
  [/\buseless\b/gi, "not quite working yet"],
  [/\bpathetic\b/gi, "disappointing"],
  [/\bdumb\b/gi, "puzzling"],
  [/shut up/gi, "hold on"],
  [/\bhate\b/gi, "struggle with"],
  [/\bworst\b/gi, "least favourite"],
  [/\btrash\b/gi, "not for me"],
  [/\bloser\b/gi, "underdog"],
];

/** The “suggest calmer wording” rewrite. The person always decides whether to use it. */
export const softenWording = (text: string) => SOFTER.reduce((t, [re, to]) => t.replace(re, to), text);
