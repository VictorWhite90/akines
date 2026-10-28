import type { CircleThread } from "@/lib/types";

/** Extra threads so every circle's tabs have something real in them. */
export const EXTRA_THREADS: Record<string, CircleThread[]> = {
  young: [
    { id: "y2", title: "First time sharing my CV here — be kind, be honest", authorId: "tunde", kind: "feedback", replies: 7, lastActive: "Yesterday" },
    { id: "y3", title: "How do you keep going when nobody's watching?", authorId: "kwame", kind: "discussion", replies: 19, lastActive: "6h ago" },
    { id: "y4", title: "Graduate internship — verified employer, paid", authorId: "kwame", kind: "opportunity", replies: 5, lastActive: "2 days ago" },
    { id: "y5", title: "Monthly mentor hour — sign-ups open", authorId: "adaeze", kind: "mentorship", replies: 3, lastActive: "3 days ago" },
  ],
  fashion: [
    { id: "f2", title: "Pitch deck feedback: second draft", authorId: "ayo", kind: "feedback", replies: 6, lastActive: "Yesterday" },
  ],
  photography: [
    { id: "p2", title: "Feedback: twelve frames from a dawn walk", authorId: "wanjiru", kind: "feedback", replies: 4, lastActive: "Yesterday" },
  ],
  diaspora: [
    { id: "d1", title: "What did you carry with you when you left?", authorId: "chidi", kind: "discussion", replies: 21, lastActive: "1h ago" },
  ],
  collectors: [
    { id: "co1", title: "How do you ask a friend to pay you back without it feeling awkward?", authorId: "zuri", kind: "discussion", replies: 9, lastActive: "5h ago" },
  ],
  traditional: [
    { id: "tr1", title: "Reading list: books that changed how you see work", authorId: "leila", kind: "discussion", replies: 6, lastActive: "2 days ago" },
  ],
};

/** Standards every circle adds on top of its own guidelines (T7). */
export const COMMUNITY_STANDARDS = [
  { title: "Harassment", text: "No insults, pile-ons or unwanted private messages." },
  { title: "Exploitation", text: "No unpaid “exposure” offers or fees to apply dressed up as opportunities." },
  { title: "Credit", text: "Credit the work and ideas you build on. Copying shared work gets it removed." },
  { title: "Respect", text: "Talk about other cultures and faiths with the people they belong to, not over them." },
  { title: "Misrepresentation", text: "Don't claim credentials, sales or affiliations you can't show." },
];

export const LEGIT_CHECKLIST = [
  "The organiser is verified on Artelia — look for the Verified label.",
  "The fee or budget is written down before you apply.",
  "You never pay to apply, to be “shortlisted” or to exhibit.",
  "The rights requested are specific and time-limited.",
  "There's a clear selection process and a date you'll hear back.",
  "Payment requests only happen inside Artelia — never by private transfer.",
];
