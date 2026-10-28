/**
 * Requirement → screen map for /concept. IDs and wording follow
 * docs/concept-requirements.md, which condenses the Artelia Connect concept note.
 */
export type Screen = { href: string; label: string };
export type Requirement = { id: string; title: string; detail: string; screens: Screen[] };
export type RequirementGroup = { id: string; title: string; items: Requirement[] };

const s = (href: string, label: string): Screen => ({ href, label });

export const GROUPS: RequirementGroup[] = [
  {
    id: "P", title: "Positioning & principles", items: [
      { id: "P1", title: "Inside Artelia, three pillars", detail: "Discover (marketplace), Connect (community), Create (collaboration).", screens: [s("/", "Top bar pillars"), s("/stories/indigo-crossing", "Buy on Artelia links")] },
      { id: "P2", title: "Purpose over consumption", detail: "No infinite feed — intentions, rooms, projects, opportunities.", screens: [s("/", "Today ends with “all caught up”"), s("/pilot", "Anti-metrics")] },
      { id: "P3", title: "Relevance, not popularity", detail: "No follower counts, no public performance.", screens: [s("/c/textiles/general", "Responses show who, never how many"), s("/introductions", "Explained introductions"), s("/rooms/home", "Six-seat palaver")] },
      { id: "P4", title: "Belonging to African creativity", detail: "The living digital home of African creativity.", screens: [s("/onboarding", "Onboarding"), s("/stories", "Stories")] },
    ],
  },
  {
    id: "C", title: "Core architecture", items: [
      { id: "C1", title: "Connection Intent", detail: "Asked at onboarding and at the start of every session.", screens: [s("/onboarding", "Onboarding step 1"), s("/", "Today intent picker")] },
      { id: "C2", title: "Creative DNA", detail: "Living, explainable, editable, privacy-controlled profile.", screens: [s("/dna", "Creative DNA"), s("/onboarding", "Calibration step")] },
      { id: "C3", title: "Meaningful Matching", detail: "Complementary journeys; every introduction explained.", screens: [s("/introductions", "Introductions"), s("/dm/moussa", "The “why” pinned in the DM"), s("/people/moussa", "Why you might connect")] },
      { id: "C4", title: "Presence Rooms", detail: "Facilitated, capped at six, no audience.", screens: [s("/rooms/home", "A live palaver: six seats around the fire"), s("/rooms", "All palavers")] },
      { id: "C5", title: "Creative Circles", detail: "Moderated communities with feedback and mentorship.", screens: [s("/c/textiles/general", "Textiles circle, #general"), s("/c/textiles/works-in-progress", "Structured critique"), s("/circles", "Find a circle")] },
      { id: "C6", title: "Story behind every artwork", detail: "Voice, studio video, sketches, failures, influences, meaning.", screens: [s("/stories/indigo-crossing", "Indigo Crossing")] },
      { id: "C7", title: "Artist Journals", detail: "Sketches, failures, ideas, doubts, wins.", screens: [s("/journals", "Journals")] },
      { id: "C8", title: "Collector Journals", detail: "Why they bought, where it lives, how it feels.", screens: [s("/journals", "Collector journals"), s("/stories/indigo-crossing", "Collector entries")] },
      { id: "C9", title: "Art Legacy", detail: "Creation, ownership, travel, exhibitions, reflections.", screens: [s("/stories/indigo-crossing", "Legacy record")] },
      { id: "C10", title: "Studio Visits", detail: "Live, 360°, VR — talk directly, buy.", screens: [s("/studio-visits", "Studio visits")] },
      { id: "C11", title: "AI Creative Companion", detail: "Specialised in African art, labelled and bounded.", screens: [s("/companion", "Creative Companion")] },
    ],
  },
  {
    id: "S", title: "Collaboration Studio & Opportunity Engine", items: [
      { id: "S1", title: "Seven stages", detail: "Discover → Imagine → Agree → Create → Present → Share value → Preserve.", screens: [s("/studio", "Studio"), s("/studio/salt-water-memory", "Project room")] },
      { id: "S2", title: "Structured Open Calls", detail: "Standard fields; apply with selected works and a tailored statement.", screens: [s("/opportunities", "Open calls"), s("/opportunities/foundation-statement", "Call & apply"), s("/opportunities/new", "Publish a call")] },
      { id: "S3", title: "Curator Desk", detail: "Screen, tag, note, compare, shortlist, communicate, radar.", screens: [s("/curator", "Curator Desk")] },
      { id: "S4", title: "Collaboration Matching", detail: "Similarity and productive difference; private idea canvas.", screens: [s("/studio", "Matching & canvas"), s("/introductions", "Complementary badge")] },
      { id: "S5", title: "Fair collaboration by default", detail: "Charter: IP, credit, decisions, expenses, revenue, exit.", screens: [s("/studio/salt-water-memory", "Agree tab")] },
      { id: "S6", title: "Project room", detail: "Boards, files, tasks, milestones, approvals.", screens: [s("/studio/salt-water-memory", "Create tab")] },
      { id: "S7", title: "Share value", detail: "Splits, expenses, payment status.", screens: [s("/studio/salt-water-memory", "Share value tab")] },
      { id: "S8", title: "Preserve", detail: "Contribution ledger, credits, provenance.", screens: [s("/studio/ancestral-frequencies", "Preserve tab")] },
      { id: "S9", title: "Transparent application status", detail: "Visible stages and communication.", screens: [s("/applications", "My applications")] },
    ],
  },
  {
    id: "W", title: "Creative wellbeing & safety", items: [
      { id: "W1", title: "Reflection tools", detail: "Mood canvas, check-ins, burnout reflection, journaling, breathing, gratitude.", screens: [s("/wellbeing", "Wellbeing")] },
      { id: "W2", title: "Professional referral", detail: "Licensed therapists and art therapists.", screens: [s("/wellbeing", "Support directory")] },
      { id: "W3", title: "Private, consent-based, no diagnosis", detail: "Separate from ranking, sales and opportunities.", screens: [s("/wellbeing", "Privacy promise"), s("/dna", "Never used for…")] },
      { id: "W4", title: "Crisis safety flow", detail: "Locally relevant emergency guidance.", screens: [s("/wellbeing", "Safety panel"), s("/companion", "Companion safety")] },
    ],
  },
  {
    id: "T", title: "Trust governance & responsible AI", items: [
      { id: "T1", title: "Verification", detail: "Curators, galleries, institutions, high-value commissioners.", screens: [s("/trust", "Trust centre"), s("/opportunities", "Verified organisers")] },
      { id: "T2", title: "Verified vs self-declared vs AI", detail: "Labelled everywhere it matters.", screens: [s("/trust", "Label legend"), s("/introductions", "Labelled reasons")] },
      { id: "T3", title: "Explainable matching & controls", detail: "Edit interests, decline, adjust visibility.", screens: [s("/introductions", "Why am I seeing these?"), s("/dna", "Edit & reset")] },
      { id: "T4", title: "Wellbeing data never sold or used", detail: "No advertising or opportunity ranking.", screens: [s("/trust", "Data promises"), s("/wellbeing", "Privacy notice")] },
      { id: "T5", title: "Portfolio protection", detail: "Watermarks, reporting, evidence preservation.", screens: [s("/trust", "Portfolio protection")] },
      { id: "T6", title: "Scam & impersonation monitoring", detail: "Flagged calls, warning signs, reporting.", screens: [s("/c/textiles/opportunities", "Companion flags a scam in-channel"), s("/opportunities/unverified-prize", "Flagged call"), s("/trust", "Report")] },
      { id: "T7", title: "Community standards", detail: "Harassment, exploitation, plagiarism, appropriation, misrepresentation.", screens: [s("/trust", "Standards"), s("/rooms/home", "House rules")] },
      { id: "T8", title: "Human review & appeals", detail: "People decide consequential cases.", screens: [s("/trust", "Appeals")] },
    ],
  },
  {
    id: "B", title: "Business model", items: [
      { id: "B1", title: "Free for artists", detail: "Monetise professional workflows and outcomes.", screens: [s("/membership", "Membership")] },
      { id: "B2", title: "Revenue streams", detail: "Commission, facilitation, calls, workspaces, membership, protection, events, enterprise.", screens: [s("/membership", "Who pays for what"), s("/curator", "Pro workspace")] },
    ],
  },
  {
    id: "M", title: "Pilot & success measures", items: [
      { id: "M1", title: "Success measures", detail: "Seven outcome areas — not screen time.", screens: [s("/pilot", "Measures")] },
      { id: "M2", title: "12-week pilot", detail: "Cohort, hubs, calls, introductions, canvases, agreements.", screens: [s("/pilot", "Pilot plan")] },
    ],
  },
];

/** The concept note's six use cases as click-through paths. */
export const USE_CASES: { id: string; title: string; steps: Screen[] }[] = [
  { id: "U1", title: "A curator runs a call for emerging West African figurative painters", steps: [s("/opportunities/new", "Publish a structured call"), s("/opportunities/figure-ground", "Artists see every standard field"), s("/curator", "Screen, tag, compare, shortlist"), s("/curator", "Keep consented artists on the radar")] },
  { id: "U2", title: "A Nigerian textile artist and a Senegalese sound artist make an installation, 50:50", steps: [s("/introductions", "Matched on migration & memory"), s("/people/moussa", "Why you might connect"), s("/studio", "Open a private idea canvas"), s("/studio/salt-water-memory", "Sign a 50:50 charter and build it")] },
  { id: "U3", title: "An institution commissions a statement artwork", steps: [s("/opportunities/foundation-statement", "Verified commission call"), s("/studio/foundation-atrium", "Milestones in a project room")] },
  { id: "U4", title: "A collector discovers an artist and becomes a patron", steps: [s("/journals", "Discover through a journal"), s("/rooms", "Join a Presence Room"), s("/studio-visits", "Visit the studio"), s("/stories/indigo-crossing", "Buy, and add to its legacy")] },
  { id: "U5", title: "A creator assembles a photographer, designer and textile artist", steps: [s("/studio", "Complementary collaborators"), s("/studio/market-light", "Agree roles and splits")] },
  { id: "U6", title: "An isolated emerging artist finds support and credible opportunities", steps: [s("/circles/young", "Join a moderated peer circle"), s("/circles/young", "Get portfolio feedback"), s("/opportunities", "Verified calls only"), s("/trust", "Spot scams")] },
];
