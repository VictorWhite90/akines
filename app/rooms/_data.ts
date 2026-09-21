import { CIRCLES, ROOMS, getPerson } from "@/lib/data";
import type { Person, PresenceRoom, Role } from "@/lib/types";

/**
 * Route-local rooms that complement the shared ROOMS list — one of them is
 * full, so the "tell me if a seat opens" state is visible in the prototype.
 */
export const EXTRA_ROOMS: PresenceRoom[] = [
  {
    id: "living-with-work",
    title: "Studio to wall: living with the work you buy",
    theme: "Collecting",
    facilitatorId: "nomvula",
    participantIds: ["nomvula", "fatima", "chidi", "tunde", "zuri", "sipho"],
    capacity: 6,
    when: "Fri · 19:00 SAST",
    durationMin: 45,
    format: "video",
    circleId: "collectors",
    language: "English",
    prompts: [
      "Describe the wall where your favourite work lives.",
      "Artists: what do you wish collectors asked you?",
      "What does a work owe the person who lives with it?",
    ],
  },
];

export const ALL_ROOMS: PresenceRoom[] = [...ROOMS, ...EXTRA_ROOMS];

export function findRoom(id: string) {
  return ALL_ROOMS.find((room) => room.id === id);
}

export function roomsForCircle(circleId: string) {
  return ALL_ROOMS.filter((room) => room.circleId === circleId);
}

export function circleName(circleId?: string) {
  if (!circleId) return undefined;
  return CIRCLES.find((c) => c.id === circleId)?.name;
}

export const ROLE_LABEL: Record<Role, string> = {
  artist: "Artist",
  curator: "Curator",
  collector: "Collector",
  gallery: "Gallery",
  institution: "Institution",
  creative: "Creative",
  researcher: "Researcher",
};

/** A short line such as "2 artists · 1 curator · 1 collector" — the mix is the point. */
export function roleMix(people: Person[]) {
  const counts = new Map<Role, number>();
  for (const person of people) counts.set(person.role, (counts.get(person.role) ?? 0) + 1);
  return [...counts.entries()]
    .map(([role, n]) => `${n} ${ROLE_LABEL[role].toLowerCase()}${n > 1 ? "s" : ""}`)
    .join(" · ");
}

export function roomPeople(room: PresenceRoom) {
  return room.participantIds.map((id) => getPerson(id));
}

export const FORMAT_LABEL: Record<PresenceRoom["format"], string> = {
  voice: "Voice only",
  video: "Camera optional",
  text: "Text only",
};

/** What to bring, per room. Falls back to a gentle default. */
export const WHAT_TO_BRING: Record<string, string[]> = {
  home: ["One object, photo or sound that means home to you.", "A work (yours or someone else's) where you feel home is present.", "Curiosity about places you've never lived."],
  fashion: ["A garment that taught you something.", "A name — the person who first showed you cloth as art."],
  memory: ["A photograph you can describe but can't show.", "A question about who owns a family archive."],
  masks: ["An image of a mask or ritual object you've seen behind glass.", "A view — or an honest doubt — about display and sale."],
  collecting: ["The story of your first purchase, however small.", "A price you paid (or didn't) and how it felt."],
  bronze: ["One thing you'd like returned objects to make possible.", "A source you trust on restitution."],
  "living-with-work": ["A photo of the wall, shelf or corner where a work lives.", "Artists: one question you've always wanted to ask a collector."],
};

export const DEFAULT_BRING = ["A work that has stayed with you.", "One question you'd like the room to sit with."];

export const HOUSE_RULES = [
  { title: "Critique the work, not the person.", text: "Be specific and generous. Say what you see before you say what you'd change." },
  { title: "Ask before sharing.", text: "No screenshots, quotes or images leave the room without the person's yes." },
  { title: "Not recorded.", text: "No recording, no transcript, no livestream. What's said here stays here." },
  { title: "Moderators step in.", text: "Harassment, cultural appropriation, plagiarism or misrepresentation end the conversation for the person responsible. Every decision can be appealed to a human reviewer." },
];

export const THEMES = [...new Set(ALL_ROOMS.map((room) => room.theme))];
