import type { PhotoKey } from "@/lib/data/images";
import type { PersonId } from "@/lib/data/people";

/**
 * Connect events: the talks, workshops and gatherings Discover and the Events page list (product design 11.70 and 11.71).
 * Shaped like the REST resource the backend will serve (GET /connect/events, GET /connect/events/:id); seeded with the
 * design's six events, hosted by our people. Registrations stay in the browser until the API takes them (useLocal, ak:).
 */
export type EventMode = "In person" | "Online";
export type ConnectEvent = {
  id: string;
  title: string;
  /** ISO start and end, with the event's own offset. */
  startsAt: string;
  endsAt: string;
  /** The zone the times are shown in, and its short name. */
  timeZone: string;
  zoneLabel: string;
  city: string;
  mode: EventMode;
  host: PersonId;
  /** One of our photos, or a path under /public. */
  photo: PhotoKey | string;
  /** The line on the card. */
  summary: string;
  about: string;
  bring: string[];
};

export const EVENTS: ConnectEvent[] = [
  {
    id: "memory-and-cloth", title: "Memory and Cloth: an artist talk", startsAt: "2026-11-21T16:00:00+01:00", endsAt: "2026-11-21T18:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Lagos", mode: "In person", host: "efua", photo: "/kin/discover/event-talk.jpg",
    summary: "Efua Boateng in conversation about textiles and memory.",
    about: "Efua Boateng shares the cloths in her archive and how memory finds its way into pattern. The talk is followed by a conversation and time to look closely at the cloth.",
    bring: ["A notebook and something to write with.", "A small piece of cloth that holds a memory.", "Questions for Efua, if you have them."],
  },
  {
    id: "indigo-dye-day", title: "Indigo dye day", startsAt: "2026-11-22T10:00:00+01:00", endsAt: "2026-11-22T13:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Ibadan", mode: "In person", host: "ayo", photo: "/kin/discover/event-workshop.jpg",
    summary: "A hands-on morning with natural indigo.",
    about: "Ayo Balogun opens the dye yard for a morning with natural indigo. Everyone dyes one piece to take home, and there is tea while it dries.",
    bring: ["Clothes you do not mind marking.", "A cotton piece to dye, if you have one.", "Questions for Ayo, if you have them."],
  },
  {
    id: "writing-the-everyday", title: "Writing the everyday: a reading", startsAt: "2026-11-26T18:30:00+01:00", endsAt: "2026-11-26T20:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Lagos", mode: "Online", host: "zuri", photo: "journalPen",
    summary: "Four writers read short pieces about ordinary days.",
    about: "Zuri Nwosu hosts four writers reading short pieces about ordinary days, then a conversation with everyone who joins.",
    bring: ["A quiet corner and headphones.", "A short piece of your own, if you want to read.", "Questions for the writers, if you have them."],
  },
  {
    id: "open-studio-afternoon", title: "Open studio afternoon", startsAt: "2026-11-28T14:00:00+02:00", endsAt: "2026-11-28T17:00:00+02:00",
    timeZone: "Africa/Johannesburg", zoneLabel: "SAST", city: "Johannesburg", mode: "In person", host: "thandi", photo: "/kin/discover/event-open-studio.jpg",
    summary: "Meet the makers and see work in progress.",
    about: "Thandi Dlamini opens her studio for an afternoon. See work in progress, meet the people who make it and stay for the firing talk.",
    bring: ["Shoes for a dusty floor.", "Something you made, if you want to show it.", "Questions for Thandi, if you have them."],
  },
  {
    id: "zine-making-for-beginners", title: "Zine making for beginners", startsAt: "2026-12-05T11:00:00+03:00", endsAt: "2026-12-05T13:00:00+03:00",
    timeZone: "Africa/Nairobi", zoneLabel: "EAT", city: "Nairobi", mode: "In person", host: "wanjiru", photo: "/kin/discover/zine.jpg",
    summary: "Fold, cut and print a first zine in one morning.",
    about: "Wanjiru Kamau shows how to fold, cut and print a first zine in one morning. Paper, glue and a copier are there for everyone.",
    bring: ["A few photos or drawings to use.", "Scissors, if you have a pair you like.", "An idea for a page, or none at all."],
  },
  {
    id: "poetry-and-wine-evening", title: "Poetry and wine evening", startsAt: "2026-12-11T19:00:00+02:00", endsAt: "2026-12-11T21:00:00+02:00",
    timeZone: "Africa/Harare", zoneLabel: "CAT", city: "Harare", mode: "Online", host: "nandi", photo: "talkMugs",
    summary: "Slow readings, an open mic and good company.",
    about: "Nandi Moyo hosts slow readings and an open mic. Read something, or just listen with a glass of whatever you like.",
    bring: ["A drink you enjoy.", "A poem you love, yours or someone else's.", "Your camera on or off, as you like."],
  },
].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)) as ConnectEvent[];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

const part = (e: ConnectEvent, at: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: e.timeZone, ...o }).format(new Date(at));
const time = (e: ConnectEvent, at: string) => part(e, at, { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s/g, " ").toLowerCase();

/** "SAT 21 NOV · 4:00 PM", the tag on the card and the page. */
export const eventTag = (e: ConnectEvent) => `${part(e, e.startsAt, { weekday: "short", day: "numeric", month: "short" }).replace(",", "")} · ${time(e, e.startsAt)}`.toUpperCase();
/** "Lagos · In person", or "Online". */
export const eventMeta = (e: ConnectEvent) => (e.mode === "Online" ? "Online" : `${e.city} · ${e.mode}`);
/** "Saturday 21 November, 4:00 pm to 6:00 pm WAT". */
export const eventWhen = (e: ConnectEvent) => `${part(e, e.startsAt, { weekday: "long", day: "numeric", month: "long" }).replace(",", "")}, ${time(e, e.startsAt)} to ${time(e, e.endsAt)} ${e.zoneLabel}`;
export const eventPlace = (e: ConnectEvent) => (e.mode === "Online" ? "Online. The link is sent when you register." : `${e.city}. The address is sent when you register.`);

/** The chips of the Events page. None on at first shows every event. */
export type EventFilter = "week" | "month" | "online" | "in-person";
export const EVENT_FILTERS: { key: EventFilter; label: string }[] = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "online", label: "Online" },
  { key: "in-person", label: "In person" },
];
const DAY = 86_400_000;
/** Upcoming events for a chip, worked out from their dates against `now`. */
export function eventsFor(filter: EventFilter | null, now = Date.now()): ConnectEvent[] {
  const today = new Date(now);
  switch (filter) {
    case null: return EVENTS;
    case "week": return EVENTS.filter((e) => { const t = Date.parse(e.startsAt); return t >= now && t < now + 7 * DAY; });
    case "month": return EVENTS.filter((e) => { const d = new Date(e.startsAt); return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth(); });
    case "online": return EVENTS.filter((e) => e.mode === "Online");
    case "in-person": return EVENTS.filter((e) => e.mode !== "Online");
  }
}
/** The No results line of a chip (the design's copy for This week; the others follow it). */
export const eventsEmptyText = (filter: EventFilter) => (filter === "week" ? "No events this week. Try This month, or look at all events." : `No events ${EVENT_FILTERS.find((f) => f.key === filter)?.label.toLowerCase()}. Try another filter, or look at all events.`);
