import { ME, type PersonId } from "./people";
import type { Msg } from "./roomChat";

/** Direct messages: private, 1:1 or small-group. Reuses the same bubble/voice-note/photo Msg shape as Circles and Rooms. */
export type Thread = { id: string; with: PersonId[]; msgs: Msg[]; pinned?: boolean };

const me = ME.id as PersonId;

export const DM_THREADS: Thread[] = [
  {
    id: "t-ayo",
    with: ["ayo"],
    pinned: true,
    msgs: [
      { id: 1, from: "ayo", at: "Mon", kind: "text", text: "Sending you a photo of the panel before I cut it. Tell me honestly if the green is too much." },
      { id: 2, from: "ayo", at: "Mon", kind: "image", photo: "textileHang" },
      { id: 3, from: me, at: "Mon", kind: "text", text: "It's not too much. It's the first thing that's made me want to buy something in months." },
      { id: 4, from: "ayo", at: "Mon", kind: "text", text: "Say hello properly when it's framed. I'll hold it for you." },
      { id: 5, from: me, at: "Tue", kind: "text", text: "Deal. How's the third bath looking?" },
    ],
  },
  {
    id: "t-kwame",
    with: ["kwame"],
    msgs: [
      { id: 1, from: "kwame", at: "Fri", kind: "voice", length: "0:51" },
      { id: 2, from: me, at: "Fri", kind: "text", text: "Listened twice. Keep the ruin showing, don't smooth it over." },
      { id: 3, from: "kwame", at: "Sat", kind: "text", text: "That's what I needed to hear. Thank you." },
    ],
  },
  {
    id: "t-zuri",
    with: ["zuri"],
    msgs: [
      { id: 1, from: "zuri", at: "2 days ago", kind: "text", text: "Loved your collector entry on the indigo piece. Would you want to read it at the circle's next meet?" },
      { id: 2, from: me, at: "2 days ago", kind: "text", text: "I'd like that. A bit nervous, but yes." },
    ],
  },
  {
    id: "t-wanjiru",
    with: ["wanjiru"],
    msgs: [
      { id: 1, from: "wanjiru", at: "1 week ago", kind: "text", text: "Thank you for the introduction to Zuri. We're already trading notes on the book edit." },
      { id: 2, from: me, at: "1 week ago", kind: "text", text: "So glad it landed well. She's exactly the right person for that." },
    ],
  },
  {
    id: "t-leila",
    with: ["leila"],
    msgs: [
      { id: 1, from: "leila", at: "3 weeks ago", kind: "text", text: "We should compare notes on collector journaling sometime. I never know how much to write." },
      { id: 2, from: me, at: "3 weeks ago", kind: "text", text: "Same. Coffee next time you're in Lagos?" },
      { id: 3, from: "leila", at: "3 weeks ago", kind: "text", text: "Yes. I'll hold you to that." },
    ],
  },
];

export const threadWith = (id: PersonId) => DM_THREADS.find((t) => t.with.length === 1 && t.with[0] === id);
