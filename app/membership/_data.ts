/** Route-local mock data: Artelia Connect's revenue streams (B1, B2). All prices illustrative. */

export type Audience = "collectors" | "professionals" | "institutions" | "everyone";

export const ARTIST_FREE: { label: string; href: string }[] = [
  { label: "Your profile and portfolio", href: "/people/adaeze" },
  { label: "Creative DNA and curated introductions", href: "/dna" },
  { label: "Presence Rooms", href: "/rooms" },
  { label: "Creative Circles, mentoring and portfolio feedback", href: "/circles" },
  { label: "Artist Journals and artwork stories", href: "/journals" },
  { label: "Applying to open calls — never an entry fee", href: "/opportunities" },
  { label: "The Collaboration Studio and project rooms", href: "/studio" },
  { label: "Creative Wellbeing tools", href: "/wellbeing" },
];

export interface Stream {
  id: string;
  title: string;
  audience: Exclude<Audience, "everyone">[];
  payer: string;
  price: string;
  unit: string;
  includes: string[];
  when: string;
  icon: "crown" | "briefcase" | "shield" | "percent" | "ticket" | "teacher" | "building" | "receipt";
}

export const STREAMS: Stream[] = [
  {
    id: "collector",
    title: "Collector membership",
    audience: ["collectors"],
    payer: "Collectors",
    price: "US$20",
    unit: "per month · or US$200 a year",
    includes: ["Private Presence Rooms with artists", "Previews of new work before public release", "Virtual and live studio access", "A named art advisor for your collection"],
    when: "Monthly or yearly. Browsing, buying and public rooms stay free.",
    icon: "crown",
  },
  {
    id: "protection",
    title: "Project protection",
    audience: ["professionals", "institutions", "collectors"],
    payer: "Commissioners & project leads",
    price: "US$49",
    unit: "per protected project + 1.5% escrow handling",
    includes: ["Plain-language agreement templates", "Escrow for commission and project budgets", "Rights records and contribution ledger", "Evidence pack if anything is disputed"],
    when: "Per project. Basic charter templates stay free for artist-to-artist collaborations.",
    icon: "shield",
  },
  {
    id: "facilitation",
    title: "Collaboration facilitation",
    audience: ["institutions", "professionals"],
    payer: "The funder of the project",
    price: "5%",
    unit: "of a funded project's budget",
    includes: ["Matching the right collaborators", "Facilitated agreement session", "Milestone tracking and approvals", "Split payments to every contributor"],
    when: "Only when a project is funded — added on top, never taken from an artist's share.",
    icon: "percent",
  },
  {
    id: "calls",
    title: "Professional open calls",
    audience: ["professionals", "institutions"],
    payer: "The organisation publishing the call",
    price: "US$150",
    unit: "per verified call",
    includes: ["Structured call with standard fields", "Verified-organiser badge", "Eligibility screening and review tools", "Status updates sent to every applicant"],
    when: "Per call. Waived for artist-run and community calls. Artists never pay to apply.",
    icon: "receipt",
  },
  {
    id: "events",
    title: "Events & learning",
    audience: ["collectors", "professionals"],
    payer: "Participants or sponsors",
    price: "US$10–60",
    unit: "per ticket · residencies priced separately",
    includes: ["Portfolio reviews with verified curators", "Salons and collector evenings", "Residencies with partner institutions", "Sponsored circles — free to artists"],
    when: "Per event. Bursaries fund one in three artist places in the pilot.",
    icon: "teacher",
  },
  {
    id: "enterprise",
    title: "Enterprise partnerships",
    audience: ["institutions"],
    payer: "Foundations, brands & institutions",
    price: "From US$15,000",
    unit: "per year",
    includes: ["White-labelled open calls and programmes", "Cohort and residency management", "Impact reporting for boards and funders", "A dedicated partnership lead"],
    when: "Annual agreement, scoped with each partner.",
    icon: "building",
  },
  {
    id: "commission",
    title: "Marketplace commission",
    audience: ["collectors"],
    payer: "Deducted from artwork sales",
    price: "Existing rate",
    unit: "Artelia's current marketplace commission — unchanged by Connect",
    includes: ["Secure checkout and delivery", "Certificate and provenance record", "The artwork's story and legacy travel with it"],
    when: "Only when an artwork sells.",
    icon: "ticket",
  },
];

export const WORKSPACE_TIERS: { name: string; price: string; unit: string; for: string; includes: string[]; highlight?: boolean }[] = [
  {
    name: "Solo",
    price: "US$29",
    unit: "per month",
    for: "Independent curators and advisors",
    includes: ["Curator Desk pipeline for 2 live calls", "Portfolio review, tags and private notes", "Future-opportunity radar (consented artists)", "Basic analytics"],
  },
  {
    name: "Team",
    price: "US$99",
    unit: "per month · 5 seats",
    for: "Galleries and collectives",
    includes: ["Unlimited calls and shared review", "Artist and collector CRM", "Longlists, shortlists and comparisons", "Programme analytics"],
    highlight: true,
  },
  {
    name: "Institution",
    price: "From US$4,000",
    unit: "per year · unlimited seats",
    for: "Museums, foundations and biennales",
    includes: ["Everything in Team", "Jury workflows and conflict-of-interest checks", "Commission and project oversight", "Exportable reporting"],
  },
];
