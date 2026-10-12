import { IMG, ME, STORIES } from "@/lib/data";
import type { OpenCall, TrustSource } from "@/lib/types";

/** Plain-language status labels shared by the list and detail pages. */
export const STATUS: Record<OpenCall["status"], { label: string; tone: "green" | "gold" | "neutral" }> = {
  open: { label: "Open", tone: "green" },
  "closing-soon": { label: "Closing soon", tone: "gold" },
  closed: { label: "Closed", tone: "neutral" },
};

export const ORGANISER_TYPE: Record<OpenCall["organiserType"], string> = {
  gallery: "Gallery",
  curator: "Independent curator",
  institution: "Institution",
  brand: "Brand",
};

/** Filter buckets. Calls describe geography and experience in their own words; these map them to shared filters. */
export const GEO_FILTERS = [
  { id: "all", label: "Anywhere" },
  { id: "nigeria", label: "Open to artists in Nigeria" },
  { id: "west-africa", label: "West Africa only" },
  { id: "pan-african", label: "Pan-African & diaspora" },
] as const;
export type GeoFilter = (typeof GEO_FILTERS)[number]["id"];

export const CALL_GEO: Record<string, GeoFilter[]> = {
  "threads-of-return": ["nigeria", "pan-african"],
  "figure-ground": ["nigeria", "west-africa"],
  "foundation-statement": ["nigeria", "west-africa"],
  "sound-space": ["nigeria", "pan-african"],
  "lagos-biennale-textiles": ["nigeria"],
  "unverified-prize": ["nigeria", "pan-african"],
};

export const EXPERIENCE_FILTERS = [
  { id: "all", label: "Any stage" },
  { id: "emerging", label: "Emerging" },
  { id: "mid-career", label: "Mid-career" },
  { id: "established", label: "Established" },
] as const;
export type ExperienceFilter = (typeof EXPERIENCE_FILTERS)[number]["id"];

/** Which career stages a call accepts ("Any" accepts all three). */
export function acceptsExperience(call: OpenCall, level: ExperienceFilter) {
  if (level === "all") return true;
  const text = call.experienceLevel.toLowerCase();
  if (text.startsWith("any")) return true;
  return text.includes(level);
}

export const MEDIUM_FILTERS = ["Textiles", "Fibre", "Installation", "Painting", "Sound"] as const;

/** A call takes a medium if it lists it, or if it accepts any medium. */
export function acceptsMedium(call: OpenCall, medium: string) {
  return call.eligibleMedia.some((m) => m === medium || m.toLowerCase().startsWith("any"));
}

/** Word limit for the tailored statement, read from the call's required materials. */
export function statementLimit(call: OpenCall) {
  for (const material of call.requiredMaterials) {
    const match = material.match(/≤\s?(\d+)\s*words/);
    if (match) return Number(match[1]);
  }
  return 300;
}

export interface EligibilityCheck {
  rule: string;
  pass: boolean;
  why: string;
  /** Where the fact about ME comes from. */
  source: TrustSource;
}

/**
 * Eligibility self-check for the signed-in member. Each rule is explained, so a
 * "no" is never a mystery. Organisers still screen by hand (T8).
 */
export const MY_ELIGIBILITY: Record<string, EligibilityCheck[]> = {
  "threads-of-return": [
    { rule: "Eligible media: textiles, fibre or installation", pass: true, why: "Your declared practices are Textiles and Installation.", source: "self-declared" },
    { rule: "Geography: pan-African & diaspora", pass: true, why: `Your identity check places you in ${ME.city}, ${ME.country}.`, source: "verified" },
    { rule: "Experience: mid-career (5+ years exhibiting)", pass: true, why: "You describe yourself as mid-career, with exhibitions since 2019.", source: "self-declared" },
  ],
  "figure-ground": [
    { rule: "Eligible media: painting", pass: false, why: "Your practices are Textiles and Installation. This call accepts painting only.", source: "self-declared" },
    { rule: "Geography: resident in West Africa", pass: true, why: `Your identity check places you in ${ME.city}, ${ME.country}.`, source: "verified" },
    { rule: "Experience: emerging (under 5 years exhibiting)", pass: false, why: "You describe yourself as mid-career. This call is reserved for emerging painters.", source: "self-declared" },
  ],
  "foundation-statement": [
    { rule: "Eligible media: any medium suitable for a public atrium", pass: true, why: "Large textile installation is suitable. Mention hanging and fire treatment in your concept.", source: "self-declared" },
    { rule: "Geography: born or based in West Africa", pass: true, why: `Your identity check places you in ${ME.city}, ${ME.country}.`, source: "verified" },
    { rule: "Experience: established", pass: false, why: "The Foundation defines established as 10+ years or 3 public works. Your profile lists 2 public works. You can still apply and make the case in your concept.", source: "self-declared" },
  ],
  "sound-space": [
    { rule: "Eligible media: sound + a partner discipline", pass: true, why: "You'd apply as a pair with Moussa Diallo (sound). Textiles counts as the partner discipline.", source: "self-declared" },
    { rule: "Geography: Africa & diaspora", pass: true, why: `Your identity check places you in ${ME.city}, ${ME.country}.`, source: "verified" },
    { rule: "Experience: any", pass: true, why: "Open to every career stage.", source: "self-declared" },
  ],
  "lagos-biennale-textiles": [
    { rule: "Eligible media: textiles or fibre", pass: true, why: "Your declared practices include Textiles.", source: "self-declared" },
    { rule: "Geography: Nigeria", pass: true, why: `Your identity check places you in ${ME.city}, ${ME.country}.`, source: "verified" },
    { rule: "Experience: any", pass: true, why: "Open to every career stage.", source: "self-declared" },
  ],
  "unverified-prize": [
    { rule: "Organiser identity verified", pass: false, why: "Artelia has not been able to verify who runs this call.", source: "verified" },
    { rule: "No payment before selection", pass: false, why: "The call asks for a US$50 entry fee. Credible calls don't charge artists to be considered.", source: "verified" },
  ],
};

/** Works ME can attach — her artwork stories plus a few portfolio pieces. */
export interface PortfolioWork {
  id: string;
  title: string;
  image: string;
  detail: string;
  storyId?: string;
}

export const MY_WORKS: PortfolioWork[] = [
  ...STORIES.filter((s) => s.artistId === ME.id).map((s) => ({ id: s.id, title: s.title, image: s.image, detail: `${s.year} · ${s.medium}`, storyId: s.id })),
  { id: "river-kept", title: "What the River Kept", image: IMG.beads, detail: "2025 · Indigo, glass beads, salvaged lace" },
  { id: "kano-lagos-map", title: "Kano–Lagos (study)", image: IMG.paperPrints, detail: "2025 · Resist-dye on paper, mapping study" },
  { id: "salt-water-sketch", title: "Salt Water Memory — sketch model", image: IMG.studioWide, detail: "2026 · Cloth and wire maquette, with Moussa Diallo" },
];

/** Default ask when the call gives no specific count. */
export function maxWorks(call: OpenCall) {
  for (const material of call.requiredMaterials) {
    const match = material.match(/(\d+)\s+(?:portfolio|artwork|past)/i);
    if (match) return Number(match[1]);
  }
  return 3;
}
