import type { PersonId } from "@/lib/data/people";
import type { Application, CollabCall, CollabState, Deliverable, ProofFile, Project } from "./types";

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

/** A deliverable for the sample projects. */
function dl(d: Partial<Deliverable> & Pick<Deliverable, "id" | "title" | "owner" | "approver" | "due" | "status">): Deliverable {
  return { steps: [], proof: [], thread: [], ...d };
}

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
    convoId: "co-market-light", rooms: [], kind: "make",
    tools: [
      { id: "ml-t1", label: "Photo folder", url: "https://drive.google.com/drive/folders/market-light", kind: "drive" },
      { id: "ml-t2", label: "Book layout", url: "https://figma.com/file/market-light-book", kind: "figma" },
    ],
    deliverables: [
      dl({ id: "ml-d1", title: "Portraits of 24 traders", owner: "wanjiru", approver: ME, due: "2 Nov", share: 35, status: "approved", approvedAt: now - 6 * DAY,
        proof: [{ id: "ml-p1", kind: "image", title: "Mama Ngozi at her stall", photo: "beadsPile", by: "wanjiru", at: now - 7 * DAY }, { id: "ml-p2", kind: "link", title: "All 46 selects", url: "https://drive.google.com/drive/folders/market-light", by: "wanjiru", at: now - 7 * DAY }],
        thread: [{ by: "wanjiru", text: "All 24 traders, two frames each. Selects are in the folder.", at: now - 7 * DAY, kind: "submitted" }, { by: ME, text: "These are beautiful. Approved.", at: now - 6 * DAY, kind: "approved" }] }),
      dl({ id: "ml-d2", title: "Trader interviews, written up", owner: "efua", approver: "wanjiru", due: "6 Nov", share: 25, status: "doing",
        steps: [{ id: "s1", title: "Fabric row (6)", done: true }, { id: "s2", title: "Bead sellers (8)", done: true }, { id: "s3", title: "Food stalls (10)", done: false }],
        proof: [{ id: "ml-p3", kind: "note", title: "Caption style", text: "First name, stall, years at the market, one sentence in their own words. No more than 30 words.", by: "efua", at: now - 4 * DAY }] }),
      dl({ id: "ml-d3", title: "Book layout, 24 pages", owner: ME, approver: "wanjiru", due: "15 Nov", share: 25, status: "doing",
        steps: [{ id: "s1", title: "Grid and type", done: true }, { id: "s2", title: "Spreads 1–6", done: true }, { id: "s3", title: "Spreads 7–12", done: false }],
        proof: [{ id: "ml-p4", kind: "image", title: "Spread 3 draft", photo: "journalOpen", by: ME, at: now - 2 * DAY }, { id: "ml-p5", kind: "link", title: "Layout in Figma", url: "https://figma.com/file/market-light-book", by: ME, at: now - 2 * DAY }] }),
      dl({ id: "ml-d4", title: "Launch at Wuse Market", owner: "wanjiru", approver: "efua", due: "7 Dec", share: 15, status: "todo" }),
    ],
    checkins: [
      { id: "ml-c1", who: "efua", at: now - DAY, done: "Wrote up the bead sellers.", next: "Food stalls on Thursday morning.", stuck: "Two traders want to check their quotes first." },
      { id: "ml-c2", who: "wanjiru", at: now - DAY - 3 * HOUR, done: "Picked three cover options.", next: "Print tests on Saturday." },
    ],
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
    convoId: "co-kubwa-bread-shoot", rooms: [], kind: "make",
    tools: [{ id: "kb-t1", label: "Shot list and footage", url: "https://drive.google.com/drive/folders/kubwa-bread", kind: "drive" }],
    deliverables: [
      dl({ id: "kb-d1", title: "Shot list: ten photos", owner: ME, approver: "fatou", due: "Tue 19 Nov", share: 10, status: "todo" }),
      dl({ id: "kb-d2", title: "The 60-second film", owner: "chidi", approver: "fatou", due: "6 Dec", share: 45, status: "todo" }),
      dl({ id: "kb-d3", title: "Ten finished photos", owner: ME, approver: "fatou", due: "6 Dec", share: 45, status: "todo" }),
    ],
    checkins: [],
  };

  const base = { stage: 3 as const, present: { what: "", where: "", when: "", checklist: [] }, studio: [], tasks: [], milestones: [], rooms: [] };

  /** Build: a clinic app with a team of six. Four of them are waiting for your review. */
  const clinic: Project = {
    ...base, id: "garki-clinic-booking", title: "Garki Clinic booking app", summary: "Online booking and SMS reminders, so patients stop waiting three hours to be seen.", photo: "studioBusy", host: "ayo", kind: "build", createdAt: now - 24 * DAY,
    members: [
      { id: "ayo", role: "Client", contribution: "For Garki Family Clinic" },
      { id: ME, role: "Product lead", contribution: "Design, and reviews the team's work" },
      { id: "kwame", role: "Backend developer", contribution: "Booking API, SMS and the admin screen" },
      { id: "chidi", role: "Frontend developer", contribution: "The patient booking screens" },
      { id: "wanjiru", role: "Photographer", contribution: "Photos of the clinic and staff" },
      { id: "leila", role: "Content", contribution: "Help text and messages" },
    ],
    charter: {
      credit: "Everyone credited in the app's About page and free to show their part in their portfolio.", ownership: "The clinic owns the app and its data. Developers keep the right to reuse their general code; the designer keeps her design system.",
      decisions: "Amara reviews the team's work first; Dr Ayo approves what goes live after trying it on the test site.", expenses: "SMS credits and hosting come out of the budget first.", uses: "Screenshots without patient data can be shown anywhere.", exit: "Two weeks' notice. Approved work is paid for.",
      split: { ayo: 0, amara: 25, kwame: 35, chidi: 25, wanjiru: 7, leila: 8 }, signed: ["ayo", ME, "kwame", "chidi", "wanjiru", "leila"], signedAt: now - 22 * DAY,
    },
    tools: [
      { id: "gc-t1", label: "Code repository", url: "https://github.com/garki-clinic/booking", kind: "github" },
      { id: "gc-t2", label: "Designs", url: "https://figma.com/file/garki-booking", kind: "figma" },
      { id: "gc-t3", label: "Test site", url: "https://staging.garkiclinic.ng", kind: "site" },
    ],
    deliverables: [
      dl({ id: "gc-d1", title: "Booking flow design", owner: ME, approver: "ayo", due: "Week 2", share: 15, status: "approved", approvedAt: now - 14 * DAY,
        proof: [{ id: "gc-p1", kind: "link", title: "Booking flow in Figma", url: "https://figma.com/file/garki-booking", by: ME, at: now - 15 * DAY }],
        thread: [{ by: ME, text: "Three screens: pick a time, confirm, reminder settings.", at: now - 15 * DAY, kind: "submitted" }, { by: "ayo", text: "My receptionist tried it on her phone in a minute. Approved.", at: now - 14 * DAY, kind: "approved" }] }),
      dl({ id: "gc-d2", title: "Booking API and database", owner: "kwame", approver: "ayo", due: "Week 3", share: 20, status: "approved", approvedAt: now - 6 * DAY,
        proof: [{ id: "gc-p2", kind: "link", title: "Pull request #14: bookings", url: "https://github.com/garki-clinic/booking/pull/14", by: "kwame", at: now - 7 * DAY }, { id: "gc-p3", kind: "file", title: "API docs", file: { id: "f-api", name: "Booking-API.pdf", size: 420 * 1024, type: "pdf", kind: "sample" }, by: "kwame", at: now - 7 * DAY }],
        thread: [{ by: "kwame", text: "Bookings, cancellations and the daily list. Tested with 500 fake bookings.", at: now - 7 * DAY, kind: "submitted" }, { by: "ayo", text: "Tried booking and cancelling on the test site. Works. Approved.", at: now - 6 * DAY, kind: "approved" }] }),
      dl({ id: "gc-d3", title: "Admin screen for the front desk", owner: "kwame", approver: ME, due: "Week 4", share: 15, status: "review",
        proof: [{ id: "gc-p4", kind: "link", title: "Try it on the test site", url: "https://staging.garkiclinic.ng/admin", by: "kwame", at: now - 5 * HOUR }, { id: "gc-p5", kind: "link", title: "Pull request #21: admin screen", url: "https://github.com/garki-clinic/booking/pull/21", by: "kwame", at: now - 5 * HOUR }],
        thread: [{ by: "kwame", text: "Built from your designs. Can you check it matches before Dr Ayo sees it?", at: now - 5 * HOUR, kind: "submitted" }] }),
      dl({ id: "gc-d6", title: "Patient booking screens", owner: "chidi", approver: ME, due: "Week 4", share: 15, status: "review",
        steps: [{ id: "s1", title: "Pick a time", done: true }, { id: "s2", title: "Confirm", done: true }, { id: "s3", title: "Reminder settings", done: true }],
        proof: [{ id: "gc-p7", kind: "link", title: "Try it on your phone", url: "https://staging.garkiclinic.ng/book", by: "chidi", at: now - 2 * HOUR }, { id: "gc-p8", kind: "file", title: "Screen recording", file: { id: "f-rec", name: "Booking-walkthrough.mp4", size: 4600 * 1024, type: "mp4", kind: "sample" }, by: "chidi", at: now - 2 * HOUR }],
        thread: [{ by: "chidi", text: "All three screens are done and work on a cheap Android phone. Recording attached.", at: now - 2 * HOUR, kind: "submitted" }] }),
      dl({ id: "gc-d7", title: "Photos of the clinic and staff", owner: "wanjiru", approver: ME, due: "Week 4", share: 5, status: "review",
        proof: [{ id: "gc-p9", kind: "image", title: "Front desk, morning", photo: "talkGroup", by: "wanjiru", at: now - 70 * MIN }, { id: "gc-p10", kind: "image", title: "Dr Ayo with the nurses", photo: "talkTwo", by: "wanjiru", at: now - 70 * MIN }, { id: "gc-p11", kind: "image", title: "Waiting room", photo: "calmBench", by: "wanjiru", at: now - 70 * MIN }],
        thread: [{ by: "wanjiru", text: "Twelve photos, three of my favourites here. Everyone signed a release.", at: now - 70 * MIN, kind: "submitted" }] }),
      dl({ id: "gc-d8", title: "Help text and messages", owner: "leila", approver: ME, due: "Week 4", share: 5, status: "review",
        proof: [{ id: "gc-p12", kind: "link", title: "All app text", url: "https://docs.google.com/document/d/garki-app-text", by: "leila", at: now - 35 * MIN }, { id: "gc-p13", kind: "note", title: "Tone", text: "Short, warm and plain. No medical words a patient wouldn't use.", by: "leila", at: now - 35 * MIN }],
        thread: [{ by: "leila", text: "Every screen's text in one doc. Hausa versions next week once you're happy.", at: now - 35 * MIN, kind: "submitted" }] }),
      dl({ id: "gc-d4", title: "SMS reminders in English and Hausa", owner: ME, approver: "ayo", due: "Week 4", share: 5, status: "doing",
        steps: [{ id: "s1", title: "English copy", done: true }, { id: "s2", title: "Hausa copy, checked by a nurse", done: false }],
        proof: [{ id: "gc-p6", kind: "note", title: "Reminder, day before", text: "Hello {name}, your appointment at Garki Family Clinic is tomorrow at {time}. Reply 1 to confirm or 2 to cancel.", by: ME, at: now - DAY }] }),
      dl({ id: "gc-d9", title: "Accessibility check", owner: "chidi", approver: ME, due: "Week 5", share: 5, status: "todo" }),
      dl({ id: "gc-d5", title: "Launch at the clinic", owner: "kwame", approver: "ayo", due: "Week 5", share: 15, status: "todo" }),
    ],
    checkins: [
      { id: "gc-c3", who: "leila", at: now - 40 * MIN, done: "Wrote every screen's text.", next: "Hausa versions with a nurse." },
      { id: "gc-c2", who: "chidi", at: now - 2 * HOUR - 10 * MIN, done: "Finished the three booking screens.", next: "Accessibility check.", stuck: "Need a real Android phone below ₦60k to test on." },
      { id: "gc-c1", who: "kwame", at: now - 5 * HOUR, done: "Finished the admin screen and sent it for review.", next: "SMS gateway once the copy is final.", stuck: "Need the Hausa reminder text." },
    ],
    budget: { total: 1_200_000, currency: "₦", expenses: [{ id: "gc-e1", label: "SMS credits (first 2,000)", amount: 24_000, by: "kwame", status: "paid" }], paidOut: [] },
    ledger: [
      { at: now - 24 * DAY, who: "ayo", what: "Started the project and invited the team" },
      { at: now - 22 * DAY, who: "akines", what: "Charter signed by all six. Work can start." },
      { at: now - 14 * DAY, who: "ayo", what: "Approved \"Booking flow design\", delivered by Amara" },
      { at: now - 6 * DAY, who: "ayo", what: "Approved \"Booking API and database\", delivered by Kwame" },
      { at: now - 5 * HOUR, who: "kwame", what: "Sent \"Admin screen for the front desk\" to Amara for review" },
      { at: now - 2 * HOUR, who: "chidi", what: "Sent \"Patient booking screens\" to Amara for review" },
      { at: now - 70 * MIN, who: "wanjiru", what: "Sent \"Photos of the clinic and staff\" to Amara for review" },
      { at: now - 35 * MIN, who: "leila", what: "Sent \"Help text and messages\" to Amara for review" },
    ],
    convoId: "co-garki-clinic-booking",
  };

  /** Study: a final-year group project, with you as their industry mentor. Tunde's survey is waiting for you. */
  const study: Project = {
    ...base, id: "kubwa-ride-final-year", title: "Final-year project: a ride app for Kubwa students", summary: "Three engineering students design and test a shared-ride app for the Kubwa–campus route.", photo: "notebookWhite", host: "chidi", kind: "study", createdAt: now - 40 * DAY,
    members: [
      { id: "chidi", role: "Group lead", contribution: "Research question, report" },
      { id: "tunde", role: "Student", contribution: "Survey and data" },
      { id: "wanjiru", role: "Student", contribution: "Prototype" },
      { id: ME, role: "Industry mentor", contribution: "Reviews each section" },
      { id: "efua", role: "Supervisor", contribution: "Final sign-off and grading" },
    ],
    charter: {
      credit: "All three students named on the report in alphabetical order; mentor and supervisor in the acknowledgements.", ownership: "The students own the work. The department keeps a copy.",
      decisions: "The group agrees each section; the mentor reviews it; the supervisor signs off the final report.", expenses: "Survey printing split three ways.", uses: "The students can show it in their portfolios.", exit: "If someone stops contributing, the record shows it and the supervisor decides.",
      split: { chidi: 34, tunde: 33, wanjiru: 33, amara: 0, efua: 0 }, signed: ["chidi", "tunde", "wanjiru", ME, "efua"], signedAt: now - 38 * DAY,
    },
    tools: [
      { id: "st-t1", label: "Report draft", url: "https://docs.google.com/document/d/kubwa-ride-report", kind: "drive" },
      { id: "st-t2", label: "Survey data", url: "https://docs.google.com/spreadsheets/d/kubwa-ride-survey", kind: "drive" },
    ],
    deliverables: [
      dl({ id: "st-d1", title: "Research question and plan", owner: "chidi", approver: ME, due: "Week 2", share: 15, status: "approved", approvedAt: now - 30 * DAY,
        proof: [{ id: "st-p1", kind: "file", title: "Proposal", file: { id: "f-prop", name: "Project-proposal.pdf", size: 310 * 1024, type: "pdf", kind: "sample" }, by: "chidi", at: now - 31 * DAY }],
        thread: [{ by: "chidi", text: "Our question: can a shared-ride app cut the morning wait on the Kubwa route by half?", at: now - 31 * DAY, kind: "submitted" }, { by: ME, text: "Clear and testable. Approved.", at: now - 30 * DAY, kind: "approved" }] }),
      dl({ id: "st-d2", title: "Survey of 60 students", owner: "tunde", approver: ME, due: "Week 5", share: 25, status: "review",
        proof: [{ id: "st-p2", kind: "link", title: "Survey results", url: "https://docs.google.com/spreadsheets/d/kubwa-ride-survey", by: "tunde", at: now - 3 * HOUR }, { id: "st-p3", kind: "note", title: "Headline finding", text: "41 of 60 wait more than 40 minutes most mornings. 38 would share a ride for ₦300.", by: "tunde", at: now - 3 * HOUR }],
        thread: [{ by: "tunde", text: "62 responses in the end. Summary is in the note.", at: now - 3 * HOUR, kind: "submitted" }] }),
      dl({ id: "st-d3", title: "Clickable prototype", owner: "wanjiru", approver: ME, due: "Week 7", share: 25, status: "doing", steps: [{ id: "s1", title: "Sketches", done: true }, { id: "s2", title: "Figma screens", done: false }] }),
      dl({ id: "st-d4", title: "Final report", owner: "chidi", approver: "efua", due: "Week 10", share: 35, status: "todo" }),
    ],
    checkins: [{ id: "st-c1", who: "wanjiru", at: now - DAY, done: "Paper sketches of five screens.", next: "Figma version by Friday." }],
    budget: { total: 0, currency: "₦", expenses: [{ id: "st-e1", label: "Printing survey forms", amount: 4_500, by: "tunde", status: "paid" }], paidOut: [] },
    ledger: [
      { at: now - 40 * DAY, who: "chidi", what: "Started the project and invited the group, a mentor and the supervisor" },
      { at: now - 38 * DAY, who: "akines", what: "Charter signed by all five. Work can start." },
      { at: now - 30 * DAY, who: ME, what: "Approved \"Research question and plan\", delivered by Chidi" },
      { at: now - 3 * HOUR, who: "tunde", what: "Sent \"Survey of 60 students\" to Amara for review" },
    ],
    convoId: "co-kubwa-ride-final-year",
  };

  /** Teach: a co-taught evening course. Paid per session taught. */
  const course: Project = {
    ...base, id: "product-design-evening-course", title: "Evening course: product design basics", summary: "Six Tuesday evenings at Abuja Tech Hub for 20 people starting out in design.", photo: "talkGroup", host: "thandi", kind: "teach", createdAt: now - 20 * DAY,
    members: [
      { id: "thandi", role: "Course lead", contribution: "Runs the course and the hub booking" },
      { id: ME, role: "Lecturer", contribution: "Sessions on research and design" },
      { id: "kwame", role: "Guest lecturer", contribution: "The session on building with code" },
    ],
    charter: {
      credit: "Each lecturer named on the sessions they teach.", ownership: "Each lecturer keeps their own slides and may reuse them.", decisions: "Thandi confirms each session ran and sets the dates.",
      expenses: "Snacks and printing come out of the course fee first.", uses: "Recordings shared only with the class.", exit: "A month's notice, or find a replacement lecturer.",
      split: { thandi: 30, amara: 50, kwame: 20 }, signed: ["thandi", ME, "kwame"], signedAt: now - 18 * DAY,
    },
    tools: [
      { id: "pc-t1", label: "Class page", url: "https://classroom.google.com/c/product-design-basics", kind: "site" },
      { id: "pc-t2", label: "Slides folder", url: "https://drive.google.com/drive/folders/pd-basics-slides", kind: "drive" },
    ],
    deliverables: [
      dl({ id: "pc-d1", title: "Course outline", owner: "thandi", approver: ME, due: "Week 1", share: 10, status: "approved", approvedAt: now - 17 * DAY }),
      dl({ id: "pc-d2", title: "Session 1: What makes a good product?", owner: ME, approver: "thandi", due: "Tue 22 Oct", share: 15, status: "approved", approvedAt: now - 4 * DAY,
        proof: [{ id: "pc-p1", kind: "file", title: "Slides", file: { id: "f-s1", name: "Session-1-good-products.pdf", size: 3100 * 1024, type: "pdf", kind: "sample" }, by: ME, at: now - 5 * DAY }, { id: "pc-p2", kind: "note", title: "Attendance", text: "18 of 20 came. Two asked for the recording.", by: "thandi", at: now - 4 * DAY }],
        thread: [{ by: "thandi", text: "Ran beautifully. Approved.", at: now - 4 * DAY, kind: "approved" }] }),
      dl({ id: "pc-d3", title: "Session 2: Talking to users", owner: ME, approver: "thandi", due: "Tue 29 Oct", share: 15, status: "doing", steps: [{ id: "s1", title: "Slides", done: true }, { id: "s2", title: "Interview practice cards", done: false }] }),
      dl({ id: "pc-d4", title: "Session 3: Building with code", owner: "kwame", approver: ME, due: "Tue 5 Nov", share: 15, status: "review",
        proof: [{ id: "pc-p3", kind: "file", title: "Draft slides", file: { id: "f-s3", name: "Session-3-building-with-code.pdf", size: 2400 * 1024, type: "pdf", kind: "sample" }, by: "kwame", at: now - 2 * HOUR }],
        thread: [{ by: "kwame", text: "First time teaching beginners. Is this too much code?", at: now - 2 * HOUR, kind: "submitted" }] }),
      dl({ id: "pc-d5", title: "Feedback from learners", owner: "thandi", approver: ME, due: "Week 6", share: 15, status: "todo" }),
    ],
    checkins: [],
    budget: { total: 600_000, currency: "₦", expenses: [], paidOut: [] },
    ledger: [
      { at: now - 20 * DAY, who: "thandi", what: "Started the course and invited Amara and Kwame" },
      { at: now - 18 * DAY, who: "akines", what: "Charter signed by all three. Work can start." },
      { at: now - 4 * DAY, who: "thandi", what: "Approved \"Session 1: What makes a good product?\", taught by Amara" },
      { at: now - 2 * HOUR, who: "kwame", what: "Sent \"Session 3: Building with code\" to Amara for review" },
    ],
    convoId: "co-product-design-evening-course",
  };

  return { v: 1, calls: SEED_CALLS, applications, projects: [bread, clinic, study, course, market], proposals: [], saved: [] };
}
