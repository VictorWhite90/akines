import type { PhotoKey } from "./images";
import { ME, PEOPLE, allPeople, type PersonId } from "./people";
import type { Room } from "./community";

export const PROMPTS: Record<string, string[]> = {
  home: ["A work of art that feels like home to you, and why.", "A place you left, and what you carried out of it.", "Whether “home” is a place, a person or a practice."],
  "photography-memory": ["One photograph you can't throw away.", "What a picture keeps that memory loses.", "Who gets to decide what's remembered?"],
  "women-fashion": ["A garment that changed how you were seen.", "Who is missing from African fashion's story?", "Cloth you'd never cut."],
  "benin-bronze": ["What restitution should mean, in practice.", "Craft lines alive today, and how to support them.", "What students should read first."],
  masks: ["When a mask stops being an object.", "How to look, photograph and speak respectfully.", "What collectors should ask before buying."],
  "indigo-memory": ["A cloth you keep, and who gave it to you.", "What dye, fold and wear tell us about a life.", "Whether cloth can be an archive."],
  collecting: ["Your first purchase and your first regret.", "What honest pricing feels like.", "How to buy well on a small budget."],
};

/** Photos people might share in a room, offered by the attach menu. */
export const SHARE_PICKER: PhotoKey[] = ["paintingHand", "textileHang", "photoAlbum", "clayWet", "frameWall", "brushes", "studioDim", "carvedRelief"];

const SHARES: Record<string, [PhotoKey, PhotoKey]> = {
  home: ["frameWall", "gallerySeated"],
  "photography-memory": ["photoAlbum", "journalCoffee"],
  "women-fashion": ["kenteVest", "redPatterned"],
  "benin-bronze": ["bronzeHead", "carvedRelief"],
  masks: ["tribalCarving", "woodFigure"],
  "indigo-memory": ["textileHang", "textileStack"],
  collecting: ["galleryHall", "galleryTwo"],
};

export const REPLIES = [
  "That's a lovely way to put it.",
  "I hadn't thought of it like that. Thank you.",
  "Yes, this. Can we come back to it on the call?",
  "Same here, honestly. It took me years to say it out loud.",
  "Would you share a photo of it?",
  "Saving this thread for later. Really good.",
];

export type Msg = {
  id: number;
  from: PersonId;
  at: string;
  kind: "text" | "image" | "voice" | "system";
  text?: string;
  photo?: PhotoKey;
  length?: string;
  replyTo?: number;
  live?: boolean;
};

/** Everyone in the room: host and seated first, then a few more members. */
export function membersOf(room: Room): PersonId[] {
  if (room.mine) return [...new Set<PersonId>([room.host, ...room.seated, ME.id as PersonId])];
  const order: PersonId[] = [room.host, ...room.seated.filter((p) => p !== room.host)];
  const rest = allPeople.map((p) => p.id as PersonId).filter((id) => !order.includes(id) && id !== ME.id);
  return [...order, ...rest.slice(0, Math.max(0, 8 - order.length)), ME.id as PersonId];
}

export const promptsOf = (room: Room) => room.prompts ?? PROMPTS[room.id] ?? [];

export function seedMessages(room: Room): Msg[] {
  if (room.mine) {
    const msgs: Msg[] = [
      { id: 1, from: room.host, at: "Just now", kind: "system", text: `You created this ${room.visibility === "private" ? "private " : ""}room` },
      { id: 2, from: room.host, at: "Just now", kind: "text", text: `Welcome. ${room.blurb}` },
    ];
    if (room.visibility === "private") msgs.push({ id: 3, from: room.host, at: "Just now", kind: "system", text: "Only people you invite can see this room, its chat and its calls." });
    return msgs;
  }
  const members = membersOf(room).filter((m) => m !== room.host && m !== ME.id);
  const [a, b, c, d] = members;
  const prompts = promptsOf(room);
  const [s1, s2] = SHARES[room.id] ?? [room.photo, room.photo];
  const host = room.host;
  const msgs: Msg[] = [
    { id: 1, from: host, at: "18:31", kind: "text", text: `Welcome, everyone. Today's thread: “${prompts[0] ?? room.title}” No need to prepare. One image or one sentence is plenty.` },
    { id: 2, from: a, at: "18:33", kind: "text", text: "Glad to be here. I'll start with a picture, one second." },
    { id: 3, from: a, at: "18:34", kind: "image", photo: s1, text: "This is the one I couldn't stop thinking about after reading the prompt." },
    { id: 4, from: b, at: "18:36", kind: "text", replyTo: 3, text: "Oh, that stopped me. What's the story behind it?" },
    { id: 5, from: a, at: "18:38", kind: "voice", length: "0:38" },
    { id: 6, from: c, at: "18:40", kind: "text", text: "Listening to that twice. Thank you for sharing it." },
    { id: 7, from: host, at: "18:44", kind: "text", text: `Lovely. Second thread: “${prompts[1] ?? "What does this room make you want to ask?"}”` },
    { id: 8, from: d, at: "18:47", kind: "image", photo: s2, text: "Mine for that one." },
    { id: 9, from: b, at: "18:49", kind: "text", text: "Same. I'll share mine after the call?" },
  ];
  msgs.push(
    room.status === "live"
      ? { id: 10, from: host, at: "18:52", kind: "system", live: true, text: `${PEOPLE[host].name.split(" ")[0]} started a live session` }
      : { id: 10, from: host, at: "18:52", kind: "system", text: `The live session opens ${room.when.toLowerCase()}. Anyone here can start one earlier.` },
  );
  return msgs;
}
