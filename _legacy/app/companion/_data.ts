/**
 * Scripted Creative Companion knowledge for the prototype. Each answer is
 * matched by keywords; a real system would retrieve from Artelia's curated
 * knowledge base and clearly separate it from general model knowledge.
 */

export type SourceKind = "curated" | "general";

export interface CompanionAnswer {
  id: string;
  domain: string;
  keywords: string[];
  title: string;
  intro: string;
  points: string[];
  close?: string;
  sources: { kind: SourceKind; label: string }[];
  links?: { href: string; label: string }[];
}

export const DOMAINS: { id: string; label: string; prompts: string[] }[] = [
  { id: "history", label: "African art history", prompts: ["How did Nok, Ife and Benin sculpture develop?", "Who were the Zaria Rebels?"] },
  { id: "materials", label: "Materials & techniques", prompts: ["Why does my natural indigo vat turn green?", "How should I care for a textile work in Lagos humidity?"] },
  { id: "symbolism", label: "Symbolism", prompts: ["What do adinkra symbols like Sankofa mean?", "Can I use nsibidi or uli motifs in my work?"] },
  { id: "exhibition", label: "Exhibition planning", prompts: ["How do I plan a small exhibition in six months?", "What light levels are safe for textiles on show?"] },
  { id: "pricing", label: "Pricing guidance", prompts: ["How should I price my first textile pieces?", "When is it fair to raise my prices?"] },
  { id: "collector", label: "Collector education", prompts: ["What should I check before buying my first work?", "What is provenance and why does it matter?"] },
  { id: "wellbeing", label: "Creative wellbeing", prompts: ["I feel burnt out and can't start anything new", "How do I cope with rejection from open calls?"] },
];

export const ANSWERS: CompanionAnswer[] = [
  {
    id: "indigo",
    domain: "Materials & techniques",
    keywords: ["indigo", "vat", "dye", "dyeing", "lime", "kofar", "adire", "ferment", "green"],
    title: "Natural indigo: why vats turn green, and how to bring them back",
    intro: "A natural indigo vat works by fermentation: bacteria remove oxygen so the indigo becomes soluble (a yellow-green liquid, sometimes called “indigo white”). Cloth comes out green and turns blue as it meets the air. So green in the vat is normal — a green, murky vat that won't blue the cloth usually means the balance is off.",
    points: [
      "Alkalinity: the vat needs to be strongly alkaline (roughly pH 10.5–11.5). Traditional pits in Kano and Abeokuta use wood-ash lye; lime is stronger and easy to overdo. Too much lime can stall fermentation — add ash water or rest the vat rather than adding more lime.",
      "Food for the bacteria: fermented vats need a sugar source (bran, dates, henna or fruit). In the dry season fermentation slows; feed little and often.",
      "Temperature: aim for warm, not hot (around 25–30 °C). Cover the vat at night during harmattan.",
      "Test before dipping: a healthy vat has a coppery film and a dark blue ‘flower’ (foam) on top. Dip a scrap first; if it comes out yellow-green and blues within a minute, you're ready.",
      "Keep notes: record ratios, weather and dip counts. Many dyers find the dry-season ratio is different from the wet-season one.",
    ],
    close: "If you want to go further, the Kofar Mata dyers in Kano still work 500-year-old pits and some take visitors.",
    sources: [
      { kind: "curated", label: "Artelia Materials Library — Natural indigo in West Africa (reviewed by the Textiles Circle moderators)" },
      { kind: "curated", label: "Studio notes shared with consent by Adire makers in Abeokuta" },
      { kind: "general", label: "General chemistry of indigo reduction and oxidation" },
    ],
    links: [{ href: "/circles/textiles", label: "Ask the Textiles Circle" }],
  },
  {
    id: "symbolism",
    domain: "Symbolism",
    keywords: ["symbol", "symbols", "adinkra", "sankofa", "nsibidi", "uli", "motif", "motifs", "meaning", "gye nyame", "sacred"],
    title: "Adinkra, nsibidi and uli: reading symbols with care",
    intro: "Many West African visual systems carry specific meanings, and some carry obligations. Learning where a symbol comes from, and who it belongs to, matters as much as what it looks like.",
    points: [
      "Adinkra (Akan, Ghana): originally stamped on cloth for funerals and ceremonies. Sankofa — a bird looking back — means “go back and fetch it”: learn from the past to move forward. Gye Nyame (“except God”) is one of the most widely used.",
      "Nsibidi (Cross River region, Nigeria and Cameroon): an ideographic system linked partly to the Ekpe/Mgbe society. Some signs are public; others were restricted to initiates. Using restricted signs decoratively can cause real offence.",
      "Uli (Igbo, Nigeria): flowing line drawings traditionally painted on bodies and walls, mostly by women. The Nsukka School (Uche Okeke and others) brought uli into modern painting in the 1970s.",
      "Before using a motif: ask what it means, who traditionally makes it, and whether it's for public use. Credit the tradition in your statement. When unsure, ask someone from that community.",
    ],
    sources: [
      { kind: "curated", label: "Artelia Knowledge — Symbol systems of West and Central Africa (reviewed by Leila Haddad, verified art historian)" },
      { kind: "general", label: "General AI knowledge about specific symbol meanings — meanings vary by region and source" },
    ],
    links: [{ href: "/people/leila", label: "Leila Haddad — art historian" }],
  },
  {
    id: "history",
    domain: "African art history",
    keywords: ["history", "nok", "ife", "benin", "bronze", "bronzes", "igbo-ukwu", "ancient", "zaria", "rebels", "modernism", "osogbo", "restitution"],
    title: "A short path through Nigerian art history",
    intro: "Nigeria has one of the longest continuous sculptural records in the world. A simplified line — each of these deserves a deeper look:",
    points: [
      "Nok (central Nigeria, roughly 1500 BCE – 1 CE): terracotta figures with elaborate hairstyles and pierced eyes, among the earliest known figurative sculpture in sub-Saharan Africa.",
      "Igbo-Ukwu (9th–10th century): extraordinarily intricate cast bronzes, made with a lost-wax technique of great sophistication.",
      "Ife (roughly 12th–15th century): naturalistic brass and terracotta heads, likely representing rulers (Ooni).",
      "Benin Kingdom (from around the 13th century): brass plaques and heads made by the royal guild of casters. Thousands were looted by British forces in 1897; restitution is ongoing.",
      "Modern movements: the Zaria Art Society (“Zaria Rebels”, 1958) and their ‘natural synthesis’ of indigenous and modern forms; the Osogbo workshops of the 1960s; the Nsukka School and its revival of uli.",
    ],
    sources: [
      { kind: "curated", label: "Artelia Knowledge — Timeline of Nigerian art (reviewed by verified curators)" },
      { kind: "general", label: "Dates are scholarly estimates and are still debated — please verify for publication" },
    ],
    links: [{ href: "/rooms", label: "Join a history Presence Room" }],
  },
  {
    id: "exhibition",
    domain: "Exhibition planning",
    keywords: ["exhibition", "exhibit", "show", "light", "lighting", "hang", "hanging", "install", "installation", "plan", "planning", "curate", "lux", "venue"],
    title: "Planning a small exhibition in about six months",
    intro: "Work backwards from opening night. A realistic outline for a solo or small group show:",
    points: [
      "Month 6–5: decide the idea in one sentence, the works (list them), and the venue. Get the venue agreement in writing — dates, commission, who pays for what.",
      "Month 5–4: budget. Typical lines: framing/mounting, transport, insurance, printing, opening event, documentation. Add 10–15% contingency.",
      "Month 4–3: loans and paperwork. If collectors are lending works, use a loan agreement and a condition report for each piece.",
      "Month 3–2: layout and lighting. Textiles, works on paper and photographs should be lit at around 50 lux; paintings can go to about 150–200 lux. Avoid direct sunlight.",
      "Month 2–1: wall texts, price list, invitations. Keep wall texts under 100 words — let the voice notes and stories do the rest.",
      "Final weeks: install, photograph everything, and plan how the show will be recorded in each work's legacy.",
    ],
    sources: [
      { kind: "curated", label: "Artelia Curator Toolkit — Exhibition timeline and loan agreement templates (verified)" },
      { kind: "general", label: "Conservation light-level guidelines — confirm with a conservator for sensitive works" },
    ],
    links: [{ href: "/curator", label: "Curator Desk" }, { href: "/studio", label: "Collaboration Studio" }],
  },
  {
    id: "pricing",
    domain: "Pricing guidance",
    keywords: ["price", "prices", "pricing", "charge", "worth", "value", "valuation", "sell", "cost", "raise", "how much"],
    title: "Pricing your work: guidance, not a valuation",
    intro: "There is no single right price, but there are ways to be consistent and fair to yourself. This is guidance only — it is not a valuation of any specific work.",
    points: [
      "Start from your costs: materials, studio time at a fair hourly rate, framing and a share of overheads. Your price should never be below this.",
      "Use a consistent formula for similar work, e.g. (height + width in cm) × a multiplier. Emerging artists on Artelia often start with a multiplier that puts a medium work between US$300 and US$1,500 — compare with peers at a similar stage, medium and market.",
      "Keep one price everywhere. Don't sell cheaper from the studio than your gallery does; it damages trust with collectors and galleries.",
      "Raise prices gradually (often 10–20%) after steady sales, a sold-out show, or a significant exhibition — not after a single sale.",
      "Record the story: documented process, exhibitions and a clear legacy record make a work easier to price and to resell.",
    ],
    close: "For an insurance or resale valuation, speak to a qualified appraiser.",
    sources: [
      { kind: "curated", label: "Artelia marketplace pricing guide for emerging artists (verified, updated 2026)" },
      { kind: "general", label: "General market ranges — prices vary widely by city and medium; please verify" },
    ],
    links: [{ href: "/opportunities", label: "Opportunities with disclosed fees" }],
  },
  {
    id: "collector",
    domain: "Collector education",
    keywords: ["collect", "collector", "collecting", "buy", "buying", "first", "provenance", "certificate", "authentic", "authenticity", "export", "ship"],
    title: "Before you buy: a collector's checklist",
    intro: "Buying art you'll live with is personal — but a few checks protect you, the artist and future owners.",
    points: [
      "Meet the work's story: read the artist's statement, listen to the voice note, and ask questions. Good artists welcome them.",
      "Provenance: ask where the work has been and who has owned it. On Artelia every work has a legacy record — look for verified entries.",
      "Documentation: request a certificate of authenticity and an invoice that names the work, date, medium and dimensions.",
      "Condition and care: ask how it was made and how to look after it (light, humidity, hanging).",
      "Moving it across borders: contemporary works usually travel with a commercial invoice; antiquities need export permits (in Nigeria, from the National Commission for Museums and Monuments). Never buy antiquities without clear legal title.",
      "Buy what stays with you. Collectors on Artelia often say the best purchases were the ones they kept thinking about a week later.",
    ],
    sources: [
      { kind: "curated", label: "Artelia Collector Guide — Provenance and documentation (verified)" },
      { kind: "general", label: "Export rules change — please verify with the relevant authority before shipping" },
    ],
    links: [{ href: "/stories", label: "Browse artwork stories" }, { href: "/membership", label: "Collector membership & advisory" }],
  },
  {
    id: "wellbeing",
    domain: "Creative wellbeing",
    keywords: ["burnout", "burnt", "burned", "tired", "exhausted", "block", "blocked", "stuck", "motivation", "rejection", "rejected", "doubt", "anxious", "anxiety", "lonely", "alone"],
    title: "When the work feels heavy",
    intro: "That sounds hard, and it's very common — especially after a long push or a run of rejections. I'm not a therapist and I can't diagnose anything, but here are gentle things other artists have found useful:",
    points: [
      "Lower the stakes: make something small you're allowed to throw away — a ten-minute sketch, a test swatch, a voice memo.",
      "Separate the work from the outcome: a rejection from an open call is usually about fit, numbers and budget, not your worth. Most calls on Artelia receive many more strong applications than they can select.",
      "Rest counts as practice. Many practices move in seasons.",
      "Talk to peers: moderated circles exist so you don't carry this alone.",
      "If low mood lasts for weeks, or affects sleep, eating or daily life, please talk to a professional — Wellbeing lists licensed therapists and art therapists.",
    ],
    sources: [
      { kind: "curated", label: "Artelia Wellbeing — Creative burnout reflection (reviewed with licensed art therapists)" },
      { kind: "general", label: "General wellbeing suggestions — not medical advice" },
    ],
    links: [{ href: "/wellbeing", label: "Private check-in & support" }, { href: "/circles", label: "Find a peer circle" }],
  },
  {
    id: "care",
    domain: "Materials & techniques",
    keywords: ["care", "conserve", "conservation", "clean", "humidity", "mould", "mold", "store", "storage", "frame", "framing", "fade", "sunlight"],
    title: "Caring for textile and paper works in a humid climate",
    intro: "Heat, humidity and light are the main risks for textiles and works on paper in coastal cities like Lagos, Accra or Dakar.",
    points: [
      "Light: keep works out of direct sun. Natural dyes, including indigo, can fade or shift. Rotate textile works every few months if you can.",
      "Humidity: aim for roughly 45–60% relative humidity. Above about 65%, mould becomes a risk — a small dehumidifier in the room helps during the rainy season.",
      "Air: leave a small gap between the work and the wall so air can move, especially on outside walls.",
      "Hanging textiles: use a sleeve and batten or Velcro along the top edge, never nails or pins through the cloth.",
      "Storage: roll textiles around an acid-free tube with tissue, never fold along the same line. Keep off the floor.",
      "Cleaning: gentle vacuuming through a screen only. For stains or mould, ask a conservator rather than washing.",
    ],
    sources: [
      { kind: "curated", label: "Artelia Care Sheets — Textiles and works on paper (verified with a conservator)" },
      { kind: "general", label: "General conservation guidance — check with a conservator for valuable works" },
    ],
  },
];

export const CRISIS_PATTERNS = [
  /hurt (my ?self|me)/i,
  /harm (my ?self|me)/i,
  /kill (my ?self|me)/i,
  /\bend it\b/i,
  /end (my|this) life/i,
  /suicid/i,
  /can'?t go on/i,
  /cannot go on/i,
  /don'?t want to (live|be here)/i,
  /want to die/i,
  /no reason to live/i,
];

export function isCrisis(text: string) {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

/** Picks the answer with the most keyword hits, or null for the fallback. */
export function matchAnswer(text: string): CompanionAnswer | null {
  const q = text.toLowerCase();
  let best: CompanionAnswer | null = null;
  let bestScore = 0;
  for (const answer of ANSWERS) {
    const score = answer.keywords.reduce((n, k) => (new RegExp(`\\b${k.replace(/[-]/g, "\\-")}`, "i").test(q) ? n + 1 : n), 0);
    if (score > bestScore) {
      best = answer;
      bestScore = score;
    }
  }
  return best;
}

export const EMERGENCY_NUMBERS = [
  { country: "Nigeria", number: "112" },
  { country: "Ghana", number: "112" },
  { country: "Kenya", number: "999 or 112" },
  { country: "South Africa", number: "10111, or 112 from a mobile" },
  { country: "United Kingdom", number: "999" },
];
