"use client";

import { useLocal } from "@/lib/useLocal";

/**
 * What the member did on Discover and the pages it leads to, kept in the browser until the API takes it (keys ak:):
 * Connect requests (the person card and the profile share one) and circle join requests, each suggestion's status, Say hello on a profile and
 * event registrations. Mirrors the design's store (connect/discover/state.ts).
 */
export type RecStatus = "idle" | "sent" | "dismissed";

const cardId = (person: string) => `person-${person}`;

export function useDiscoverState() {
  const [requested, setRequested] = useLocal<string[]>("ak:discover-requested", []);
  const [recs, setRecs] = useLocal<Record<string, RecStatus>>("ak:discover-recs", {});
  const [hellos, setHellos] = useLocal<string[]>("ak:discover-hellos", []);
  return {
    isRequested: (person: string) => requested.includes(cardId(person)),
    /** Connect, on a person card or a profile. Pressing it again does nothing. */
    connect: (person: string) => setRequested((r) => (r.includes(cardId(person)) ? r : [...r, cardId(person)])),
    /** Request to join, on the card of a circle that needs approval. Pressing it again does nothing. */
    isCircleRequested: (circle: string) => requested.includes(`circle-${circle}`),
    requestCircle: (circle: string) => setRequested((r) => (r.includes(`circle-${circle}`) ? r : [...r, `circle-${circle}`])),
    recStatus: (person: string): RecStatus => recs[person] ?? "idle",
    setRec: (person: string, s: RecStatus) => setRecs((r) => ({ ...r, [person]: s })),
    /** Did the member say hello to this person (on the profile, or on their suggestion)? */
    helloSent: (person: string) => hellos.includes(person) || recs[person] === "sent",
    /** Say hello on a profile. A suggestion of the same person reads "sent" too. */
    sayHello: (person: string) => {
      setHellos((h) => (h.includes(person) ? h : [...h, person]));
      setRecs((r) => (r[person] && r[person] !== "idle" ? r : { ...r, [person]: "sent" }));
    },
  };
}

/** Event registrations: the event id and the address the confirmation went to. */
export function useRegistration(eventId: string) {
  const [all, setAll] = useLocal<Record<string, string>>("ak:event-registrations", {});
  return {
    email: all[eventId] as string | undefined,
    register: (email: string) => setAll((a) => (a[eventId] ? a : { ...a, [eventId]: email })),
    cancel: () => setAll((a) => { if (!a[eventId]) return a; const next = { ...a }; delete next[eventId]; return next; }),
  };
}
