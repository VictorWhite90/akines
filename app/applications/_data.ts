import type { ApplicationStage } from "@/lib/types";

export const STAGE_STEPS: { id: ApplicationStage; label: string }[] = [
  { id: "submitted", label: "Submitted" },
  { id: "eligibility", label: "Eligibility" },
  { id: "review", label: "Review" },
  { id: "longlist", label: "Longlist" },
  { id: "shortlist", label: "Shortlist" },
  { id: "selected", label: "Selected" },
];

export const STAGE_LABEL: Record<ApplicationStage, string> = {
  submitted: "Submitted",
  eligibility: "Eligibility confirmed",
  review: "In review",
  longlist: "Longlisted",
  shortlist: "Shortlisted",
  selected: "Selected",
  "not-selected": "Not selected",
};

/** What each stage means for the artist, in plain words. */
export const STAGE_MEANING: Record<ApplicationStage, string> = {
  submitted: "Your application arrived complete.",
  eligibility: "A person checked your application against the call's rules.",
  review: "The panel is reading every eligible application.",
  longlist: "You're among the applications the panel wants to look at closely.",
  shortlist: "You're in the final group. A conversation comes next.",
  selected: "You've been selected.",
  "not-selected": "The panel chose other applications this time.",
};

/** Video-conversation slots offered by Ubuntu Contemporary for the shortlist (WAT). */
export const SLOTS = [
  { id: "s1", day: "Tue, Oct 28", time: "10:00 WAT", with: "Nomvula Dlamini + 1 panellist" },
  { id: "s2", day: "Tue, Oct 28", time: "15:30 WAT", with: "Nomvula Dlamini + 1 panellist" },
  { id: "s3", day: "Wed, Oct 29", time: "11:00 WAT", with: "Nomvula Dlamini + 1 panellist" },
  { id: "s4", day: "Thu, Oct 30", time: "09:00 WAT", with: "Nomvula Dlamini + 1 panellist" },
];

/** What happens next for applications that don't need anything from the artist. */
export const NEXT_UP: Record<string, string> = {
  "sound-space": "Nothing needed from you. Interviews are expected in the first week of December; Moussa sees the same status.",
};
