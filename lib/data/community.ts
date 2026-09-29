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
  { id: "inspiration", label: "I'm an artist looking for inspiration", headline: "Wander through other people's studios.", body: "Read this week's open journals: sketches, doubts and half-finished ideas from artists working in your medium.", cta: { label: "Read studio journals", href: "/journal" }, also: { label: "Visit a studio live", href: "/studios" }, photo: "studioDim" },
  { id: "blocked", label: "I feel creatively blocked", headline: "Start smaller than a masterpiece.", body: "A two-minute breathing pause, a low-stakes prompt, and a way to check in on how you are, privately.", cta: { label: "Open Breathing Room", href: "/wellbeing" }, also: { label: "Take the burnout check", href: "/wellbeing#check" }, photo: "calmBench" },
  { id: "heals", label: "I collect because art heals me", headline: "Your collection already has a story.", body: "Write about why you bought it and where it lives. Collector journals become part of the artwork's living history.", cta: { label: "Write a collector entry", href: "/journal?tab=collectors" }, also: { label: "See an artwork's legacy", href: "/stories/indigo-room" }, photo: "frameWall" },
  { id: "identity", label: "I'm searching for my African identity", headline: "Sit with people asking the same question.", body: "The Diaspora circle meets in small rooms. Nobody needs the right answers, only an honest one.", cta: { label: "Join the Diaspora circle", href: "/circles/diaspora" }, also: { label: "Tonight's room on home", href: "/rooms/home" }, photo: "bronzeHead" },
  { id: "lonely", label: "I'm lonely and enjoy discussing art", headline: "Six chairs. One conversation. Tonight.", body: "No audience, no recording, no followers. Take a seat in a Presence Room and just talk about what you see.", cta: { label: "Find a seat", href: "/rooms" }, also: { label: "Meet kindred people", href: "/kindred" }, photo: "talkTwo" },
  { id: "artists", label: "I'm looking for African artists", headline: "Meet artists through their work in progress.", body: "Introductions come with a reason: the things you both noticed, made or kept. Not a wall of profiles.", cta: { label: "See who you'd click with", href: "/kindred" }, also: { label: "Browse creative circles", href: "/circles" }, photo: "galleryViewer" },
  { id: "history", label: "I'm researching African history", headline: "Follow an object back through time.", body: "Every artwork keeps its provenance: makers, owners, exhibitions, and voices. The Companion reads alongside you.", cta: { label: "Explore artwork legacies", href: "/stories/indigo-room" }, also: { label: "Talk with an art historian", href: "/rooms" }, photo: "carvedRelief" },
  { id: "fashion", label: "I'm interested in African fashion", headline: "Cut, cloth and the politics of dress.", body: "Designers, stylists and cloth-makers in one circle, trading process, fabric sources and honest critique.", cta: { label: "Enter African Fashion", href: "/circles/african-fashion" }, also: { label: "Women redefining fashion, a room", href: "/rooms" }, photo: "kenteVest" },
  { id: "collaborators", label: "I'm looking for collaborators", headline: "Make something neither of you could make alone.", body: "Portfolio-first applications, roles and rights agreed up front, and a shared room for the work.", cta: { label: "Explore collaborations", href: "/collaborate" }, also: { label: "Answer an open call", href: "/collaborate#calls" }, photo: "textileStack" },
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
  { id: "home", title: "What does “home” mean in African art?", host: "nandi", when: "Tonight · 19:30", status: "soon", blurb: "A quiet, six-person conversation. Bring one work, place or memory that means home to you.", seated: ["nandi", "kwame", "leila"], photo: "frameWall", tag: "Identity" },
  { id: "photography-memory", title: "Photography and memory", host: "wanjiru", when: "Live now", status: "live", blurb: "What does a photograph keep that a memory can't? We start from one picture each.", seated: ["wanjiru", "zuri", "efua", "tunde", "thandi"], photo: "photoAlbum", tag: "Photography" },
  { id: "women-fashion", title: "Women redefining African fashion", host: "fatou", when: "Thu · 18:00", status: "later", blurb: "Designers, stylists and wearers on who gets to define what African fashion looks like.", seated: ["fatou", "ayo", "wanjiru", "chidi"], photo: "kenteVest", tag: "Fashion" },
  { id: "benin-bronze", title: "The future of Benin Bronze", host: "efua", when: "Fri · 20:00", status: "later", blurb: "Return, restitution and the living craft of bronze casting today. Students especially welcome.", seated: ["efua", "zuri"], photo: "bronzeHead", tag: "History" },
  { id: "masks", title: "The spirituality of masks", host: "tunde", when: "Sat · 17:00", status: "later", blurb: "When is a mask an object, and when is it something else? A room for careful listening.", seated: ["tunde"], photo: "tribalCarving", tag: "Tradition" },
  { id: "indigo-memory", title: "Indigo, memory and cloth", host: "ayo", when: "Mon · 19:00", status: "later", blurb: "What a length of dyed cloth remembers that a photograph can't. Bring a cloth, or a story about one.", seated: ["ayo", "efua", "chidi"], photo: "textileHang", tag: "Textiles" },
  { id: "collecting", title: "The business of collecting", host: "zuri", when: "Sun · 16:00", status: "later", blurb: "First purchase, first fear. Collectors, curators and artists trade honest numbers.", seated: ["zuri", "leila", "kwame"], photo: "galleryHall", tag: "Collecting" },
];

/* ---------- Creative Circles ---------- */
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
  { id: "african-fashion", name: "African Fashion", blurb: "Designers, stylists and cloth-makers trading process and critique.", members: 612, active: 24, photo: "kenteVest", starter: "How are you sourcing hand-woven cloth without pricing yourself out?" },
  { id: "photography", name: "Photography", blurb: "Street, studio and family archive. Weekly one-image critique.", members: 388, active: 15, photo: "gallerySeated", starter: "One image, no caption: what do you see first?" },
  { id: "digital-art", name: "Digital Art", blurb: "Illustration, collage and motion rooted in African visual language.", members: 274, active: 11, photo: "waxPrint", starter: "Sharing a wax-print collage study. Where does it lose the pattern?" },
  { id: "textiles", name: "Textiles & Adire", blurb: "Indigo, resist-dye, weaving and embroidery. Slow work, shared.", members: 416, active: 12, photo: "circleInner", joined: true, starter: "Second dye bath came out greener than expected. Anyone seen this with cassava resist?" },
  { id: "ceramics", name: "Ceramics", blurb: "Wheel, hand-building, firing and glazes from local clay.", members: 233, active: 9, photo: "clayHands", starter: "Bisque firing schedule for a small gas kiln: sharing what worked." },
  { id: "collectors", name: "Collectors", blurb: "First-time and seasoned collectors on buying with care.", members: 501, active: 18, photo: "circleIndigo", joined: true, starter: "What did you regret NOT buying?" },
  { id: "curators", name: "Curators", blurb: "Exhibition thinking, open calls and honest studio-visit notes.", members: 142, active: 6, photo: "galleryHall", starter: "How do you write a wall text that doesn't explain too much?" },
  { id: "diaspora", name: "Diaspora", blurb: "Belonging, return and what home looks like from far away.", members: 447, active: 20, photo: "bronzeHead", starter: "The object from home you keep in every apartment." },
  { id: "young-artists", name: "Young Artists", blurb: "Students and first-decade artists. Gentle, direct and unpolished.", members: 359, active: 22, photo: "paintingDancers", starter: "First show. Ten things I'd tell anyone starting." },
  { id: "traditional-arts", name: "Traditional Arts", blurb: "Carving, weaving, bronze and pottery: lineage and living practice.", members: 198, active: 7, photo: "carvedGroup", starter: "Learning from an elder: what did you have to unlearn?" },
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
  { id: "tunde", artist: "tunde", place: "Yaba, Lagos", mode: "Live", when: "Wed 26 · 17:00", photo: "clayWheelTop", blurb: "Watch a firing day. Ask anything. Buy from the shelf if something follows you home." },
  { id: "thandi", artist: "thandi", place: "Maboneng, Johannesburg", mode: "360°", when: "On demand", photo: "clayVases", blurb: "Walk the workshop at your own pace. Tap any vessel to hear how it was made." },
  { id: "kwame", artist: "kwame", place: "Osu, Accra", mode: "Virtual", when: "Fri 28 · 15:00", photo: "studioEasel", blurb: "A guided hour among works in progress, six visitors at a time." },
  { id: "ayo", artist: "ayo", place: "Bodija, Ibadan", mode: "VR", when: "Next month", photo: "textileHang", blurb: "Step inside the dye yard. Ten metres of indigo cloth move around you in the wind." },
  { id: "fatou", artist: "fatou", place: "Médina, Dakar", mode: "Live", when: "Sat 29 · 16:00", photo: "kenteVest", blurb: "Fittings, fabric bins and a cutting table. Watch a garment go from pattern to person." },
  { id: "efua", artist: "efua", place: "Adum, Kumasi", mode: "360°", when: "On demand", photo: "carvedRelief", blurb: "Walk the archive room among carved panels and hear where each one came from." },
  { id: "nandi", artist: "nandi", place: "Avondale, Harare", mode: "Virtual", when: "Tue 30 · 17:30", photo: "galleryHall", blurb: "A curator's walk through a hang in progress: why this wall, why this order." },
  { id: "leila", artist: "leila", place: "Gauthier, Casablanca", mode: "Virtual", when: "Thu 2 · 19:00", photo: "frameWall", blurb: "A collector's hallway. See how a small collection lives with a family, and why it's arranged this way." },
  { id: "wanjiru", artist: "wanjiru", place: "Kilimani, Nairobi", mode: "Virtual", when: "Mon 1 · 18:30", photo: "studioDim", blurb: "A quiet hour with the contact sheets: how one picture gets chosen from three hundred." },
];

/* ---------- Therapists (fictional profiles) ---------- */
export const CARE_TEAM = [
  { name: "Dr Ifeoma Okeke", kind: "Licensed clinical psychologist", where: "Lagos · remote sessions", focus: "Burnout, anxiety, grief" },
  { name: "Sade Bello, MA", kind: "Registered art therapist", where: "Ibadan · remote sessions", focus: "Creative blocks, expressive work" },
  { name: "Kofi Asare, LCSW", kind: "Licensed counsellor", where: "Accra · remote sessions", focus: "Loneliness, impostor feelings" },
];
