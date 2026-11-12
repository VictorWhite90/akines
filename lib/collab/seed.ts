import type { PersonId } from "@/lib/data/people";
import type { Application, Charter, CollabCall, CollabState, Member, Milestone, Project, Task } from "./types";

/*
 * The demo's collaboration content, word for word from the product design's sample data:
 *   - the projects looking for people of Discover projects (features/collaborate/projects/data.ts) and the open
 *     calls of Collaborate Home (start/home-data.ts), as our open calls;
 *   - Kemi's own open call, Mapping the Market Road, with the five people who applied (applicants/data.ts);
 *   - Kemi's four projects of My projects (workspace/data.ts, project-header/data.ts, project-team/data.ts):
 *     Career Guidance for Everyone, Community Learning Initiative, Mentorship Circle and Adire Stories.
 * The workspace content (tasks, decisions, files, conversations…) is keyed by these project ids.
 * The design's dates are the story's dates (November 2026), so they are fixed here rather than counted from today.
 */

const ME: PersonId = "kemi";
const HOUR = 3_600_000, DAY = 24 * HOUR;
/** A fixed day of the story, at 10:00 (month is 1-based). */
const on = (month: number, day: number, hour = 10, minute = 0) => new Date(2026, month - 1, day, hour, minute).getTime();

const ab = (id: string) => [
  { id: "works", label: "Your work", hint: "Pieces, links or files that show you can do this: whatever fits your work.", required: true },
  { id: "why", label: "Why this, and why you", hint: "A few honest lines, tailored to this call.", required: true },
  { id: "availability", label: "Your availability", hint: "The dates in the timeline below.", required: true },
  { id: `${id}-extra`, label: "A rough idea or sketch", hint: "Optional, but it helps.", required: false },
];

/** What every sample project and call agrees by default. */
const RIGHTS = "Everyone is credited for their part. What each person brings stays theirs.";
const SELECTION = "The project owner reads every request and replies to everyone.";

/** The talk times Ngozi shared (the design's Slot Picker, the disabled chips left out). */
export const NGOZI_SLOTS = [
  "Mon 9 Nov · 10:00", "Mon 9 Nov · 11:30", "Mon 9 Nov · 16:30",
  "Tue 10 Nov · 09:30", "Tue 10 Nov · 12:00", "Tue 10 Nov · 16:00", "Tue 10 Nov · 17:30",
  "Wed 11 Nov · 10:00", "Wed 11 Nov · 15:00", "Wed 11 Nov · 16:00",
];

type CallInput = Pick<CollabCall, "id" | "title" | "host" | "city" | "where" | "summary" | "about" | "roles" | "fields"> & Partial<CollabCall>;
const call = (c: CallInput): CollabCall => ({
  org: "", orgKind: "Independent project", photo: "collabArt", level: "Any level", fee: "Agreed together", rights: RIGHTS, selection: SELECTION,
  teamSize: c.roles.length + 1, materials: ab(c.id), timeline: [{ label: "Start", when: "Agreed together" }, { label: "Check-ins", when: "Every week" }],
  closesInDays: 30, verified: true, ...c,
});

/**
 * The calls, in the order Collaborate Home shows its open calls (A Better Way to Learn first) and Discover shows its
 * six projects. Which screen lists which call is in their profiles (lib/collab/projects.ts).
 */
export const SEED_CALLS: CollabCall[] = [
  call({
    id: "a-better-way-to-learn", title: "A Better Way to Learn", host: "ngozi", city: "Lagos", where: "Hybrid", photo: "notebookWhite",
    summary: "A digital learning initiative exploring more accessible ways for students to learn.",
    about: "A Better Way to Learn explores how simple, low-cost lesson tools can help students who learn at different speeds. The team has spoken with students and teachers in Lagos and is now shaping a first version that works on a basic phone.",
    roles: ["Product Designer", "Software Engineer", "Education Researcher"], fields: ["Tech", "Design"],
    fee: "6 hours a week, agreed together", timeline: [{ label: "Start", when: "Mon 23 Nov" }, { label: "Check-ins", when: "Every week" }],
  }),
  call({
    id: "craft-memory-archive", title: "Craft Memory Archive", host: "tunde-bello", city: "Ibadan", where: "Hybrid", photo: "textileHang",
    summary: "A shared archive documenting traditional craft techniques with the artisans who practise them.",
    about: "A shared archive documenting traditional craft techniques with the artisans who practise them.",
    roles: ["Photographer", "Researcher", "Web Developer"], fields: ["Arts", "Tech"], fee: "Two hours a week, agreed together.",
  }),
  call({
    id: "neighbourhood-story-map", title: "Neighbourhood Story Map", host: "chioma", city: "Lagos", where: "Hybrid", photo: "journalOpen",
    summary: "A shared map of the stories, places and voices that shape Lagos neighbourhoods.",
    about: "A shared map of the stories, places and voices that shape Lagos neighbourhoods.",
    roles: ["Illustrator", "Writer", "Front-end Developer"], fields: ["Arts", "Tech"],
  }),
  call({
    id: "voices-of-the-market", title: "Voices of the Market", host: "emeka-anozie", city: "Lagos", where: "Hybrid", photo: "beadsShop",
    summary: "A shared audio archive of the stories traders tell about their markets and their work.",
    about: "A shared audio archive of the stories traders tell about their markets and their work.",
    roles: ["Sound Recordist", "Writer", "Researcher"], fields: ["Media"],
  }),
  call({
    id: "learning-in-two-languages", title: "Learning in Two Languages", host: "halima-sani", city: "Kano", where: "Hybrid", photo: "talkGroup",
    summary: "A bilingual learning toolkit for primary school teachers working in two languages.",
    about: "A bilingual learning toolkit for primary school teachers working in two languages.",
    roles: ["Learning Designer", "Illustrator", "Teacher"], fields: ["Community", "Design"],
  }),
  call({
    id: "the-weaving-lab", title: "The Weaving Lab", host: "adaora", city: "Lagos", where: "Hybrid", photo: "textileHang",
    summary: "An open lab exploring how traditional weaving can shape modern product design.",
    about: "An open lab exploring how traditional weaving can shape modern product design.",
    roles: ["Product Designer", "Weaver", "Photographer"], fields: ["Design", "Arts"],
  }),
  call({
    id: "voices-of-lagos", title: "Voices of Lagos", host: "tunde-bakare", city: "Lagos", where: "In person", photo: "talkYoung",
    summary: "A documentary series capturing everyday stories from Lagos neighbourhoods.",
    about: "Voices of Lagos follows ordinary people through a day in their own neighbourhood. The team has filmed short test shoots and written an outline for the first episode, and now needs a small crew to shape it into a series.",
    roles: ["Cinematographer", "Sound Designer", "Documentary Editor"], fields: ["Media"],
  }),
  call({
    id: "clean-water-mapping", title: "Clean Water Mapping", host: "halima-yusuf", city: "Kaduna", where: "In person", photo: "calmBench",
    summary: "A community-led map of safe water points across Kaduna and Abuja.",
    about: "A community-led map of safe water points across Kaduna and Abuja.",
    roles: ["Field Researcher", "GIS Analyst", "Community Organiser"], fields: ["Community", "Tech"], closesInDays: 0,
  }),
  call({
    id: "market-women-ledger", title: "Market Women Ledger", host: "amaka", city: "Enugu", where: "Remote", photo: "beadsShop",
    summary: "A simple mobile ledger helping market traders record sales and savings.",
    about: "Market Women Ledger replaces paper notebooks with a simple phone app that records daily sales and savings. The team has spoken with traders about how they keep records today and is now building a first version.",
    roles: ["Mobile Developer", "UX Researcher", "Finance Advisor"], fields: ["Tech", "Business"],
  }),
  call({
    id: "stories-for-small-hands", title: "Stories for Small Hands", host: "ifeoma", city: "Kano", where: "Hybrid", photo: "journalOpen",
    summary: "An illustrated book series helping young students learn kindness in Hausa and English.",
    about: "Stories for Small Hands is a series of short picture books that teach kindness through everyday moments. The team has drafted the first story in English and is exploring how to publish each book in both Hausa and English.",
    roles: ["Illustrator", "Hausa Translator", "Children’s Book Editor"], fields: ["Arts", "Community"],
  }),
  call({
    id: "clinic-queue", title: "Clinic Queue", host: "dayo", city: "Ibadan", where: "Hybrid", photo: "studioBusy",
    summary: "A queue and appointment tool for busy primary health centres.",
    about: "Clinic Queue helps patients know when to arrive and helps nurses see who is waiting. The team has watched how queues work at two primary health centres and is now exploring a first version.",
    roles: ["Mobile Developer", "Health Informatics Lead", "UX Writer"], fields: ["Tech", "Community"],
  }),
  // Daniel's invitation to Kemi (Collaborate Home, "You've been invited"): the call behind Community Learning Initiative.
  call({
    id: "community-learning-initiative", title: "Community Learning Initiative", host: "daniel", city: "Lagos", where: "Hybrid", photo: "talkGroup",
    summary: "A project creating accessible learning opportunities for underserved communities.",
    about: "A weekend learning programme that pairs local tutors with students who need extra support.",
    roles: ["Product Designer"], fields: ["Community", "Design"], fee: "Flexible, based on agreed contribution.",
  }),
  // Kemi's own open call (12.46 Open calls), with no project yet.
  call({
    id: "mapping-the-market-road", title: "Mapping the Market Road: a call for a writer and a photographer", host: ME, city: "Lagos", where: "Hybrid", photo: "beadsShop",
    summary: "Stories and photographs of the traders along the market road, from Lagos to Port Harcourt.",
    about: "Stories and photographs of the traders along the market road, from Lagos to Port Harcourt.",
    roles: ["Writer", "Photographer"], fields: ["Media", "Arts"], postedByMe: true,
    timeline: [{ label: "Applications close", when: "Fri 20 Nov" }, { label: "Start", when: "Agreed together" }], closesInDays: 8,
  }),
];

/* ------------------------------------------------------------------ Kemi's projects */

function charter(members: PersonId[], signedAt: number): Charter {
  const even = Math.floor(100 / members.length);
  return {
    credit: "Every member is named on the finished work, in the order they joined.",
    ownership: "What each person brings stays theirs. What we make together belongs to all of us.",
    decisions: "Each person decides their own part. Anything that changes the whole needs everyone to agree.",
    expenses: "Agreed costs come out of the shared budget first, with receipts in the workspace.",
    uses: "Everyone can show their part anywhere. Selling or licensing the whole needs everyone to agree.",
    exit: "Anyone can leave with two weeks' notice. Their finished work stays in, credited.",
    split: Object.fromEntries(members.map((m, i) => [m, i === 0 ? 100 - even * (members.length - 1) : even])),
    signed: members, signedAt,
  };
}

/** A milestone. `label` is how the project bar and the cards say it ("Define the first student experience."). */
const ms = (id: string, title: string, due: string, done: boolean, label?: string): Milestone => ({ id, title, due, done, ...(label ? { label } : {}) });

type ProjectInput = Pick<Project, "id" | "title" | "summary" | "photo" | "host" | "stage" | "kind" | "createdAt" | "milestones" | "ledger"> & { members: Member[]; callId?: string; tasks?: Task[]; signed?: PersonId[] };
const project = ({ signed, tasks = [], ...p }: ProjectInput): Project => {
  const c = charter(p.members.map((m) => m.id), p.createdAt + 2 * DAY);
  return {
  ...p,
  // Agreed by everyone, unless the terms changed and only some have signed again (no signedAt then).
  charter: signed ? { ...c, signed, signedAt: undefined } : c,
  tasks, studio: [], rooms: [], tools: [], deliverables: [], checkins: [],
  present: { what: "", where: "", when: "", checklist: [] },
  budget: { total: 0, currency: "₦", expenses: [], paidOut: [] },
  convoId: `co-${p.id}`,
  };
};

/** The nine tasks of the design's Tasks page (12.14 and 12.36): the same ids on both projects, in the same order. */
const TASK_IDS = [
  "review-the-student-onboarding-draft", "collect-questions-students-ask-about-careers", "write-the-guided-onboarding-questions", "build-the-second-onboarding-screen",
  "confirm-the-final-interest-questions", "invite-two-schools-to-the-review", "plan-the-prototype-review-session", "share-the-career-interview-notes", "set-up-the-shared-canvas",
];
const tasks = (rows: [string, PersonId, string, Task["status"]][]): Task[] => rows.map(([title, who, due, status], i) => ({ id: TASK_IDS[i]!, title, who, due, status }));

export function seedState(): CollabState {
  const now = Date.now();

  const projects: Project[] = [
    project({
      id: "career-guidance-for-everyone", title: "Career Guidance for Everyone", photo: "notebookWhite", host: ME, stage: 3, kind: "build",
      summary: "A digital career guidance platform helping Nigerian students make informed career decisions.",
      members: [
        { id: ME, role: "Owner and Product Designer", contribution: "Leads the project and shapes the product direction." },
        { id: "adaeze", role: "Product Designer", contribution: "Designs the student-facing screens and helps the team review work." },
        { id: "tobi", role: "Software Engineer", contribution: "Builds the student onboarding screens in code." },
        { id: "ngozi", role: "Career Researcher", contribution: "Runs the student interviews and turns them into findings." },
      ],
      milestones: [
        ms("project-brief-approved", "Project brief approved", "12 October", true),
        ms("first-student-experience", "First Student Experience", "28 November", false, "Define the first student experience"),
        ms("prototype-review", "Prototype Review", "12 December", false),
      ],
      tasks: tasks([
        ["Review the student onboarding draft", "adaeze", "Fri 6 Nov", "doing"],
        ["Collect questions students ask about careers", "ngozi", "Mon 9 Nov", "doing"],
        ["Write the guided onboarding questions", ME, "Tue 10 Nov", "doing"],
        ["Build the second onboarding screen", "tobi", "Fri 13 Nov", "doing"],
        ["Confirm the final interest questions", "ngozi", "Fri 20 Nov", "todo"],
        ["Invite two schools to the review", "tobi", "Fri 27 Nov", "todo"],
        ["Plan the prototype review session", "adaeze", "Fri 4 Dec", "todo"],
        ["Share the career interview notes", "ngozi", "Tue 3 Nov", "done"],
        ["Set up the shared workspace", ME, "Mon 2 Nov", "done"],
      ]),
      signed: [ME, "adaeze"],
      createdAt: on(10, 20),
      ledger: [
        { at: on(10, 20), who: ME, what: "Started the project and invited the team" },
        { at: on(11, 3), who: ME, what: "Added decision-making rights, so everyone signs again" },
        { at: on(11, 3, 10, 30), who: ME, what: "Signed the charter" },
        { at: on(11, 3, 15), who: "adaeze", what: "Signed the charter" },
        { at: now - 2 * HOUR, who: "adaeze", what: "Asked Kemi to review the student onboarding draft" },
      ],
    }),
    project({
      id: "community-learning-initiative", title: "Community Learning Initiative", photo: "talkGroup", host: "ayo-balogun", stage: 2, kind: "teach", callId: "community-learning-initiative",
      summary: "A weekend learning programme that pairs local tutors with students who need extra support.",
      members: [
        { id: "ayo-balogun", role: "Owner", contribution: "Leads the programme" },
        { id: ME, role: "Product Designer", contribution: "Shapes the learning experience" },
        { id: "tolu", role: "Volunteer Coordinator", contribution: "Recruits and supports the tutors" },
        { id: "funke", role: "Education Researcher", contribution: "Shapes the session format" },
      ],
      milestones: [
        ms("project-brief-approved", "Project brief approved", "20 October", true),
        ms("weekend-session-format", "Weekend Session Format", "30 November", false, "Agree the weekend session format"),
        ms("tutor-onboarding-plan", "Tutor Onboarding Plan", "14 December", false),
      ],
      createdAt: on(10, 10),
      ledger: [
        { at: on(10, 10), who: "ayo-balogun", what: "Started the project and invited the team" },
        { at: on(10, 20), who: "akines", what: "Milestone done: Project brief approved" },
        { at: now - DAY, who: "tolu", what: "Drafted the tutor list" },
      ],
    }),
    project({
      id: "mentorship-circle", title: "Mentorship Circle", photo: "talkTwo", host: ME, stage: 2, kind: "teach",
      summary: "A peer mentoring programme connecting final-year students with early-career professionals.",
      members: [
        { id: ME, role: "Owner", contribution: "Leads the programme" },
        { id: "bisi-fashola", role: "Mentor Coordinator", contribution: "Recruits the mentors" },
        { id: "emeka-nwosu", role: "Programme Support", contribution: "Keeps the mentor shortlist" },
      ],
      milestones: [
        ms("project-brief-approved", "Project brief approved", "18 October", true),
        ms("mentor-recruitment", "Mentor Recruitment", "27 November", false, "Recruit the first six mentors"),
        ms("mentor-guide", "Mentor Guide", "11 December", false),
      ],
      createdAt: on(10, 8),
      ledger: [
        { at: on(10, 8), who: ME, what: "Started the project and invited the team" },
        { at: on(10, 18), who: "akines", what: "Milestone done: Project brief approved" },
        { at: now - 3 * DAY, who: "bisi-fashola", what: "Shared the mentor sign-up form" },
      ],
    }),
    project({
      id: "adire-stories", title: "Adire Stories", photo: "textileHang", host: ME, stage: 3, kind: "make",
      summary: "A shared illustration series that celebrates adire textile patterns and the people who make them.",
      members: [
        { id: ME, role: "Owner and Art Director", contribution: "Leads the series and sets the art direction." },
        { id: "amara-obi", role: "Illustrator", contribution: "Draws the line work for each headwrap illustration." },
        { id: "ayo-bello", role: "Colour Artist", contribution: "Chooses the colours and prepares the print proofs." },
        { id: "yusuf-danjuma", role: "Textile Historian", contribution: "Researches the history behind each resist pattern." },
      ],
      milestones: [
        ms("series-brief-approved", "Series brief approved", "8 October", true),
        ms("headwrap-portrait", "Headwrap Portrait", "26 November", false, "Finish the headwrap portrait"),
        ms("pattern-study-set", "Pattern Study Set", "10 December", false),
      ],
      tasks: tasks([
        ["Review the headwrap colour layer", "amara-obi", "Fri 6 Nov", "doing"],
        ["Collect reference photos of headwrap cloth", "yusuf-danjuma", "Wed 11 Nov", "doing"],
        ["Write the caption for the headwrap plate", ME, "Thu 12 Nov", "doing"],
        ["Paint the headwrap highlight layer", "ayo-bello", "Mon 16 Nov", "doing"],
        ["Confirm the pattern names with the dyers", "yusuf-danjuma", "Wed 18 Nov", "todo"],
        ["Draft the palette for the pattern set", "ayo-bello", "Mon 30 Nov", "todo"],
        ["Sketch the pattern study layouts", "amara-obi", "Thu 3 Dec", "todo"],
        ["Share the dye pot notes from Abeokuta", "yusuf-danjuma", "Wed 4 Nov", "done"],
        ["Set up the plate template", ME, "Sun 1 Nov", "done"],
      ]),
      signed: [ME, "amara-obi"],
      createdAt: on(10, 20),
      ledger: [
        { at: on(10, 20), who: ME, what: "Started the project and invited the team" },
        { at: on(11, 3), who: ME, what: "Added decision-making rights, so everyone signs again" },
        { at: on(11, 3, 10, 30), who: ME, what: "Signed the charter" },
        { at: on(11, 3, 15), who: "amara-obi", what: "Signed the charter" },
        { at: now - HOUR, who: "amara-obi", what: "Asked Kemi to review the headwrap colour layer" },
      ],
    }),
  ];

  const applications: Application[] = [
    // Kemi's interest in A Better Way to Learn, sent Thu 5 Nov and withdrawn Fri 6 Nov: the project reads plain (Express
    // interest is open again) and the request's own pages show each stage Ngozi's journey has.
    {
      id: "a-better-way-to-learn-kemi", callId: "a-better-way-to-learn", applicant: ME, role: "Product Designer", works: [],
      statement: "I design simple learning tools and have worked with teachers in Ibadan. I can help shape how students move through each lesson.",
      availability: "A few hours a week", materials: { works: true, why: true, availability: true }, stage: "withdrawn", slotsOffered: NGOZI_SLOTS,
      history: [{ stage: "submitted", at: on(11, 5) }, { stage: "withdrawn", at: on(11, 6), note: "You withdrew your interest." }], notes: [], tags: [],
    },
    // The two invitations of Collaborate Home.
    {
      id: "community-learning-initiative-kemi", callId: "community-learning-initiative", applicant: ME, role: "Product Designer", works: [],
      statement: "", availability: "Flexible, based on agreed contribution.", materials: {}, stage: "offer",
      offer: { role: "Product Designer", fee: "Flexible, based on agreed contribution.", start: "" },
      history: [{ stage: "offer", at: on(10, 28), note: "Daniel invited you to contribute to a new project." }], notes: [], tags: [],
    },
    {
      id: "craft-memory-archive-kemi", callId: "craft-memory-archive", applicant: ME, role: "Web Developer", works: [],
      statement: "", availability: "Two hours a week, agreed together.", materials: {}, stage: "offer",
      offer: { role: "Web Developer", fee: "Two hours a week, agreed together.", start: "" },
      history: [{ stage: "offer", at: on(10, 30), note: "Tunde invited you to contribute to a new project." }], notes: [], tags: [],
    },
    // The people who applied to Mapping the Market Road (12.46), all new.
    ...([
      ["folake", "Writer", "I write about markets and the people who keep them running. This is the story I want to tell.", "Available for new projects", 3],
      ["tunde-bello", "Photographer", "I photograph working streets and the people on them. I know the Ibadan end of the road well.", "Available from next month", 3],
      ["ngozi", "Writer", "I have written about informal trade for three years and would like to interview traders along the road.", "A few hours a week", 4],
      ["chuka", "Photographer", "I can cover the Port Harcourt end of the road with portraits and market scenes.", "Open to new collaborations", 5],
      ["amara-okafor", "Writer", "I write long pieces and would like to bring the voices of market women into the story.", "Available for new projects", 6],
    ] as const).map(([who, role, statement, availability, day]): Application => ({
      id: `mapping-the-market-road-${who}`, callId: "mapping-the-market-road", applicant: who, role, works: [], statement, availability,
      materials: { works: true, why: true, availability: true }, stage: "submitted", history: [{ stage: "submitted", at: on(11, day) }], notes: [], tags: [],
    })),
  ];

  // The Saved list, oldest first (the page lists the latest first): A Better Way to Learn, Voices of Lagos, Clean Water Mapping.
  return { v: 1, calls: SEED_CALLS, applications, projects, proposals: [], saved: ["clean-water-mapping", "voices-of-lagos", "a-better-way-to-learn"] };
}

