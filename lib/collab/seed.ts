import type { PersonId } from "@/lib/data/people";
import type { Application, CollabCall, CollabState, ProofFile, Project } from "./types";

const ME: PersonId = "amara";
const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;


const ab = (id: string) => [
  { id: "works", label: "Your work", hint: "Pieces, links or files that show you can do this: whatever fits your work.", required: true },
  { id: "why", label: "Why this, and why you", hint: "A few honest lines, tailored to this call.", required: true },
  { id: "availability", label: "Your availability", hint: "The dates in the timeline below.", required: true },
  { id: `${id}-extra`, label: "A rough idea or sketch", hint: "Optional, but it helps.", required: false },
];

const f = (kind: ProofFile["kind"], name: string, kb: number): ProofFile => ({ id: `${kind}-${name}`, name, size: kb * 1024, type: name.split(".").pop() ?? "", kind });

/** What the sample applicants to the podcast sent: different work, different proof. */
const INCOMING_PROOF: Record<string, Pick<Application, "links" | "files">> = {
  chidi: { links: [{ url: "https://soundcloud.com/chidi-eze/derby-day-pod-ep12", kind: "soundcloud", note: "Football podcast, episode 12" }], files: [f("sample", "lecture-cleanup-before-after.mp3", 3900)] },
  kwame: { links: [{ url: "https://open.spotify.com/show/devs-after-dark", kind: "spotify", note: "Devs After Dark (I edit it)" }, { url: "https://github.com/kwame-asante", kind: "github" }, { url: "https://linkedin.com/in/kwame-asante", kind: "linkedin" }], files: [f("cv", "Kwame-Asante-CV.pdf", 182)] },
  wanjiru: { links: [{ url: "https://behance.net/wanjirukamau", kind: "behance" }, { url: "https://instagram.com/wanjiru.frames", kind: "instagram" }], files: [] },
  leila: { links: [{ url: "https://youtube.com/watch?v=founder-talks-casablanca", kind: "youtube", note: "Panel I hosted, Casablanca" }, { url: "https://linkedin.com/in/leila-benali", kind: "linkedin" }], files: [f("cv", "Leila-Benali-Resume.pdf", 240)] },
  nandi: { links: [{ url: "https://linkedin.com/in/nandi-moyo", kind: "linkedin" }], files: [f("cv", "Nandi-Moyo-CV.docx", 96), f("sample", "Radio-segment-money-and-family.m4a", 4700)] },
};

export const SEED_CALLS: CollabCall[] = [
  {
    id: "jabi-mural", title: "Jabi Lake Arts Week: a 20-metre mural", host: "zuri", org: "Jabi Lake Arts Week", orgKind: "Community festival", city: "Abuja", where: "In person",
    photo: "paintingDancers", summary: "Three people to design and paint the festival's lakeside wall, start to finish, in nine days.",
    about: "Every November the lake walk gets a new wall. This year's theme is \"Arriving\": what Abuja looks like to people who came here to start again. We're putting together a small team: one person to lead the design, one to paint alongside, and one designer to turn it into the festival's posters and signs.",
    roles: ["Lead muralist", "Assistant painter", "Graphic designer"], fields: ["Arts", "Design"], level: "Any level, with at least three finished pieces",
    fee: "₦600,000 lead · ₦250,000 per teammate", rights: "The festival may photograph and show the mural for two years. You keep the design, and your name is on the wall.",
    selection: "Zuri reviews every application herself. Shortlisted people get a 20-minute conversation, and everyone hears back.", teamSize: 3,
    materials: ab("jabi"), timeline: [{ label: "Applications close", when: "9 Nov" }, { label: "Conversations", when: "11–13 Nov" }, { label: "Painting", when: "20–28 Nov" }, { label: "Unveiling", when: "30 Nov" }],
    closesInDays: 14, verified: true,
  },
  {
    id: "kubwa-bread", title: "A short brand film for Kubwa Bread Co.", host: "fatou", org: "Kubwa Bread Co.", orgKind: "Small business", city: "Abuja", where: "Hybrid",
    photo: "talkCafe", summary: "A 60-second film and ten photos about the family behind Kubwa's favourite bakery.",
    about: "We bake from 4am and most of Kubwa has eaten our agege bread, but nobody knows the family behind it. We want one honest, warm minute of film and a set of photos for our page and the shop wall.",
    roles: ["Videographer", "Photographer"], fields: ["Media", "Food", "Business"], level: "Some paid work already",
    fee: "₦350,000 for the pair", rights: "The bakery may use the film and photos online and in the shop for three years. Raw footage stays with you.",
    selection: "Fatou picks a pair. She'll call shortlisted people for a quick chat at the bakery.", teamSize: 2,
    materials: ab("bread"), timeline: [{ label: "Applications close", when: "15 Nov" }, { label: "Shoot", when: "22 Nov, 4am" }, { label: "Delivery", when: "6 Dec" }],
    closesInDays: 20, verified: true,
  },
  {
    id: "clinic-app", title: "Booking app for Garki Family Clinic, version 1", host: "ayo", org: "Garki Family Clinic", orgKind: "Health clinic", city: "Abuja", where: "Hybrid",
    photo: "studioBusy", summary: "Patients book and see their queue on their phones, so nobody waits outside from 6am.",
    about: "Our patients queue from 6am. We want a simple booking app (web is fine) that shows their place in the queue. We need a designer and a developer who'll talk to patients first.",
    roles: ["Product designer", "Developer"], fields: ["Tech", "Design"], level: "Two or more shipped projects",
    fee: "₦1.2m, paid at three milestones", rights: "The clinic owns the app. You can show it in your portfolio and you're credited in the app.",
    selection: "Ayo and the clinic manager review together. Shortlisted pairs get a 30-minute call.", teamSize: 2,
    materials: ab("clinic"), timeline: [{ label: "Applications close", when: "12 Nov" }, { label: "Patient interviews", when: "18–20 Nov" }, { label: "First version", when: "15 Dec" }],
    closesInDays: 17, verified: true,
  },
  {
    id: "youth-podcast", title: "Abuja Youth Podcast: season one", host: ME, org: "Wuse Tech Hangout", orgKind: "Akines community", city: "Abuja", where: "Hybrid",
    photo: "talkYoung", summary: "Eight episodes on starting out in Abuja: first jobs, first rent, first business.",
    about: "We're making an eight-episode podcast with young people starting out in Abuja. We need an audio editor, a cover designer and two co-hosts who'd enjoy asking good questions.",
    roles: ["Audio editor", "Cover designer", "Co-host"], fields: ["Media", "Community"], level: "Any level",
    fee: "₦80,000 per episode for editing · ₦150,000 for the cover · co-hosts credited", rights: "Everyone is credited in every episode. The community owns the show; you can share your part anywhere.",
    selection: "You review the applications. Shortlisted people get a 20-minute call.", teamSize: 4,
    materials: ab("pod"), timeline: [{ label: "Applications close", when: "10 Nov" }, { label: "Recording starts", when: "17 Nov" }, { label: "Episode one", when: "1 Dec" }],
    closesInDays: 15, verified: true, postedByMe: true,
  },
  {
    id: "indigo-futures", title: "Indigo Futures Residency", host: "efua", org: "Abeokuta Dye Works", orgKind: "Craft workshop", city: "Abeokuta", where: "In person",
    photo: "textileHang", summary: "Four weeks with master dyers, for textile artists and designers early in their careers.",
    about: "Live and work at the dye works for four weeks, learn adire from the women who've done it for forty years, and make one new piece with them.",
    roles: ["Resident"], fields: ["Arts", "Design"], level: "Early to mid career",
    fee: "Stipend ₦300,000 · housing and meals included", rights: "Your work stays yours. The dye works may show it in their end-of-residency exhibition.",
    selection: "A panel of three dyers reviews applications.", teamSize: 4,
    materials: ab("indigo"), timeline: [{ label: "Applications close", when: "1 Nov" }, { label: "Residency", when: "Jan 2027" }],
    closesInDays: 6, verified: true,
  },
  {
    id: "supply-drive", title: "Back-to-school supply drive", host: "thandi", org: "Kubwa Parents' Forum", orgKind: "Parents' group", city: "Abuja", where: "In person",
    photo: "talkGroup", summary: "Get 400 school packs to children in Kubwa before term starts.",
    about: "Last year we packed 250 bags on one Saturday. This year we want 400, and we need people who can organise: someone to run the day, someone for pick-ups and drop-offs, and someone to tell the story online.",
    roles: ["Volunteer lead", "Logistics", "Social media"], fields: ["Community"], level: "Anyone who can give two Saturdays",
    fee: "Volunteer · transport and lunch covered", rights: "Photos are shared with families' consent only.",
    selection: "Thandi calls everyone who applies.", teamSize: 3,
    materials: ab("supply").filter((m) => m.id !== "works"), timeline: [{ label: "Applications close", when: "20 Nov" }, { label: "Packing day", when: "6 Dec" }],
    closesInDays: 25, verified: false,
  },
  {
    id: "matchday-food", title: "Matchday food stalls for the Area 1 Youth League", host: "tunde", org: "Area 1 Youth League", orgKind: "Youth sports", city: "Abuja", where: "In person",
    photo: "talkMugs", summary: "Food, photos and a little design for the league's final, with 2,000 people expected.",
    about: "Our final draws families from all over Garki. We want local cooks to run three stalls, a photographer, and someone to design the stall signs and menu boards.",
    roles: ["Caterer", "Photographer", "Event designer"], fields: ["Food", "Community", "Design"], level: "Any level",
    fee: "₦200,000 per stall · ₦120,000 photos · ₦90,000 design", rights: "The league may post the photos. Cooks keep their recipes and their takings.",
    selection: "Tunde and two coaches choose.", teamSize: 5,
    materials: ab("match"), timeline: [{ label: "Applications close", when: "18 Nov" }, { label: "Final", when: "29 Nov" }],
    closesInDays: 23, verified: true,
  },
];

export function seedState(): CollabState {
  const now = Date.now();
  const applications: Application[] = [
    // Mine: one in progress, one decided (so "every applicant hears back" is visible).
    {
      id: "a-clinic", callId: "clinic-app", applicant: ME, role: "Product designer", works: ["w-clinic", "w-journal", "w-research"],
      statement: "I redesigned a clinic check-in last year and spent two mornings in the queue first. I'd start the same way here.", availability: "Weekday afternoons and Saturdays",
      materials: { works: true, why: true, availability: true }, stage: "viewed",
      history: [{ stage: "submitted", at: now - 2 * DAY }, { stage: "viewed", at: now - DAY, note: "Ayo opened your application." }], notes: [], tags: [],
    },
    {
      id: "a-bread", callId: "kubwa-bread", applicant: ME, role: "Photographer", works: ["w-poster"],
      statement: "I'd shoot the bakery in the dark before 4am: flour in the lamp light, the first tray out. Honest, warm, no staging.", availability: "22 Nov from 3am, and edits the week after",
      materials: { works: true, why: true, availability: true }, stage: "joined", slot: "Tue 12 Nov · 10:00", projectId: "kubwa-bread-shoot",
      offer: { role: "Photographer", fee: "₦175,000", start: "Fri 22 Nov, 3:30am at the bakery" },
      history: [
        { stage: "submitted", at: now - 6 * DAY }, { stage: "viewed", at: now - 5 * DAY }, { stage: "shortlisted", at: now - 5 * DAY + 3 * HOUR },
        { stage: "conversation", at: now - 3 * DAY, note: "Conversation booked: Tue 12 Nov · 10:00." }, { stage: "offer", at: now - DAY, note: "Fatou offered you the Photographer role." },
        { stage: "joined", at: now - 2 * HOUR, note: "You accepted. The project workspace is open." },
      ],
      notes: [], tags: [],
    },
    {
      id: "a-indigo", callId: "indigo-futures", applicant: ME, role: "Resident", works: ["w-poster", "w-mentoring"],
      statement: "I want to learn how pattern carries meaning in cloth, for my stall identity work.", availability: "All of January",
      materials: { works: true, why: true, availability: true }, stage: "not-selected",
      history: [{ stage: "submitted", at: now - 9 * DAY }, { stage: "viewed", at: now - 8 * DAY }, { stage: "not-selected", at: now - 3 * DAY }],
      feedback: "Thank you, Amara. We chose residents with more hands-on dyeing this time. Your stall identities were lovely; come to our open studio day on 14 Dec and dye something with us.",
      notes: [], tags: [],
    },
    // Coming in to the call I host.
    ...([
      ["chidi", "Audio editor", "I edit my department's lecture recordings and a friend's football podcast. I'd love to learn properly on a real show.", "submitted", 5 * HOUR],
      ["kwame", "Audio editor", "Eight years of software, three of them editing a tech podcast on the side. I care about clean levels and short edits.", "viewed", 26 * HOUR],
      ["wanjiru", "Cover designer", "Most of my work is photography; the cover could be a portrait of your guests, shot in Wuse.", "shortlisted", 2 * DAY],
      ["leila", "Co-host", "I started my company at 23 and made every mistake. I'd ask the questions I wish someone had asked me.", "submitted", 3 * HOUR],
      ["nandi", "Co-host", "I'm a therapist; I'd bring the quieter questions about money, family and pressure.", "submitted", 40 * MIN],
    ] as const).map(([who, role, statement, stage, ago]): Application => ({
      id: `in-${who}`, callId: "youth-podcast", applicant: who, role, works: [], ...INCOMING_PROOF[who], statement, availability: "Weekends", materials: { works: true, why: true, availability: true },
      stage, slot: stage === "shortlisted" ? "Thu 14 Nov · 16:00" : undefined,
      history: [{ stage: "submitted", at: now - ago }, ...(stage !== "submitted" ? [{ stage: "viewed" as const, at: now - ago + HOUR }] : []), ...(stage === "shortlisted" ? [{ stage: "shortlisted" as const, at: now - ago + 2 * HOUR }] : [])],
      notes: who === "kwame" ? [{ at: now - 20 * HOUR, text: "Strong on audio quality. Ask about time per episode." }] : [], tags: who === "wanjiru" ? ["Strong visuals"] : [],
    })),
  ];

  const market: Project = {
    id: "market-light", title: "Market Light", summary: "A small photo book of Wuse Market traders, in their own words.", photo: "beadsShop", host: "wanjiru",
    members: [
      { id: "wanjiru", role: "Photographer", contribution: "Portraits and market photos" },
      { id: ME, role: "Designer", contribution: "Book layout, type and cover" },
      { id: "efua", role: "Historian", contribution: "Trader interviews and captions" },
    ],
    stage: 3, createdAt: now - 18 * DAY,
    charter: {
      credit: "All three names on the cover, in alphabetical order. Each trader is named with their photo.",
      ownership: "Photos stay Wanjiru's, interviews stay Efua's, the layout stays Amara's. The book as a whole belongs to all three.",
      decisions: "Day-to-day decisions by whoever owns that part. The cover and the title need all three.",
      expenses: "Printing and transport come out of the shared budget first. Receipts go in the workspace.",
      uses: "Each of us can show our part anywhere. Selling the book needs all three to agree.",
      exit: "Anyone can leave with two weeks' notice. Their finished work stays in the book, credited.",
      split: { wanjiru: 40, amara: 30, efua: 30 }, signed: ["wanjiru", "amara", "efua"], signedAt: now - 15 * DAY,
    },
    tasks: [
      { id: "t1", title: "Shoot the fabric row (6 traders)", who: "wanjiru", due: "Sat 2 Nov", status: "done" },
      { id: "t2", title: "Transcribe Mama Ngozi's interview", who: "efua", due: "Mon 4 Nov", status: "doing" },
      { id: "t3", title: "First full layout, 24 pages", who: ME, due: "Fri 8 Nov", status: "doing" },
      { id: "t4", title: "Choose the cover photo", who: "wanjiru", due: "Fri 8 Nov", status: "todo" },
      { id: "t5", title: "Get printing quotes (3 printers)", who: ME, due: "Wed 13 Nov", status: "todo" },
    ],
    milestones: [
      { id: "m1", title: "All traders photographed", due: "2 Nov", done: true },
      { id: "m2", title: "Interviews written up", due: "6 Nov", done: false },
      { id: "m3", title: "Layout signed off by all three", due: "15 Nov", done: false },
      { id: "m4", title: "Launch at the market", due: "7 Dec", done: false },
    ],
    studio: [
      { id: "s1", kind: "image", title: "Mama Ngozi at her stall", by: "wanjiru", tag: "Final", at: now - 6 * DAY, photo: "beadsPile", comments: [{ by: "efua", text: "This is the cover. Look at her hands.", at: now - 6 * DAY + HOUR }] },
      { id: "s2", kind: "image", title: "Fabric row, early morning", by: "wanjiru", tag: "Draft", at: now - 5 * DAY, photo: "textileStack", comments: [] },
      { id: "s3", kind: "note", title: "Caption style", by: "efua", tag: "Reference", at: now - 4 * DAY, text: "First name, stall, years at the market, one sentence in their own words. No more than 30 words.", comments: [{ by: ME, text: "Agreed. I'll set them in the sans at 9pt.", at: now - 4 * DAY + 2 * HOUR }] },
      { id: "s4", kind: "image", title: "Layout draft, spread 3", by: ME, tag: "Draft", at: now - 2 * DAY, photo: "journalOpen", comments: [] },
      { id: "s5", kind: "image", title: "Bead seller's tray", by: "wanjiru", tag: "Draft", at: now - DAY, photo: "beadsGold", comments: [] },
    ],
    present: { what: "Launch at Wuse Market, with the traders", where: "Wuse Market, fabric row", when: "Sat 7 Dec · 10:00", checklist: [{ label: "Permission from the market association", done: true }, { label: "Print 200 copies", done: false }, { label: "A copy for every trader in the book", done: false }, { label: "Invite the community", done: false }] },
    budget: { total: 450_000, currency: "₦", expenses: [{ id: "e1", label: "Transport to the market (6 trips)", amount: 18_000, by: "wanjiru", status: "paid" }, { id: "e2", label: "Recorder batteries", amount: 6_500, by: "efua", status: "paid" }, { id: "e3", label: "Printing deposit", amount: 120_000, by: ME, status: "pending" }], paidOut: [] },
    ledger: [
      { at: now - 18 * DAY, who: "wanjiru", what: "Started the project and invited Amara and Efua" },
      { at: now - 15 * DAY, who: "akines", what: "Charter signed by all three. Work can start." },
      { at: now - 12 * DAY, who: "wanjiru", what: "Added 46 photos to the studio" },
      { at: now - 6 * DAY, who: "efua", what: "Marked \"Mama Ngozi at her stall\" as the cover" },
      { at: now - 6 * DAY, who: "akines", what: "Milestone done: all traders photographed" },
    ],
    convoId: "co-market-light", rooms: [],
  };

  /** Just accepted: the team agrees the terms first. Fatou and Chidi have signed; your signature opens the work. */
  const bread: Project = {
    id: "kubwa-bread-shoot", title: "A short brand film for Kubwa Bread Co.", summary: "A 60-second film and ten photos about the family behind Kubwa's favourite bakery.", photo: "talkCafe", host: "fatou", callId: "kubwa-bread",
    members: [
      { id: "fatou", role: "Host", contribution: "For Kubwa Bread Co." },
      { id: "chidi", role: "Videographer", contribution: "The 60-second film and sound" },
      { id: ME, role: "Photographer", contribution: "Ten photos for the page and the shop wall" },
    ],
    stage: 2, createdAt: now - 2 * HOUR,
    charter: {
      credit: "Film and photos credited to Chidi and Amara on every post and on the shop wall. The bakery is credited as the client.",
      ownership: "The bakery may use the film and photos online and in the shop for three years. Raw footage and outtakes stay with Chidi and Amara.",
      decisions: "Fatou approves the final cut and the ten photos. Chidi and Amara decide how to shoot.",
      expenses: "Transport to the 4am shoot comes out of the budget first, with receipts in the workspace.",
      uses: "Chidi and Amara can show the work in their portfolios once the bakery has posted it.",
      exit: "If someone can't make the shoot, they say so a week before. Work already delivered is paid for.",
      split: { fatou: 0, chidi: 50, amara: 50 }, signed: ["fatou", "chidi"],
    },
    tasks: [
      { id: "b1", title: "Visit the bakery and plan the shots", who: "chidi", due: "Mon 18 Nov", status: "todo" },
      { id: "b2", title: "Shot list: ten photos", who: ME, due: "Tue 19 Nov", status: "todo" },
      { id: "b3", title: "Share opening hours and who'll be on shift", who: "fatou", due: "Mon 18 Nov", status: "todo" },
    ],
    milestones: [
      { id: "bm1", title: "Terms agreed by everyone", due: "This week", done: false },
      { id: "bm2", title: "Shoot day at 4am", due: "22 Nov", done: false },
      { id: "bm3", title: "Film and photos delivered", due: "6 Dec", done: false },
    ],
    studio: [
      { id: "bs1", kind: "note", title: "What the film should feel like", by: "fatou", tag: "Reference", at: now - HOUR, text: "Warm, early, a bit sleepy. My mother kneading, my brother loading the van. No music with words.", comments: [] },
    ],
    present: { what: "Film on the bakery's page, photos on the shop wall", where: "Kubwa Bread Co., Kubwa", when: "Sat 7 Dec", checklist: [{ label: "Final cut approved by Fatou", done: false }, { label: "Ten photos printed for the wall", done: false }, { label: "Post the film", done: false }] },
    budget: { total: 350_000, currency: "₦", expenses: [], paidOut: [] },
    ledger: [
      { at: now - 2 * HOUR - 20 * MIN, who: "fatou", what: "Accepted Amara and Chidi from the open call" },
      { at: now - 2 * HOUR, who: "akines", what: "Workspace opened. Agree the terms to start." },
      { at: now - 90 * MIN, who: "fatou", what: "Signed the charter" },
      { at: now - HOUR, who: "chidi", what: "Signed the charter" },
    ],
    convoId: "co-kubwa-bread-shoot", rooms: [],
  };

  return { v: 1, calls: SEED_CALLS, applications, projects: [bread, market], proposals: [], saved: [] };
}
