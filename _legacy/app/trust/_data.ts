/** Route-local mock data for the Trust & safety centre. */

export const MY_VERIFICATION = [
  { label: "Identity", detail: "Government ID matched to a live selfie check", date: "Verified 3 Jun 2026" },
  { label: "Professional practice", detail: "Exhibition record (Lagos Biennale 2024, Rele Gallery group show) and two studio references", date: "Verified 11 Jun 2026" },
  { label: "Payout details", detail: "Bank account name matches your verified identity", date: "Verified 11 Jun 2026" },
];

export const WHO_IS_VERIFIED: { who: string; personId?: string; checks: string[]; why: string }[] = [
  {
    who: "Curators",
    personId: "halima",
    checks: ["Identity document + live check", "Two exhibitions or publications we can confirm", "A reference from an institution or gallery"],
    why: "Only verified curators can publish open calls or search for artists.",
  },
  {
    who: "Galleries",
    personId: "nomvula",
    checks: ["Business registration", "A physical address we have confirmed", "Director's identity", "Artist payment history, where available"],
    why: "Galleries handle consignment and money, so we check the business behind the name.",
  },
  {
    who: "Institutions & brands",
    personId: "kofi",
    checks: ["Legal registration or charity number", "A named programme lead with verified identity", "Source of the commissioning budget"],
    why: "Calls from institutions carry weight — applicants deserve to know they are real.",
  },
  {
    who: "High-value commissioners",
    checks: ["Identity and proof of funds for commissions above US$5,000", "Budget held in escrow, or a signed agreement", "No payment asked of the artist, ever"],
    why: "Large commissions are where artists lose the most when things go wrong.",
  },
];

export const LABEL_EXAMPLES = [
  { source: "verified" as const, example: "Halima Sani has curated six exhibitions since 2018 — checked against published catalogues." },
  { source: "self-declared" as const, example: "Kwame Mensah: “Available for mural commissions from November.” — his own words, not checked by us." },
  { source: "ai" as const, example: "“You and Moussa Diallo both work with migration and memory.” — a suggestion from matching that you can dismiss." },
];

export const MATCH_SIGNALS = [
  "What you told us you're here for (your connection intent)",
  "Your declared practice, themes and materials",
  "Creative DNA inferred from rooms and stories — only with your consent",
  "Availability, geography and language",
  "Readiness and collaboration preferences",
  "Verification status of the other person",
];

export const NEVER_USED = [
  "Anything from Creative Wellbeing — check-ins, reflections, mood canvases",
  "Follower counts or popularity (we don't have any)",
  "How much you've spent or earned",
  "Private journal entries, unless you switch that on",
];

export const DATA_PROMISES = [
  { title: "We never sell your data.", body: "Not to advertisers, brokers, galleries or anyone else. Not in aggregate, not 'anonymised'." },
  { title: "Wellbeing data stays yours alone.", body: "It is never sold, never used for advertising, and never used to rank you for opportunities or introductions. The AI does not diagnose." },
  { title: "No advertising based on your behaviour.", body: "Artelia earns from professional tools and successful outcomes, not attention. See how on the membership page." },
  { title: "You can see and delete what we hold.", body: "Download everything, or delete your account and its data. Wellbeing data can be deleted separately, instantly." },
  { title: "AI is labelled, explained and optional.", body: "Every AI suggestion says why it was made. You can dismiss it, correct it, or turn inference off." },
];

export const EVIDENCE = [
  { date: "2 Sep 2026 · 10:14 WAT", item: "Indigo Crossing — final images uploaded", proof: "Fingerprint 3f9a…c21e", href: "/stories/indigo-crossing" },
  { date: "28 Aug 2026 · 16:40 WAT", item: "Salt Water Memory — charter signed (50:50 rights with Moussa Diallo)", proof: "Signed by both parties", href: "/studio/salt-water-memory" },
  { date: "19 Aug 2026 · 09:02 WAT", item: "Salt Water Memory — first dye-test panels logged in the contribution ledger", proof: "Ledger entry #4", href: "/studio/salt-water-memory" },
  { date: "12 Aug 2026 · 18:25 WAT", item: "Threads of Return — application statement submitted", proof: "Fingerprint a71d…09bf", href: "/applications" },
];

export const WARNING_SIGNS = [
  "You're asked to pay before any selection — an 'entry', 'hanging' or 'processing' fee.",
  "The organiser isn't verified, or their name doesn't match the account messaging you.",
  "No budget, fee or rights are stated.",
  "Pressure to decide fast: 'only 24 hours left', 'you've been specially chosen'.",
  "Requests to move to WhatsApp, Telegram or personal email before anything is agreed.",
  "They want full-resolution files or all rights, forever, for 'exposure'.",
];

export const STANDARDS: { title: string; body: string; examples: string }[] = [
  {
    title: "Harassment",
    body: "No intimidation, unwanted advances, pile-ons or threats — in rooms, circles, messages or project spaces.",
    examples: "Repeated messages after someone has said no; mocking an artist's accent in a room.",
  },
  {
    title: "Exploitation",
    body: "No unpaid labour disguised as opportunity, no fees charged to artists to be seen, no unfair terms pushed on early-career members.",
    examples: "Asking an emerging artist to 'collaborate' on a brand campaign for free; pay-to-exhibit schemes.",
  },
  {
    title: "Plagiarism",
    body: "Credit the work you build on. Don't present someone else's images, designs or ideas as your own.",
    examples: "Reposting another artist's photographs in your portfolio; copying a pattern from a shared idea canvas.",
  },
  {
    title: "Cultural appropriation",
    body: "Engage with living traditions with care and credit. Sacred or restricted forms need the community's consent.",
    examples: "Selling reproductions of a restricted ritual motif; using adire patterns without naming their origin.",
  },
  {
    title: "Misrepresentation",
    body: "Be who you say you are. Don't invent exhibitions, credentials, provenance or prizes.",
    examples: "Claiming a museum acquisition that didn't happen; posing as a curator to request artworks.",
  },
];

export const REVIEW_TIMELINE = [
  { step: "Report or flag received", time: "Immediately", body: "Automated checks can hide a suspicious call from new applicants, but never make the final decision." },
  { step: "A trained person reviews", time: "Within 24–48 hours", body: "Reviewers are trained in African art contexts and can call in a regional advisor." },
  { step: "Decision, with reasons", time: "Within 3 days", body: "You're told what was decided, why, which standard applies, and how to appeal." },
  { step: "You can appeal", time: "Up to 14 days after", body: "Add context, evidence or cultural background the first reviewer may have missed." },
  { step: "Fresh senior review", time: "Within 7 days", body: "A different, senior reviewer decides. Their reasons are shared with you in plain language." },
];
