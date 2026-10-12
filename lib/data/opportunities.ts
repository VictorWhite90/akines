import type { Application, Candidate, OpenCall } from "@/lib/types";
import { IMG } from "./legacyImages";

/** Structured open calls: every call carries the same standard fields. */
export const OPEN_CALLS: OpenCall[] = [
  {
    id: "threads-of-return", title: "Threads of Return", organisation: "Ubuntu Contemporary", organiserId: "nomvula", organiserType: "gallery", organiserVerified: true, image: IMG.textile,
    theme: "Textile & fibre installations on migration and return", summary: "A commissioned installation for Ubuntu Contemporary's 2027 season, touring Johannesburg and Lagos.",
    eligibleMedia: ["Textiles", "Fibre", "Installation"], geography: "Pan-African & diaspora", experienceLevel: "Mid-career (5+ years exhibiting)", numberOfWorks: "1 installation", budget: "US$8,000 production + US$2,500 artist fee",
    rightsRequested: "Artist keeps copyright and ownership. Gallery takes 30% commission if sold; exhibition and press images only.", selectionProcess: "Curator panel shortlist → video conversation → final selection",
    requiredMaterials: ["Up to 6 portfolio images", "Proposal (≤500 words)", "Sketch or model", "CV"], timeline: [{ label: "Call opens", date: "Aug 1" }, { label: "Deadline", date: "Oct 3" }, { label: "Shortlist", date: "Oct 24" }, { label: "Selection", date: "Nov 14" }, { label: "Opening", date: "Mar 2027" }],
    deadline: "Oct 3, 2026", status: "closing-soon", commissionerHistory: "4 commissions completed on Artelia · all artist payments on time",
    matchReasons: [{ text: "Your practice matches every eligible medium.", source: "ai" }, { text: "Your theme — migration and memory — is the call's theme.", source: "ai" }],
  },
  {
    id: "figure-ground", title: "Figure & Ground: Emerging West African Figurative Painters", organisation: "Halima Sani (independent curator)", organiserId: "halima", organiserType: "curator", organiserVerified: true, image: IMG.paintingStudio,
    theme: "The figure in domestic space", summary: "A group exhibition of eight emerging painters, with a catalogue and mentoring from the curator.",
    eligibleMedia: ["Painting"], geography: "West Africa (resident)", experienceLevel: "Emerging (under 5 years exhibiting)", numberOfWorks: "Up to 3 works", budget: "₦500,000 artist fee + shipping covered",
    rightsRequested: "Non-exclusive exhibition and catalogue reproduction for 12 months.", selectionProcess: "Eligibility screen → curator longlist → studio conversation → final eight",
    requiredMaterials: ["3 artwork images", "Statement (≤300 words)", "CV"], timeline: [{ label: "Call opens", date: "Sep 1" }, { label: "Deadline", date: "Oct 20" }, { label: "Longlist", date: "Nov 3" }, { label: "Final eight", date: "Nov 24" }],
    deadline: "Oct 20, 2026", status: "open", commissionerHistory: "2 calls run on Artelia · every applicant received a decision",
  },
  {
    id: "foundation-statement", title: "Statement Artwork for the Foundation's New Home", organisation: "West Africa Arts Foundation", organiserId: "kofi", organiserType: "institution", organiserVerified: true, image: IMG.studioWide,
    theme: "Heritage that looks forward", summary: "A permanent work for the atrium of the Foundation's new Accra headquarters.",
    eligibleMedia: ["Any medium suitable for a public atrium"], geography: "Artists born or based in West Africa", experienceLevel: "Established", numberOfWorks: "1 commissioned work", budget: "US$15,000 fee + US$10,000 production",
    rightsRequested: "Foundation acquires the physical work; artist keeps copyright and receives credit in perpetuity.", selectionProcess: "Concept proposals → 3 paid concept developments (US$750 each) → board selection",
    requiredMaterials: ["Concept (≤800 words)", "Visual references", "Budget outline", "3 past public works"], timeline: [{ label: "Call opens", date: "Sep 10" }, { label: "Deadline", date: "Nov 1" }, { label: "Paid concepts", date: "Dec" }, { label: "Install", date: "Jun 2027" }],
    deadline: "Nov 1, 2026", status: "open", commissionerHistory: "Verified institution · milestone payments held in escrow",
  },
  {
    id: "sound-space", title: "Sound & Space: Cross-disciplinary Lab", organisation: "Dakar Sound Collective", organiserType: "institution", organiserVerified: true, image: IMG.heroStudio,
    theme: "Pairs of artists from different disciplines", summary: "A four-week lab in Dakar for pairs whose practices share a theme but not a medium.",
    eligibleMedia: ["Sound", "Any partner discipline"], geography: "Africa & diaspora", experienceLevel: "Any", numberOfWorks: "1 collaborative work per pair", budget: "US$3,000 per pair + travel and housing",
    rightsRequested: "Pairs co-own the work; lab may document and show it for 2 years.", selectionProcess: "Pair application → interview → selection",
    requiredMaterials: ["Joint statement", "Collaboration charter draft", "Portfolio from each artist"], timeline: [{ label: "Deadline", date: "Nov 15" }, { label: "Lab", date: "Feb 2027" }],
    deadline: "Nov 15, 2026", status: "open", commissionerHistory: "First call on Artelia · identity and funding verified",
  },
  {
    id: "lagos-biennale-textiles", title: "Lagos Biennale: New Cloth", organisation: "Lagos Biennale", organiserType: "institution", organiserVerified: true, image: IMG.beads,
    theme: "Textile practices that remake tradition", summary: "A section of the 2026 Biennale devoted to contemporary cloth.",
    eligibleMedia: ["Textiles", "Fibre"], geography: "Nigeria", experienceLevel: "Any", numberOfWorks: "Up to 2 works", budget: "₦750,000 artist fee",
    rightsRequested: "Exhibition and press images for the Biennale period.", selectionProcess: "Jury review → final selection",
    requiredMaterials: ["2 artwork images", "Statement (≤300 words)"], timeline: [{ label: "Deadline", date: "Feb 20" }, { label: "Decisions", date: "Mar 28" }, { label: "Opening", date: "May 2026" }],
    deadline: "Feb 20, 2026", status: "closed", commissionerHistory: "Verified institution · decisions sent to every applicant",
  },
  {
    id: "unverified-prize", title: "Global Emerging Art Prize 2026", organisation: "Unverified organiser", organiserType: "brand", organiserVerified: false, image: IMG.paperPrints,
    theme: "Any theme", summary: "“Win exposure to international buyers.” Entry requires a payment before any selection.",
    eligibleMedia: ["Any"], geography: "Worldwide", experienceLevel: "Any", numberOfWorks: "Unlimited", budget: null,
    rightsRequested: "Not stated", selectionProcess: "Not stated", requiredMaterials: ["US$50 entry fee"], timeline: [{ label: "Deadline", date: "Not stated" }],
    deadline: "Not stated", status: "open", commissionerHistory: "No history on Artelia",
    flags: ["Organiser identity not verified", "No budget or fee disclosed", "Payment requested before selection", "Rights requested not stated"],
  },
];

export const MY_APPLICATIONS: Application[] = [
  { id: "app-1", callId: "threads-of-return", stage: "shortlist", submitted: "Sep 12", selectedWorks: ["Indigo Crossing", "What the River Kept"], history: [
    { stage: "submitted", date: "Sep 12" }, { stage: "eligibility", date: "Sep 13", note: "Meets all eligibility rules." }, { stage: "review", date: "Sep 20" },
    { stage: "longlist", date: "Oct 6" }, { stage: "shortlist", date: "Oct 24", note: "Video conversation invite sent — pick a slot by Oct 30." },
  ] },
  { id: "app-2", callId: "sound-space", stage: "review", submitted: "Sep 18", selectedWorks: ["Salt Water Memory (with Moussa Diallo)"], history: [
    { stage: "submitted", date: "Sep 18" }, { stage: "eligibility", date: "Sep 18", note: "Joint application confirmed by both artists." }, { stage: "review", date: "Sep 25" },
  ] },
  { id: "app-3", callId: "lagos-biennale-textiles", stage: "not-selected", submitted: "Feb 14", selectedWorks: ["Indigo Crossing"], history: [
    { stage: "submitted", date: "Feb 14" }, { stage: "eligibility", date: "Feb 15", note: "Meets all eligibility rules." }, { stage: "review", date: "Mar 1" }, { stage: "not-selected", date: "Mar 28" },
  ], feedback: "Beautiful dye work. The jury prioritised pieces that could hang freely in the open-air pavilion; your installation needed a wall. We'd welcome a free-hanging proposal next edition." },
];

const works = (a: string, b: string) => [{ title: "Study I", image: a, medium: "Oil on canvas" }, { title: "Study II", image: b, medium: "Acrylic on board" }];

/** Submissions to "Figure & Ground", as the Curator Desk shows them. */
export const CANDIDATES: Candidate[] = [
  { id: "cand-1", personId: "kwame", callId: "figure-ground", stage: "shortlist", eligibility: [{ rule: "Painting", pass: true }, { rule: "West Africa resident", pass: true }, { rule: "Under 5 years exhibiting", pass: true }], tags: ["large-scale", "domestic space"], notes: ["Murals at church scale — ask about studio size.", "Strong second image."], works: works(IMG.paintingStudio, IMG.portrait), statement: "I paint my neighbours at the size we paint saints.", keepOnRadar: true },
  { id: "cand-2", personId: "tunde", callId: "figure-ground", stage: "longlist", eligibility: [{ rule: "Painting", pass: true }, { rule: "West Africa resident", pass: true }, { rule: "Under 5 years exhibiting", pass: true }], tags: ["solitude", "promising"], notes: ["Young, raw, honest. Pair with a mentor?"], works: works(IMG.drawing, IMG.illustration), statement: "An empty classroom is the most crowded room I know.", keepOnRadar: true },
  { id: "cand-3", personId: "ayo", callId: "figure-ground", stage: "declined", eligibility: [{ rule: "Painting", pass: false }, { rule: "West Africa resident", pass: true }, { rule: "Under 5 years exhibiting", pass: false }], tags: [], notes: [], works: works(IMG.fashion, IMG.womensWear), statement: "Fashion as figurative portraiture.", keepOnRadar: false },
  { id: "cand-4", personId: "wanjiru", callId: "figure-ground", stage: "received", eligibility: [{ rule: "Painting", pass: false }, { rule: "West Africa resident", pass: false }, { rule: "Under 5 years exhibiting", pass: false }], tags: [], notes: [], works: works(IMG.photography, IMG.portrait), statement: "Photographs painted over by hand.", keepOnRadar: false },
  { id: "cand-6", personId: "fatima", callId: "figure-ground", stage: "eligible", eligibility: [{ rule: "Painting", pass: true }, { rule: "West Africa resident", pass: false }, { rule: "Under 5 years exhibiting", pass: true }], tags: [], notes: ["Based in Morocco — check residency rule."], works: works(IMG.ceramics, IMG.sculpture), statement: "Paintings of the vessels I throw.", keepOnRadar: true },
];

export function getCall(id: string) {
  return OPEN_CALLS.find((call) => call.id === id);
}
