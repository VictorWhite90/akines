import type { CollectorType, CreativeDna, IntentId } from "@/lib/types";

/** Connection Intent options, asked at onboarding and at the start of a session. */
export const INTENTS: { id: IntentId; label: string; example: string }[] = [
  { id: "inspiration", label: "Find inspiration", example: "“I'm an artist looking for inspiration.”" },
  { id: "collaborator", label: "Meet a collaborator", example: "“I'm looking for collaborators.”" },
  { id: "discover-artists", label: "Discover artists", example: "“I'm looking for African artists.”" },
  { id: "discuss", label: "Discuss art", example: "“I enjoy discussing art.”" },
  { id: "opportunity", label: "Find an opportunity", example: "“I want a residency or an open call.”" },
  { id: "learn", label: "Learn", example: "“I'm researching African history.”" },
  { id: "reflect", label: "Reflect quietly", example: "“I feel creatively blocked.”" },
  { id: "less-alone", label: "Feel less alone", example: "“I'm lonely and want to talk about art.”" },
];

export const COLLECTOR_TYPES: { id: CollectorType; description: string }[] = [
  { id: "Explorer", description: "Follows curiosity across media and regions." },
  { id: "Investor", description: "Weighs market trajectory and provenance." },
  { id: "Historian", description: "Collects to preserve context and lineage." },
  { id: "Decorator", description: "Chooses work for how it lives in a space." },
  { id: "Patron", description: "Backs artists over whole careers." },
  { id: "Mentor", description: "Shares networks and knowledge, not just money." },
];

export const MY_DNA: CreativeDna = {
  personId: "adaeze",
  intents: ["collaborator", "opportunity", "less-alone"],
  collectorTypes: undefined,
  privacy: { inferFromBehaviour: true, visibleToMatches: true, visibleToCurators: true, useJournalThemes: false },
  dimensions: [
    { id: "curiosity", label: "Creative curiosity", left: "Deep & focused", right: "Wide-ranging", value: 38, source: "self-declared", why: "You said you return to the same materials for years." },
    { id: "storytelling", label: "Storytelling preference", left: "Visual", right: "Narrative", value: 78, source: "ai", why: "Your artwork stories use long voice notes and family histories." },
    { id: "history", label: "Historical interest", left: "Present-day", right: "Ancestral", value: 82, source: "self-declared", why: "You listed indigo dye traditions as a core theme." },
    { id: "material", label: "Material affinity", left: "Digital", right: "Tactile", value: 92, source: "self-declared", why: "Textiles and installation are your declared practices." },
    { id: "emotion", label: "Emotional style", left: "Quiet", right: "Expressive", value: 30, source: "ai", why: "You mostly join Presence Rooms as a listener before speaking." },
    { id: "tradition", label: "Traditional ↔ Contemporary", left: "Traditional", right: "Contemporary", value: 58, source: "self-declared", why: "You describe your work as old techniques, new questions." },
    { id: "form", label: "Abstract ↔ Figurative", left: "Abstract", right: "Figurative", value: 24, source: "self-declared", why: "Your recent works are pattern-led, without figures." },
    { id: "collaboration", label: "Collaboration style", left: "Solo", right: "Co-creative", value: 70, source: "ai", why: "You accepted three collaboration introductions this year." },
    { id: "voice", label: "Silent observer ↔ Conversation starter", left: "Observer", right: "Starter", value: 35, source: "ai", why: "You reply often, but rarely open new threads." },
  ],
};
