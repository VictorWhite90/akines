import type { PhotoKey } from "./images";
import type { PersonId } from "./people";

/* =========================================================
   Community circles: a KinCircle can be small (≤8, a journey) or a
   community (an organisation with leaders, members and events).
   Shapes mirror the planned Django models so the API can swap in:
   CommunityCircle, CircleEvent, Ticket.
   ========================================================= */

export const ABUJA_AREAS = ["Wuse", "Wuse 2", "Maitama", "Asokoro", "Garki", "Jabi", "Utako", "Gwarinpa", "Kubwa", "Lugbe", "Life Camp", "Katampe", "Central Area"] as const;
export type AbujaArea = (typeof ABUJA_AREAS)[number];

export const COMMUNITY_CATEGORIES = ["Social hangouts", "Food & conversation", "Books & writing", "Faith & fellowship", "Wellness", "Creatives", "Careers & business", "Sports & fitness", "Games", "Volunteering"] as const;
export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export type CommunityCircle = {
  id: string;
  name: string;
  tagline: string;
  about: string;
  category: CommunityCategory;
  area: AbujaArea;
  photo: PhotoKey;
  verified: boolean;
  leaders: PersonId[];
  /** Members before the prototype viewer joined. */
  members: number;
  instagram?: string;
  whatsapp?: string;
  inviteCode: string;
  guidelines: string[];
  createdAt: string;
  mine?: boolean;
};

export type CircleEvent = {
  id: string;
  circleId: string;
  title: string;
  about: string;
  /** ISO date, e.g. 2026-10-31 */
  date: string;
  start: string;
  end: string;
  area: AbujaArea;
  venue: string;
  /** Show the exact address only to confirmed guests. */
  venueHidden: boolean;
  capacity: number;
  /** Naira. 0 means free. */
  price: number;
  photo: PhotoKey;
  /** Seats already taken by other members (prototype). */
  taken: number;
  goingAlone: number;
  createdAt: string;
};

export type Ticket = {
  id: string;
  eventId: string;
  code: string;
  status: "going" | "waitlist";
  comingAlone: boolean;
  paid: number;
  checkedIn: boolean;
  createdAt: string;
};

export const DEFAULT_GUIDELINES = [
  "Come as you are. Everyone here is welcome.",
  "Respect people's boundaries, online and in person.",
  "No harassment, hate or selling without permission.",
  "Look out for each other and tell a leader if something feels off.",
];

/** Fictional Abuja communities used to demo the flow. */
export const SEED_COMMUNITIES: CommunityCircle[] = [
  {
    id: "come-alone-club", name: "Come Alone Club Abuja", tagline: "Come alone, leave with friends.",
    about: "Monthly hangouts for people who are new to Abuja or just want new friends. Games, good food, music and a host who makes sure nobody stands in a corner.",
    category: "Social hangouts", area: "Wuse 2", photo: "talkLaugh", verified: true, leaders: ["zuri", "tunde"], members: 1840,
    instagram: "comealoneclub.abj", whatsapp: "+234 800 000 0001", inviteCode: "CACABJ", guidelines: DEFAULT_GUIDELINES, createdAt: "2026-03-01",
  },
  {
    id: "sunday-table", name: "Sunday Table", tagline: "Long lunches and real conversation.",
    about: "Every other Sunday, twelve strangers share a long lunch and one big question. Hosted by local chefs in homes and small restaurants around the city.",
    category: "Food & conversation", area: "Maitama", photo: "talkCafe", verified: true, leaders: ["fatou"], members: 960,
    instagram: "sundaytable.abuja", inviteCode: "SUNTAB", guidelines: DEFAULT_GUIDELINES, createdAt: "2026-05-12",
  },
  {
    id: "abuja-readers", name: "Abuja Readers' Corner", tagline: "One book a month, in good company.",
    about: "A reading community with a monthly meet-up, author nights and quiet reading mornings. Free to join; most events are free.",
    category: "Books & writing", area: "Jabi", photo: "journalCoffee", verified: false, leaders: ["efua", "amara"], members: 512,
    instagram: "abujareaders", inviteCode: "READAB", guidelines: DEFAULT_GUIDELINES, createdAt: "2026-07-20",
  },
];

export const SEED_EVENTS: CircleEvent[] = [
  { id: "cac-oct-hangout", circleId: "come-alone-club", title: "October Link-Up: games, food and new friends", about: "An outdoor afternoon with board games, a DJ, food and small icebreakers. Come alone: we'll put you in a group as soon as you arrive.", date: "2026-10-31", start: "14:00", end: "18:00", area: "Wuse 2", venue: "Garden terrace, 12 Aminu Kano Crescent", venueHidden: true, capacity: 80, price: 6000, photo: "talkGroup", taken: 64, goingAlone: 23, createdAt: "2026-10-05" },
  { id: "cac-games-night", circleId: "come-alone-club", title: "Games night: Truth, dare and charades", about: "An indoor night of party games. Snacks included. Perfect if you've never been to one of our events.", date: "2026-11-14", start: "18:30", end: "21:30", area: "Utako", venue: "Upstairs lounge, Utako market road", venueHidden: true, capacity: 40, price: 3500, photo: "talkMugs", taken: 40, goingAlone: 11, createdAt: "2026-10-12" },
  { id: "st-long-lunch", circleId: "sunday-table", title: "Long lunch: What did your parents get right?", about: "A four-course lunch for twelve, cooked by Fatou, and one question for the table.", date: "2026-11-01", start: "13:00", end: "16:00", area: "Maitama", venue: "A private home in Maitama", venueHidden: true, capacity: 12, price: 15000, photo: "talkCafe", taken: 9, goingAlone: 6, createdAt: "2026-10-10" },
  { id: "ar-book-night", circleId: "abuja-readers", title: "Book night: the novel that changed your mind", about: "Bring a book that changed how you see something. Five-minute share each, tea after.", date: "2026-10-29", start: "18:00", end: "20:00", area: "Jabi", venue: "Jabi Lake mall, community room", venueHidden: false, capacity: 30, price: 0, photo: "journalOpen", taken: 17, goingAlone: 8, createdAt: "2026-10-08" },
];

export function naira(n: number) {
  return n === 0 ? "Free" : `₦${n.toLocaleString("en-NG")}`;
}

export function eventDate(e: Pick<CircleEvent, "date" | "start" | "end">) {
  const d = new Date(`${e.date}T00:00:00`);
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return `${day} · ${e.start}–${e.end}`;
}

export function ticketCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function inviteCode(name: string) {
  const base = name.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  return base + Math.random().toString(36).slice(2, 4).toUpperCase();
}
