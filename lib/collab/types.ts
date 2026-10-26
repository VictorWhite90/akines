import type { PhotoKey } from "@/lib/data/images";
import type { PersonId } from "@/lib/data/people";

/*
 * Collaboration: the journey from an open call (or a proposal to one person) to a shared workspace.
 * Seven stages, from the concept brief (S1): Discover → Imagine → Agree → Create → Present → Share value → Preserve.
 */

export const JOURNEY = ["Discover", "Imagine", "Agree", "Create", "Present", "Share value", "Preserve"] as const;
export type JourneyStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const FIELDS = ["Design", "Tech", "Media", "Arts", "Food", "Community", "Business"] as const;
export type Field = (typeof FIELDS)[number];

export type CallMaterial = { id: string; label: string; hint?: string; required: boolean };

/** A structured open call (S2): everything an applicant needs to decide, up front. */
export type CollabCall = {
  id: string;
  title: string;
  host: PersonId;
  org: string;
  orgKind: string;
  city: string;
  where: "In person" | "Remote" | "Hybrid";
  photo: PhotoKey;
  summary: string;
  about: string;
  roles: string[];
  fields: Field[];
  level: string;
  fee: string;
  rights: string;
  selection: string;
  teamSize: number;
  materials: CallMaterial[];
  timeline: { label: string; when: string }[];
  closesInDays: number;
  verified: boolean;
  postedByMe?: boolean;
};

/** A piece of someone's work they can attach to an application or bring into a studio. */
export type Work = { id: string; title: string; kind: string; year: string; photo: PhotoKey };

/** A link that shows someone's work: GitHub, a live project, a portfolio, a profile, a recording. */
export type ProofLink = { url: string; kind: LinkKind; note?: string };
export type LinkKind = "github" | "gitlab" | "figma" | "behance" | "dribbble" | "linkedin" | "instagram" | "youtube" | "vimeo" | "soundcloud" | "spotify" | "medium" | "substack" | "drive" | "site";
/** A file sent with an application: a CV, or a sample (writing, audio, a deck, a menu, a certificate). */
export type ProofFile = { id: string; name: string; size: number; type: string; kind: "cv" | "sample" };

/**
 * Where an application stands. The applicant and the host see the same stage; only the words differ.
 * submitted → viewed → shortlisted → conversation → offer → joined, or not-selected / withdrawn.
 */
export type AppStage = "submitted" | "viewed" | "shortlisted" | "conversation" | "offer" | "joined" | "not-selected" | "withdrawn";
export const APP_FLOW: AppStage[] = ["submitted", "viewed", "shortlisted", "conversation", "offer", "joined"];

export type Application = {
  id: string;
  callId: string;
  applicant: PersonId;
  role: string;
  works: string[];
  /** Links and files, for work that isn't a picture (code, writing, audio, a CV). Older saved applications have none. */
  links?: ProofLink[];
  files?: ProofFile[];
  statement: string;
  availability: string;
  materials: Record<string, boolean>;
  stage: AppStage;
  history: { stage: AppStage; at: number; note?: string }[];
  /** The conversation slot the applicant picked when shortlisted. */
  slot?: string;
  /** Host-only: private notes, tags and a quick rating. */
  notes: { at: number; text: string }[];
  tags: string[];
  rating?: number;
  /** What the host said with their decision (everyone hears back, S9). */
  feedback?: string;
  offer?: { role: string; fee: string; start: string };
  projectId?: string;
  /** Demo: when the other side responds next (the sample people "answer" a few seconds later). */
  nextAt?: number;
  /** Demo: an application that "arrives" at this time (after the member posts a call). Hidden until then. */
  arrivesAt?: number;
};

export type Member = { id: PersonId; role: string; contribution: string };

/** Fair terms agreed before work starts (S5). Work can't start until everyone has signed. */
export type Charter = {
  credit: string;
  ownership: string;
  decisions: string;
  expenses: string;
  uses: string;
  exit: string;
  split: Partial<Record<PersonId, number>>;
  signed: PersonId[];
  signedAt?: number;
};

export type Task = { id: string; title: string; who: PersonId; due: string; status: "todo" | "doing" | "done" };
export type Milestone = { id: string; title: string; due: string; done: boolean };
export type StudioItem = {
  id: string;
  kind: "image" | "note";
  title: string;
  by: PersonId;
  tag: "Reference" | "Draft" | "Final";
  at: number;
  photo?: PhotoKey;
  src?: string;
  text?: string;
  comments: { by: PersonId; text: string; at: number }[];
};
export type Expense = { id: string; label: string; amount: number; by: PersonId; status: "paid" | "pending" };

export type Project = {
  id: string;
  title: string;
  summary: string;
  photo: PhotoKey;
  host: PersonId;
  callId?: string;
  proposalId?: string;
  members: Member[];
  stage: JourneyStage;
  createdAt: number;
  charter: Charter;
  tasks: Task[];
  milestones: Milestone[];
  studio: StudioItem[];
  present: { what: string; where: string; when: string; checklist: { label: string; done: boolean }[] };
  budget: { total: number; currency: "₦"; expenses: Expense[]; paidOut: PersonId[] };
  /** Contribution ledger (S8): every decision, sign-off and delivery, dated. */
  ledger: { at: number; who: PersonId | "akines"; what: string }[];
  /** The project's KinMessage conversation. */
  convoId: string;
  rooms: string[];
  /** Demo: teammates who will sign the charter a few seconds after the member does. */
  signAt?: number;
};

/** "Propose a project" to one person, from matching (S4). Accepted, it becomes a project at Imagine. */
export type Proposal = { id: string; to: PersonId; title: string; idea: string; myRole: string; theirRole: string; status: "sent" | "accepted" | "declined"; at: number; nextAt?: number; projectId?: string };

export type CollabState = {
  v: 1;
  calls: CollabCall[];
  applications: Application[];
  projects: Project[];
  proposals: Proposal[];
  /** Calls the member follows. */
  saved: string[];
};
