import type { DraftAnswers, DraftAt } from "@/lib/collab/drafts";
import type { WorkspaceKind } from "@/lib/collab/workspace";

/*
 * Start a project: the product design's builder copy and the rules that turn the answers into a brief and a
 * recommended workspace. Copied from the design; only the image paths are ours.
 */

export type Step = "entry" | DraftAt | "workspace-art" | "workspace-accepted" | "workspace-art-accepted" | "preparing" | "error" | "ready";
export type Opt = { id: string; title: string; text?: string };

export const STEP_NAMES = ["Your idea", "Your purpose", "Your progress", "Your people"];

export const TYPES: Opt[] = [
  { id: "business", title: "A business" },
  { id: "application", title: "An application" },
  { id: "film", title: "A film" },
  { id: "research", title: "A research project" },
  { id: "community", title: "A community initiative" },
  { id: "book", title: "A book" },
  { id: "event", title: "An event" },
  { id: "course", title: "A course" },
  { id: "impact", title: "A social-impact intervention" },
  { id: "other", title: "Something else" },
];

export const QUESTIONS = [
  { id: "q1", title: "What problem are you trying to solve?", label: "The problem", placeholder: "Describe the challenge or opportunity you’ve identified..." },
  { id: "q2", title: "Who is this for?", label: "Who benefits", placeholder: "Tell us about the people this project is intended to help..." },
  { id: "q3", title: "What would success look like?", label: "Desired outcome", placeholder: "What would you like to achieve?" },
  { id: "q4", title: "Why do you care about this?", label: "Why it matters", placeholder: "What makes this idea meaningful to you?" },
] as const;
export type QId = (typeof QUESTIONS)[number]["id"];
export const QN: Record<QId, number> = { q1: 1, q2: 2, q3: 3, q4: 4 };
export const prevOfQ = (q: QId): Step => (q === "q1" ? "idea" : (`q${QN[q] - 1}` as QId));
export const nextOfQ = (q: QId): Step => (q === "q4" ? "stage" : (`q${QN[q] + 1}` as QId));

export const STAGES: (Opt & { sentence: string })[] = [
  { id: "idea", title: "Just an idea", text: "I have an idea, but I haven’t started developing it.", sentence: "The idea is still taking shape and has not been developed yet." },
  { id: "exploring", title: "Exploring", text: "I’m researching the opportunity and understanding what is possible.", sentence: "The opportunity is being researched and the possibilities are becoming clearer." },
  { id: "planning", title: "Ready to plan", text: "I have a clearer direction and want to establish the next steps.", sentence: "A clearer direction is in place and the next steps are still to be established." },
  { id: "building", title: "Already building", text: "I’m actively working on the project.", sentence: "Work on the project is already under way." },
  { id: "skills", title: "Looking for missing skills", text: "The project is moving, but I need additional expertise.", sentence: "The project is moving and needs additional expertise." },
  { id: "launch", title: "Preparing to launch", text: "The project is approaching completion and needs support to reach its audience.", sentence: "The project is approaching completion and needs support to reach its audience." },
];

export const NEEDS: Opt[] = [
  { id: "collaborators", title: "Collaborators", text: "People who can work with you to develop and deliver the project." },
  { id: "mentorship", title: "Mentorship", text: "Experienced people who can provide guidance and perspective." },
  { id: "technical", title: "Technical expertise", text: "People with specialist technical skills." },
  { id: "research", title: "Research", text: "People who can investigate, analyse or validate the project." },
  { id: "funding", title: "Funding", text: "Resources or financial support to help the project progress." },
  { id: "distribution", title: "Distribution", text: "People or resources that can help the project reach its audience." },
  { id: "customers", title: "Customers or users", text: "People who can provide feedback, validate the idea or use the outcome." },
];

/** The design's sample answers: a research-style idea, and an art one. */
export const SAMPLE: DraftAnswers = {
  type: "application",
  idea: "I want to build a career guidance platform for Nigerian students who are choosing what to study.",
  q: {
    q1: "Many secondary school students in Nigeria choose what to study without reliable guidance, and often only learn about their options after they have committed.",
    q2: "Secondary school and early university students in Nigeria, and the teachers and parents who support their decisions.",
    q3: "Students explore careers with confidence and make study choices they understand and can explain.",
    q4: "I remember choosing my own path with very little guidance, and I want the next generation to have more.",
  },
  stage: "planning",
  needs: ["collaborators", "research"],
};
export const SAMPLE_ART: DraftAnswers = {
  type: "other",
  idea: "I want to create an illustrated series that celebrates adire textile patterns and the people who make them.",
  q: {
    q1: "Adire patterns carry stories, but few contemporary illustrators draw them, so younger people rarely see those stories told.",
    q2: "Young Nigerians and the diaspora who love textiles and illustration, and the dyers who keep the craft alive.",
    q3: "A finished series of illustrated portraits and patterns that people want to print, share and keep.",
    q4: "My grandmother dyed adire cloth, and I want its patterns to be seen and remembered.",
  },
  stage: "building",
  needs: ["collaborators", "distribution"],
};
export const BLANK: DraftAnswers = { type: "", idea: "", q: { q1: "", q2: "", q3: "", q4: "" }, stage: "", needs: [] };

const same = (a: string, b: string) => a.trim() === b.trim();
const sameRest = (a: DraftAnswers, b: DraftAnswers) =>
  (["q1", "q2", "q3", "q4"] as const).every((k) => same(a.q[k], b.q[k])) && a.stage === b.stage && [...a.needs].sort().join() === [...b.needs].sort().join();
export const isSample = (a: DraftAnswers, b: DraftAnswers) => same(a.idea, b.idea) && sameRest(a, b);

export type BriefKey = "name" | "overview" | "purpose" | "problem" | "audience" | "outcome" | "stage" | "support";
export type Brief = Record<BriefKey, string>;
export const BRIEF_PARTS: { id: BriefKey; label: string; title?: boolean }[] = [
  { id: "name", label: "Project name", title: true },
  { id: "overview", label: "Project overview" },
  { id: "purpose", label: "Purpose" },
  { id: "problem", label: "Problem" },
  { id: "audience", label: "Audience" },
  { id: "outcome", label: "Desired outcome" },
  { id: "stage", label: "Current stage" },
  { id: "support", label: "Support needed" },
];
const SAMPLE_BRIEF: Brief = {
  name: "Career Guidance for Everyone",
  overview: "A career guidance platform that helps Nigerian secondary school students explore careers, understand their options and make confident decisions about what to study.",
  purpose: "Many students choose their path without reliable guidance. This project exists to make career guidance accessible to every student, wherever they are.",
  problem: "Students in Nigeria often choose subjects and courses with limited information, and only learn about their options after they have committed.",
  audience: "Secondary school and early university students in Nigeria, and the teachers and parents who support their decisions.",
  outcome: "Students explore careers with confidence and make study choices they understand and can explain.",
  stage: "Ready to plan. A clearer direction is in place and the next steps are still to be established.",
  support: "Collaborators with research and product design skills, technical expertise, and mentors who understand how students make career decisions.",
};
const SAMPLE_ART_BRIEF: Brief = {
  name: "Adire Stories",
  overview: "A shared illustration series that celebrates adire textile patterns and the people who make them.",
  purpose: "Adire patterns carry stories that few illustrators have drawn. This project exists to bring those patterns, and the people behind them, to a wider audience.",
  problem: "Adire is part of everyday Nigerian life, yet younger people rarely see its patterns told as stories in contemporary illustration.",
  audience: "Young Nigerians and the diaspora who love textiles and illustration, and the dyers and makers who keep the craft alive.",
  outcome: "A finished series of illustrated portraits and patterns that people want to print, share and keep.",
  stage: "Already building. Work on the project is already under way.",
  support: "Collaborators with illustration and colour skills, and help to share the series with its audience.",
};

const firstSentence = (s: string) => { const t = s.trim().replace(/\s+/g, " "); const m = t.match(/^.*?[.!?](?=\s|$)/); return (m ? m[0] : t).trim(); };
const stop = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);
const upper = (s: string) => s && s.charAt(0).toUpperCase() + s.slice(1);
const lower = (s: string) => s && s.charAt(0).toLowerCase() + s.slice(1);
const typeOf = (id: string) => TYPES.find((t) => t.id === id);
export const stageOf = (id: string) => STAGES.find((s) => s.id === id);
const stripLead = (s: string) => s.replace(/^(i['’]ve been thinking about|i have been thinking about|i['’]m thinking about|i am thinking about|i want to|i would like to|i['’]d like to|i hope to|i plan to)\s+/i, "");

/** "Collaborators and research". */
export function needsSentence(needs: string[]) {
  const t = NEEDS.filter((n) => needs.includes(n.id)).map((n, i) => (i === 0 ? n.title : lower(n.title)));
  return t.length === 0 ? "Nothing chosen yet" : t.length === 1 ? t[0] : `${t.slice(0, -1).join(", ")} and ${t[t.length - 1]}`;
}
/** "Collaborators, research". */
export const needsList = (needs: string[]) => {
  const t = NEEDS.filter((n) => needs.includes(n.id)).map((n, i) => (i === 0 ? n.title : lower(n.title)));
  return t.length ? t.join(", ") : "To be decided";
};
const COUNT = ["No", "One", "Two", "Three", "Four"];

/** The panel's one-line summary of the idea. */
export function ideaLine(a: DraftAnswers) {
  const kind = typeOf(a.type)?.title ?? "Your idea";
  if (same(a.idea, SAMPLE.idea) && a.type === SAMPLE.type) return "An application: a career guidance platform for Nigerian students";
  if (same(a.idea, SAMPLE_ART.idea) && a.type === SAMPLE_ART.type) return "Something else: an illustrated series that celebrates adire textile patterns";
  const s = stripLead(firstSentence(a.idea).replace(/[.!?]$/, ""));
  if (!s) return kind;
  return `${kind}: ${lower(s.length > 90 ? `${s.slice(0, 88).trimEnd()}...` : s)}`;
}
export function purposeLine(a: DraftAnswers) {
  const n = (["q1", "q2", "q3", "q4"] as const).filter((k) => a.q[k].trim()).length;
  return n === 4 ? "Four answers about the problem, the people and the change you hope to make"
    : n === 0 ? "Not added yet. You can still add this later"
    : `${COUNT[n]} ${n === 1 ? "answer" : "answers"} about the problem, the people and the change you hope to make`;
}

const NAMELESS = "My project idea";
function nameOf(a: DraftAnswers) {
  const s = firstSentence(a.idea).replace(/[.!?]$/, "");
  if (!s) return NAMELESS;
  const words = stripLead(s).replace(/^(build|create|make|start|launch|write|run|design|develop|organise|organize|explore)(ing)?\s+((an|a|the)\s+)?/i, "").split(/\s+/).filter(Boolean).slice(0, 5);
  return words.length < 2 ? NAMELESS : upper(words.join(" ").replace(/[,;:]$/, ""));
}

/** The brief the builder prepares from the answers (the member's edits are laid over it). */
export function briefOf(a: DraftAnswers): Brief {
  if (isSample(a, SAMPLE)) return { ...SAMPLE_BRIEF };
  if (isSample(a, SAMPLE_ART)) return { ...SAMPLE_ART_BRIEF };
  const st = stageOf(a.stage);
  const none = "Not added yet. Use Edit to add it.";
  const idea = a.idea.trim();
  const needs = NEEDS.filter((n) => a.needs.includes(n.id));
  return {
    name: nameOf(a),
    overview: idea ? (idea.length > 220 ? stop(firstSentence(idea)) : stop(idea)) : none,
    purpose: a.q.q4.trim() ? stop(a.q.q4) : none,
    problem: a.q.q1.trim() ? stop(a.q.q1) : none,
    audience: a.q.q2.trim() ? stop(a.q.q2) : none,
    outcome: a.q.q3.trim() ? stop(a.q.q3) : none,
    stage: st ? `${st.title}. ${st.sentence}` : none,
    support: needs.length ? `${needsSentence(a.needs)} to help move this project forward.` : none,
  };
}

const ARTY = /\b(art|arts|artist|artists|artwork|artworks|illustrat\w*|paint\w*|draw|drawing|drawings|sketch\w*|canvas|mural\w*|comic|comics|cartoon\w*|animation|animations|animated|textile|textiles|adire|ankara|poster|posters|graphic|graphics|photograph\w*|visual|visuals|collage\w*)\b/i;
/** The workspace Create AI recommends: a canvas for visual work, a document otherwise. */
export function recommend(a: DraftAnswers): WorkspaceKind {
  if (isSample(a, SAMPLE_ART)) return "art";
  if (a.type === "research") return "research";
  return ARTY.test([a.idea, a.q.q1, a.q.q2, a.q.q3, a.q.q4].join(" ")) ? "art" : "research";
}
/** Leaving the idea step: if the idea changed between the two samples, the sample answers follow it. */
export function followSample(a: DraftAnswers): DraftAnswers {
  const arty = a.type !== "research" && ARTY.test(a.idea);
  if (arty && sameRest(a, SAMPLE)) return { ...a, q: { ...SAMPLE_ART.q }, stage: SAMPLE_ART.stage, needs: [...SAMPLE_ART.needs] };
  if (!arty && sameRest(a, SAMPLE_ART)) return { ...a, q: { ...SAMPLE.q }, stage: SAMPLE.stage, needs: [...SAMPLE.needs] };
  return a;
}

export const WORKSPACES: Record<WorkspaceKind, { name: string; why: string; features: string[]; photo: string }> = {
  research: {
    name: "Research Workspace",
    why: "Your brief involves research, shared writing and a report the team edits together.",
    features: ["Rich text with headings, lists, links and tables", "Comments on selected text, with replies", "Document outline and version history", "See who is editing, live"],
    photo: "/kin/collab-start/workspace-research.jpg",
  },
  art: {
    name: "Digital Art Workspace",
    why: "Your brief involves visual creation, illustration and artwork the team makes together.",
    features: ["Shared canvas with brushes, layers and colour", "Comments pinned to the artwork", "Layers, undo and version history", "See who is on the canvas, live"],
    photo: "/kin/collab-start/workspace-art.jpg",
  },
};

export const PREPARING = ["Understanding your idea.", "Clarifying your purpose.", "Organising your project details.", "Preparing your brief."];
export const PREPARE_MS = 3000;

export const SUGGESTIONS = [
  { id: "who", title: "Clarify who this is for", text: "Naming the students, teachers and parents you want to help makes it easier to find the right collaborators." },
  { id: "describe", title: "Improve the project description", text: "Add one sentence about how the platform will work, so people can picture what they would help build." },
  { id: "missing", title: "Add missing information", text: "You haven’t said yet how you plan to reach schools. A short note could help collaborators understand the scope." },
  { id: "skills", title: "Skills that may be relevant", text: "Career research, product design, mobile engineering and community partnerships may all help this project." },
  { id: "milestones", title: "Possible first milestones", text: "Interview ten students, map the first student journey and test a simple prototype with one school." },
];
