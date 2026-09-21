import type { Circle, Introduction, PresenceRoom } from "@/lib/types";
import { IMG } from "./images";

/** Meaningful Matching for the signed-in member. Every card explains itself. */
export const INTRODUCTIONS: Introduction[] = [
  {
    id: "intro-moussa",
    personId: "moussa",
    kind: "collaborator",
    headline: "A sound artist working on the same questions you are",
    complementarity: "complementary",
    reasons: [
      { text: "You both explore migration and memory in your recent work.", source: "ai" },
      { text: "Textile and sound: different languages for the same theme — a productive difference.", source: "ai" },
      { text: "Both of you marked yourselves open to cross-border installation work.", source: "self-declared" },
      { text: "Moussa's last two installations were exhibited in Dakar and Lisbon.", source: "verified" },
    ],
    fit: { availability: "Open to new projects", geography: "Dakar ↔ Lagos · remote-first", language: "English shared", readiness: "Both mid-career" },
    suggestedOpener: "Your harbour recordings made me think of the indigo cloth my grandmother carried from Kano — could fabric and sound hold the same journey?",
  },
  {
    id: "intro-chidi",
    personId: "chidi",
    kind: "collector",
    headline: "A collector who follows the histories your work draws on",
    complementarity: "similar",
    reasons: [
      { text: "Chidi collects northern Nigerian textile art — your practice draws on the same histories.", source: "ai" },
      { text: "Supported four emerging artists on Artelia this year, including two studio commissions.", source: "verified" },
      { text: "Says he wants to understand artists before buying.", source: "self-declared" },
    ],
    fit: { availability: "Open to studio visits", geography: "London (diaspora)", language: "English, Igbo", readiness: "Long-term patron" },
    suggestedOpener: "I'd love to show you the dye pits behind my new series on a virtual studio visit.",
  },
  {
    id: "intro-halima",
    personId: "halima",
    kind: "curator",
    headline: "A curator building a show around textile & fibre",
    complementarity: "similar",
    reasons: [
      { text: "Halima is curating “Threads of Return” and runs a verified open call.", source: "verified" },
      { text: "Your practice matches the call's eligible media and geography.", source: "ai" },
    ],
    fit: { availability: "Reviewing portfolios this month", geography: "Abuja", language: "English", readiness: "Established curator" },
    suggestedOpener: "I've applied to Threads of Return and would value five minutes on how you read installation proposals.",
  },
  {
    id: "intro-tunde",
    personId: "tunde",
    kind: "mentor",
    headline: "An emerging painter asking for a mentor in large-format work",
    complementarity: "complementary",
    reasons: [
      { text: "Tunde asked for mentorship in large-format and installation work.", source: "self-declared" },
      { text: "You've documented six large installations in your stories.", source: "verified" },
      { text: "You both said you sometimes feel creatively isolated.", source: "self-declared" },
    ],
    fit: { availability: "Wants a monthly call", geography: "Ibadan · 2 hrs from Lagos", language: "English, Yoruba", readiness: "Emerging" },
    suggestedOpener: "Happy to look at your large canvases — what's the hardest part of working at that size alone?",
  },
  {
    id: "intro-wanjiru",
    personId: "wanjiru",
    kind: "peer",
    headline: "A photographer who prints on market cloth",
    complementarity: "complementary",
    reasons: [
      { text: "Wanjiru prints photographs onto market cloth; you dye and weave it.", source: "ai" },
      { text: "Both of you joined the Textiles Circle's “Cloth as archive” thread.", source: "verified" },
    ],
    fit: { availability: "Limited until November", geography: "Nairobi", language: "English", readiness: "Both mid-career" },
    suggestedOpener: "Your cloth prints and my dye work might meet somewhere interesting — how do you source your fabric?",
  },
];

export const ROOMS: PresenceRoom[] = [
  { id: "home", title: "What does home mean in African art?", theme: "Home & belonging", facilitatorId: "halima", participantIds: ["halima", "kwame", "zuri", "tunde"], capacity: 6, when: "Today · 18:00 WAT", durationMin: 45, format: "video", circleId: "diaspora", language: "English", prompts: ["Bring one object that means home to you.", "Where does home show up in a work you love?", "Can a place you've never lived feel like home?"] },
  { id: "fashion", title: "Women redefining African fashion", theme: "Fashion", facilitatorId: "ayo", participantIds: ["ayo", "adaeze", "ines", "wanjiru", "zuri", "halima"], capacity: 6, when: "Today · 20:00 WAT", durationMin: 60, format: "video", circleId: "fashion", language: "English", prompts: ["Who taught you to see clothing as art?", "What should stay handmade?"] },
  { id: "memory", title: "Photography and memory", theme: "Photography", facilitatorId: "wanjiru", participantIds: ["wanjiru", "moussa", "leila"], capacity: 6, when: "Tomorrow · 17:00 EAT", durationMin: 45, format: "voice", circleId: "photography", language: "English", prompts: ["A photograph you wish existed.", "Who owns a family archive?"] },
  { id: "masks", title: "The spirituality of masks", theme: "Traditional arts", facilitatorId: "leila", participantIds: ["leila", "kofi", "fatima", "chidi", "kwame"], capacity: 6, when: "Thu · 19:00 EET", durationMin: 60, format: "video", circleId: "traditional", language: "English", prompts: ["Should a mask ever sit behind glass?", "What changes when a ritual object is sold?"] },
  { id: "collecting", title: "The business of collecting", theme: "Collecting", facilitatorId: "chidi", participantIds: ["chidi", "zuri"], capacity: 6, when: "Sat · 11:00 BST", durationMin: 45, format: "video", circleId: "collectors", language: "English", prompts: ["Your first purchase — and what it taught you.", "How do you price something that moved you?"] },
  { id: "bronze", title: "The future of the Benin Bronzes", theme: "Heritage & restitution", facilitatorId: "kofi", participantIds: ["kofi", "leila", "halima", "moussa"], capacity: 6, when: "Sun · 16:00 GMT", durationMin: 60, format: "voice", circleId: "traditional", language: "English", prompts: ["Who should decide where they live?", "What does return make possible?"] },
];

const guidelines = ["Critique the work, never the person.", "Ask before sharing someone's images outside the circle.", "Credit ideas you build on.", "Moderators step in on harassment, plagiarism or appropriation."];

export const CIRCLES: Circle[] = [
  { id: "textiles", name: "Textiles", practice: "Textiles", image: IMG.textile, description: "Dyers, weavers and fibre artists sharing process, sources and critique.", moderatorIds: ["adaeze", "ayo"], nextGathering: "Portfolio review · Wed 18:00 WAT", isMember: true, guidelines, threads: [
    { id: "t1", title: "Cloth as archive: what does fabric remember?", authorId: "wanjiru", kind: "discussion", replies: 23, lastActive: "2h ago" },
    { id: "t2", title: "Feedback please — indigo resist test, round 3", authorId: "adaeze", kind: "feedback", replies: 9, lastActive: "5h ago" },
    { id: "t3", title: "Threads of Return open call — who's applying?", authorId: "halima", kind: "opportunity", replies: 14, lastActive: "Yesterday" },
    { id: "t4", title: "Looking for a mentor in natural dyes", authorId: "tunde", kind: "mentorship", replies: 4, lastActive: "2 days ago" },
  ] },
  { id: "fashion", name: "African Fashion", practice: "Fashion", image: IMG.fashion, description: "Designers, tailors and stylists redefining African fashion.", moderatorIds: ["ayo"], nextGathering: "Presence Room · Today 20:00 WAT", isMember: true, guidelines, threads: [
    { id: "f1", title: "Adire sourcing that pays dyers fairly", authorId: "ayo", kind: "discussion", replies: 17, lastActive: "1h ago" },
  ] },
  { id: "photography", name: "Photography", practice: "Photography", image: IMG.photography, description: "Image-makers working with memory, archives and the everyday.", moderatorIds: ["wanjiru"], nextGathering: "Photo walk · Sat 07:00 EAT", isMember: false, guidelines, threads: [
    { id: "p1", title: "Printing on cloth: what's worked for you?", authorId: "wanjiru", kind: "discussion", replies: 11, lastActive: "3h ago" },
  ] },
  { id: "ceramics", name: "Ceramics", practice: "Ceramics", image: IMG.ceramics, description: "Potters and ceramicists across craft lineages.", moderatorIds: ["fatima"], nextGathering: "Kiln talk · Fri 16:00 WET", isMember: false, guidelines, threads: [
    { id: "c1", title: "Local clays and what they teach you", authorId: "fatima", kind: "discussion", replies: 8, lastActive: "Yesterday" },
  ] },
  { id: "digital", name: "Digital Art", practice: "Digital", image: IMG.illustration, description: "Illustrators, animators and digital painters.", moderatorIds: ["kwame"], nextGathering: "Crit night · Thu 19:00 GMT", isMember: false, guidelines, threads: [] },
  { id: "collectors", name: "Collectors", practice: "Collecting", image: IMG.meaningfulCollecting, description: "Collectors and patrons learning together — first purchase to lifelong patronage.", moderatorIds: ["chidi"], nextGathering: "Presence Room · Sat 11:00 BST", isMember: false, guidelines, threads: [] },
  { id: "curators", name: "Curators", practice: "Curation", image: IMG.framedPrints, description: "Curators comparing notes on calls, shows and fair selection.", moderatorIds: ["halima"], nextGathering: "Open-call clinic · Mon 12:00 WAT", isMember: false, guidelines, threads: [] },
  { id: "diaspora", name: "Diaspora", practice: "Community", image: IMG.culturalDepth, description: "For Africans abroad and the ones who came home.", moderatorIds: ["chidi", "halima"], nextGathering: "Presence Room · Today 18:00 WAT", isMember: true, guidelines, threads: [] },
  { id: "young", name: "Young Artists", practice: "Community", image: IMG.drawing, description: "First five years of practice — peer support, portfolio feedback, credible opportunities.", moderatorIds: ["kwame"], nextGathering: "Portfolio swap · Tue 18:00 WAT", isMember: false, guidelines, threads: [
    { id: "y1", title: "Is this open call legit? (checklist inside)", authorId: "tunde", kind: "opportunity", replies: 12, lastActive: "4h ago" },
  ] },
  { id: "traditional", name: "Traditional Arts", practice: "Heritage", image: IMG.nok1, description: "Masks, bronzes, beadwork and the living traditions behind them.", moderatorIds: ["leila"], nextGathering: "Presence Room · Thu 19:00 EET", isMember: false, guidelines, threads: [] },
];

export function getRoom(id: string) {
  return ROOMS.find((room) => room.id === id);
}
export function getCircle(id: string) {
  return CIRCLES.find((circle) => circle.id === id);
}
