/**
 * Every page a member can reach, grouped the way the app's menu groups them (components/shell/nav.ts):
 * Home, Connect, Make & sell, Explore, Care, then You. Pages no menu or page links to are left out.
 * `isNew` marks pages that are on this preview branch but not on main yet.
 * Each link opens its page directly (preview builds sign the visitor in as the demo guest).
 */
export type PageLink = { path: string; title: string; what: string; isNew?: boolean };
export type PageGroup = { id: string; title: string; blurb: string; pages: PageLink[] };

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
    id: "home", title: "Home", blurb: "The first page after signing in, and what's new.",
    pages: [
      { path: "/", title: "Community home", what: "Your day on Akines (opens About when signed out)" },
      { path: "/notifications", title: "Notifications", what: "Everything in the bell" },
    ],
  },
  {
    id: "connect", title: "Connect", blurb: "Meeting people: questions, circles, rooms, games, projects and messages.",
    pages: [
      { path: "/kindred", title: "Discover people", what: "People whose journeys complement yours" },
      { path: "/banter", title: "Banter", what: "One question, a small chat that fades or grows" },
      { path: "/banter?new=chat", title: "Start a banter", what: "Ask your own question" },
      { path: "/banter/happy", title: "A banter chat", what: "“What made you happy today?”" },
      { path: "/banter/now/diaspora", title: "Banter: live now", what: "A live topic everyone is talking about" },
      { path: "/circles", title: "KinCircle", what: "Your circles and communities, and ones to join" },
      { path: "/circles/new", title: "Start a circle", what: "A small circle or a whole community" },
      { path: "/circles/photography", title: "A small circle", what: "Photography" },
      { path: "/circles/community/come-alone-club", title: "A community", what: "Come Alone Club Abuja" },
      { path: "/circles/community/come-alone-club/circles/first-timers", title: "A circle inside a community", what: "First-timers Five" },
      { path: "/circles/join/code", title: "Join with an invite link", what: "What an invite looks like" },
      { path: "/cliqs", title: "Cliqs", what: "Your people, on purpose" },
      { path: "/rooms", title: "Presence rooms", what: "Six chairs, one live conversation" },
      { path: "/rooms/coding-club", title: "A room", what: "Weekend Coding Club" },
      { path: "/rooms/new", title: "Open a room", what: "Host your own" },
      { path: "/play", title: "Play Together", what: "Games as a reason to connect" },
      { path: "/play/two-truths", title: "A game", what: "Two truths and a story" },
      { path: "/play/session/uni-night", title: "A live game", what: "Playing with friends" },
      { path: "/play/new", title: "Make a game", what: "Create one for your people" },
      { path: "/activities", title: "Activities", what: "Things to do with people nearby" },
      { path: "/messages", title: "KinMessage", what: "All conversations; filter by Collaborations" },
      { path: "/messages/ayo", title: "A one-to-one chat", what: "With Ayo" },
    ],
  },
  {
    id: "collaborate", title: "Connect: Collaborate", blurb: "Open calls, applying, reviewing, and the project workspace.",
    pages: [
      { path: "/collaborate", title: "Collaborate", what: "Your projects, open calls, people to work with" },
      { path: "/collaborate/calls/jabi-mural", title: "An open call", what: "Jabi Lake Arts Week mural" },
      { path: "/collaborate/threads-of-return", title: "Being made right now", what: "A collaboration others can follow" },
      { path: "/collaborate/calls/clinic-app/apply", title: "Apply to a call", what: "As a developer: links and CV first", isNew: true },
      { path: "/collaborate/calls/matchday-food/apply", title: "Apply (other work)", what: "As a caterer: CV and proof of past work", isNew: true },
      { path: "/collaborate/applications", title: "My applications", what: "Status of everything you applied to", isNew: true },
      { path: "/collaborate/review", title: "Calls you host", what: "Your own open calls", isNew: true },
      { path: "/collaborate/review/youth-podcast", title: "Review desk", what: "Shortlist, compare and choose applicants", isNew: true },
      { path: "/collaborate/new", title: "Post an open call", what: "Step by step", isNew: true },
      { path: "/collaborate/projects/garki-clinic-booking", title: "Workspace: build", what: "Clinic booking app; Kwame's feature needs your review", isNew: true },
      { path: "/collaborate/projects/garki-clinic-booking?tab=work", title: "Workspace: the Work tab", what: "Pinned tools and the deliverables board", isNew: true },
      { path: "/collaborate/projects/kubwa-ride-final-year", title: "Workspace: study", what: "Students' final-year project, with you as mentor", isNew: true },
      { path: "/collaborate/projects/product-design-evening-course", title: "Workspace: teach", what: "Co-taught evening course, paid per session", isNew: true },
      { path: "/collaborate/projects/kubwa-bread-shoot?tab=agree", title: "Workspace: just accepted", what: "Bakery film; sign the charter to start", isNew: true },
      { path: "/collaborate/projects/market-light", title: "Workspace: make", what: "Photo book, well underway", isNew: true },
      { path: "/collaborate/projects/garki-clinic-booking?tab=value", title: "Workspace: share value", what: "Money released by approvals", isNew: true },
      { path: "/collaborate/projects/garki-clinic-booking?tab=record", title: "Workspace: record", what: "Who delivered what, approved by whom", isNew: true },
      { path: "/messages/co-garki-clinic-booking", title: "A collaboration chat", what: "Team chat in KinMessage, with a Workspace button", isNew: true },
    ],
  },
  {
    id: "make", title: "Make & sell", blurb: "Your own space, journal and store.",
    pages: [
      { path: "/studio", title: "My studio", what: "Open your studio, or manage it" },
      { path: "/studios/me", title: "My studio as a visitor", what: "Preview of what others see" },
      { path: "/journal", title: "My journal", what: "Your private journal" },
      { path: "/store", title: "My store", what: "Sell what you make" },
    ],
  },
  {
    id: "explore", title: "Explore", blurb: "What other members make, sell and share.",
    pages: [
      { path: "/shop", title: "Marketplace", what: "Products, classes and services" },
      { path: "/shop/jollof-box", title: "A product", what: "Party jollof, tray for 10" },
      { path: "/shop/code-starter", title: "A class", what: "Learn to code: 8-week starter" },
      { path: "/studios", title: "Open doors", what: "Other people's studios" },
      { path: "/studios/fatou", title: "A studio", what: "Fatou's Table" },
      { path: "/stories", title: "Stories", what: "Stories from members" },
      { path: "/stories/breakfast-question", title: "A story", what: "The question my daughter asked at breakfast" },
    ],
  },
  {
    id: "care", title: "Care", blurb: "Slower, more personal parts of Akines.",
    pages: [
      { path: "/wellbeing", title: "Wellbeing", what: "A place to breathe out" },
      { path: "/dna", title: "Creative DNA", what: "How you see, keep and share" },
    ],
  },
  {
    id: "you", title: "You", blurb: "Your profile, work profile and settings.",
    pages: [
      { path: "/profile", title: "Your profile", what: "Work, communities and about" },
      { path: "/profile/work", title: "Build your work profile", what: "Five skippable steps", isNew: true },
      { path: "/profile/ayo", title: "Someone else's profile", what: "Ayo Balogun" },
      { path: "/u/chidieze", title: "A community member's profile", what: "Opened from a community's member list" },
      { path: "/settings", title: "Settings", what: "All settings" },
      { path: "/settings/personal", title: "Personal details", what: "Name, email, phone" },
      { path: "/settings/privacy", title: "Privacy", what: "Who can find and message you" },
      { path: "/settings/security", title: "Security", what: "Password and two-step sign-in" },
      { path: "/settings/devices", title: "Devices", what: "Where you're signed in" },
      { path: "/settings/blocked", title: "Blocked people", what: "People you've blocked" },
      { path: "/settings/data", title: "Your data", what: "Download or delete" },
    ],
  },
];
