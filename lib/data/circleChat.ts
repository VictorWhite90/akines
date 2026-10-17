import type { Circle } from "./community";
import { ME, allPeople, type PersonId } from "./people";
import type { Msg } from "./roomChat";
import type { PhotoKey } from "./images";

export const CHANNELS = [
  { id: "general", label: "general", blurb: "Everyday conversation" },
  { id: "work", label: "share-your-work", blurb: "Photos and what you're working on" },
  { id: "feedback", label: "feedback", blurb: "Honest, kind feedback" },
  { id: "intros", label: "introductions", blurb: "Say hello" },
] as const;
export type ChannelId = (typeof CHANNELS)[number]["id"];

/** A repeatable subset of members for each circle (rotated so circles feel different). */
export function circleMembers(circle: Circle): PersonId[] {
  const all = allPeople.map((p) => p.id as PersonId).filter((id) => id !== ME.id);
  const shift = circle.id.length % all.length;
  const rot = [...all.slice(shift), ...all.slice(0, shift)];
  return [...rot.slice(0, 9), ME.id as PersonId];
}

const EXTRA_PHOTOS: PhotoKey[] = ["talkCafe", "journalCoffee", "studioBusy", "talkLaugh", "calmWater"];

export function seedChannels(circle: Circle): Record<ChannelId, Msg[]> {
  const m = circleMembers(circle).filter((x) => x !== ME.id);
  const [a, b, c, d, e] = m;
  const host = a;
  const p1 = EXTRA_PHOTOS[circle.id.length % EXTRA_PHOTOS.length];
  return {
    general: [
      { id: 1, from: host, at: "09:12", kind: "text", text: `Morning, ${circle.name}. Starter for today: ${circle.starter}` },
      { id: 2, from: b, at: "09:20", kind: "text", text: "Coming back to this all week. I'll write something properly tonight." },
      { id: 3, from: c, at: "09:41", kind: "voice", length: "0:52" },
      { id: 4, from: d, at: "10:05", kind: "text", replyTo: 2, text: "Same. Would love to hear where it lands." },
      { id: 5, from: e, at: "10:32", kind: "text", text: `Reminder: our next small room for ${circle.name} is this week. Bring one thing that happened to you this week.` },
    ],
    work: [
      { id: 1, from: b, at: "Yesterday", kind: "image", photo: circle.photo, text: "Nearly there with this. Honest thoughts?" },
      { id: 2, from: c, at: "Yesterday", kind: "text", replyTo: 1, text: "What's working: the idea. Try this: cut it in half and lead with the best part." },
      { id: 3, from: d, at: "08:15", kind: "image", photo: p1, text: "Progress this morning." },
    ],
    feedback: [
      { id: 1, from: host, at: "Mon", kind: "system", text: "Feedback here uses three lines: What's working, what's unclear, try this." },
      { id: 2, from: e, at: "Mon", kind: "text", text: "Asking for eyes on my second attempt at this. Be honest, I won't take it personally." },
      { id: 3, from: a, at: "Mon", kind: "text", replyTo: 2, text: "What's working: the clarity. What's unclear: who it's for. Try this: say it out loud to a friend first." },
    ],
    intros: [
      { id: 1, from: host, at: "Mon", kind: "system", text: `Welcome to ${circle.name}. Tell us what you do, what you love, and what you're hoping to find here.` },
      { id: 2, from: d, at: "Mon", kind: "text", text: "Hi all. New here, still finding my feet. Glad there's a room for that." },
      { id: 3, from: c, at: "Tue", kind: "text", replyTo: 2, text: "Welcome. You're in the right place." },
    ],
  };
}
