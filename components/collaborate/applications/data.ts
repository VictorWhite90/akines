import type { Application, AppStage } from "@/lib/collab/types";
import type { TimelineStep } from "./shared";

/*
 * The design's application journey (12.44 APPLICATION STATUS) read from our Application: the page a request is at,
 * the days and times the host offered (Slot Picker), dates as the design writes them, and the timeline steps per stage.
 * Their sample dates and times come from the application's history and the host's offered slots here.
 */

export type Stage = "pending" | "shortlisted" | "talk" | "offer" | "joined" | "declined" | "not-selected" | "withdrawn";

/** The page an application is at. Declining an offer withdraws the application, so a withdrawal after an offer reads Declined. */
export function stageOf(a: Application): Stage {
  switch (a.stage) {
    case "shortlisted": return a.slot ? "talk" : "shortlisted";
    case "conversation": return "talk";
    case "offer": return "offer";
    case "joined": return "joined";
    case "not-selected": return "not-selected";
    case "withdrawn": return a.history.some((h) => h.stage === "offer") ? "declined" : "withdrawn";
    default: return "pending";
  }
}

/** The tab titles of the design's frames. */
export const TAB_TITLE: Record<Stage, string> = {
  pending: "Your request",
  shortlisted: "Your request",
  talk: "Talk booked",
  offer: "Offer received",
  joined: "You are on the team",
  declined: "Offer declined",
  "not-selected": "Your request",
  withdrawn: "Interest withdrawn",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "Thu 5 Nov" */
export const dayLabel = (at: number) => {
  const d = new Date(at);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** When the application reached `stage` (the latest time), or the latest step it has when it never did. */
export function stageAt(a: Application, stage: AppStage) {
  const hits = a.history.filter((h) => h.stage === stage);
  return (hits[hits.length - 1] ?? a.history[a.history.length - 1])?.at ?? Date.now();
}
export const sentOn = (a: Application) => dayLabel(a.history[0]?.at ?? Date.now());

/** "Product Designer, a few hours a week" */
export const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/* ---------------- talk times (Slot Picker) ---------------- */

/** One time the host offered, e.g. "Tue 12 Nov · 10:00": the day (weekday and date) and the time as the design writes it. */
export type Slot = { value: string; weekday: string; date: string; time: string };
export type Day = { key: string; weekday: string; date: string; slots: Slot[] };

/** "14:30" → "2:30 pm"; anything else stays as it is. */
function clock(t: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return t.trim();
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "am" : "pm"}`;
}

export function parseSlot(value: string): Slot {
  const [day = value, time = ""] = value.split(/\s+·\s+|,\s+/);
  const [weekday = "", ...rest] = day.trim().split(/\s+/);
  return { value, weekday, date: rest.join(" "), time: clock(time) };
}

/** The offered times grouped by day, in the order offered. */
export function slotDays(values: string[]): Day[] {
  const days: Day[] = [];
  for (const s of values.map(parseSlot)) {
    const key = `${s.weekday} ${s.date}`;
    const day = days.find((d) => d.key === key);
    if (day) day.slots.push(s);
    else days.push({ key, weekday: s.weekday, date: s.date, slots: [s] });
  }
  return days;
}

/** "Tue 12 Nov, 10:00 am WAT" (picker summary and booked line) */
export const slotFull = (s: Slot) => `${s.weekday} ${s.date}${s.time ? `, ${s.time}` : ""} WAT`;
/** "Tue 12 Nov, 10:00 am" (timeline note) */
export const slotShort = (s: Slot) => `${s.weekday} ${s.date}${s.time ? `, ${s.time}` : ""}`;

/* ---------------- timeline steps per stage (Application Timeline) ---------------- */

export const pendingSteps = (a: Application, host: string): TimelineStep[] => [
  { title: "Sent", note: sentOn(a), state: "done" },
  { title: "Shortlisted", note: `When ${host} shortlists you`, state: "upcoming" },
  { title: "Talk", note: "A 20 minute video call", state: "upcoming" },
  { title: "Offer", note: "If you both decide to go ahead", state: "upcoming" },
  { title: "Joined", note: "You join the team", state: "upcoming" },
];

export const shortlistedSteps = (a: Application): TimelineStep[] => [
  { title: "Sent", note: sentOn(a), state: "done" },
  { title: "Shortlisted", note: dayLabel(stageAt(a, "shortlisted")), state: "done" },
  { title: "Talk", note: "Pick a time", state: "current" },
  { title: "Offer", note: "After you talk", state: "upcoming" },
  { title: "Joined", note: "When you both agree", state: "upcoming" },
];

export const talkSteps = (a: Application, slot: Slot): TimelineStep[] => [
  { title: "Sent", note: sentOn(a), state: "done" },
  { title: "Shortlisted", note: dayLabel(stageAt(a, "shortlisted")), state: "done" },
  { title: "Talk", note: slotShort(slot), state: "current" },
  { title: "Offer", note: "After the talk", state: "upcoming" },
  { title: "Joined", note: "When you both agree", state: "upcoming" },
];

export const offerSteps = (a: Application, slot: Slot | null): TimelineStep[] => [
  { title: "Sent", note: sentOn(a), state: "done" },
  { title: "Shortlisted", note: dayLabel(stageAt(a, "shortlisted")), state: "done" },
  { title: "Talk", note: slot ? slotShort(slot) : dayLabel(stageAt(a, "conversation")), state: "done" },
  { title: "Offer", note: `${dayLabel(stageAt(a, "offer"))}. Waiting for your reply`, state: "current" },
  { title: "Joined", note: "When you accept", state: "upcoming" },
];
