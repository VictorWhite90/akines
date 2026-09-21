import type { CandidateStage } from "@/lib/types";

export const PIPELINE: { id: CandidateStage; label: string; hint: string }[] = [
  { id: "received", label: "Received", hint: "Waiting for an eligibility screen" },
  { id: "eligible", label: "Eligible", hint: "Meets the call's rules, not yet reviewed" },
  { id: "longlist", label: "Longlist", hint: "Worth a closer look" },
  { id: "shortlist", label: "Shortlist", hint: "Invited to a studio conversation" },
  { id: "selected", label: "Selected", hint: "In the final eight" },
  { id: "declined", label: "Declined", hint: "Told, with feedback" },
];

export type Consent = "granted" | "requested" | "not-asked" | "declined";

/** Future-opportunity radar consent, as each artist answered it (or hasn't yet). */
export const RADAR_CONSENT: Record<string, { state: Consent; date?: string }> = {
  kwame: { state: "granted", date: "Sep 14" },
  tunde: { state: "granted", date: "Sep 16" },
  fatima: { state: "granted", date: "Sep 19" },
  ayo: { state: "declined", date: "Sep 15" },
  wanjiru: { state: "not-asked" },
};

export const CONSENT_LABEL: Record<Consent, string> = {
  granted: "Artist consented",
  requested: "Consent requested",
  "not-asked": "Not asked yet",
  declined: "Artist declined",
};

/** Consented profiles kept from Halima's earlier calls. */
export const PAST_RADAR = [
  { personId: "adaeze", from: "Domestic Archives (2025)", since: "Nov 2025", why: "Textile maps of family journeys — right for a fibre show on women's archives." },
  { personId: "ines", from: "Domestic Archives (2025)", since: "Nov 2025", why: "Performance from kept gestures; could pair with a painter on the body at home." },
];

/** Templated messages for communicating status to everyone at a stage. */
export const TEMPLATES: Record<CandidateStage, string> = {
  received:
    "Dear {first_name},\n\nThank you for applying to {call}. Your application arrived complete. Eligibility screening finishes by Oct 24 and you'll hear from me either way.\n\nHalima",
  eligible:
    "Dear {first_name},\n\nYour application to {call} meets every eligibility rule and is now with me for review. Longlist decisions go out on Nov 3.\n\nHalima",
  longlist:
    "Dear {first_name},\n\nI'm pleased to tell you you're on the longlist for {call}. I'll be in touch about studio conversations by Nov 10. Nothing is needed from you yet.\n\nHalima",
  shortlist:
    "Dear {first_name},\n\nYou're shortlisted for {call}. Please pick a 30-minute studio conversation slot on your Applications page by Nov 12.\n\nHalima",
  selected:
    "Dear {first_name},\n\nI'm delighted to invite you into the final eight for {call}. The agreement, fee schedule (₦500,000 + shipping) and timeline follow in your Studio.\n\nHalima",
  declined:
    "Dear {first_name},\n\nThank you for applying to {call}. I haven't been able to include your work this time. My written feedback is attached, and I'd welcome an application to a future call.\n\nHalima",
};

export const CALL_START = "Sep 1";
