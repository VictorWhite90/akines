"use client";

import { SEED_COMMUNITIES, SEED_EVENTS, ticketCode, type CircleEvent, type CommunityCircle, type Ticket } from "@/lib/data/communityCircles";
import { ME, type PersonId } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";
import type { SavedKinCircle } from "./CreateKinCircle";

/**
 * Community circles, their events and the viewer's tickets.
 * Prototype store (localStorage); each call maps to one API endpoint later:
 * create → POST /circles, join → POST /circles/:id/members, rsvp → POST /events/:id/tickets.
 */
export function useCommunities() {
  const [created, setCreated] = useLocal<CommunityCircle[]>("ak:community-circles", []);
  const [joined, setJoined] = useLocal<string[]>("ak:community-joined", ["abuja-readers"]);
  const [events, setEvents] = useLocal<CircleEvent[]>("ak:community-events", []);
  const [tickets, setTickets] = useLocal<Ticket[]>("ak:community-tickets", []);
  const [smalls] = useLocal<SavedKinCircle[]>("ak:kincircles", []);
  const [checkins, setCheckins] = useLocal<Record<string, string[]>>("ak:community-checkins", {});

  const all = [...created, ...SEED_COMMUNITIES];
  const allEvents = [...events, ...SEED_EVENTS].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const me = ME.id as PersonId;

  const find = (id: string) => all.find((c) => c.id === id);
  const byCode = (code: string) => all.find((c) => c.inviteCode.toUpperCase() === code.toUpperCase());
  const isLeader = (c: CommunityCircle) => c.mine || c.leaders.includes(me);
  const isMember = (id: string) => joined.includes(id) || !!find(id)?.mine;
  const memberCount = (c: CommunityCircle) => c.members + (joined.includes(c.id) || c.mine ? 1 : 0);

  const create = (c: Omit<CommunityCircle, "id" | "createdAt" | "mine" | "leaders" | "verified">) => {
    const circle: CommunityCircle = { ...c, id: newId("cc"), createdAt: new Date().toISOString(), mine: true, leaders: [me], verified: false };
    setCreated((cur) => [circle, ...cur]);
    return circle;
  };
  const join = (id: string) => setJoined((cur) => (cur.includes(id) ? cur : [...cur, id]));
  const leave = (id: string) => setJoined((cur) => cur.filter((x) => x !== id));

  const eventsOf = (circleId: string) => allEvents.filter((e) => e.circleId === circleId);
  const findEvent = (id: string) => allEvents.find((e) => e.id === id);
  const addEvent = (e: Omit<CircleEvent, "id" | "createdAt" | "taken" | "goingAlone">) => {
    const ev: CircleEvent = { ...e, id: newId("ev"), createdAt: new Date().toISOString(), taken: 0, goingAlone: 0 };
    setEvents((cur) => [ev, ...cur]);
    return ev;
  };

  const ticketFor = (eventId: string) => tickets.find((t) => t.eventId === eventId);
  const seatsTaken = (e: CircleEvent) => e.taken + tickets.filter((t) => t.eventId === e.id && t.status === "going").length;
  const rsvp = (e: CircleEvent, comingAlone: boolean) => {
    const full = seatsTaken(e) >= e.capacity;
    const t: Ticket = { id: newId("tk"), eventId: e.id, code: ticketCode(), status: full ? "waitlist" : "going", comingAlone, paid: full ? 0 : e.price, checkedIn: false, createdAt: new Date().toISOString() };
    setTickets((cur) => [t, ...cur.filter((x) => x.eventId !== e.id)]);
    join(e.circleId);
    return t;
  };
  const cancel = (eventId: string) => setTickets((cur) => cur.filter((t) => t.eventId !== eventId));

  const checkedIn = (eventId: string) => checkins[eventId] ?? [];
  const toggleCheckIn = (eventId: string, who: string) =>
    setCheckins((cur) => {
      const list = cur[eventId] ?? [];
      return { ...cur, [eventId]: list.includes(who) ? list.filter((x) => x !== who) : [...list, who] };
    });

  const smallCirclesOf = (circleId: string) => smalls.filter((s) => (s as SavedKinCircle & { parentId?: string }).parentId === circleId);

  return { all, find, byCode, isLeader, isMember, memberCount, create, join, leave, eventsOf, findEvent, addEvent, allEvents, ticketFor, seatsTaken, rsvp, cancel, tickets, checkedIn, toggleCheckIn, smallCirclesOf };
}
