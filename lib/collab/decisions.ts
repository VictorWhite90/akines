"use client";

import { useCallback, useMemo } from "react";
import { aliasOf, ms, mutate, peek, reload, teamwork, tempId, useResource, type ApiDecision, type ApiTeamFile } from "@/lib/api/teamwork";
import { DEMO } from "@/lib/demo/mode";
import { useLocal, newId } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import { fileSize } from "@/lib/collab/proof";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * A project's decisions, as the product design shows them (components/collaborate/workspace/decisions): a
 * proposal with options, the context behind it, the team's acknowledgements and, once decided, the outcome.
 * They are their own resource (lib/api/teamwork.ts, /api/v1/teamwork/projects/:id/…):
 *   GET    decisions                 → page of Decision (?view=pending|history|all)
 *   POST   decisions                 ← DecisionInput (+ file_ids)
 *   POST   decisions/:id/ack         (the member acknowledges; everyone has → approved)   DELETE: take it back
 *   POST   decisions/:id/comments    ← { text } (the discussion, also a conversation)
 *   POST   decisions/:id/outcome     ← { status, outcome } (the host)
 *   DELETE decisions/:id             (the proposer before anyone responds, or the host)
 * The demo keeps them in the browser, seeded with decisions about our sample projects.
 * Decided ones are part of the project's story: see `decisionStory`, which reads them next to the ledger.
 */

export type DecisionStatus = "proposed" | "discussion" | "awaiting" | "approved" | "rejected" | "superseded";
export const DECISION_STATUS: Record<DecisionStatus, string> = {
  proposed: "Proposed",
  discussion: "Under discussion",
  awaiting: "Awaiting acknowledgement",
  approved: "Approved",
  rejected: "Rejected",
  superseded: "Superseded",
};
export const isDecided = (s: DecisionStatus) => s === "approved" || s === "rejected" || s === "superseded";

export type DecisionOption = { title: string; good: string; watch: string };
export type DecisionFile = { name: string; meta: string; href?: string };
export type Decision = {
  id: string;
  projectId: string;
  /** The address of its page: /collaborate/my-projects/:id/decisions/:slug */
  slug: string;
  title: string;
  /** One line under the title. */
  summary: string;
  status: DecisionStatus;
  proposedBy: PersonId;
  proposedAt: number;
  decideBy?: number;
  /** A milestone title, when the decision belongs to one. */
  milestone?: string;
  /** Who has acknowledged it, in order. */
  acknowledged: PersonId[];
  /** The first option is the proposed one. */
  options: DecisionOption[];
  context?: string;
  problem?: string;
  direction?: string;
  files: DecisionFile[];
  discussion: { who: PersonId; text: string }[];
  outcome?: string;
  outcomeAt?: number;
};
export type DecisionInput = Pick<Decision, "title" | "summary"> & Partial<Pick<Decision, "decideBy" | "milestone" | "options" | "context" | "problem" | "direction">>;

const DAY = 24 * 60 * 60 * 1000;
const slugOf = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function seed(): Decision[] {
  const now = Date.now();
  const d = (x: Omit<Decision, "slug" | "files" | "discussion" | "options"> & Partial<Pick<Decision, "files" | "discussion" | "options">>): Decision => ({ files: [], discussion: [], options: [], ...x, slug: slugOf(x.title) });
  return [
    // Garki Clinic booking app: six people, the patient screens are waiting on how a booking is confirmed.
    d({
      id: "gc-dec1", projectId: "garki-clinic-booking", title: "Choose how patients confirm a booking", status: "awaiting",
      summary: "How a patient says yes to an appointment, so the reminder messages can be finished.",
      proposedBy: "kwame", proposedAt: now - 5 * DAY, decideBy: now + 2 * DAY, acknowledged: ["kwame", "chidi", "leila"],
      options: [
        { title: "Reply to the SMS", good: "Works on every phone, with no data.", watch: "Replies cost the clinic a little for each message." },
        { title: "Tap a link in the SMS", good: "Patients see the booking and can change it.", watch: "Needs data, which many patients ration." },
      ],
      context: "Patients get a reminder the day before. Many have basic phones and buy data a little at a time.",
      problem: "The reminder text and the admin screen cannot be finished until the team agrees how patients confirm.",
      direction: "Patients reply 1 to confirm or 2 to cancel. The front desk sees each answer on the daily list.",
      files: [{ name: "Booking-API.pdf", meta: "PDF, 420 KB, shared by Kwame Mensah" }, { name: "Reminder copy, day before", meta: "Note, added by Amara Okafor" }],
      discussion: [
        { who: "chidi", text: "Likes the reply option: it works on the cheap Android phones we tested." },
        { who: "leila", text: "Will write the Hausa version once the wording is agreed." },
        { who: "kwame", text: "Prefers replies and asked for a decision before the SMS gateway is set up." },
      ],
    }),
    d({
      id: "gc-dec2", projectId: "garki-clinic-booking", title: "Choose the phone we test accessibility on", status: "discussion",
      summary: "One phone that matches what most patients carry.",
      proposedBy: "chidi", proposedAt: now - 3 * DAY, decideBy: now + 6 * DAY, acknowledged: [],
      options: [
        { title: "A phone under ₦60,000", good: "Close to what most patients use.", watch: "Someone has to buy or borrow one." },
        { title: "The browser's phone view", good: "Free and quick.", watch: "Misses slow screens and small memory." },
      ],
      context: "The booking screens work on Chidi's phone, which is faster than most patients' phones.",
      problem: "The accessibility check needs a real phone before it can start.",
      direction: "Borrow a phone under ₦60,000 from the clinic staff for one week.",
      discussion: [{ who: "chidi", text: "Asked for a real Android phone below ₦60,000 to test on." }],
    }),
    d({
      id: "gc-dec3", projectId: "garki-clinic-booking", title: "Agree when the Hausa reminders go live", status: "proposed",
      summary: "Whether Hausa reminders launch with the app or a week after.",
      proposedBy: "leila", proposedAt: now - 1 * DAY, decideBy: now + 9 * DAY, acknowledged: [],
      options: [
        { title: "With the launch", good: "Every patient is reached from day one.", watch: "Less time for a nurse to check the wording." },
        { title: "A week after", good: "A nurse checks every message first.", watch: "Hausa speakers get English reminders at first." },
      ],
      context: "The English reminders are written. The Hausa ones need a nurse to check them.",
      direction: "Launch with Hausa reminders, checked by a nurse the week before.",
    }),
    d({
      id: "gc-dec4", projectId: "garki-clinic-booking", title: "Send reminders the day before, not the same morning", status: "approved",
      summary: "When patients get their reminder.", proposedBy: ME, proposedAt: now - 20 * DAY, acknowledged: ["amara", "ayo", "kwame", "chidi", "wanjiru", "leila"],
      outcome: "Reminders go out at 6 PM the day before.", outcomeAt: now - 18 * DAY,
    }),
    d({
      id: "gc-dec5", projectId: "garki-clinic-booking", title: "Build a phone app instead of a website", status: "rejected",
      summary: "Whether patients install an app to book.", proposedBy: "kwame", proposedAt: now - 23 * DAY, acknowledged: ["amara", "ayo", "kwame", "chidi", "wanjiru", "leila"],
      outcome: "A website and SMS reach more patients than an app they must install.", outcomeAt: now - 21 * DAY,
    }),
    d({
      id: "gc-dec6", projectId: "garki-clinic-booking", title: "Use one booking form for every doctor", status: "superseded",
      summary: "One form, or one per doctor.", proposedBy: "ayo", proposedAt: now - 16 * DAY, acknowledged: ["amara", "ayo", "kwame", "chidi", "leila"],
      outcome: "Replaced by the doctor picker in the booking flow.", outcomeAt: now - 14 * DAY,
    }),

    // Market Light: three people, the book is in layout.
    d({
      id: "ml-dec1", projectId: "market-light", title: "Choose the paper for the book", status: "awaiting",
      summary: "The paper the 200 copies are printed on, so the printers can quote.",
      proposedBy: "wanjiru", proposedAt: now - 4 * DAY, decideBy: now + 3 * DAY, milestone: "Layout signed off by all three", acknowledged: ["wanjiru", "efua"],
      options: [
        { title: "Uncoated matte", good: "Warm, and the portraits feel close.", watch: "Colours print a little softer." },
        { title: "Silk coated", good: "Sharp colour in the fabric photos.", watch: "Shine under the market lights." },
      ],
      context: "The portraits are warm and full of fabric colour. The book is handed out at the market.",
      problem: "The printing quotes cannot be compared until the paper is chosen.",
      direction: "Uncoated matte, with one test print of spread 3 before the full run.",
      files: [{ name: "Spread 3 draft", meta: "Image, added by Amara Okafor" }],
      discussion: [
        { who: "efua", text: "Prefers matte: the traders will hold it in daylight." },
        { who: "wanjiru", text: "Asked for a test print before Saturday." },
      ],
    }),
    d({
      id: "ml-dec2", projectId: "market-light", title: "Agree the launch day at the market", status: "discussion",
      summary: "A market day when the traders can come.", proposedBy: "efua", proposedAt: now - 2 * DAY, decideBy: now + 8 * DAY, milestone: "Launch at the market", acknowledged: [],
      options: [
        { title: "Saturday 7 December", good: "The busiest day, so many people see it.", watch: "Traders have less time to stop." },
        { title: "Sunday 8 December", good: "Traders can stay for the launch.", watch: "Fewer shoppers walk past." },
      ],
      discussion: [{ who: "efua", text: "Three traders said Saturday is too busy for them." }],
    }),
    d({
      id: "ml-dec3", projectId: "market-light", title: "Keep each caption under 30 words", status: "approved",
      summary: "How long a trader's caption can be.", proposedBy: "efua", proposedAt: now - 5 * DAY, milestone: "Interviews written up", acknowledged: ["efua", "amara", "wanjiru"],
      outcome: "First name, stall, years at the market, and one sentence in their own words.", outcomeAt: now - 4 * DAY,
    }),
    d({
      id: "ml-dec4", projectId: "market-light", title: "Use Mama Ngozi at her stall for the cover", status: "approved",
      summary: "The cover photo.", proposedBy: "efua", proposedAt: now - 7 * DAY, milestone: "Layout signed off by all three", acknowledged: ["efua", "wanjiru", "amara"],
      outcome: "Mama Ngozi at her stall is the cover.", outcomeAt: now - 6 * DAY,
    }),
  ];
}

const KEY = "ak:collab-decisions:v1";
const BY_TIME = (a: Decision, b: Decision) => a.proposedAt - b.proposedAt;

/** A project's decisions, and what the member can do with them. */
function useLocalDecisions(projectId: string) {
  const [all, setAll, ready] = useLocal<Decision[]>(KEY, seed());
  const list = useMemo(() => all.filter((x) => x.projectId === projectId), [all, projectId]);
  const pending = useMemo(() => list.filter((x) => !isDecided(x.status)).sort(BY_TIME), [list]);
  const history = useMemo(() => list.filter((x) => isDecided(x.status)).sort((a, b) => (b.outcomeAt ?? 0) - (a.outcomeAt ?? 0)), [list]);
  /** Waiting for the member's acknowledgement. */
  const awaitingMe = useMemo(() => pending.filter((x) => x.status === "awaiting" && !x.acknowledged.includes(ME)), [pending]);
  const edit = useCallback((id: string, fn: (d: Decision) => Decision) => setAll((cur) => cur.map((x) => (x.id === id ? fn(structuredClone(x)) : x))), [setAll]);

  return {
    ready,
    list,
    pending,
    history,
    awaitingMe,
    get: (slug: string) => list.find((x) => x.slug === slug || x.id === slug),
    /** The member acknowledges. When everyone has, the proposed option is the outcome. */
    acknowledge: (id: string, teamSize: number) => edit(id, (d) => {
      if (!d.acknowledged.includes(ME)) d.acknowledged.push(ME);
      if (d.acknowledged.length >= teamSize) { d.status = "approved"; d.outcomeAt = Date.now(); d.outcome ??= d.options[0]?.title ?? d.direction; }
      return d;
    }),
    /** Undo an acknowledgement (the toast's Undo). */
    restore: (prev: Decision) => setAll((cur) => cur.map((x) => (x.id === prev.id ? prev : x))),
    propose: (input: DecisionInput) => {
      const dec: Decision = { options: [], files: [], discussion: [], ...input, id: newId("dec"), projectId, slug: `${slugOf(input.title)}-${Date.now().toString(36).slice(-4)}`, status: "proposed", proposedBy: ME, proposedAt: Date.now(), acknowledged: [] };
      setAll((cur) => [...cur, dec]);
      return dec;
    },
    remove: (id: string) => setAll((cur) => cur.filter((x) => x.id !== id)),
    /** Adds to the decision's discussion. */
    comment: (id: string, text: string) => edit(id, (d) => { d.discussion.push({ who: ME, text }); if (d.status === "proposed" && d.proposedBy !== ME) d.status = "discussion"; return d; }),
    /** The host records the outcome. */
    decide: (id: string, status: "approved" | "rejected" | "superseded", outcome = "") => edit(id, (d) => ({ ...d, status, outcome: outcome || d.outcome || d.direction || d.title, outcomeAt: Date.now() })),
  };
}

// ── On the backend ──────────────────────────────────────────────────────────────────────────

const typeName = (f: ApiTeamFile) => (f.kind === "document" ? "Document" : f.type?.startsWith("image/") ? "Image" : f.type === "application/pdf" ? "PDF" : "File");
const nameOfPerson = (id: string | null) => (id ? PEOPLE[id as PersonId]?.name ?? "A member" : "A deleted member");
export const decisionFileFromApi = (f: ApiTeamFile): DecisionFile => ({
  name: f.name, href: f.url ?? undefined,
  meta: [typeName(f), f.size ? fileSize(f.size) : null, `shared by ${nameOfPerson(f.by)}`].filter(Boolean).join(", "),
});
const who = (id: string | null) => (id ?? "akines") as PersonId;

export function decisionFromApi(projectId: string, d: ApiDecision): Decision {
  return {
    id: d.id, projectId, slug: d.slug, title: d.title, summary: d.summary, status: d.status, proposedBy: who(d.proposed_by),
    proposedAt: Date.parse(d.proposed_at), decideBy: ms(d.decide_by), milestone: d.milestone || undefined,
    acknowledged: d.acknowledged.filter((x): x is string => !!x) as PersonId[], options: d.options,
    context: d.context || undefined, problem: d.problem || undefined, direction: d.direction || undefined,
    files: d.files.map(decisionFileFromApi), discussion: d.discussion.map((m) => ({ who: who(m.by), text: m.text })),
    outcome: d.outcome || undefined, outcomeAt: ms(d.outcome_at),
  };
}

export const decisionsKey = (projectId: string) => `tw:decisions:${projectId}`;
/** The project's decisions as the backend last told us (for other teamwork modules, e.g. conversations). */
export const knownDecisions = (projectId: string) => peek<Decision[]>(decisionsKey(projectId)) ?? [];
const NONE: Decision[] = [];

function useRemoteDecisions(projectId: string) {
  const key = projectId ? decisionsKey(projectId) : null;
  const loaded = useResource<Decision[]>(key, async () => (await teamwork.decisions(projectId))?.map((d) => decisionFromApi(projectId, d)));
  const list = loaded ?? NONE;
  const pending = useMemo(() => list.filter((x) => !isDecided(x.status)).sort(BY_TIME), [list]);
  const history = useMemo(() => list.filter((x) => isDecided(x.status)).sort((a, b) => (b.outcomeAt ?? 0) - (a.outcomeAt ?? 0)), [list]);
  const awaitingMe = useMemo(() => pending.filter((x) => x.status === "awaiting" && !x.acknowledged.includes(ME)), [pending]);
  /** Puts the server's answer in place of ours (or of the optimistic one with id `was`). */
  const put = useCallback((d: ApiDecision | undefined, was?: string) => {
    if (!key) return;
    mutate<Decision[]>(key, (cur = []) => {
      if (!d) return was ? cur.filter((x) => x.id !== was) : cur;
      const next = decisionFromApi(projectId, d);
      const rest = cur.filter((x) => x.id !== next.id && x.id !== was);
      return [...rest, next];
    });
  }, [key, projectId]);
  const edit = (id: string, fn: (d: Decision) => Decision) => key && mutate<Decision[]>(key, (cur = []) => cur.map((x) => (x.id === id ? fn(structuredClone(x)) : x)));

  return {
    ready: loaded !== undefined,
    list,
    pending,
    history,
    awaitingMe,
    get: (slug: string) => list.find((x) => x.slug === slug || x.id === slug || x.id === aliasOf(slug)),
    acknowledge: (id: string, teamSize: number) => {
      void teamSize;  // the backend counts the team itself
      edit(id, (d) => { if (!d.acknowledged.includes(ME)) d.acknowledged.push(ME); return d; });
      void teamwork.acknowledge(projectId, aliasOf(id)).then((d) => (d ? put(d) : key && reloadDecisions(projectId)));
    },
    /** Undo an acknowledgement (the toast's Undo): takes ours back if it was added. */
    restore: (prev: Decision) => {
      edit(prev.id, () => prev);
      if (!prev.acknowledged.includes(ME)) void teamwork.unacknowledge(projectId, prev.id).then((d) => d && put(d));
    },
    propose: (input: DecisionInput) => {
      const base = slugOf(input.title) || "decision";
      let slug = base;
      for (let n = 2; list.some((x) => x.slug === slug); n++) slug = `${base}-${n}`;
      const body = { title: input.title, summary: input.summary, problem: input.problem ?? "", context: input.context ?? "", direction: input.direction ?? "",
        milestone: input.milestone ?? "", decide_by: input.decideBy ? new Date(input.decideBy).toISOString() : null, options: input.options ?? [] };
      const created = teamwork.propose(projectId, body);
      const id = tempId("dec", created.then((d) => d?.id));
      const dec: Decision = { options: [], files: [], discussion: [], ...input, id, projectId, slug, status: "proposed", proposedBy: ME, proposedAt: Date.now(), acknowledged: [] };
      if (key) mutate<Decision[]>(key, (cur = []) => [...cur, dec]);
      void created.then((d) => put(d, id));
      return dec;
    },
    remove: (id: string) => {
      if (key) mutate<Decision[]>(key, (cur = []) => cur.filter((x) => x.id !== id));
      void teamwork.removeDecision(projectId, aliasOf(id)).then((r) => { if (!r) reloadDecisions(projectId); });
    },
    /** Adds to the decision's discussion. */
    comment: (id: string, text: string) => void teamwork.commentDecision(projectId, aliasOf(id), text).then((d) => d && put(d)),
    /** The host records the outcome. */
    decide: (id: string, status: "approved" | "rejected" | "superseded", outcome = "") => void teamwork.recordOutcome(projectId, aliasOf(id), status, outcome).then((d) => d && put(d)),
  };
}

const reloadDecisions = (projectId: string) => void reload(decisionsKey(projectId));

export const useDecisions: typeof useLocalDecisions = DEMO ? useLocalDecisions : useRemoteDecisions;

/** The project's story: the ledger, with each decided decision written in on the day it was decided. */
export function decisionStory(ledger: { at: number; who: PersonId | "akines"; what: string }[], decisions: Decision[]) {
  const decided = decisions.filter((d) => isDecided(d.status) && d.outcomeAt).map((d) => ({ at: d.outcomeAt!, who: d.proposedBy as PersonId | "akines", what: `Decision ${DECISION_STATUS[d.status].toLowerCase()}: ${d.title}`, decision: d.slug }));
  return [...ledger.map((l) => ({ ...l, decision: undefined as string | undefined })), ...decided].sort((a, b) => b.at - a.at);
}
