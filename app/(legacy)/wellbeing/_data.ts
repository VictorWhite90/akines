/**
 * Route-local mock data for Creative Wellbeing. Everything here is private to
 * the member in the real product — never used for matching, ranking,
 * opportunity access or advertising (W3, T4).
 */

export type MoodShape = "circle" | "square" | "triangle" | "wave" | "spiral";

export interface MoodEntry {
  id: string;
  date: string;
  colour: string;
  colourName: string;
  shape: MoodShape;
  word: string;
}

export const MOOD_COLOURS: { name: string; hex: string }[] = [
  { name: "Indigo", hex: "#2e3a73" },
  { name: "Ochre", hex: "#d58430" },
  { name: "Clay", hex: "#a8553f" },
  { name: "Sage", hex: "#7f9c83" },
  { name: "Dusk", hex: "#8a6f9e" },
  { name: "Sky", hex: "#6dacbf" },
  { name: "Charcoal", hex: "#3a3a3a" },
  { name: "Gold", hex: "#e0a93a" },
];

export const MOOD_SHAPES: { id: MoodShape; label: string }[] = [
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "triangle", label: "Triangle" },
  { id: "wave", label: "Wave" },
  { id: "spiral", label: "Spiral" },
];

/** Adaeze's last few days — visible only to her. */
export const MOOD_HISTORY: MoodEntry[] = [
  { id: "m1", date: "Tue 15", colour: "#6dacbf", colourName: "Sky", shape: "wave", word: "open" },
  { id: "m2", date: "Wed 16", colour: "#2e3a73", colourName: "Indigo", shape: "circle", word: "steeped" },
  { id: "m3", date: "Thu 17", colour: "#3a3a3a", colourName: "Charcoal", shape: "square", word: "stuck" },
  { id: "m4", date: "Fri 18", colour: "#a8553f", colourName: "Clay", shape: "triangle", word: "restless" },
  { id: "m5", date: "Sat 19", colour: "#7f9c83", colourName: "Sage", shape: "spiral", word: "unwinding" },
  { id: "m6", date: "Sun 20", colour: "#e0a93a", colourName: "Gold", shape: "circle", word: "warm" },
];

export const BURNOUT_QUESTIONS: { id: string; q: string }[] = [
  { id: "joy", q: "When you walk into the studio, how often does it feel like a chore rather than a place you chose?" },
  { id: "rest", q: "How often do you rest without feeling you should be making something?" },
  { id: "compare", q: "How often do you measure your work against other artists' visibility or sales?" },
  { id: "body", q: "How often does your body ask you to stop — tired eyes, sore hands, poor sleep?" },
  { id: "people", q: "How often do you talk about your work with someone who understands it?" },
];

export const BURNOUT_OPTIONS = ["Rarely", "Sometimes", "Often"] as const;
export type BurnoutAnswer = (typeof BURNOUT_OPTIONS)[number];

export const ARTIST_ANXIETY_PROMPTS = [
  "What would you make this week if nobody ever saw it?",
  "Name one piece of feedback you are still carrying. Is it yours to keep?",
  "When did you last feel proud of something small in the studio?",
  "What is the kindest thing a fellow artist has said about your work?",
];

export const COLLECTOR_PROMPTS = [
  "Which work in your home do you look at when you need to slow down? Why that one?",
  "Is there a piece you almost bought and still think about? What did it ask of you?",
  "Are you collecting for the person you are, or the person you think you should be?",
  "What would you want the artist to know about how their work lives with you?",
];

export const JOURNAL_PROMPT = {
  title: "Draw the weather inside you",
  text: "Without planning, make marks for how today felt — thread, charcoal, dye on scrap cloth, anything to hand. Then write three words beside it. It does not need to be good. It only needs to be honest.",
};

export const MINDFULNESS_PROMPT =
  "Before you start work, hold one material in your hand for thirty seconds. Notice its weight, temperature and smell. Let it tell you where to begin.";

export const GRATITUDE_SEED = [
  { id: "g1", date: "Sat 19", text: "Moussa sent a harbour recording at 5am — the gulls sounded like my grandmother's radio." },
  { id: "g2", date: "Thu 17", text: "The indigo vat finally came back to life after a week of sulking." },
];

export interface Therapist {
  id: string;
  name: string;
  profession: string;
  city: string;
  languages: string[];
  formats: ("Virtual" | "In person")[];
  fee: string;
  focus: string;
}

/** Fictional example listings — the pilot will onboard real, licensed professionals. */
export const THERAPISTS: Therapist[] = [
  { id: "t1", name: "Dr. Ngozi Okafor", profession: "Clinical psychologist", city: "Lagos", languages: ["English", "Igbo", "Yoruba"], formats: ["Virtual", "In person"], fee: "₦25,000–₦40,000 per session", focus: "Creative block, anxiety, perfectionism in working artists." },
  { id: "t2", name: "Abena Owusu", profession: "Registered art therapist", city: "Accra", languages: ["English", "Twi"], formats: ["Virtual", "In person"], fee: "GH₵350–GH₵600 per session", focus: "Expressive art therapy, grief, rebuilding a practice after a hard year." },
  { id: "t3", name: "Dr. Achieng Otieno", profession: "Counselling psychologist", city: "Nairobi", languages: ["English", "Swahili"], formats: ["Virtual"], fee: "KSh 4,000–KSh 7,000 per session · sliding scale", focus: "Isolation, burnout and financial stress for freelance creatives." },
  { id: "t4", name: "Thandi Mokoena", profession: "Registered art therapist", city: "Johannesburg", languages: ["English", "isiZulu", "Sesotho"], formats: ["Virtual", "In person"], fee: "R650–R1,100 per session", focus: "Trauma-informed art therapy, identity and belonging." },
  { id: "t5", name: "Samuel Adjei", profession: "Psychotherapist (UKCP)", city: "London", languages: ["English", "Twi"], formats: ["Virtual"], fee: "£55–£90 per session · reduced-fee places", focus: "Diaspora identity, career transitions, anxiety." },
];

export const EMERGENCY_NUMBERS: { country: string; number: string }[] = [
  { country: "Nigeria", number: "112" },
  { country: "Ghana", number: "112" },
  { country: "Kenya", number: "999 or 112" },
  { country: "South Africa", number: "10111, or 112 from a mobile" },
  { country: "United Kingdom", number: "999" },
];

const CRISIS_PATTERNS = [/hurt myself/i, /\bend it\b/i, /suicid/i, /can'?t go on/i, /can’t go on/i, /cannot go on/i, /kill myself/i];

/** True when text contains language that should trigger the safety flow (W4). */
export function hasCrisisLanguage(text: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}
