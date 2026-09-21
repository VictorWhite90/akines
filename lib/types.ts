/**
 * Artelia Connect domain model. Every screen reads mock data in these shapes
 * from `lib/data`; a real backend would slot in behind the same types.
 */

/** Where a fact comes from — shown with <TrustLabel> wherever it appears. */
export type TrustSource = "verified" | "self-declared" | "ai";

export type Role = "artist" | "curator" | "collector" | "gallery" | "institution" | "creative" | "researcher";

export interface Person {
  id: string;
  name: string;
  role: Role;
  /** e.g. "Textile artist", "Independent curator". */
  title: string;
  city: string;
  country: string;
  languages: string[];
  practices: string[];
  themes: string[];
  /** Identity / professional verification (required for curators, galleries, institutions). */
  verified: boolean;
  availability: "open" | "limited" | "closed";
  readiness: "emerging" | "mid-career" | "established";
  bio: string;
}

/** Answers to "Why are you here?" — shape the whole experience. */
export type IntentId =
  | "inspiration"
  | "collaborator"
  | "discover-artists"
  | "discuss"
  | "opportunity"
  | "learn"
  | "reflect"
  | "less-alone";

export interface DnaDimension {
  id: string;
  label: string;
  left: string;
  right: string;
  /** 0 = fully `left`, 100 = fully `right`. */
  value: number;
  /** Declared by the member, or inferred (with consent) from behaviour. */
  source: TrustSource;
  /** Why the value is what it is — Creative DNA must stay explainable. */
  why: string;
}

export type CollectorType = "Explorer" | "Investor" | "Historian" | "Decorator" | "Patron" | "Mentor";

export interface CreativeDna {
  personId: string;
  intents: IntentId[];
  dimensions: DnaDimension[];
  collectorTypes?: CollectorType[];
  /** Consent toggles that govern what may be inferred and who sees it. */
  privacy: { inferFromBehaviour: boolean; visibleToMatches: boolean; visibleToCurators: boolean; useJournalThemes: boolean };
}

export interface IntroductionReason {
  text: string;
  source: TrustSource;
}

/** A Meaningful Matching recommendation — every one explains itself. */
export interface Introduction {
  id: string;
  personId: string;
  kind: "collaborator" | "peer" | "mentor" | "collector" | "curator";
  headline: string;
  reasons: IntroductionReason[];
  /** Similar vs productively different practices. */
  complementarity: "similar" | "complementary";
  fit: { availability: string; geography: string; language: string; readiness: string };
  suggestedOpener: string;
}

export interface PresenceRoom {
  id: string;
  title: string;
  theme: string;
  facilitatorId: string;
  participantIds: string[];
  /** Rooms are capped — no audience, no followers, no livestream. */
  capacity: 6;
  when: string;
  durationMin: number;
  format: "voice" | "video" | "text";
  circleId?: string;
  prompts: string[];
  language: string;
}

export interface CircleThread {
  id: string;
  title: string;
  authorId: string;
  kind: "feedback" | "discussion" | "opportunity" | "mentorship";
  replies: number;
  lastActive: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  image: string;
  practice: string;
  moderatorIds: string[];
  nextGathering: string;
  guidelines: string[];
  threads: CircleThread[];
  isMember: boolean;
}

export interface OpenCall {
  id: string;
  title: string;
  organisation: string;
  organiserId?: string;
  organiserType: "gallery" | "curator" | "institution" | "brand";
  organiserVerified: boolean;
  image: string;
  theme: string;
  summary: string;
  eligibleMedia: string[];
  geography: string;
  experienceLevel: string;
  numberOfWorks: string;
  /** Budget or fee must be disclosed — a verification requirement. */
  budget: string | null;
  rightsRequested: string;
  selectionProcess: string;
  requiredMaterials: string[];
  timeline: { label: string; date: string }[];
  deadline: string;
  status: "open" | "closing-soon" | "closed";
  /** Trust signals shown to applicants. */
  commissionerHistory: string;
  flags?: string[];
  matchReasons?: IntroductionReason[];
}

export type ApplicationStage = "submitted" | "eligibility" | "review" | "longlist" | "shortlist" | "selected" | "not-selected";

export interface Application {
  id: string;
  callId: string;
  stage: ApplicationStage;
  submitted: string;
  selectedWorks: string[];
  history: { stage: ApplicationStage; date: string; note?: string }[];
  feedback?: string;
}

export type CandidateStage = "received" | "eligible" | "longlist" | "shortlist" | "selected" | "declined";

/** A submission as the Curator Desk sees it. */
export interface Candidate {
  id: string;
  personId: string;
  callId: string;
  stage: CandidateStage;
  eligibility: { rule: string; pass: boolean }[];
  tags: string[];
  notes: string[];
  works: { title: string; image: string; medium: string }[];
  statement: string;
  keepOnRadar: boolean;
}

export type ProjectStage = "discover" | "imagine" | "agree" | "create" | "present" | "share-value" | "preserve";

export interface CollaborationCharter {
  roles: { personId: string; role: string; contribution: string }[];
  backgroundIp: string;
  newIp: string;
  credit: string;
  decisionRights: string;
  expenses: string;
  revenueShare: { personId: string; share: number }[];
  permittedUses: string[];
  exit: string;
  signed: { personId: string; date: string | null }[];
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  image: string;
  stage: ProjectStage;
  memberIds: string[];
  kind: "artist-led" | "curator-call" | "institutional-commission" | "cross-disciplinary";
  idea: { prompt: string; references: string[]; questions: { q: string; answers: { personId: string; text: string }[] }[] };
  charter: CollaborationCharter;
  tasks: { id: string; title: string; assigneeId: string; status: "todo" | "doing" | "done"; due: string }[];
  milestones: { id: string; title: string; date: string; status: "done" | "current" | "upcoming"; approvals: { personId: string; approved: boolean }[] }[];
  files: { name: string; kind: "image" | "audio" | "doc" | "video"; by: string; date: string }[];
  budget: { label: string; amount: number; paidBy: string }[];
  payments: { personId: string; amount: number; status: "paid" | "pending" | "scheduled" }[];
  ledger: { date: string; personId: string; contribution: string }[];
  currency: "USD" | "NGN";
}

export interface LegacyEvent {
  date: string;
  kind: "created" | "exhibited" | "acquired" | "travelled" | "award" | "reflection";
  text: string;
  personId?: string;
  place?: string;
  source: TrustSource;
}

/** An artwork page that is a story, not a listing. */
export interface ArtworkStory {
  id: string;
  title: string;
  artistId: string;
  image: string;
  year: string;
  medium: string;
  dimensions: string;
  price?: string;
  meaning: string;
  voiceNote: { duration: string; transcript: string };
  studioVideo: { duration: string; poster: string; caption: string };
  evolution: { stage: string; note: string; date: string }[];
  materials: string[];
  influences: { kind: "music" | "poem" | "place" | "artist" | "memory"; text: string }[];
  challenges: string;
  legacy: LegacyEvent[];
  collectorEntries: { personId: string; date: string; text: string; livesIn?: string }[];
}

export interface JournalEntry {
  id: string;
  authorId: string;
  kind: "sketch" | "failure" | "idea" | "doubt" | "win" | "collector";
  date: string;
  text: string;
  image?: string;
  visibility: "public" | "circle" | "private";
  storyId?: string;
}

export interface StudioVisit {
  id: string;
  artistId: string;
  title: string;
  when: string;
  format: "live" | "360" | "vr" | "recorded";
  seats: number;
  seatsLeft: number;
  image: string;
  description: string;
}
