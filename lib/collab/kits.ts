import type { IconName } from "@/components/ui/Icon";
import type { LinkKind, WorkKind } from "./types";

/**
 * One workspace for any kind of work, shaped by what the work is. Every project has the same spine (agree,
 * deliver, approve, record, share value); a kit changes the words, the tools people pin, what proof looks like,
 * who usually approves, the meetings, and a starter plan.
 */
export type Kit = {
  id: WorkKind;
  label: string;
  icon: IconName;
  blurb: string;
  /** What one deliverable is called: "Feature", "Session", "Section". */
  one: string;
  many: string;
  proofHint: string;
  /** Who usually approves, in words. */
  approver: string;
  reviewHint: string;
  tools: { label: string; kind: LinkKind; placeholder: string }[];
  rituals: { title: string; minutes: number; blurb: string }[];
  checkin: { done: string; next: string };
  value: string;
  starter: { title: string; due: string; share: number }[];
};

export const KITS: Record<WorkKind, Kit> = {
  build: {
    id: "build", label: "Build", icon: "code", blurb: "Apps, websites, software",
    one: "Feature", many: "Features and releases", proofHint: "A pull request, a live preview link, a demo video or API docs",
    approver: "the client tries it", reviewHint: "Open the preview, try it like a real user, then approve or ask for changes.",
    tools: [
      { label: "Code repository", kind: "github", placeholder: "github.com/team/project" },
      { label: "Designs", kind: "figma", placeholder: "figma.com/file/…" },
      { label: "Test site", kind: "site", placeholder: "staging.yourapp.ng" },
      { label: "Docs", kind: "drive", placeholder: "docs.google.com/…" },
    ],
    rituals: [
      { title: "Stand-up", minutes: 15, blurb: "Done, next, stuck. Everyone in two minutes." },
      { title: "Demo", minutes: 30, blurb: "Show what works on the test site." },
      { title: "Pairing", minutes: 60, blurb: "Two people, one problem, screen shared." },
    ],
    checkin: { done: "What did you ship or fix?", next: "What are you building next?" },
    value: "Paid as each feature is approved",
    starter: [
      { title: "Scope and user stories", due: "Week 1", share: 10 },
      { title: "First working version", due: "Week 3", share: 40 },
      { title: "Tested with real users", due: "Week 4", share: 25 },
      { title: "Launch", due: "Week 5", share: 25 },
    ],
  },
  engineer: {
    id: "engineer", label: "Engineering", icon: "verified", blurb: "Installations, structures, technical builds",
    one: "Stage", many: "Stages and sign-offs", proofHint: "Dated site photos, drawings, test results or a signed checklist",
    approver: "the licensed lead signs off", reviewHint: "Check the photos and results against the drawings, then sign off the stage.",
    tools: [
      { label: "Drawings", kind: "drive", placeholder: "drive.google.com/…" },
      { label: "Spec sheet", kind: "drive", placeholder: "docs.google.com/…" },
      { label: "Supplier quote", kind: "site", placeholder: "supplier.ng/quote/…" },
    ],
    rituals: [
      { title: "Site check-in", minutes: 20, blurb: "What's done on site, what's blocked, safety notes." },
      { title: "Safety briefing", minutes: 10, blurb: "Before work starts on a new stage." },
      { title: "Handover walk-through", minutes: 45, blurb: "Walk the client through the finished work." },
    ],
    checkin: { done: "What was done on site?", next: "What's planned next, and is it safe to start?" },
    value: "Paid per stage signed off",
    starter: [
      { title: "Site survey", due: "Week 1", share: 10 },
      { title: "Design and drawings", due: "Week 2", share: 20 },
      { title: "Installation", due: "Week 4", share: 40 },
      { title: "Testing and certificate", due: "Week 5", share: 20 },
      { title: "Handover to the client", due: "Week 5", share: 10 },
    ],
  },
  teach: {
    id: "teach", label: "Teach", icon: "mentorship", blurb: "Courses, workshops, lectures",
    one: "Session", many: "Sessions and materials", proofHint: "Slides, a reading list, a recording or the attendance",
    approver: "the course lead confirms it ran", reviewHint: "Check the materials are ready, or confirm the session happened.",
    tools: [
      { label: "Classroom", kind: "site", placeholder: "classroom.google.com/…" },
      { label: "Slides", kind: "drive", placeholder: "docs.google.com/presentation/…" },
      { label: "Shared folder", kind: "drive", placeholder: "drive.google.com/…" },
    ],
    rituals: [
      { title: "Prep session", minutes: 30, blurb: "Walk through next session's plan together." },
      { title: "Run-through", minutes: 45, blurb: "Rehearse the hard parts out loud." },
      { title: "Debrief", minutes: 20, blurb: "What landed, what to change next time." },
    ],
    checkin: { done: "What did you teach or prepare?", next: "What are you preparing next?" },
    value: "Fee per session taught",
    starter: [
      { title: "Course outline", due: "Week 1", share: 10 },
      { title: "Session 1", due: "Week 2", share: 25 },
      { title: "Session 2", due: "Week 3", share: 25 },
      { title: "Session 3", due: "Week 4", share: 25 },
      { title: "Feedback from learners", due: "Week 5", share: 15 },
    ],
  },
  study: {
    id: "study", label: "Study", icon: "study", blurb: "Group assignments, research, final-year projects",
    one: "Section", many: "Sections and drafts", proofHint: "A draft, your data, your sources",
    approver: "the group, then the supervisor", reviewHint: "Read the draft against the brief, then approve or say what's missing.",
    tools: [
      { label: "Shared document", kind: "drive", placeholder: "docs.google.com/…" },
      { label: "Data", kind: "drive", placeholder: "sheets.google.com/…" },
      { label: "References", kind: "site", placeholder: "zotero.org/groups/…" },
    ],
    rituals: [
      { title: "Group meeting", minutes: 30, blurb: "Who's doing what this week." },
      { title: "Supervision", minutes: 30, blurb: "Questions for your supervisor, notes after." },
      { title: "Writing sprint", minutes: 60, blurb: "Cameras on, heads down, write together." },
    ],
    checkin: { done: "What did you write, read or collect?", next: "What will you do before the next meeting?" },
    value: "A contribution record for grading",
    starter: [
      { title: "Research question", due: "Week 1", share: 10 },
      { title: "Literature review", due: "Week 3", share: 20 },
      { title: "Data collection", due: "Week 5", share: 25 },
      { title: "Analysis", due: "Week 7", share: 25 },
      { title: "Final report", due: "Week 9", share: 20 },
    ],
  },
  make: {
    id: "make", label: "Make", icon: "creative", blurb: "Design, art, photo, film, writing",
    one: "Piece", many: "Pieces and drafts", proofHint: "Drafts, images, a cut, a file",
    approver: "the host picks the final", reviewHint: "Look at the draft against the brief, then approve or ask for changes.",
    tools: [
      { label: "Design file", kind: "figma", placeholder: "figma.com/file/…" },
      { label: "Shared folder", kind: "drive", placeholder: "drive.google.com/…" },
      { label: "Moodboard", kind: "site", placeholder: "pinterest.com/…" },
    ],
    rituals: [
      { title: "Critique", minutes: 30, blurb: "Honest notes on the latest drafts." },
      { title: "Working session", minutes: 60, blurb: "Make together, cameras on." },
      { title: "Shoot or studio day", minutes: 120, blurb: "Plan the day, then go." },
    ],
    checkin: { done: "What did you make this week?", next: "What are you making next?" },
    value: "Revenue split",
    starter: [
      { title: "Brief and references", due: "Week 1", share: 10 },
      { title: "First drafts", due: "Week 2", share: 30 },
      { title: "Finals", due: "Week 4", share: 45 },
      { title: "Show it", due: "Week 5", share: 15 },
    ],
  },
  event: {
    id: "event", label: "Event", icon: "event", blurb: "Events, food, community projects",
    one: "Part", many: "Parts of the event", proofHint: "A booking, a menu, the run of show, photos from the day",
    approver: "the organiser confirms it", reviewHint: "Check it's booked and ready, then confirm.",
    tools: [
      { label: "Run of show", kind: "drive", placeholder: "docs.google.com/…" },
      { label: "Budget sheet", kind: "drive", placeholder: "sheets.google.com/…" },
      { label: "Tickets or RSVPs", kind: "site", placeholder: "tix.africa/…" },
    ],
    rituals: [
      { title: "Planning call", minutes: 30, blurb: "Suppliers, timings, who's on what." },
      { title: "Walk-through", minutes: 45, blurb: "Walk the venue and the day, start to finish." },
      { title: "Debrief", minutes: 20, blurb: "What to keep for next time." },
    ],
    checkin: { done: "What got booked or done?", next: "What's next before the day?" },
    value: "Paid per part delivered",
    starter: [
      { title: "Venue and date", due: "Week 1", share: 15 },
      { title: "Suppliers booked", due: "Week 2", share: 25 },
      { title: "Run of show", due: "Week 3", share: 15 },
      { title: "The day", due: "Week 4", share: 35 },
      { title: "Thank-yous and photos", due: "Week 5", share: 10 },
    ],
  },
};

export const KIT_ORDER: WorkKind[] = ["build", "engineer", "teach", "study", "make", "event"];
export const kitOf = (k?: WorkKind) => KITS[k ?? "make"];

/** A sensible kind for a call or project, from its fields. */
export function kindForFields(fields: string[]): WorkKind {
  if (fields.includes("Tech")) return "build";
  if (fields.includes("Food") || fields.includes("Community")) return "event";
  return "make";
}

export const STATUS_LABEL: Record<string, string> = { todo: "To do", doing: "In progress", review: "Ready for review", changes: "Changes asked", approved: "Approved" };
