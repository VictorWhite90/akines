import type { PersonId } from "@/lib/data/people";

/*
 * Community Home content, word for word from the product design (its features/community/feed/content.ts): the hero
 * carousel, the rail (your circles and the match slideshow) and the eleven feed sections. Photos are the design's own,
 * copied to public/kin/design/home/<feed|community>/ under their file names. People are our ids for the design's cast.
 */

/** A design photo: "feed/hero-card-1" → /kin/design/home/feed/hero-card-1.jpg */
export const img = (name: string) => `/kin/design/home/${name}.jpg`;

/** Where the feed's links go (the design's DEST, on our routes). */
export const DEST = {
  connect: "/connect",
  explore: "/explore",
  banter: "/community/banter",
  discover: "/collaborate/discover",
  whyMatch: "/collaborate/collaborators/why-this-match",
  zine: "/community/collaborations/lagos-makers-zine",
  reflect: "/wellbeing/reflect",
  care: "/care",
  recommendations: "/settings/explanations",
} as const;

/* ---------------------------------------------------------------- hero */
export type HeroKind = "banter" | "live" | "game" | "activity";
export type HeroCard = { id: string; kind: HeroKind; tag: string; title: string; meta: string; image: string; href: string };

export const HERO_LABEL = "Happening now on Akines";
export const HERO_HEADING = "Community home";
export const HERO_INTERVAL = 5000;

export const HERO_CARDS: HeroCard[] = [
  { id: "rest", kind: "banter", tag: "Banter", title: "Can ambition and rest coexist?", meta: "18 people talking · Banter", image: img("feed/hero-card-1"), href: DEST.banter },
  { id: "studio-hour", kind: "live", tag: "Live room", title: "Evening Studio Hour", meta: "12 in the room · Hosted by Tunde", image: img("feed/hero-card-2"), href: DEST.connect },
  { id: "name-that-pattern", kind: "game", tag: "Game", title: "Name That Pattern", meta: "Starts 6:30 PM · 14 playing", image: img("feed/hero-card-3"), href: DEST.connect },
  { id: "indigo", kind: "activity", tag: "Activity", title: "Indigo dyeing for beginners", meta: "Sat 8 Nov · Yaba, Lagos", image: img("feed/hero-card-4"), href: DEST.connect },
  { id: "collab", kind: "banter", tag: "Banter", title: "What makes collaboration work?", meta: "24 people talking · Banter", image: img("feed/hero-card-5"), href: DEST.banter },
  { id: "open-mic", kind: "live", tag: "Live room", title: "Poetry Open Mic", meta: "Starts 7:00 PM · Hosted by Amara", image: img("feed/hero-card-6"), href: DEST.connect },
  { id: "story-chain", kind: "game", tag: "Game", title: "Story Chain", meta: "Open now · 9 playing", image: img("feed/hero-card-7"), href: DEST.connect },
  { id: "swap", kind: "live", tag: "Live room", title: "Textile Swap Circle", meta: "21 in the room · Hosted by Ayo", image: img("feed/hero-card-8"), href: DEST.connect },
];

/* ---------------------------------------------------------------- rail */
export type CircleRow = { id: string; name: string; meta: string; image: string; href: string };
export const CIRCLES: CircleRow[] = [
  { id: "textiles", name: "Textiles & Adire", meta: "416 members · 8 active", image: img("feed/circle-textiles"), href: DEST.connect },
  { id: "poetry", name: "Poetry and Wine talk", meta: "20 members · 4 active", image: img("feed/circle-poetry"), href: DEST.connect },
];
export const CIRCLES_COPY = { title: "Your circles", link: { label: "See all", href: DEST.connect } };

export type Match = { id: PersonId; name: string; role: string; place: string; quote: string; image: string };
export const MATCHES: Match[] = [
  { id: "ayo-balogun", name: "Ayo Balogun", role: "Textile artist", place: "Ibadan", quote: "You both see textiles as living archives.", image: img("feed/avatar-ayo") },
  { id: "amara-okafor", name: "Amara Okafor", role: "Visual artist", place: "Abuja", quote: "You both believe a poem can host a whole evening.", image: img("feed/avatar-amara") },
  { id: "yusuf-umar", name: "Yusuf Umar", role: "Multidisciplinary artist", place: "Kwara", quote: "You both want collaboration that challenges an idea without flattening it.", image: img("feed/avatar-yusuf") },
  { id: "ngozi", name: "Ngozi Eze", role: "Writer and zine maker", place: "Lagos", quote: "You both write to remember the people in your lives.", image: img("community/av-ngozi") },
  { id: "tunde-bakare", name: "Tunde Bakare", role: "Community health designer", place: "Abuja", quote: "You both prefer practical, small-group work.", image: img("community/av-tunde") },
  { id: "chuka", name: "Chuka Nwosu", role: "Founder and maker", place: "Port Harcourt", quote: "You both like thinking an idea through with one person at a time.", image: img("community/av-chuka") },
  { id: "folake", name: "Folake Adeniran", role: "Storyteller", place: "Lagos", quote: "You both keep Sunday for slow walks and long talks.", image: img("community/av-folake") },
];
export const MATCH_COPY = {
  title: "You two would get along",
  link: { label: "Why this match?", href: DEST.whyMatch },
  empty: { text: "Nothing to suggest today. Check back tomorrow.", link: { label: "Update recommendation preferences", href: DEST.recommendations } },
  skip: "Not now",
  hello: "Say hello",
};

/* ---------------------------------------------------------------- sections */
export type FeedKey = "explore" | "kincircle" | "banter" | "rooms" | "activities" | "collaborate" | "shop" | "studios" | "stories" | "wellbeing" | "dna";
export type FeedVersion = "a" | "b" | "c" | "d";
export const ARRANGEMENTS: Record<FeedVersion, { name: string; sections: FeedKey[] }> = {
  a: { name: "Discover", sections: ["explore", "kincircle", "banter", "stories", "studios", "shop"] },
  b: { name: "Belong", sections: ["kincircle", "rooms", "collaborate", "activities", "wellbeing", "explore"] },
  c: { name: "Make together", sections: ["collaborate", "dna", "rooms", "studios", "banter", "shop"] },
  d: { name: "Heritage and craft", sections: ["stories", "studios", "wellbeing", "shop", "dna", "activities"] },
};

export type SectionHead = { title: string; support: string; link?: { label: string; href: string } };
export const HEADS: Record<FeedKey, SectionHead> = {
  explore: { title: "These might resonate with you.", support: "Discover stories, ideas, and conversations worth your time.", link: { label: "Explore all", href: DEST.explore } },
  kincircle: { title: "Your circles' feed.", support: "What people are sharing in the circles you've joined.", link: { label: "Explore all", href: DEST.connect } },
  banter: { title: "Conversations worth joining.", support: "Open conversations happening across Akines right now.", link: { label: "Open Banter", href: DEST.banter } },
  rooms: { title: "Rooms open now.", support: "Drop in, listen, or speak when you are ready.", link: { label: "See all rooms", href: DEST.connect } },
  activities: { title: "Things to do together.", support: "Small, easy ways to meet people through making.", link: { label: "See all activities", href: DEST.connect } },
  collaborate: { title: "Projects looking for you.", support: "Open projects that match your interests and skills.", link: { label: "Discover projects", href: DEST.discover } },
  shop: { title: "Fresh from the makers.", support: "Original work and made-to-order pieces, sold by the people who made them.", link: { label: "Shop all", href: DEST.explore } },
  studios: { title: "Step inside the studio.", support: "Live, virtual, 360° or VR. Talk to the maker directly.", link: { label: "Visit studios", href: DEST.explore } },
  stories: { title: "Witness the journey.", support: "Living journals and the legacy every artwork carries.", link: { label: "Open journals", href: DEST.explore } },
  wellbeing: { title: "A quiet moment.", support: "How is your creative energy today? Only you can see your answer." },
  dna: { title: "Your creative DNA.", support: "Traits that shape how you make, and the people who share them.", link: { label: "See your full DNA", href: DEST.care } },
};

export type FeedCard = { id: string; tag?: string; title: string; text: string; image: string; href: string; left?: string; right?: string };

const FELT = { left: "128 felt this", right: "24 Reflections" };
export const EXPLORE_CARDS: FeedCard[] = [
  { id: "story-1", title: "I almost painted over this", text: "A work about my grandmother, indigo cloth and the things families leave unsaid.", image: img("feed/story-1"), href: DEST.explore, ...FELT },
  { id: "story-2", title: "The painting that made my daughter ask", text: "One talk over breakfast changed how my family speaks about identity.", image: img("feed/story-2"), href: DEST.explore, ...FELT },
  { id: "story-3", title: "Five voices reshaping portraiture", text: "Beyond the gaze: a personal walk through the artists changing the conversation.", image: img("feed/story-3"), href: DEST.explore, ...FELT },
];

export const ROOM_CARDS: FeedCard[] = [
  { id: "studio-hour", tag: "LIVE NOW", title: "Evening Studio Hour", text: "A quiet room to work alongside others, cameras optional.", image: img("community/zine-tall"), href: DEST.connect, left: "12 in the room", right: "Hosted by Tunde" },
  { id: "open-mic", tag: "STARTS 7:00 PM", title: "Poetry Open Mic", text: "Bring a poem of your own, or just come to listen.", image: img("feed/post2-a"), href: DEST.connect, left: "8 going", right: "Hosted by Amara" },
  { id: "swap", tag: "LIVE NOW", title: "Textile Swap Circle", text: "Trade scraps, dyes and techniques with makers across the country.", image: img("feed/circle-textiles"), href: DEST.connect, left: "21 in the room", right: "Hosted by Ayo" },
];

export const ACTIVITY_CARDS: FeedCard[] = [
  { id: "indigo", tag: "SAT 8 NOV · 4:00 PM", title: "Indigo dyeing for beginners", text: "Learn the first three dye baths and take your cloth home.", image: img("feed/post1-a"), href: DEST.connect, left: "Yaba, Lagos", right: "6 spots left" },
  { id: "sketch", tag: "SUN 9 NOV · 10:00 AM", title: "Sunday sketch walk", text: "Two slow hours with a sketchbook and a small group.", image: img("feed/studio-3"), href: DEST.connect, left: "Freedom Park, Lagos", right: "12 spots left" },
  { id: "writing", tag: "WED 12 NOV · 6:30 PM", title: "Writing together, online", text: "A gentle hour of quiet writing, then one shared paragraph.", image: img("feed/journal-1"), href: DEST.connect, left: "Online", right: "Open to all" },
];

/** `match` is the design's sample "% match": shown in preview only (no invented scores on real data). */
export const PROJECT_CARDS: (FeedCard & { match: string })[] = [
  { id: "zine", tag: "LOOKING FOR: ILLUSTRATOR", title: "Lagos Makers Zine", text: "A printed zine celebrating independent makers across the city.", image: img("community/zine-tall"), href: DEST.zine, left: "5 collaborators", match: "88% match" },
  { id: "health", tag: "LOOKING FOR: COMMUNITY ORGANISER", title: "Community Health Initiative", text: "Mapping local health needs and the people already meeting them.", image: img("community/health-tall"), href: DEST.discover, left: "9 collaborators", match: "81% match" },
  { id: "careers", tag: "LOOKING FOR: FACILITATOR", title: "Career Guidance for Everyone", text: "Short, honest sessions that help students see what work could look like.", image: img("community/kincircle"), href: DEST.discover, left: "4 collaborators", match: "76% match" },
];

export const STUDIO_CARDS: FeedCard[] = [
  { id: "tunde", tag: "LIVE", title: "Tunde Adeyemi's studio", text: "Watch a firing day. Ask anything. Buy from the shelf if something follows you home.", image: img("feed/studio-1"), href: DEST.explore, left: "Yaba, Lagos" },
  { id: "thandi", tag: "360°", title: "Thandi Dlamini's studio", text: "Walk the workshop at your own pace. Tap any vessel to hear how it was made.", image: img("feed/studio-2"), href: DEST.explore, left: "Maboneng, Johannesburg" },
  { id: "kwame", tag: "VIRTUAL", title: "Kwame Mensah's studio", text: "A guided hour among works in progress, six visitors at a time.", image: img("feed/studio-3"), href: DEST.explore, left: "Osu, Accra" },
];

export const STORY_CARDS: FeedCard[] = [
  { id: "panel", tag: "ARTIST JOURNAL", title: "Failed panel #3, kept anyway", text: "Scraped it back to the third layer.", image: img("feed/journal-1"), href: DEST.explore, ...FELT },
  { id: "green", tag: "ARTIST JOURNAL", title: "Dyeing day 7: the green surprise", text: "The third batch came out greener than any I've ever mixed.", image: img("feed/journal-2"), href: DEST.explore, ...FELT },
  { id: "legacy", tag: "ART LEGACY", title: "Where the painting lives", text: "Made in Accra, acquired in Casablanca and now asked about every morning.", image: img("feed/journal-3"), href: DEST.explore, ...FELT },
];

export type BanterCard = { id: string; tag: string; title: string; text: string; talking: string; faces: PersonId[] };
export const BANTER_CARDS: BanterCard[] = [
  { id: "rest", tag: "BANTER · LIVE", title: "Can ambition and rest coexist?", text: "I used to think resting meant falling behind. Lately my best work comes the morning after a real day off.", talking: "18 people talking", faces: ["amara-okafor", "tunde-bakare", "folake"] },
  { id: "collab", tag: "BANTER · LIVE", title: "What makes collaboration work?", text: "It is rarely the idea. It is whether you can disagree on a Tuesday and still show up on Wednesday.", talking: "24 people talking", faces: ["ngozi", "chuka", "amara-okafor"] },
  { id: "look", tag: "BANTER · OPEN", title: "Who taught you to look closely?", text: "A teacher, a grandmother, a stranger at a market. Tell us who made you notice the small things.", talking: "9 people talking", faces: ["folake", "tunde-bakare", "ngozi"] },
];
export const BANTER_JOIN = { label: "Join the conversation", href: DEST.banter };

/** The maker's face is the photo the design shows on the card (its product cards reuse the community avatars). */
export type Product = { id: string; tag: string; title: string; maker: string; face: string; price: string; edition?: string; image: string };
export const PRODUCTS: Product[] = [
  { id: "vase", tag: "CERAMICS", title: "Firing day vase", maker: "Thandi Dlamini", face: img("community/av-ngozi"), price: "$240", image: img("feed/studio-2") },
  { id: "indigo-room", tag: "PAINTING", title: "Indigo Room", maker: "Kwame Mensah", face: img("community/av-chuka"), price: "$10,000", edition: "1 of 1", image: img("feed/journal-3") },
  { id: "figure", tag: "SCULPTURE", title: "The watching figure", maker: "Tunde Adeyemi", face: img("community/av-tunde"), price: "$3,200", edition: "1 of 1", image: img("feed/product-3") },
];
export const SHOP_COPY = { buy: "Buy", toast: "Added to your basket", href: DEST.explore };

export type Reaction = { emoji: string; label: string; count: number };
export type FeedPost = { id: string; name: string; face: string; meta: string; circle?: string; body: string[]; media: string[]; reactions: Reaction[]; replies: string };
export const PICKER: { emoji: string; label: string }[] = [
  { emoji: "👍", label: "thumbs up" },
  { emoji: "❤️", label: "heart" },
  { emoji: "👏", label: "clap" },
  { emoji: "😮", label: "surprised" },
  { emoji: "🙌", label: "celebrate" },
];
const E = (emoji: string, count: number): Reaction => ({ emoji, label: PICKER.find((p) => p.emoji === emoji)?.label ?? "reaction", count });
export const POSTS: FeedPost[] = [
  {
    id: "ayo",
    name: "Ayo Balogun",
    face: img("feed/avatar-ayo"),
    meta: "Textile artist · Ibadan · 2h",
    circle: "Textiles and adire circle",
    body: ["Seven dye baths in, and the blue finally came out the way I've been chasing all year. Hung it in the yard for an hour just to watch the light change it."],
    media: [img("feed/post1-a"), img("feed/post1-b")],
    reactions: [E("👏", 3), E("❤️", 2)],
    replies: "2 replies",
  },
  {
    id: "amara",
    name: "Amara Okafor",
    face: img("feed/avatar-amara"),
    meta: "Visual artist · Abuja · 3h",
    circle: "Poetry and wine talk circle",
    body: [
      "There's something about a glass of wine, a room full of honest conversations, and poetry that says the things we struggle to admit out loud. Sometimes, the words of a stranger feel like they were written from the pages of our own lives.",
      "If we hosted a poetry and wine evening, what poem would you bring to the table, and what story would you tell behind it?",
    ],
    media: [img("feed/post2-a"), img("feed/post2-b"), img("feed/post2-c")],
    reactions: [E("👍", 13), E("❤️", 20), E("😮", 5)],
    replies: "12 replies",
  },
  {
    id: "yusuf",
    name: "Yusuf Umar",
    face: img("feed/avatar-yusuf"),
    meta: "Multidisciplinary artist · Kwara · 5h",
    body: [
      "One thing I'm learning is that collaboration isn't about finding people who think exactly like you. It's about finding people who can challenge your ideas without making you feel you have to abandon them.",
      "How do you know when a creative partnership is worth pursuing?",
    ],
    media: [],
    reactions: [E("👍", 3)],
    replies: "No replies yet",
  },
];
export const REACT_LABEL = "+ React";

export const WELLBEING = {
  eyebrow: "CREATIVE WELLBEING",
  image: img("community/amara"),
  options: [
    { id: "full", label: "Full", reply: "Lovely. Let it carry something small into the world." },
    { id: "steady", label: "Steady", reply: "Steady is a good place to make from." },
    { id: "low", label: "Low", reply: "Then be gentle. A walk or ten quiet minutes can be enough." },
    { id: "empty", label: "Running on empty", reply: "Thank you for saying so. Rest counts as part of the work." },
  ],
  link: { label: "Reflect privately", href: DEST.reflect },
};

export type Trait = { id: string; eyebrow: string; title: string; text: string; faces: PersonId[] };
export const TRAITS: Trait[] = [
  { id: "patient", eyebrow: "TRAIT 01", title: "Patient maker", text: "You return to a piece many times before it feels finished.", faces: ["amara-okafor", "folake", "chuka"] },
  { id: "story", eyebrow: "TRAIT 02", title: "Story first", text: "You start from the person or memory behind the work, then find the form.", faces: ["ngozi", "tunde-bakare", "amara-okafor"] },
  { id: "together", eyebrow: "TRAIT 03", title: "Better together", text: "Your best ideas arrive in conversation, not alone at the desk.", faces: ["chuka", "folake", "ngozi"] },
];
export const TRAIT_META = "Shared by 24 people";
export const TRAIT_LINK = { label: "See who shares it", href: DEST.care };

export const ERROR_COPY = {
  title: "We could not load this section.",
  text: "Your conversations and projects are safe. Check your connection and try again. The rest of your page is still here.",
  retry: "Try again",
};
export const LOADING_NOTE = "Getting things ready";
export const LOADING_MS = 1500;
