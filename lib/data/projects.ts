import type { Project, ProjectStage } from "@/lib/types";
import { IMG } from "./images";

/** The Collaboration Studio's seven stages, idea to legacy. */
export const PROJECT_STAGES: { id: ProjectStage; label: string; outcome: string }[] = [
  { id: "discover", label: "Discover", outcome: "Relevant people and opportunities surface without follower counts." },
  { id: "imagine", label: "Imagine", outcome: "Test an idea privately before committing." },
  { id: "agree", label: "Agree", outcome: "A collaboration charter protects everyone." },
  { id: "create", label: "Create", outcome: "Work progresses in one organised room." },
  { id: "present", label: "Present", outcome: "The work reaches audiences coherently." },
  { id: "share-value", label: "Share value", outcome: "Commercial terms stay visible and accountable." },
  { id: "preserve", label: "Preserve", outcome: "Every contributor becomes part of the work's legacy." },
];

const noSignatures = (ids: string[]) => ids.map((personId) => ({ personId, date: null }));

export const PROJECTS: Project[] = [
  {
    id: "salt-water-memory", title: "Salt Water Memory", kind: "cross-disciplinary", image: IMG.textile, stage: "create", memberIds: ["adaeze", "moussa"], currency: "USD",
    summary: "An installation of indigo cloth panels that play harbour and market recordings as you walk between them — the journey from Kano to Dakar to Lagos.",
    idea: { prompt: "What does a journey sound like after it's been folded into cloth?", references: ["Grandmother's wrapper, Kano, 1971", "Dakar harbour at 5am (field recording)", "Lagos Marina market"], questions: [
      { q: "What is non-negotiable for you in this project?", answers: [{ personId: "adaeze", text: "The dye comes from the pits in Kano, not a supplier." }, { personId: "moussa", text: "Sound stays spatial — no headphones." }] },
      { q: "How do you like to make decisions?", answers: [{ personId: "adaeze", text: "Slowly, with samples on the wall." }, { personId: "moussa", text: "In the room, out loud." }] },
    ] },
    charter: {
      roles: [{ personId: "adaeze", role: "Textile lead", contribution: "Dyeing, weaving, panel fabrication" }, { personId: "moussa", role: "Sound lead", contribution: "Field recordings, composition, speaker design" }],
      backgroundIp: "Each artist keeps full ownership of work, techniques and recordings made before the project.",
      newIp: "The installation and its new recordings are co-owned 50:50.",
      credit: "“Adaeze Nwosu & Moussa Diallo” — alphabetical, equal size, everywhere the work appears.",
      decisionRights: "Creative decisions by consensus; each lead has final say inside their medium.",
      expenses: "Shared 50:50 from the production budget; anything over budget needs both approvals.",
      revenueShare: [{ personId: "adaeze", share: 50 }, { personId: "moussa", share: 50 }],
      permittedUses: ["Exhibition", "Sale of the full installation", "Press & portfolio images", "Documentation film (non-commercial)"],
      exit: "Either artist can leave with 30 days' notice; work to date stays co-owned and credited.",
      signed: [{ personId: "adaeze", date: "Sep 3" }, { personId: "moussa", date: "Sep 4" }],
    },
    tasks: [
      { id: "t1", title: "Dye 12 indigo panels (Kano pits)", assigneeId: "adaeze", status: "doing", due: "Oct 10" },
      { id: "t2", title: "Record Dakar harbour dawn session", assigneeId: "moussa", status: "done", due: "Sep 20" },
      { id: "t3", title: "Speaker placement test in Lagos studio", assigneeId: "moussa", status: "todo", due: "Oct 18" },
      { id: "t4", title: "Weave panel 4–6 with salvaged fabric", assigneeId: "adaeze", status: "todo", due: "Oct 25" },
      { id: "t5", title: "Budget check with gallery", assigneeId: "adaeze", status: "done", due: "Sep 15" },
    ],
    milestones: [
      { id: "m1", title: "Charter signed", date: "Sep 4", status: "done", approvals: [{ personId: "adaeze", approved: true }, { personId: "moussa", approved: true }] },
      { id: "m2", title: "Material samples approved", date: "Sep 28", status: "done", approvals: [{ personId: "adaeze", approved: true }, { personId: "moussa", approved: true }] },
      { id: "m3", title: "First full panel with sound", date: "Oct 20", status: "current", approvals: [{ personId: "adaeze", approved: false }, { personId: "moussa", approved: true }] },
      { id: "m4", title: "Install & opening", date: "Mar 2027", status: "upcoming", approvals: [] },
    ],
    files: [
      { name: "dakar-harbour-0512.wav", kind: "audio", by: "moussa", date: "Sep 20" },
      { name: "indigo-panel-test-3.jpg", kind: "image", by: "adaeze", date: "Sep 26" },
      { name: "floorplan-v2.pdf", kind: "doc", by: "moussa", date: "Sep 30" },
      { name: "studio-walkthrough.mp4", kind: "video", by: "adaeze", date: "Oct 2" },
    ],
    budget: [{ label: "Indigo & fabric", amount: 1800, paidBy: "adaeze" }, { label: "Speakers & amplifiers", amount: 2200, paidBy: "moussa" }, { label: "Travel Dakar–Lagos", amount: 900, paidBy: "moussa" }],
    payments: [{ personId: "adaeze", amount: 4000, status: "scheduled" }, { personId: "moussa", amount: 4000, status: "scheduled" }],
    ledger: [
      { date: "Aug 29", personId: "adaeze", contribution: "Opened idea canvas with the Kano wrapper story" },
      { date: "Aug 30", personId: "moussa", contribution: "Added harbour recordings as references" },
      { date: "Sep 4", personId: "moussa", contribution: "Signed charter (50:50)" },
      { date: "Sep 20", personId: "moussa", contribution: "Recorded Dakar harbour dawn session" },
      { date: "Sep 26", personId: "adaeze", contribution: "Dyed first three indigo panels" },
    ],
  },
  {
    id: "market-light", title: "Market Light", kind: "artist-led", image: IMG.photography, stage: "agree", memberIds: ["wanjiru", "ayo", "adaeze"], currency: "USD",
    summary: "A photography and fashion editorial: Ayo's adire tailoring photographed by Wanjiru in markets at dawn, printed on Adaeze's cloth.",
    idea: { prompt: "Can an editorial be sold as art without losing the market it came from?", references: ["Gikomba market, 5:40am", "Adire from Abeokuta"], questions: [] },
    charter: {
      roles: [{ personId: "wanjiru", role: "Photographer", contribution: "Shoot & prints" }, { personId: "ayo", role: "Designer", contribution: "Garments & styling" }, { personId: "adaeze", role: "Textile", contribution: "Print cloth" }],
      backgroundIp: "Each keeps prior work.", newIp: "Photographs owned by Wanjiru; garments by Ayo; print cloth by Adaeze.", credit: "Listed by role on every print.", decisionRights: "Each lead decides within their medium.",
      expenses: "Split by role budget.", revenueShare: [{ personId: "wanjiru", share: 40 }, { personId: "ayo", share: 35 }, { personId: "adaeze", share: 25 }], permittedUses: ["Editorial", "Limited print edition of 20"], exit: "30 days' notice.",
      signed: [{ personId: "wanjiru", date: "Oct 1" }, { personId: "ayo", date: null }, { personId: "adaeze", date: null }],
    },
    tasks: [], milestones: [], files: [], budget: [], payments: [], ledger: [{ date: "Sep 28", personId: "wanjiru", contribution: "Proposed the collaboration from an introduction" }],
  },
  {
    id: "clay-and-rain", title: "Clay & Rain", kind: "cross-disciplinary", image: IMG.ceramics, stage: "imagine", memberIds: ["fatima", "sipho"], currency: "USD",
    summary: "A ceramicist and an architect testing vessels that collect rainwater in public courtyards.",
    idea: { prompt: "What if a courtyard's drainage was a sculpture?", references: ["Marrakech riad cisterns", "Cape Town drought, 2018"], questions: [{ q: "Where should this live first?", answers: [{ personId: "fatima", text: "A school courtyard." }] }] },
    charter: { roles: [], backgroundIp: "", newIp: "", credit: "", decisionRights: "", expenses: "", revenueShare: [], permittedUses: [], exit: "", signed: noSignatures(["fatima", "sipho"]) },
    tasks: [], milestones: [], files: [], budget: [], payments: [], ledger: [{ date: "Oct 2", personId: "fatima", contribution: "Opened a private idea canvas" }],
  },
  {
    id: "foundation-atrium", title: "Foundation Atrium Commission", kind: "institutional-commission", image: IMG.studioWide, stage: "present", memberIds: ["kwame", "kofi"], currency: "USD",
    summary: "A 6-metre painted frieze of Accra families for the West Africa Arts Foundation's new home.",
    idea: { prompt: "Heritage that looks forward.", references: [], questions: [] },
    charter: { roles: [{ personId: "kwame", role: "Artist", contribution: "Frieze" }, { personId: "kofi", role: "Commissioner", contribution: "Brief, budget, install" }], backgroundIp: "Artist keeps prior work.", newIp: "Foundation owns the object; artist keeps copyright.", credit: "Artist credited in perpetuity.", decisionRights: "Milestone approvals by both.", expenses: "Covered by the Foundation.", revenueShare: [{ personId: "kwame", share: 100 }], permittedUses: ["Permanent display", "Press"], exit: "Paid to last approved milestone.", signed: [{ personId: "kwame", date: "May 2" }, { personId: "kofi", date: "May 2" }] },
    tasks: [], milestones: [], files: [], budget: [], payments: [{ personId: "kwame", amount: 15000, status: "paid" }], ledger: [],
  },
  {
    id: "ancestral-frequencies", title: "Ancestral Frequencies", kind: "curator-call", image: IMG.sculpture, stage: "preserve", memberIds: ["moussa", "ines", "leila"], currency: "USD",
    summary: "A performance of sound, dance and spoken research, now a permanent record with every contributor credited.",
    idea: { prompt: "", references: [], questions: [] },
    charter: { roles: [], backgroundIp: "", newIp: "Co-owned in thirds.", credit: "All three, equal.", decisionRights: "", expenses: "", revenueShare: [{ personId: "moussa", share: 34 }, { personId: "ines", share: 33 }, { personId: "leila", share: 33 }], permittedUses: [], exit: "", signed: [] },
    tasks: [], milestones: [], files: [], budget: [], payments: [{ personId: "moussa", amount: 2040, status: "paid" }, { personId: "ines", amount: 1980, status: "paid" }, { personId: "leila", amount: 1980, status: "paid" }],
    ledger: [{ date: "Jan 14", personId: "leila", contribution: "Research script" }, { date: "Feb 2", personId: "ines", contribution: "Choreography" }, { date: "Feb 2", personId: "moussa", contribution: "Score" }],
  },
];

export function getProject(id: string) {
  return PROJECTS.find((project) => project.id === id);
}
