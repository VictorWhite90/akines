import type { PhotoKey } from "@/lib/data/images";
import type { PersonId } from "@/lib/data/people";

/**
 * Connect events: the talks, workshops and gatherings Discover and the Events page list (product design 11.70 and 11.71).
 * Shaped like the REST resource the backend will serve (GET /connect/events, GET /connect/events/:id); seeded with the
 * design's six events. Registrations stay in the browser until the API takes them (useLocal, ak:).
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
  /** The date line as the design's sample shows it ("SAT 22 NOV · 4:00 PM"; "Saturday 22 November, 4:00 pm to 6:00 pm WAT"), where it is fixed. */
  shown?: { tag: string; when: string };
};

const img = (ref: string) => `/kin/design/connect/${ref}.jpg`;

/** The design's six events, in its order, with its words and photos. Dates are this year's, so the This week and This month chips give what the design draws. */
export const EVENTS: ConnectEvent[] = [
  {
    id: "memory-and-cloth", title: "Memory and Cloth: an artist talk", startsAt: "2026-11-22T16:00:00+01:00", endsAt: "2026-11-22T18:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Lagos", mode: "In person", host: "anaya", photo: img("discover/event-talk"),
    summary: "Anaya Smith in conversation about textiles and memory.",
    about: "Anaya Smith shares the work behind her indigo cloths and how memory finds its way into pattern. The talk is followed by a conversation and time to look closely at the cloth.",
    bring: ["A notebook and something to write with.", "A small piece of cloth that holds a memory.", "Questions for Anaya, if you have them."],
    shown: { tag: "SAT 22 NOV · 4:00 PM", when: "Saturday 22 November, 4:00 pm to 6:00 pm WAT" },
  },
  {
    id: "indigo-dye-day", title: "Indigo dye day", startsAt: "2026-11-23T10:00:00+01:00", endsAt: "2026-11-23T13:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Ibadan", mode: "In person", host: "ayo-balogun", photo: img("discover/event-workshop"),
    summary: "A hands-on morning with natural indigo.",
    about: "Ayo Balogun opens the dye yard in Ibadan for a morning with natural indigo. Everyone dyes one piece to take home.",
    bring: ["Clothes you do not mind marking.", "A cotton piece to dye, if you have one.", "Questions for Ayo, if you have them."],
    shown: { tag: "SUN 23 NOV · 10:00 AM", when: "Sunday 23 November, 10:00 am to 1:00 pm WAT" },
  },
  {
    id: "writing-the-everyday", title: "Writing the everyday: a reading", startsAt: "2026-11-27T18:30:00+01:00", endsAt: "2026-11-27T20:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Lagos", mode: "Online", host: "ngozi", photo: img("feed/hero-card-6"),
    summary: "Four writers read short pieces about ordinary days.",
    about: "Ngozi Eze hosts four writers reading short pieces about ordinary days, then a conversation with everyone who joins.",
    bring: ["A quiet corner and headphones.", "A short piece of your own, if you want to read.", "Questions for the writers, if you have them."],
    shown: { tag: "THU 27 NOV · 6:30 PM", when: "Thursday 27 November, 6:30 pm to 8:00 pm WAT" },
  },
  {
    id: "open-studio-afternoon", title: "Open studio afternoon", startsAt: "2026-11-29T14:00:00+01:00", endsAt: "2026-11-29T17:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Abuja", mode: "In person", host: "amara-okafor", photo: img("discover/event-open-studio"),
    summary: "Meet the makers and see work in progress.",
    about: "Amara Okafor opens her studio in Abuja for an afternoon. See work in progress and meet the people who make it.",
    bring: ["Shoes for a dusty floor.", "Something you made, if you want to show it.", "Questions for Amara, if you have them."],
    shown: { tag: "SAT 29 NOV · 2:00 PM", when: "Saturday 29 November, 2:00 pm to 5:00 pm WAT" },
  },
  {
    id: "zine-making-for-beginners", title: "Zine making for beginners", startsAt: "2026-12-06T11:00:00+01:00", endsAt: "2026-12-06T13:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Lagos", mode: "In person", host: "ngozi", photo: img("community/zine-tall"),
    summary: "Fold, cut and print a first zine in one morning.",
    about: "Ngozi Eze shows how to fold, cut and print a first zine in one morning. Paper, glue and a copier are there for everyone.",
    bring: ["A few photos or drawings to use.", "Scissors, if you have a pair you like.", "An idea for a page, or none at all."],
    shown: { tag: "SAT 6 DEC · 11:00 AM", when: "Saturday 6 December, 11:00 am to 1:00 pm WAT" },
  },
  {
    id: "poetry-and-wine-evening", title: "Poetry and wine evening", startsAt: "2026-12-12T19:00:00+01:00", endsAt: "2026-12-12T21:00:00+01:00",
    timeZone: "Africa/Lagos", zoneLabel: "WAT", city: "Lagos", mode: "Online", host: "amara-okafor", photo: img("feed/circle-poetry"),
    summary: "Slow readings, an open mic and good company.",
    about: "Amara Okafor hosts slow readings and an open mic. Read something, or just listen.",
    bring: ["A drink you enjoy.", "A poem you love, yours or someone else's.", "Your camera on or off, as you like."],
    shown: { tag: "FRI 12 DEC · 7:00 PM", when: "Friday 12 December, 7:00 pm to 9:00 pm WAT" },
  },
];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

const part = (e: ConnectEvent, at: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: e.timeZone, ...o }).format(new Date(at));
const time = (e: ConnectEvent, at: string) => part(e, at, { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s/g, " ").toLowerCase();

/** "SAT 21 NOV · 4:00 PM", the tag on the card and the page. */
export const eventTag = (e: ConnectEvent) => e.shown?.tag ?? `${part(e, e.startsAt, { weekday: "short", day: "numeric", month: "short" }).replace(",", "")} · ${time(e, e.startsAt)}`.toUpperCase();
/** "Lagos · In person", or "Online". */
export const eventMeta = (e: ConnectEvent) => (e.mode === "Online" ? "Online" : `${e.city} · ${e.mode}`);
/** "Saturday 21 November, 4:00 pm to 6:00 pm WAT". */
export const eventWhen = (e: ConnectEvent) => e.shown?.when ?? `${part(e, e.startsAt, { weekday: "long", day: "numeric", month: "long" }).replace(",", "")}, ${time(e, e.startsAt)} to ${time(e, e.endsAt)} ${e.zoneLabel}`;
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
