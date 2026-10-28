/** Route-local mock data: the 12-week pilot, simulated at week 7 (M1, M2, P2). */

export const PILOT = { week: 7, of: 12, started: "4 Aug 2026", ends: "27 Oct 2026" };

/** `min`–`max` is the target range; `current` is where we are at week 7. */
export const COHORTS = [
  { label: "Artists", current: 212, min: 150, max: 250 },
  { label: "Curators & galleries", current: 19, min: 15, max: 25 },
  { label: "Collectors", current: 24, min: 30, max: 30 },
  { label: "Institutional & brand partners", current: 3, min: 3, max: 5 },
];

export const HUBS = [
  { city: "Lagos", country: "Nigeria", members: 94, lead: true },
  { city: "Abuja", country: "Nigeria", members: 31 },
  { city: "Accra", country: "Ghana", members: 38 },
  { city: "Nairobi", country: "Kenya", members: 27 },
  { city: "Dakar", country: "Senegal", members: 22 },
  { city: "Johannesburg", country: "South Africa", members: 19 },
  { city: "London", country: "Diaspora hub", members: 27 },
];

export const COMMITMENTS = [
  { label: "Structured open calls", current: 2, target: 3, targetLabel: "3", note: "Threads of Return and Figure & Ground are live; Sound & Space opens in week 8.", href: "/opportunities" },
  { label: "Curated introductions accepted", current: 14, target: 20, targetLabel: "20+", note: "31 made, 14 accepted by both people. Every one explained.", href: "/introductions" },
  { label: "Collaboration canvases opened", current: 7, target: 10, targetLabel: "10", note: "Including Salt Water Memory and Clay & Rain.", href: "/studio" },
  { label: "Formal agreements signed", current: 2, target: 5, targetLabel: "3–5", note: "Two charters signed; a third is in review with a lawyer.", href: "/studio/salt-water-memory", min: 3 },
];

export const MEASURES: { area: string; question: string; indicators: { label: string; value: string; hint: string }[] }[] = [
  {
    area: "Meaningful connection",
    question: "Are people forming relationships that matter to their work?",
    indicators: [
      { label: "Introductions → 2nd conversation", value: "61%", hint: "Of accepted introductions" },
      { label: "Room members who met again", value: "38%", hint: "Outside the room, within 3 weeks" },
      { label: "Felt less alone", value: "72%", hint: "Artists, week-6 pulse survey" },
    ],
  },
  {
    area: "Opportunity access",
    question: "Are more artists reaching credible opportunities — fairly?",
    indicators: [
      { label: "Applications submitted", value: "146", hint: "Across 2 live calls" },
      { label: "First-time applicants", value: "44%", hint: "Never applied to a call before" },
      { label: "Applicants given a status update", value: "100%", hint: "At every stage" },
      { label: "Artists on a curator's radar", value: "37", hint: "With consent, for future calls" },
    ],
  },
  {
    area: "Collaboration",
    question: "Do introductions turn into real creative work?",
    indicators: [
      { label: "Canvases opened", value: "7", hint: "Target 10" },
      { label: "Cross-disciplinary pairs", value: "5 of 7", hint: "Different media, shared theme" },
      { label: "Median days, canvas → charter", value: "19", hint: "Two charters so far" },
    ],
  },
  {
    area: "Artist income",
    question: "Is money reaching artists — and on clear terms?",
    indicators: [
      { label: "Paid to artists via Connect", value: "US$23.4k", hint: "Commissions, fees and sales" },
      { label: "Sales after a studio visit or room", value: "11", hint: "Artworks sold" },
      { label: "Payments on time", value: "96%", hint: "Of scheduled splits" },
    ],
  },
  {
    area: "Collector depth",
    question: "Are collectors going deeper, not just buying more?",
    indicators: [
      { label: "Collectors who joined a room", value: "19 of 24", hint: "At least once" },
      { label: "Collector journal entries", value: "31", hint: "Why they bought, where it lives" },
      { label: "Repeat support of an artist", value: "7", hint: "Second purchase, commission or patronage" },
    ],
  },
  {
    area: "Trust & safety",
    question: "Do people feel safe, and are problems handled fairly?",
    indicators: [
      { label: "Suspicious calls caught", value: "4", hint: "Before any artist paid" },
      { label: "Reports reviewed in 48h", value: "93%", hint: "By a person" },
      { label: "Appeals upheld", value: "1 of 3", hint: "Decision changed on appeal" },
      { label: "Feel safe here", value: "88%", hint: "All members, week-6 pulse" },
    ],
  },
  {
    area: "Sustainability",
    question: "Could this pay for itself without charging artists?",
    indicators: [
      { label: "Workspace pilots converting", value: "8 of 19", hint: "Curators & galleries" },
      { label: "Collector memberships", value: "14", hint: "Paying, illustrative pricing" },
      { label: "Artists charged anything", value: "0", hint: "By design" },
    ],
  },
];

export const INTERVIEW_QUESTIONS = [
  { q: "Did you feel understood by your introductions?", who: "Artists & collectors", done: 18, quote: "It knew I work with memory, not just with cloth. That's never happened on a platform." },
  { q: "Did the Curator Desk save you time?", who: "Curators & galleries", done: 9, quote: "Eligibility screening alone saved me two evenings per call." },
  { q: "Did selection feel fairer than elsewhere?", who: "Applicants", done: 14, quote: "I didn't get it, but I knew exactly why — and when." },
  { q: "Did the agreement templates reduce ambiguity?", who: "Collaborators", done: 6, quote: "We argued about splits before we made anything. Best argument we ever had." },
];

export const NOT_OPTIMISED = [
  { label: "Time in app", why: "A good session can be four minutes long." },
  { label: "Scroll depth", why: "There is no feed to scroll." },
  { label: "Follower growth", why: "There are no followers." },
  { label: "Daily streaks", why: "Rest is part of a creative practice." },
];
