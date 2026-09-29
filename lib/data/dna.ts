/** Creative DNA: dimensions from the concept note. Every value is member-editable and never public by default. */
export const RADAR = [
  { key: "curiosity", label: "Creative curiosity", value: 86 },
  { key: "story", label: "Storytelling", value: 92 },
  { key: "history", label: "Historical interest", value: 78 },
  { key: "colour", label: "Colour affinity", value: 64 },
  { key: "emotion", label: "Emotional resonance", value: 81 },
  { key: "conversation", label: "Conversation", value: 38 },
] as const;

export const SPECTRA = [
  { key: "era", left: "Traditional", right: "Contemporary", value: 34 },
  { key: "form", left: "Abstract", right: "Figurative", value: 72 },
  { key: "social", left: "Silent observer", right: "Conversation starter", value: 30 },
] as const;

export const COLLECTOR_TYPES = [
  { key: "historian", label: "Historian", value: 44, blurb: "You collect to understand where something came from." },
  { key: "explorer", label: "Explorer", value: 30, blurb: "You'd rather find an unknown voice than a famous one." },
  { key: "patron", label: "Patron", value: 14, blurb: "You like to help an artist make the next work." },
  { key: "decorator", label: "Decorator", value: 6, blurb: "You buy for how a room feels." },
  { key: "investor", label: "Investor", value: 4, blurb: "You watch the market, lightly." },
  { key: "mentor", label: "Mentor", value: 2, blurb: "You pass what you know on." },
] as const;

export const DNA_TITLE = "Story-seeker with a quiet eye";
export const DNA_SUMMARY = "You connect most deeply through memory, material and intimate artist stories. You look for a long time before you speak, and you speak best in small rooms.";

export const CAPTIONS = [
  "You've read 9 studio journals this month, mostly textile and portrait.",
  "You linger longest on works that carry a personal story.",
  "You joined 2 rooms and left before speaking. Quiet, not absent.",
];
