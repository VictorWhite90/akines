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
 * The demo keeps them in the browser, seeded with the design's decisions on its two sample projects.
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

const slugOf = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/** A day of the sample projects (their dates are fixed, as the design writes them): 2026, at noon. */
const on = (month: number, day: number) => new Date(2026, month - 1, day, 12).getTime();
const CAREER_ID = "career-guidance-for-everyone";
const ADIRE_ID = "adire-stories";

function seed(): Decision[] {
  const d = (x: Omit<Decision, "slug" | "files" | "discussion" | "options"> & Partial<Pick<Decision, "files" | "discussion" | "options">>): Decision => ({ files: [], discussion: [], options: [], ...x, slug: slugOf(x.title) });
  const FSE = "First Student Experience", PR = "Prototype Review";
  const HP = "Headwrap Portrait", PSS = "Pattern Study Set";
  return [
    // Career Guidance for Everyone: the second onboarding screen waits on how students start.
    d({
      id: "cg-dec1", projectId: CAREER_ID, title: "Choose the onboarding approach", status: "awaiting",
      summary: "How students first meet Career Guidance, so the first screens can be finished.",
      proposedBy: "adaeze", proposedAt: on(11, 2), decideBy: on(11, 6), milestone: FSE, acknowledged: ["adaeze", "tobi"],
      options: [
        { title: "Guided questions", good: "A clear first step for every student.", watch: "Less room to explore on a first visit." },
        { title: "Open workspace", good: "Freedom to explore at their own pace.", watch: "May feel overwhelming on a first visit." },
      ],
      context: "Students meet Career Guidance on the first screen. Many want a clear first step, and some are unsure where to begin.",
      problem: "The second onboarding screen cannot be finished until the team agrees how students start.",
      direction: "Start with guided questions: three short questions, then a first step built from the answers. Review it at the prototype session.",
      files: [{ name: "Student onboarding draft.pdf", meta: "PDF, 2.4 MB, shared by Tobi Adeyemi" }, { name: "Career interview notes.docx", meta: "Word, 180 KB, shared by Ngozi Eze" }],
      discussion: [
        { who: "tobi", text: "Worries the open option may feel overwhelming on a first visit." },
        { who: "ngozi", text: "Agrees, based on the student interviews." },
        { who: "adaeze", text: "Prefers the guided option and asked for a decision before Friday." },
      ],
    }),
    d({ id: "cg-dec2", projectId: CAREER_ID, title: "Choose the first student group", status: "discussion", summary: "", proposedBy: "ngozi", proposedAt: on(11, 3), milestone: FSE, acknowledged: [] }),
    d({ id: "cg-dec3", projectId: CAREER_ID, title: "Agree the review schedule", status: "proposed", summary: "", proposedBy: "tobi", proposedAt: on(11, 4), milestone: PR, acknowledged: [] }),
    d({ id: "cg-dec4", projectId: CAREER_ID, title: "Use one questionnaire for every school", status: "superseded", summary: "", proposedBy: "ngozi", proposedAt: on(10, 31), milestone: FSE, acknowledged: ["ngozi", "adaeze", "kemi"], outcomeAt: on(11, 2) }),
    d({ id: "cg-dec5", projectId: CAREER_ID, title: "Build the onboarding as a mobile app first", status: "rejected", summary: "", proposedBy: "tobi", proposedAt: on(10, 28), milestone: FSE, acknowledged: ["tobi", "adaeze", "ngozi", "kemi"], outcomeAt: on(10, 30) }),
    d({ id: "cg-dec6", projectId: CAREER_ID, title: "Run interviews before building screens", status: "approved", summary: "", proposedBy: "kemi", proposedAt: on(10, 26), milestone: FSE, acknowledged: ["kemi", "adaeze", "tobi", "ngozi"], outcomeAt: on(10, 28) }),

    // Adire Stories: the headwrap plate waits on its palette.
    d({
      id: "as-dec1", projectId: ADIRE_ID, title: "Choose the headwrap palette", status: "awaiting", summary: "",
      proposedBy: "amara-obi", proposedAt: on(11, 3), milestone: HP, acknowledged: ["amara-obi", "ayo-bello"],
      options: [{ title: "Indigo and cream", good: "", watch: "" }],
    }),
    d({ id: "as-dec2", projectId: ADIRE_ID, title: "Choose the pattern for the next plate", status: "discussion", summary: "", proposedBy: "yusuf-danjuma", proposedAt: on(11, 4), milestone: HP, acknowledged: [] }),
    d({ id: "as-dec3", projectId: ADIRE_ID, title: "Agree the print proof schedule", status: "proposed", summary: "", proposedBy: "ayo-bello", proposedAt: on(11, 5), milestone: PSS, acknowledged: [] }),
    d({ id: "as-dec4", projectId: ADIRE_ID, title: "Use one dye palette for every plate", status: "superseded", summary: "", proposedBy: "yusuf-danjuma", proposedAt: on(11, 1), milestone: HP, acknowledged: ["yusuf-danjuma", "amara-obi", "kemi"], outcomeAt: on(11, 3) }),
    d({ id: "as-dec5", projectId: ADIRE_ID, title: "Match colours from phone photos alone", status: "rejected", summary: "", proposedBy: "ayo-bello", proposedAt: on(10, 29), milestone: HP, acknowledged: ["ayo-bello", "amara-obi", "yusuf-danjuma", "kemi"], outcomeAt: on(10, 31) }),
    d({ id: "as-dec6", projectId: ADIRE_ID, title: "Meet the dyers before drawing the plates", status: "approved", summary: "", proposedBy: "kemi", proposedAt: on(10, 27), milestone: HP, acknowledged: ["kemi", "amara-obi", "ayo-bello", "yusuf-danjuma"], outcomeAt: on(10, 29) }),
  ];
}

const KEY = "ak:collab-decisions:v2";
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
