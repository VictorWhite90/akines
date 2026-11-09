/*
 * Copy and addresses of the host's review of applicants (12.45 REVIEW APPLICANTS, 12.46 OPEN CALL REVIEW), word for
 * word from the product design's applicants/data.ts. Where the design names its sample project or call, the copy
 * takes ours. No "use client": pages and client screens both import it.
 */
import { workspaceHref } from "@/lib/collab/workspace";
import type { ReviewStatus } from "@/lib/collab/applicants";

/* ------------------------------------------------------------------ paths */

/** A project's applicants (12.45) and the frames that show another state of the page (.../state-<name>). */
export const applicantPaths = (projectId: string) => {
  const list = `${workspaceHref(projectId)}/applicants`;
  return {
    list,
    compare: `${list}/compare`,
    compareSelected: `${list}/state-compare-selected`,
    loading: `${list}/state-loading`,
    empty: `${list}/state-empty`,
    error: `${list}/state-error`,
    offerSent: `${list}/state-offer-sent`,
    joined: `${list}/state-joined`,
    notNow: `${list}/state-not-now`,
  };
};

export const CALLS_PATH = "/collaborate/open-calls";
/** A call you host that has no project yet (12.46). */
export const callPaths = (callId: string) => {
  const call = `${CALLS_PATH}/${callId}`;
  return {
    call,
    compare: `${call}/compare`,
    compareSelected: `${call}/state-compare-selected`,
    ready: `${call}/state-ready`,
    closed: `${call}/state-closed`,
    empty: `${call}/state-empty`,
  };
};

export const LINKS = { myProjects: "/collaborate/my-projects", start: "/collaborate/start" } as const;

/* ------------------------------------------------------------------ helpers */

/** "Folake and Tunde", "Folake, Tunde and Ngozi". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const WORD = ["no one", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/* ------------------------------------------------------------------ 12.45 Applicants */

export const PAGE = {
  back: "Team",
  title: "Applicants",
  support: (project: string) => `People who applied to join ${project}. You decide who goes ahead.`,
  emptySupport: (project: string) => `People who ask to join ${project} will appear here.`,
  chips: ["All", "New", "Shortlisted", "Talk booked", "Offer sent"] as const,
  empty: {
    title: "No one has applied yet",
    text: (project: string) => `When someone asks to join ${project}, you will see them here. Share the project link to help the right people find it.`,
    action: "Share the project link",
  },
  error: { title: "We could not load your applicants.", text: "Check your connection and try again. Your applicants are safe.", action: "Try again" },
  none: "No one here yet.",
  linkCopied: "Link copied.",
};

/** "4 applicants. 2 new, 1 shortlisted, 1 talk booked." Statuses without anyone are left out. */
export function summaryLine(counts: Record<ReviewStatus, number>): string {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const parts = (["New", "Shortlisted", "Talk booked", "Offer sent", "Joined", "Not now"] as ReviewStatus[]).filter((s) => counts[s] > 0).map((s) => `${counts[s]} ${s.toLowerCase()}`);
  return `${plural(total, "applicant")}.${parts.length ? ` ${parts.join(", ")}.` : ""}`;
}

export const ROW = {
  compare: "Compare",
  view: "View applicant",
  wants: "WANTS TO JOIN AS",
  availability: "AVAILABILITY",
  message: "MESSAGE",
  shortlist: "Shortlist",
  notNow: "Not now",
  proposeTimes: "Propose times",
  sendOffer: "Send offer",
  undo: "Undo",
  seeOnTeam: "See on Team",
  offerInfo: "Offer sent. Waiting for an answer.",
};

export const JOINED_NOTICE = (name: string, project: string) => `${name} joined ${project}.`;

/* ------------------------------------------------------------------ compare */

export const COMPARE = {
  title: "Compare applicants",
  back: "Applicants",
  support: (names: string[]) => `${joinNames(names)}, side by side. Your notes are only visible to you.`,
  summary: (n: number) => `${n} people selected`,
  names: (names: string[]) => `${joinNames(names)}. You can compare up to three.`,
  clear: "Clear",
  compare: "Compare",
  rows: ["ROLE", "WANTS TO JOIN AS", "AVAILABILITY", "SKILLS", "EXPERIENCE", "MESSAGE", "YOUR NOTES"] as const,
  noNote: "No note yet.",
  /** Our people may not have shared these yet. */
  notShared: "Not shared yet.",
};

/* ------------------------------------------------------------------ slide-out and modals */

export const SLIDE = {
  eyebrow: "APPLICANT",
  skills: "SKILLS",
  note: { label: "Private note", placeholder: "For example, strong research background. Ask about availability.", helper: "Only you can see this.", save: "Save note", saved: "Note saved" },
  noteToast: "Note saved. Only you can see it.",
};

export const TIMES = {
  eyebrow: "PROPOSE TIMES",
  title: (first: string) => `Propose times to ${first}`,
  description: "Pick up to three slots. Times are in WAT. The talk is a 20 minute video call.",
  slots: ["10:00 am", "2:00 pm", "4:00 pm"],
  /** The slots chosen when the modal opens (Propose Times Form, Ready): day one 2:00 pm, day two 10:00 am, day three 4:00 pm. */
  chosen: [[0, 1], [1, 0], [2, 2]] as [number, number][],
  max: 3,
  count: (n: number) => `${n} of 3 chosen`,
  message: { label: "Message", placeholder: "For example, I would love to hear how you would approach the first screens.", hint: "Optional." },
  send: "Send times",
  cancel: "Cancel",
  toast: (name: string) => `Times sent. ${name} will pick one.`,
};

export const OFFER = {
  eyebrow: "SEND OFFER",
  title: (first: string) => `Send an offer to ${first}`,
  description: (first: string) => `${first} decides. An offer is never accepted for anyone.`,
  role: { label: "Role", hint: "The role you are offering.", placeholder: "For example, Product Designer" },
  hours: { label: "Hours a week", hint: "Agreed together.", placeholder: "For example, 6 hours a week", value: "6 hours a week" },
  start: { label: "Start date", hint: "When they would begin.", placeholder: "Choose a date" },
  note: {
    label: "Note",
    hint: "Optional. They will see it with the offer.",
    placeholder: "A line about why you would like them on the team.",
    value: "Thank you for the careful workshop plan. We would be glad to have you on the team.",
  },
  send: "Send offer",
  cancel: "Cancel",
  toast: (name: string) => `Offer sent. ${name} will see it.`,
};

export const NOT_NOW = {
  eyebrow: "NOT NOW",
  title: (first: string) => `Reply to ${first}?`,
  description: (first: string) => `This is not a no. ${first} will see that now is not the right time.`,
  /** The design says "She will see your reply."; our people carry no pronoun, so the line names no one. */
  to: { label: "To", hint: "They will see your reply." },
  message: { label: "Message", hint: "Optional.", placeholder: "For example, We are not adding anyone just yet." },
  send: "Send",
  cancel: "Cancel",
  toast: (name: string) => `Marked not now. ${name} will see your reply.`,
};

/* ------------------------------------------------------------------ 12.46 Open calls */

export const CALLS_PAGE = {
  back: "My projects",
  label: "OPEN CALLS",
  title: "Your open calls.",
  lead: "Calls you posted that do not have a project yet. Choose who goes ahead when you are ready.",
  post: "Post a new call",
  empty: { title: "You have no open calls.", text: "When you post a call for collaborators, it will appear here with the people who applied.", action: "Post a new call" },
  review: "Review applicants",
  open: "Open",
  closed: "Closed",
  meta: (stage: string, roles: string) => `${stage} · Looking for ${roles}`,
  closes: (date: string) => `Closes ${date}`,
  closedOn: (date: string) => `Closed on ${date}`,
};

export const CALL_PAGE = {
  back: "Your open calls",
  eyebrow: "OPEN CALL",
  eyebrowClosed: "CALL",
  stage: "STAGE",
  lookingFor: "LOOKING FOR",
  closes: "CLOSES",
  closedOn: "CLOSED ON",
  applicants: "APPLICANTS",
  noProject: { title: "This call does not have a project yet.", text: "When you have chosen your collaborators, we will help you start the project with them." },
  closeCall: "Close call",
  closedNotice: { title: (date: string) => `Applications closed on ${date}`, text: "No new people can apply. You can still review everyone who did.", reopen: "Reopen call" },
  start: "Start the project with shortlisted people",
  helperNone: "Shortlist at least one person to start the project.",
  helper: (names: string[]) => `${plural(names.length, "person", "people")} shortlisted: ${joinNames(names)}.`,
  empty: { title: "No one has applied yet", text: "People who apply to this call will appear here. You can close the call whenever you are ready.", action: "Share the call link" },
  linkCopied: "Link copied.",
  closedToast: "Call closed. No new applications.",
};

export const CLOSE_MODAL = {
  eyebrow: "CLOSE CALL",
  title: "Close this call?",
  description: "People will not be able to apply any more. You can reopen it later, and everyone who applied stays on your list.",
  confirm: "Close call",
  cancel: "Cancel",
};

export const START_MODAL = {
  eyebrow: "START PROJECT",
  title: (names: string[]) => `Start a project with ${joinNames(names)}?`,
  description: (names: string[]) => `We will set up the project with ${names.length === 1 ? names[0] : `the ${WORD[names.length] ?? names.length} of them`}. You can add or change the team afterwards.`,
  confirm: "Start project",
  cancel: "Not yet",
};

/* ------------------------------------------------------------------ Overview band */

export const BAND = {
  label: "INTEREST REQUESTS",
  waiting: (n: number) => `${n} waiting`,
  reviewAll: "Review all",
  review: "Review",
  wants: (role: string) => `Wants to join as ${role}`,
};
