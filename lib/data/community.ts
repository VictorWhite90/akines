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
  { id: "inspiration", label: "I want to see how others do their work", headline: "Look inside other people's working lives.", body: "Read this week's open journals: first tries, doubts and small wins from people in every line of work.", cta: { label: "Read work journals", href: "/journal?tab=work" }, also: { label: "Visit an Open door", href: "/studios" }, photo: "studioBusy" },
  { id: "blocked", label: "I feel stuck or burnt out", headline: "Start smaller than a big plan.", body: "A two-minute breathing pause, a low-stakes prompt, and a way to check in on how you are, privately.", cta: { label: "Open Wellbeing", href: "/wellbeing" }, also: { label: "Take the burnout check", href: "/wellbeing#check" }, photo: "calmBench" },
  { id: "heals", label: "I want to write about my life", headline: "Your life already has a story.", body: "Write about where you've been, what changed and who helped. Keep it private, or share it with your circles.", cta: { label: "Write a journal entry", href: "/journal?tab=life" }, also: { label: "Read members' stories", href: "/stories" }, photo: "journalPen" },
  { id: "identity", label: "I'm far from home", headline: "Sit with people who understand.", body: "The Diaspora circle meets in small rooms. Nobody needs the right answers, only an honest one.", cta: { label: "Join the Diaspora circle", href: "/circles/diaspora" }, also: { label: "Tonight's room on home", href: "/rooms/home" }, photo: "kincircleHero" },
  { id: "lonely", label: "I'm lonely and want to talk", headline: "Six chairs. One conversation. Tonight.", body: "No audience, no recording, no followers. Take a seat in a Presence Room and just talk.", cta: { label: "Find a seat", href: "/rooms" }, also: { label: "Meet kindred people", href: "/kindred" }, photo: "talkTwo" },
  { id: "artists", label: "I want to meet people like me", headline: "Meet people through what you share.", body: "Introductions come with a reason: the things you both care about, do or have lived through. Not a wall of profiles.", cta: { label: "See who you'd click with", href: "/kindred" }, also: { label: "Browse KinCircles", href: "/circles" }, photo: "talkLaugh" },
  { id: "history", label: "I want to learn something new", headline: "Learn from someone who's done it.", body: "Classes, mentors and members happy to share what they know. The Companion can help you find the right one.", cta: { label: "Browse classes", href: "/shop" }, also: { label: "Ask in a Presence Room", href: "/rooms" }, photo: "notebookWhite" },
  { id: "fashion", label: "I'm starting a business", headline: "Open your doors.", body: "Set up a store to sell your products or services in a few minutes, and start taking your first orders.", cta: { label: "Open your store", href: "/store" }, also: { label: "Ask for advice in a Banter", href: "/banter?new=chat" }, photo: "talkCafe" },
  { id: "collaborators", label: "I'm looking for collaborators", headline: "Make something neither of you could make alone.", body: "Clear roles and fair credit agreed up front, and a shared room for the work.", cta: { label: "Explore collaborations", href: "/collaborate" }, also: { label: "See open calls", href: "/collaborate#calls" }, photo: "collabArt" },
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

export const ROOMS: Room[] = [
  { id: "home", title: "What does “home” mean to you now?", host: "nandi", when: "Tonight · 19:30", status: "soon", blurb: "A quiet, six-person conversation. Bring one place, smell or memory that means home.", seated: ["nandi", "kwame", "leila"], photo: "talkMugs", tag: "Belonging" },
  { id: "photography-memory", title: "Starting over in a new city", host: "wanjiru", when: "Live now", status: "live", blurb: "Moved recently? We share what helped, what didn't, and who we wish we'd met sooner.", seated: ["wanjiru", "zuri", "efua", "tunde", "thandi"], photo: "talkGroup", tag: "Life" },
  { id: "women-fashion", title: "Women building businesses", host: "fatou", when: "Thu · 18:00", status: "later", blurb: "Founders, freelancers and side-hustlers trade honest numbers and first-year lessons.", seated: ["fatou", "leila", "wanjiru", "chidi"], photo: "talkCafe", tag: "Business" },
  { id: "benin-bronze", title: "Burnout, honestly", host: "ayo", when: "Fri · 20:00", status: "later", blurb: "Nurses, teachers, engineers and parents on what tired really feels like, and what helps.", seated: ["ayo", "efua"], photo: "calmBench", tag: "Wellbeing" },
  { id: "masks", title: "Is it okay to quit?", host: "tunde", when: "Sat · 17:00", status: "later", blurb: "Jobs, courses, teams, relationships. A room for careful listening, not advice.", seated: ["tunde"], photo: "talkTwo", tag: "Career" },
  { id: "indigo-memory", title: "Learning a new skill after 30", host: "thandi", when: "Mon · 19:00", status: "later", blurb: "Coding, pottery, a language, an instrument. Bring what you're learning and where you're stuck.", seated: ["thandi", "efua", "chidi"], photo: "studioBusy", tag: "Growth" },
  { id: "coding-club", title: "Weekend Coding Club: plan the first lesson", host: "wanjiru", when: "Thu · 18:00", status: "later", blurb: "The circle's weekly room. Bring one idea for a 45-minute lesson a teenager would actually enjoy.", seated: ["wanjiru", "efua", "fatou", "nandi"], photo: "studioBusy", tag: "Tech" },
  { id: "collecting", title: "Money talk: first salaries and first savings", host: "zuri", when: "Sun · 16:00", status: "later", blurb: "No shame, real numbers. Students, professionals and parents compare notes.", seated: ["zuri", "leila", "kwame"], photo: "talkLaugh", tag: "Money" },
];

/* ---------- KinCircles ---------- */
export type Circle = {
  id: string;
  name: string;
  blurb: string;
  members: number;
  active: number;
  photo: PhotoKey;
  joined?: boolean;
  starter: string;
};

export const CIRCLES: Circle[] = [
  { id: "african-fashion", name: "Founders Circle", blurb: "Early-stage founders sharing wins, numbers and the hard weeks.", members: 612, active: 24, photo: "talkCafe", starter: "What's one thing you wish you'd known before raising money?" },
  { id: "photography", name: "Photography", blurb: "Street, studio and family archive. Weekly one-image critique.", members: 388, active: 15, photo: "gallerySeated", starter: "One image, no caption: what do you see first?" },
  { id: "digital-art", name: "Tech & Code", blurb: "Developers, designers and learners helping each other ship.", members: 274, active: 11, photo: "studioBusy", starter: "Stuck on a bug for two days. How do you ask for help without feeling stupid?" },
  { id: "textiles", name: "New in the City", blurb: "Just moved? Meet people, find your spots and stop eating alone.", members: 416, active: 12, photo: "talkLaugh", joined: true, starter: "Where's the best place you've found to meet people that isn't a bar?" },
  { id: "ceramics", name: "Health & Care Workers", blurb: "Nurses, doctors and carers looking after each other for once.", members: 233, active: 9, photo: "calmBench", starter: "How do you switch off after a hard shift?" },
  { id: "collectors", name: "Book Club", blurb: "One book a month, honest opinions, and nobody judges if you didn't finish.", members: 501, active: 18, photo: "journalCoffee", joined: true, starter: "The book you'd hand a stranger who's having a hard year." },
  { id: "curators", name: "Parents Together", blurb: "New and seasoned parents trading tips, sleep tricks and solidarity.", members: 142, active: 6, photo: "talkTwo", starter: "What's one thing about parenting nobody warned you about?" },
  { id: "diaspora", name: "Diaspora", blurb: "Belonging, return and what home looks like from far away.", members: 447, active: 20, photo: "talkMugs", starter: "The object from home you keep in every apartment." },
  { id: "young-artists", name: "Students & Grads", blurb: "Study groups, first jobs and figuring out what comes next.", members: 359, active: 22, photo: "talkYoung", starter: "First job interview next week. Ten things you'd tell me?" },
  { id: "traditional-arts", name: "Creatives & Makers", blurb: "Artists, designers, musicians and makers sharing work in progress.", members: 198, active: 7, photo: "studioEasel", starter: "Show something unfinished you're proud of." },
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

export const COLLABS: Collab[] = [
  { id: "threads-of-return", title: "Threads of Return", route: "Lagos × Dakar", medium: "Textile & sound", blurb: "A textile artist and a designer translate migration memories into an immersive installation.", photo: "collabArt", progress: 68, stage: 2, makers: ["ayo", "fatou"], next: "Exhibition in 24 days" },
  { id: "shared-sketchbook", title: "The Sketchbook Between Us", route: "Lagos × Nairobi", medium: "Drawing & photography", blurb: "One sketchbook travelling by post and by scan: each maker answers the other's page.", photo: "journalOpen", progress: 41, stage: 1, makers: ["wanjiru", "kwame"], next: "Page 9 of 24 due Friday" },
  { id: "clay-zellige", title: "Clay & Zellige", route: "Accra × Casablanca", medium: "Ceramics", blurb: "Hand-thrown vessels meet cut-tile geometry in a shared sculptural series.", photo: "clayBrown", progress: 22, stage: 0, makers: ["thandi", "leila"], next: "Glaze tests this week" },
  { id: "beads-cloth", title: "Beads & Cloth", route: "Johannesburg × Dakar", medium: "Textile & beadwork", blurb: "Wearable wall pieces stitched from Zulu beadwork and Senegalese cotton.", photo: "beadsRed", progress: 86, stage: 3, makers: ["thandi", "fatou"], next: "Opening night in 6 days" },
];

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

export const CALLS: OpenCall[] = [
  { id: "new-portraiture", title: "New African Portraiture", by: "zuri", org: "Lantern House", city: "London", days: 9, blurb: "Seeking distinctive figurative painters for a London group exhibition.", tags: ["Figurative", "2–6 works", "Paid"], photo: "paintingWoman" },
  { id: "objects-of-memory", title: "Objects of Memory", by: "nandi", org: "Kilimani Projects", city: "Nairobi", days: 14, blurb: "Mixed-media works built around one object someone couldn't leave behind.", tags: ["Mixed media", "Any career stage", "Stipend"], photo: "carvedGroup" },
  { id: "indigo-futures", title: "Indigo Futures Residency", by: "efua", org: "Abeokuta Dye Works", city: "Abeokuta", days: 21, blurb: "Four weeks with master dyers. Textile artists and designers, early to mid career.", tags: ["Textile", "Residency", "Housing included"], photo: "textileHang" },
];

/* ---------- Wellbeing ---------- */
export type Mood = { id: string; word: string; hue: string; text: string; reply: string };

export const MOODS: Mood[] = [
  { id: "heavy", word: "Heavy", hue: "bg-ink-700", text: "text-paper-50", reply: "Heavy days count too. You don't have to make anything today. A slow breath could be enough." },
  { id: "restless", word: "Restless", hue: "bg-clay-500", text: "text-paper-50", reply: "Restless often means something wants to move. Ten minutes of loose, ugly sketching can help it out." },
  { id: "tender", word: "Tender", hue: "bg-rose-300", text: "text-ink-900", reply: "Tender is a good state to notice things in. Be gentle with what you show today." },
  { id: "open", word: "Open", hue: "bg-ochre-400", text: "text-ink-900", reply: "Open is a gift. Is there someone whose work you've been meaning to write to?" },
  { id: "grounded", word: "Grounded", hue: "bg-moss-500", text: "text-paper-50", reply: "Grounded: a good day to finish something small that you started weeks ago." },
];

export const WEEK_MOODS = ["restless", "open", "heavy", "tender", "open", "grounded"] as const;

/* ---------- Studio visits ---------- */
export type StudioVisit = { id: string; artist: PersonId; place: string; mode: "Live" | "Virtual" | "360°" | "VR"; when: string; photo: PhotoKey; blurb: string };

export const STUDIOS: StudioVisit[] = [
  { id: "tunde", artist: "tunde", place: "Yaba, Lagos", mode: "Live", when: "Wed 26 · 17:00", photo: "talkYoung", blurb: "Watch an under-15s training session, then ask the coach anything." },
  { id: "thandi", artist: "thandi", place: "Maboneng, Johannesburg", mode: "Live", when: "Thu · 15:00", photo: "journalCoffee", blurb: "Sit in on a reading hour in a primary classroom. Volunteers welcome." },
  { id: "kwame", artist: "kwame", place: "Osu, Accra", mode: "Virtual", when: "Fri 28 · 15:00", photo: "studioBusy", blurb: "A live coding session: build a small app together, beginners first." },
  { id: "ayo", artist: "ayo", place: "Bodija, Ibadan", mode: "Virtual", when: "Next month", photo: "calmBench", blurb: "What a night shift is really like, and how nurses look after each other." },
  { id: "fatou", artist: "fatou", place: "Médina, Dakar", mode: "Live", when: "Sat 29 · 16:00", photo: "talkCafe", blurb: "A cooking class in a real restaurant kitchen. Six aprons, one big pot." },
  { id: "efua", artist: "efua", place: "Adum, Kumasi", mode: "360°", when: "On demand", photo: "photoAlbum", blurb: "Walk the archive room and hear the family stories behind old photographs." },
  { id: "nandi", artist: "nandi", place: "Avondale, Harare", mode: "Virtual", when: "Tue 30 · 17:30", photo: "talkMugs", blurb: "A gentle talk on burnout, followed by a small listening circle." },
  { id: "leila", artist: "leila", place: "Gauthier, Casablanca", mode: "Virtual", when: "Thu 2 · 19:00", photo: "talkTwo", blurb: "Founder office hours: bring your idea or deck for honest feedback." },
  { id: "wanjiru", artist: "wanjiru", place: "Kilimani, Nairobi", mode: "Virtual", when: "Mon 1 · 18:30", photo: "gallerySeated", blurb: "How one good photograph gets chosen from three hundred." },
];

/* ---------- Therapists (fictional profiles) ---------- */
export const CARE_TEAM = [
  { name: "Dr Ifeoma Okeke", kind: "Licensed clinical psychologist", where: "Lagos · remote sessions", focus: "Burnout, anxiety, grief" },
  { name: "Sade Bello, MA", kind: "Registered art therapist", where: "Ibadan · remote sessions", focus: "Stress, change, expressive work" },
  { name: "Kofi Asare, LCSW", kind: "Licensed counsellor", where: "Accra · remote sessions", focus: "Loneliness, impostor feelings" },
];
