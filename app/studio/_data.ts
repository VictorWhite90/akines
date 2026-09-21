/**
 * Route-local mock data and helpers for the Collaboration Studio.
 * Shared project data lives in `@/lib/data`; this file adds the studio-only
 * layers (matching suggestions, stage guidance, launch plans, provenance).
 */
import type { IntroductionReason, Project, ProjectStage, TrustSource } from "@/lib/types";
import { ME_ID, PROJECT_STAGES, getPerson } from "@/lib/data";

/** Artelia's collaboration facilitation fee (B2) — shown on every Share value tab. */
export const FACILITATION_FEE_RATE = 0.05;

export const KIND_LABEL: Record<Project["kind"], string> = {
  "artist-led": "Artist-led",
  "curator-call": "From a curator's call",
  "institutional-commission": "Institutional commission",
  "cross-disciplinary": "Cross-disciplinary",
};

export type RoomTab = Exclude<ProjectStage, "discover">;

export const ROOM_TABS: { id: RoomTab; label: string }[] = [
  { id: "imagine", label: "Imagine" },
  { id: "agree", label: "Agree" },
  { id: "create", label: "Create" },
  { id: "present", label: "Present" },
  { id: "share-value", label: "Share value" },
  { id: "preserve", label: "Preserve" },
];

export function stageIndex(stage: ProjectStage) {
  return PROJECT_STAGES.findIndex((s) => s.id === stage);
}

export function stageLabel(stage: ProjectStage) {
  return PROJECT_STAGES.find((s) => s.id === stage)?.label ?? stage;
}

/** The room tab a project opens on: its current stage (Discover opens on Imagine). */
export function defaultTab(stage: ProjectStage): RoomTab {
  return stage === "discover" ? "imagine" : stage;
}

export function isMember(project: Project) {
  return project.memberIds.includes(ME_ID);
}

/** Projects the public may see: only those already presented or preserved. */
export function isPublic(project: Project) {
  return project.stage === "present" || project.stage === "share-value" || project.stage === "preserve";
}

export function money(amount: number, currency: Project["currency"]) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function firstName(personId: string) {
  return getPerson(personId).name.split(" ")[0];
}

export function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** The one thing a project needs next — shown on "Your projects" cards. */
export function nextNeeded(project: Project): { text: string; forMe: boolean } {
  if (project.stage === "imagine") {
    const unanswered = project.idea.questions.some((q) => q.answers.length < project.memberIds.length);
    return { text: unanswered ? "Answer the compatibility questions on the canvas" : "Decide together whether to open a project room", forMe: unanswered };
  }
  if (project.stage === "agree") {
    const unsigned = project.charter.signed.filter((s) => !s.date).map((s) => s.personId);
    const signedCount = project.charter.signed.length - unsigned.length;
    if (unsigned.includes(ME_ID)) {
      return { text: `Your signature on the charter · ${signedCount} of ${project.charter.signed.length} signed`, forMe: true };
    }
    return { text: `Waiting for ${joinNames(unsigned.map(firstName))} to sign the charter`, forMe: false };
  }
  if (project.stage === "create") {
    const current = project.milestones.find((m) => m.status === "current");
    if (current) {
      const mine = current.approvals.find((a) => a.personId === ME_ID);
      if (mine && !mine.approved) return { text: `Your approval: “${current.title}”`, forMe: true };
      return { text: `Milestone in progress: “${current.title}”`, forMe: false };
    }
    return { text: "Plan the first milestone", forMe: false };
  }
  if (project.stage === "present") return { text: "Confirm the launch plan and public story", forMe: false };
  if (project.stage === "share-value") return { text: "Check split instructions before payments release", forMe: false };
  return { text: "Add a reflection to the work's legacy", forMe: false };
}

/** What each stage is for and how a project gets there — used when a tab isn't reached yet. */
export const STAGE_GUIDE: Record<RoomTab, { what: string[]; howToGetThere: (p: Project) => string }> = {
  imagine: {
    what: ["A private canvas for the question you want to explore", "A shared board of references", "Compatibility questions each person answers honestly"],
    howToGetThere: () => "Open a private idea canvas from a suggestion in the Collaboration Studio.",
  },
  agree: {
    what: [
      "A plain-language charter: roles, background and new IP, credit, decision rights, expenses and revenue share",
      "Permitted uses and a fair way to leave",
      "Every member signs before production starts",
    ],
    howToGetThere: (p) =>
      `When ${joinNames(p.memberIds.map(firstName))} agree the idea is worth making, turn this canvas into a project room and start from a charter template.`,
  },
  create: {
    what: ["A task board everyone can see", "Milestones that every member approves — approvals can release budget tranches", "Files in one place, with who added what"],
    howToGetThere: (p) => {
      const unsigned = p.charter.signed.filter((s) => !s.date).map((s) => firstName(s.personId));
      return unsigned.length
        ? `Production opens once everyone has signed the charter. Still to sign: ${joinNames(unsigned)}.`
        : "Production opens once everyone has signed the charter.";
    },
  },
  present: {
    what: ["One shared story page for the work, credited to everyone", "A launch plan: preview, press, opening", "Optionally list the work on Artelia Discover"],
    howToGetThere: () => "Approve the final production milestone together. The public page stays a draft until every member approves it.",
  },
  "share-value": {
    what: ["Split instructions taken straight from the charter", "Expenses with who paid, reimbursed before the split", "Payment status per member, with escrow for commissioned funds"],
    howToGetThere: () => "Revenue appears here once the work is sold, commissioned or licensed. Nothing is paid out without the charter's split.",
  },
  preserve: {
    what: ["A contribution ledger that records who did what, and when", "Creator credits that travel with the work", "Provenance and ownership history future owners inherit"],
    howToGetThere: () => "The ledger is already recording. Once the work is presented, it becomes part of the work's permanent legacy.",
  },
};

export type LaunchStep = { label: string; date: string; status: "done" | "next" | "later" };

export const LAUNCH_PLANS: Record<string, LaunchStep[]> = {
  "salt-water-memory": [
    { label: "Private preview for collectors who follow the journal", date: "Feb 2027", status: "later" },
    { label: "Press images and the recording of Dakar harbour released", date: "Feb 2027", status: "later" },
    { label: "Opening at Ubuntu Contemporary, Johannesburg", date: "Mar 2027", status: "later" },
    { label: "Sound & Space lab presentation, Dakar", date: "Apr 2027", status: "later" },
  ],
  "foundation-atrium": [
    { label: "Unveiling for the Foundation's families and staff", date: "Nov 14", status: "done" },
    { label: "Public story page goes live with Kwame's voice note", date: "Nov 18", status: "next" },
    { label: "School visits programme begins", date: "Jan 2027", status: "later" },
  ],
  "ancestral-frequencies": [
    { label: "Premiere, Dakar Sound Collective", date: "Feb 2026", status: "done" },
    { label: "Luanda performance", date: "Mar 2026", status: "done" },
    { label: "Recording archived with full credits", date: "Apr 2026", status: "done" },
  ],
};

export function launchPlan(project: Project): LaunchStep[] {
  return (
    LAUNCH_PLANS[project.id] ?? [
      { label: "Members approve the public story page", date: "To be set", status: "next" },
      { label: "Preview for people already following the work", date: "To be set", status: "later" },
      { label: "Opening or release", date: "To be set", status: "later" },
    ]
  );
}

export type ProvenanceEvent = { date: string; text: string; source: TrustSource };

export const PROVENANCE: Record<string, ProvenanceEvent[]> = {
  "salt-water-memory": [
    { date: "Sep 4, 2026", text: "New work registered as co-owned 50:50 by Adaeze Nwosu and Moussa Diallo under the signed charter.", source: "verified" },
    { date: "Sep 26, 2026", text: "Indigo from the Kano dye pits recorded as the source material for all panels.", source: "self-declared" },
  ],
  "foundation-atrium": [
    { date: "May 2, 2026", text: "Commission agreed: the Foundation will own the object; Kwame Mensah keeps copyright.", source: "verified" },
    { date: "Nov 14, 2026", text: "Installed in the atrium of the West Africa Arts Foundation, Accra.", source: "verified" },
  ],
  "ancestral-frequencies": [
    { date: "Feb 2026", text: "Premiered at the Dakar Sound Collective; recording co-owned in thirds.", source: "verified" },
    { date: "Apr 2026", text: "Archival recording deposited with full contributor credits.", source: "verified" },
    { date: "Jun 2026", text: "Licensed for a university course in Cairo — credits carried through.", source: "self-declared" },
  ],
};

/** Collaboration Matching (S4) — similarity AND productive difference, always explained. */
export interface StudioMatch {
  id: string;
  personIds: string[];
  pairing: string;
  headline: string;
  similarity: IntroductionReason[];
  difference: IntroductionReason[];
  /** A starting question for the idea canvas. */
  prompt: string;
  existingProjectId?: string;
  /** An example pairing between other members, shown to explain how matching works. */
  example?: boolean;
}

export const STUDIO_MATCHES: StudioMatch[] = [
  {
    id: "moussa",
    personIds: ["moussa"],
    pairing: "Textile × Sound",
    headline: "Cloth holds a journey you can touch. Sound holds one you walk through.",
    similarity: [
      { text: "You both work with migration and memory — Kano to Dakar to Lagos.", source: "self-declared" },
      { text: "Both identity-verified, open to collaborate, and share English.", source: "verified" },
    ],
    difference: [
      { text: "He records spaces; you fold time into material. Neither of you would make this installation alone.", source: "ai" },
    ],
    prompt: "What does a journey sound like after it's been folded into cloth?",
    existingProjectId: "salt-water-memory",
  },
  {
    id: "wanjiru-ayo",
    personIds: ["wanjiru", "ayo"],
    pairing: "Photographer × Fashion designer × Textile",
    headline: "A whole editorial team, without trawling three sets of profiles.",
    similarity: [
      { text: "Wanjiru photographs markets at dawn and prints on market cloth — the same ground your indigo comes from.", source: "self-declared" },
      { text: "Ayo is in Lagos, available now, and tailors adire.", source: "verified" },
    ],
    difference: [
      { text: "Image, garment and cloth cover each other's gaps: Wanjiru frames, Ayo shapes, you make the surface.", source: "ai" },
    ],
    prompt: "Can an editorial be sold as art without losing the market it came from?",
    existingProjectId: "market-light",
  },
  {
    id: "ines",
    personIds: ["ines"],
    pairing: "Textile × Choreography",
    headline: "The gestures people keep after leaving home — and the cloth they carry.",
    similarity: [
      { text: "You both make work about migration; Inês calls the body an archive.", source: "self-declared" },
      { text: "Identity verified; limited availability until January.", source: "verified" },
    ],
    difference: [
      { text: "She works in time and movement, you in material that lasts. Cloth that dancers wear, then leave behind, could hold both.", source: "ai" },
    ],
    prompt: "What would a wrapper remember if it were danced in before it was hung?",
  },
  {
    id: "fatima-sipho",
    personIds: ["fatima", "sipho"],
    pairing: "Ceramicist × Architect",
    headline: "How matching paired two other members: a potter and an architect who both think about water.",
    similarity: [{ text: "Both named water and public space as themes they return to.", source: "self-declared" }],
    difference: [
      { text: "Fatima builds vessels by hand; Sipho designs the courtyards they could live in. Craft meets infrastructure.", source: "ai" },
    ],
    prompt: "",
    example: true,
  },
];
