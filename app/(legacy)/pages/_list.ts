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
      { path: "/landing", title: "Landing page", what: "The editorial landing page", isNew: true },
      { path: "/about", title: "About Akines", what: "About Akines, with the hero video" },
      { path: "/about/philosophy", title: "Core philosophy", what: "Why Akines exists" },
      { path: "/login", title: "Log in", what: "Includes “Preview as guest”" },
      { path: "/signup", title: "Sign up", what: "Create an account, step by step" },
    ],
  },
  {
    id: "home", title: "Home", blurb: "The first page after signing in, and what's new.",
    pages: [
      { path: "/", title: "Community Home", what: "Welcome, journals, your circles' posts, rooms, projects and more", isNew: true },
      { path: "/notifications", title: "Notifications", what: "Everything in the bell" },
    ],
  },
  {
    id: "connect", title: "Connect", blurb: "Meeting people: questions, circles, rooms, games, projects and messages.",
    pages: [
      { path: "/connect", title: "Discover", what: "Explore, a mix for you, interests and people to meet" },
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
    id: "collaborate", title: "Collaborate", blurb: "Projects, collaborators, and the project workspace, from the product design.",
    pages: [
      { path: "/collaborate", title: "Collaborate home", what: "Your projects, what needs you, people and open calls", isNew: true },
      { path: "/collaborate/discover", title: "Discover projects", what: "Projects looking for people, with search and filters", isNew: true },
      { path: "/collaborate/projects/jabi-mural", title: "A project", what: "Jabi Lake Arts Week mural", isNew: true },
      { path: "/collaborate/projects/jabi-mural/interest", title: "Express interest", what: "Say how you'd help", isNew: true },
      { path: "/collaborate/projects/youth-podcast", title: "Your own project", what: "Answer people who expressed interest", isNew: true },
      { path: "/collaborate/saved", title: "Saved projects", what: "Projects you kept for later", isNew: true },
      { path: "/collaborate/members/zuri", title: "A project lead", what: "Who is behind a project", isNew: true },
      { path: "/collaborate/collaborators", title: "Collaborators", what: "People to create with", isNew: true },
      { path: "/collaborate/collaborators/discovery", title: "Recommended collaborators", what: "Matched to your project", isNew: true },
      { path: "/collaborate/collaborators/why-this-match", title: "Why this match", what: "The reasons, in plain words", isNew: true },
      { path: "/collaborate/introduction-requests", title: "Introduction requests", what: "Introductions you sent and received", isNew: true },
      { path: "/collaborate/opportunities", title: "Opportunities", what: "Open roles that fit you", isNew: true },
      { path: "/collaborate/contributions", title: "My contributions", what: "What you've done across projects", isNew: true },
      { path: "/collaborate/start", title: "Start a project", what: "Idea, purpose, progress, people, then a workspace", isNew: true },
      { path: "/collaborate/my-projects", title: "My projects", what: "Active projects and drafts", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking", title: "Workspace: overview", what: "Clinic booking app", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking/tasks", title: "Workspace: tasks", what: "List, board and milestones", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking/decisions", title: "Workspace: decisions", what: "Proposed, decided and acknowledged", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking/agreements", title: "Workspace: agreements", what: "Roles, credit and the formal agreement", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking/team", title: "Workspace: team", what: "Members, availability and interest requests", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking/files", title: "Workspace: files", what: "Everything the project is built on", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking/conversations", title: "Workspace: conversations", what: "Team and work threads", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking/workspace", title: "Research workspace", what: "The shared document", isNew: true },
      { path: "/collaborate/my-projects/market-light/workspace", title: "Digital art workspace", what: "The shared canvas", isNew: true },
      { path: "/collaborate/my-projects/garki-clinic-booking/meet", title: "Meeting", what: "Lobby, call, and after the call", isNew: true },
      { path: "/community/collaborations/garki-clinic-booking", title: "A collaboration", what: "From Community Home, with Arrange a Create Call", isNew: true },
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
