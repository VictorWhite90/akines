import { CIRCLES, ROOMS } from "./connect";
import { IMG } from "./images";

/* ---------- Creative presence (replaces online/offline) ---------- */

export type PresenceState = "room" | "studio" | "around" | "quiet" | "away";

export const PRESENCE_LABEL: Record<PresenceState, string> = {
  room: "In a room",
  studio: "In the studio",
  around: "Around",
  quiet: "Quiet mode",
  away: "Away",
};

export const PRESENCE: Record<string, { state: PresenceState; activity?: string; roomId?: string }> = {
  adaeze: { state: "studio", activity: "Dyeing panel 7" },
  moussa: { state: "around", activity: "Editing harbour recordings" },
  halima: { state: "room", activity: "Hosting a palaver", roomId: "home" },
  kwame: { state: "room", roomId: "home" },
  zuri: { state: "room", roomId: "home" },
  tunde: { state: "room", roomId: "home" },
  wanjiru: { state: "studio", activity: "Printing on market cloth" },
  chidi: { state: "around", activity: "Planning a studio visit" },
  fatima: { state: "studio", activity: "Wood-firing" },
  nomvula: { state: "away" },
  ines: { state: "quiet" },
  ayo: { state: "studio", activity: "Fitting adire jackets" },
  kofi: { state: "away" },
  sipho: { state: "around" },
  leila: { state: "around", activity: "Writing on masks" },
};

/** Rooms happening right now (the rest are scheduled). */
export const LIVE_ROOM_IDS = ["home"];

/* ---------- Channels & messages ---------- */

export type ResponseKind = "moved" | "useful" | "talk" | "same";

/** Responses show who, never how many. */
export const RESPONSES: Record<ResponseKind, { label: string; mark: string }> = {
  moved: { label: "Moved me", mark: "✦" },
  useful: { label: "Useful", mark: "◆" },
  talk: { label: "Let's talk", mark: "↗" },
  same: { label: "Same here", mark: "◎" },
};

export type Attachment =
  | { type: "story"; storyId: string }
  | { type: "call"; callId: string }
  | { type: "room"; roomId: string }
  | { type: "project"; projectId: string }
  | { type: "image"; src: string; alt: string }
  | { type: "feedback"; image: string; questions: string[] }
  | { type: "critique"; working: string; unclear: string; tryThis: string }
  | { type: "intro"; introId: string };

export interface Message {
  id: string;
  authorId: string;
  time: string;
  body?: string;
  attachment?: Attachment;
  responses?: { kind: ResponseKind; personIds: string[] }[];
}

export type ChannelKind = "announce" | "text" | "feedback" | "calls";

export interface Channel {
  id: string;
  name: string;
  kind: ChannelKind;
  topic: string;
}

/** The Companion speaks in every space. Always labelled as AI. */
export const COMPANION_ID = "companion";

const baseChannels = (practice: string): Channel[] => [
  { id: "welcome", name: "welcome", kind: "announce", topic: "Start here — who we are and how we treat each other." },
  { id: "general", name: "general", kind: "text", topic: `Anything ${practice.toLowerCase()} — process, sources, questions.` },
  { id: "works-in-progress", name: "works-in-progress", kind: "feedback", topic: "Share unfinished work. Replies are structured: what's working, what's unclear, try this." },
  { id: "opportunities", name: "opportunities", kind: "calls", topic: "Verified calls only. Ask here if anything looks off." },
];

export function channelsFor(circleId: string): Channel[] {
  const circle = CIRCLES.find((c) => c.id === circleId);
  return circle ? baseChannels(circle.practice) : [];
}

export function roomsFor(circleId: string) {
  return ROOMS.filter((room) => room.circleId === circleId);
}

const TEXTILES: Record<string, Message[]> = {
  welcome: [
    { id: "tw1", authorId: "adaeze", time: "Pinned", body: "Welcome to Textiles 🧵 Dyers, weavers and fibre artists — all levels. Three rules: critique the work, never the person. Ask before sharing someone's images outside the circle. Credit the ideas you build on." },
    { id: "tw2", authorId: "ayo", time: "Pinned", body: "Portfolio review every Wednesday at 18:00 WAT. Post in #works-in-progress by Tuesday night to get a slot." },
  ],
  general: [
    { id: "tg1", authorId: "wanjiru", time: "Today 09:12", body: "Cloth as archive: what does fabric remember? Mine remembers the market it was bought in — the smell never leaves.", responses: [{ kind: "moved", personIds: ["adaeze", "ayo"] }] },
    { id: "tg2", authorId: "ayo", time: "Today 09:40", body: "Ours remembers hands. Eleven women cut every jacket in my studio — you can tell who cut which by the notches.", responses: [{ kind: "same", personIds: ["wanjiru"] }] },
    { id: "tg3", authorId: "adaeze", time: "Today 10:05", body: "Mine remembers a journey nobody in my family talked about.", attachment: { type: "story", storyId: "indigo-crossing" }, responses: [{ kind: "moved", personIds: ["chidi", "wanjiru", "halima"] }, { kind: "talk", personIds: ["chidi"] }] },
    { id: "tg4", authorId: COMPANION_ID, time: "Today 10:06", body: "Wanjiru prints images onto cloth; Adaeze makes cloth that holds an image. You're approaching “cloth as archive” from opposite ends — that difference could make a good palaver." },
    { id: "tg5", authorId: "halima", time: "Today 11:30", body: "Reminder for anyone working at installation scale — this closes Oct 3. Verified organiser, budget disclosed.", attachment: { type: "call", callId: "threads-of-return" }, responses: [{ kind: "useful", personIds: ["adaeze", "ayo", "tunde"] }] },
  ],
  "works-in-progress": [
    { id: "tp1", authorId: "adaeze", time: "Yesterday 16:20", body: "Indigo resist test, round 3. The green panel happened by accident — keep it or dye over it?", attachment: { type: "feedback", image: IMG.textile, questions: ["Does the green read as a mistake or a choice?", "Does the route line still read from two metres away?"] } },
    { id: "tp2", authorId: "ayo", time: "Yesterday 17:02", attachment: { type: "critique", working: "The green is the most alive part of the piece.", unclear: "The route line disappears in the darkest band.", tryThis: "Stitch the route in undyed thread so it survives the dark." }, responses: [{ kind: "useful", personIds: ["adaeze"] }] },
    { id: "tp3", authorId: "wanjiru", time: "Yesterday 18:40", attachment: { type: "critique", working: "The accident makes it feel lived-in, not planned.", unclear: "I can't tell where the journey starts.", tryThis: "Leave one selvedge raw as the starting edge." } },
    { id: "tp4", authorId: "tunde", time: "Yesterday 20:15", body: "I've never used natural dye. Could I ask you about the lime ratio sometime?", responses: [{ kind: "talk", personIds: ["adaeze"] }] },
  ],
  opportunities: [
    { id: "to1", authorId: "halima", time: "Mon 10:00", attachment: { type: "call", callId: "threads-of-return" } },
    { id: "to2", authorId: "moussa", time: "Mon 14:30", body: "Pairs across disciplines — textile artists welcome.", attachment: { type: "call", callId: "sound-space" } },
    { id: "to3", authorId: "tunde", time: "Tue 08:12", body: "Is this one legit? They want $50 before anything else.", attachment: { type: "call", callId: "unverified-prize" } },
    { id: "to4", authorId: COMPANION_ID, time: "Tue 08:12", body: "Be careful with this one. It has four warning signs: the organiser isn't verified, no budget is disclosed, payment is asked for before selection, and the rights requested aren't stated. Verified calls on Artelia never charge to apply." },
  ],
};

const FASHION: Record<string, Message[]> = {
  general: [
    { id: "fg1", authorId: "ayo", time: "Today 08:30", body: "Adire sourcing that pays dyers fairly — I'm publishing what we pay per yard. Who else will?", responses: [{ kind: "moved", personIds: ["adaeze", "wanjiru"] }, { kind: "same", personIds: ["ines"] }] },
    { id: "fg2", authorId: "adaeze", time: "Today 09:15", body: "I will. Indigo from the Kofar Mata pits, ₦4,500 per metre, dyers paid on collection." },
    { id: "fg3", authorId: "ayo", time: "Today 12:00", body: "Tonight — six seats, and they're all taken. Ask to be told if one opens.", attachment: { type: "room", roomId: "fashion" } },
  ],
};

const DIASPORA: Record<string, Message[]> = {
  general: [
    { id: "dg1", authorId: "halima", time: "Live now", body: "We've started — two seats still open. Bring one object that means home.", attachment: { type: "room", roomId: "home" }, responses: [{ kind: "talk", personIds: ["zuri", "kwame"] }] },
    { id: "dg2", authorId: "chidi", time: "Today 07:50", body: "Moved Indigo Crossing to the hallway. It changes colour with the morning light — nobody told me cloth does that.", attachment: { type: "story", storyId: "indigo-crossing" }, responses: [{ kind: "moved", personIds: ["adaeze", "halima"] }] },
    { id: "dg3", authorId: "zuri", time: "Yesterday", body: "First time here. I started collecting after a hard year — art made my flat feel like somewhere I'm allowed to rest.", responses: [{ kind: "same", personIds: ["chidi"] }, { kind: "moved", personIds: ["halima", "adaeze"] }] },
  ],
};

const SEEDED: Record<string, Record<string, Message[]>> = { textiles: TEXTILES, fashion: FASHION, diaspora: DIASPORA };

/** Messages for a circle channel; unseeded channels fall back to the circle's threads. */
export function messagesFor(circleId: string, channelId: string): Message[] {
  const seeded = SEEDED[circleId]?.[channelId];
  if (seeded) return seeded;
  const circle = CIRCLES.find((c) => c.id === circleId);
  if (!circle) return [];
  if (channelId === "welcome") {
    return [{ id: `${circleId}-w`, authorId: circle.moderatorIds[0], time: "Pinned", body: `Welcome to ${circle.name}. ${circle.description} ${circle.guidelines.join(" ")}` }];
  }
  if (channelId === "general") {
    return circle.threads.map((t) => ({ id: `${circleId}-${t.id}`, authorId: t.authorId, time: t.lastActive, body: t.title }));
  }
  return [];
}

/* ---------- Direct messages ---------- */

export interface DirectThread {
  personId: string;
  introId?: string;
  messages: Message[];
}

export const DIRECT_THREADS: DirectThread[] = [
  {
    personId: "moussa",
    introId: "intro-moussa",
    messages: [
      { id: "dm1", authorId: "adaeze", time: "Aug 27", body: "Your harbour recordings made me think of the indigo cloth my grandmother carried from Kano. Could fabric and sound hold the same journey?" },
      { id: "dm2", authorId: "moussa", time: "Aug 27", body: "I recorded Dakar harbour at 5am last week. The gulls start before the engines — that order matters. Yes. Let's try." },
      { id: "dm3", authorId: "moussa", time: "Aug 29", body: "Opened a private canvas for us.", attachment: { type: "project", projectId: "salt-water-memory" } },
      { id: "dm4", authorId: "moussa", time: "Today 09:02", body: "Approved the first-panel milestone. Your turn when you're happy with it 🙏" },
    ],
  },
  {
    personId: "chidi",
    introId: "intro-chidi",
    messages: [
      { id: "dc1", authorId: "chidi", time: "Aug 10", body: "My mother stood in front of Indigo Crossing for twenty minutes. I'd like to understand how it was made before I say anything else." },
      { id: "dc2", authorId: "adaeze", time: "Aug 10", body: "Come to Saturday's studio visit — I'll show you the dye pits on camera." },
      { id: "dc3", authorId: "chidi", time: "Today 07:55", body: "It lives in the hallway now. My daughter calls it ‘Grandma's river’." },
    ],
  },
  {
    personId: "halima",
    messages: [
      { id: "dh1", authorId: "halima", time: "Oct 24", body: "Congratulations — you're on the Threads of Return shortlist. Could you pick a 30-minute slot for a video conversation by Oct 30?" },
    ],
  },
  {
    personId: "tunde",
    introId: "intro-tunde",
    messages: [
      { id: "dt1", authorId: "tunde", time: "Yesterday", body: "Thank you for answering in #works-in-progress. The hardest part of working big alone is not knowing if it's finished or abandoned." },
    ],
  },
];

export function getDirectThread(personId: string) {
  return DIRECT_THREADS.find((t) => t.personId === personId);
}
