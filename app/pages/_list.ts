/**
 * Every page in the portal, by feature, for reviewing the preview. Each link opens its page directly
 * (preview builds sign the visitor in as the demo guest). Keep this in step with app/ when pages are added.
 */
export type PageLink = { path: string; title: string; what: string };
export type PageGroup = { id: string; title: string; blurb: string; pages: PageLink[]; old?: boolean };

export const PAGE_GROUPS: PageGroup[] = [
  {
    id: "start", title: "Start: before signing in", blurb: "What a new visitor sees first.",
    pages: [
      { path: "/about", title: "About Akines", what: "The landing page with the hero video" },
      { path: "/about/philosophy", title: "Core philosophy", what: "Why Akines exists" },
      { path: "/login", title: "Log in", what: "Includes “Preview as guest”" },
      { path: "/signup", title: "Sign up", what: "Create an account, step by step" },
    ],
  },
  {
    id: "home", title: "Home and updates", blurb: "The daily view once signed in.",
    pages: [
      { path: "/", title: "Home", what: "Your day on Akines (opens About when signed out)" },
      { path: "/community", title: "The Akines Weekly", what: "What's happening across the community" },
      { path: "/notifications", title: "Notifications", what: "Everything in the bell" },
      { path: "/activities", title: "Activities", what: "Things to do with people nearby" },
    ],
  },
  {
    id: "banter", title: "Banter", blurb: "One question, a small chat that fades or grows.",
    pages: [
      { path: "/banter", title: "Banter", what: "Questions to answer, and your chats" },
      { path: "/banter?new=chat", title: "Start a banter", what: "Ask your own question" },
      { path: "/banter/happy", title: "A banter chat", what: "“What made you happy today?”" },
      { path: "/banter/now/diaspora", title: "Live now", what: "A live topic everyone is talking about" },
    ],
  },
  {
    id: "circles", title: "Circles and communities", blurb: "Small circles of a few people, and bigger communities that meet in person.",
    pages: [
      { path: "/circles", title: "Circles", what: "Your circles and communities, and ones to join" },
      { path: "/circles/new", title: "Start a circle", what: "Small circle or a whole community" },
      { path: "/circles/photography", title: "A small circle", what: "Photography" },
      { path: "/circles/photography?tab=activities", title: "Circle activities", what: "What the circle is doing" },
      { path: "/circles/community/come-alone-club", title: "A community", what: "Come Alone Club Abuja" },
      { path: "/circles/community/come-alone-club?tab=circles", title: "Circles inside a community", what: "Small circles within it" },
      { path: "/circles/community/come-alone-club/circles/first-timers", title: "A circle inside a community", what: "First-timers Five" },
      { path: "/circles/community/wuse-tech-hangout", title: "Another community", what: "Wuse Tech Hangout" },
      { path: "/circles/join/code", title: "Join with an invite link", what: "What an invite looks like" },
    ],
  },
  {
    id: "rooms", title: "Rooms", blurb: "Six chairs, one live conversation.",
    pages: [
      { path: "/rooms", title: "Rooms", what: "Rooms happening now and soon" },
      { path: "/rooms/coding-club", title: "A room", what: "Weekend Coding Club" },
      { path: "/rooms/new", title: "Open a room", what: "Host your own" },
    ],
  },
  {
    id: "play", title: "Play", blurb: "Games as a reason to connect.",
    pages: [
      { path: "/play", title: "Play", what: "All games" },
      { path: "/play/two-truths", title: "A game", what: "Two truths and a story" },
      { path: "/play/session/uni-night", title: "A live game", what: "Playing with friends" },
      { path: "/play/new", title: "Make a game", what: "Create one for your people" },
    ],
  },
  {
    id: "messages", title: "KinMessage", blurb: "Private messages, including every collaboration's team chat.",
    pages: [
      { path: "/messages", title: "KinMessage", what: "All conversations; filter by Collaborations" },
      { path: "/messages/ayo", title: "A one-to-one chat", what: "With Ayo" },
      { path: "/messages/co-garki-clinic-booking", title: "A collaboration chat", what: "Team chat with a Workspace button" },
    ],
  },
  {
    id: "collaborate", title: "Collaborate", blurb: "Open calls, applying, reviewing, and the project workspace.",
    pages: [
      { path: "/collaborate", title: "Collaborate", what: "Your projects, open calls, people to work with" },
      { path: "/collaborate/calls/jabi-mural", title: "An open call", what: "Jabi Lake Arts Week mural" },
      { path: "/collaborate/calls/clinic-app/apply", title: "Apply to a call", what: "As a developer: links and CV first" },
      { path: "/collaborate/calls/matchday-food/apply", title: "Apply (other work)", what: "As a caterer: CV and proof of past work" },
      { path: "/collaborate/applications", title: "My applications", what: "Status of everything you applied to" },
      { path: "/collaborate/review", title: "Calls you host", what: "Your own open calls" },
      { path: "/collaborate/review/youth-podcast", title: "Review desk", what: "Shortlist, compare and choose applicants" },
      { path: "/collaborate/new", title: "Post an open call", what: "Step by step" },
      { path: "/collaborate/threads-of-return", title: "Being made right now", what: "A collaboration others can follow" },
    ],
  },
  {
    id: "workspaces", title: "Project workspaces", blurb: "One workspace for any kind of work: agree, deliver with proof, approve, get paid, keep the record.",
    pages: [
      { path: "/collaborate/projects/garki-clinic-booking", title: "Build: clinic booking app", what: "Developer work; Kwame's feature needs your review" },
      { path: "/collaborate/projects/garki-clinic-booking?tab=work", title: "The Work tab", what: "Pinned tools and the deliverables board" },
      { path: "/collaborate/projects/kubwa-ride-final-year", title: "Study: final-year project", what: "Students, with you as mentor" },
      { path: "/collaborate/projects/product-design-evening-course", title: "Teach: evening course", what: "Co-taught, paid per session" },
      { path: "/collaborate/projects/kubwa-bread-shoot?tab=agree", title: "Just accepted: sign the charter", what: "Bakery film; work opens after signing" },
      { path: "/collaborate/projects/market-light", title: "Make: photo book", what: "Well underway" },
      { path: "/collaborate/projects/garki-clinic-booking?tab=value", title: "Share value", what: "Money released by approvals" },
      { path: "/collaborate/projects/garki-clinic-booking?tab=record", title: "Record", what: "Who delivered what, approved by whom" },
    ],
  },
  {
    id: "profile", title: "Profile and work profile", blurb: "Who you are, and what you do.",
    pages: [
      { path: "/profile", title: "Your profile", what: "Work, communities and about" },
      { path: "/profile/work", title: "Build your work profile", what: "Five skippable steps" },
      { path: "/profile/ayo", title: "Someone else's profile", what: "Ayo Balogun" },
      { path: "/u/chidieze", title: "Public profile link", what: "How a shared profile link looks" },
    ],
  },
  {
    id: "studios", title: "Studios", blurb: "A personal space to show your work and welcome visitors.",
    pages: [
      { path: "/studio", title: "My studio", what: "Open your studio, or manage it" },
      { path: "/studios/me", title: "My studio as a visitor", what: "Preview of what others see" },
      { path: "/studios", title: "Visit studios", what: "Other people's spaces" },
      { path: "/studios/fatou", title: "A studio", what: "Fatou's Table" },
    ],
  },
  {
    id: "shop", title: "Shop and store", blurb: "Buy from people you know, or sell what you make.",
    pages: [
      { path: "/shop", title: "Shop", what: "Products, classes and services" },
      { path: "/shop/jollof-box", title: "A product", what: "Party jollof, tray for 10" },
      { path: "/shop/code-starter", title: "A class", what: "Learn to code: 8-week starter" },
      { path: "/store", title: "Open your store", what: "Sell what you make" },
    ],
  },
  {
    id: "stories", title: "Stories, journal and wellbeing", blurb: "Slower, more personal parts of Akines.",
    pages: [
      { path: "/stories", title: "Stories", what: "Stories from members" },
      { path: "/stories/breakfast-question", title: "A story", what: "The question my daughter asked at breakfast" },
      { path: "/journal", title: "Journal", what: "Your private journal" },
      { path: "/wellbeing", title: "Wellbeing", what: "A place to breathe out" },
      { path: "/dna", title: "Creative DNA", what: "How you see, keep and share" },
    ],
  },
  {
    id: "settings", title: "Settings", blurb: "Account, privacy and security.",
    pages: [
      { path: "/settings", title: "Settings", what: "All settings" },
      { path: "/settings/personal", title: "Personal details", what: "Name, email, phone" },
      { path: "/settings/privacy", title: "Privacy", what: "Who can find and message you" },
      { path: "/settings/security", title: "Security", what: "Password and two-step sign-in" },
      { path: "/settings/devices", title: "Devices", what: "Where you're signed in" },
      { path: "/settings/blocked", title: "Blocked people", what: "People you've blocked" },
      { path: "/settings/data", title: "Your data", what: "Download or delete" },
    ],
  },
  {
    id: "old", title: "Earlier prototypes", blurb: "Design explorations kept for reference. Not part of the current product; some of their links are out of date.", old: true,
    pages: [
      { path: "/cliqs", title: "Cliqs", what: "Earlier take on small groups" },
      { path: "/kindred", title: "Kindred", what: "Earlier matching idea" },
      { path: "/constellation", title: "Constellation", what: "Earlier connections view" },
      { path: "/atelier", title: "Atelier", what: "Earlier art-collector concept" },
      { path: "/community/classic", title: "Classic home", what: "The first home page" },
      { path: "/banter/classic", title: "Classic banter", what: "The first banter design" },
      { path: "/layouts/panes", title: "Layout: stacked panes", what: "Layout exploration" },
      { path: "/layouts/stage", title: "Layout: stage", what: "Layout exploration" },
      { path: "/layouts/today", title: "Layout: today", what: "Layout exploration" },
      { path: "/concept", title: "Concept coverage", what: "Requirements checklist from the first concept" },
      { path: "/pilot", title: "Pilot dashboard", what: "Pilot measures from the first concept" },
    ],
  },
];
