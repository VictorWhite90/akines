"use client";

import { useCallback, useMemo } from "react";
import { aliasOf, mutate, teamwork, tempId, useResource, type ApiDraft, type ApiSuggestion } from "@/lib/api/teamwork";
import { DEMO } from "@/lib/demo/mode";
import { newId, useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { Project } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * A project's agreements as the product design shows them (components/collaborate/workspace/Agreements): six
 * stages, each with its terms, the team's acknowledgements and a version history.
 * Our Project holds one charter that everyone signs (S5), so the stages are read from it:
 *   Intent        the project's summary
 *   Roles         each member's role, and how decisions are made        (charter.decisions)
 *   Contributions what each member brings, and how anyone can leave     (members' contribution, charter.exit)
 *   Ownership     credit, ownership and how the work can be used        (charter.credit, ownership, uses)
 *   Revenue       the agreed split and how costs are paid               (charter.split, expenses)
 *   Formal        optional legal templates (no terms of its own)
 * Signing the charter acknowledges every stage at once; changing a term asks everyone to sign again (a new version).
 * What the charter can't hold, new agreements the team drafts and suggested changes, is its own resource
 * (lib/api/teamwork.ts, /api/v1/teamwork/projects/:id/…):
 *   GET/POST agreements/drafts                 ← { stage, title, description }      DELETE agreements/drafts/:id
 *   GET/POST agreements/suggestions            ← { stage, change, why, terms? }     DELETE (the author withdraws)
 *   POST     agreements/suggestions/:id/answer ← { answer: accept | decline }  (the host; accepting new terms makes a
 *            new version of the charter, so everyone signs again)
 *   GET      agreements/versions               → the charter's versions
 */

export type StageId = "intent" | "roles" | "contributions" | "ownership" | "revenue" | "formal";
export type StageStatus = "Not started" | "In progress" | "Awaiting acknowledgement" | "Acknowledged";

export const STAGES: { id: StageId; title: string; name: string; text: string; lead: string }[] = [
  { id: "intent", title: "Intent", name: "Intent", text: "Why the project exists and what each member hopes to achieve.", lead: "Why the project exists and what each member hopes to achieve." },
  { id: "roles", title: "Roles", name: "Roles and responsibilities", text: "Project owner, member roles, responsibilities and decision-making rights.", lead: "Who leads the project, what each member looks after and who makes which decisions." },
  { id: "contributions", title: "Contributions", name: "Contributions", text: "Expected contributions, skills provided and agreed commitments.", lead: "Expected contributions, skills provided and agreed commitments." },
  { id: "ownership", title: "Ownership", name: "Ownership", text: "Idea ownership, intellectual property, attribution and shared work.", lead: "Idea ownership, intellectual property, attribution and shared work." },
  { id: "revenue", title: "Revenue", name: "Revenue", text: "Revenue sharing, commercial outcomes and financial responsibilities, where relevant.", lead: "Revenue sharing, commercial outcomes and financial responsibilities, where relevant." },
  { id: "formal", title: "Formal Agreement", name: "Formal Agreement", text: "Optional legal templates for serious commercial projects.", lead: "Optional legal templates for serious commercial projects." },
];
/** The stage chips in "Create agreement", in the design's words. */
export const STAGE_CHIPS = ["Intent", "Roles", "Contributions", "Ownership", "Revenue", "Formal Agreement"] as const;
const CHIP_TO_STAGE: Record<string, StageId> = { Intent: "intent", Roles: "roles", Contributions: "contributions", Ownership: "ownership", Revenue: "revenue", "Formal Agreement": "formal" };
export const stageOfChip = (chip: string) => CHIP_TO_STAGE[chip] ?? "ownership";

export type AgreementDraft = { id: string; projectId: string; stage: StageId; title: string; description: string; by: PersonId; at: number };
export type ChangeSuggestion = { id: string; projectId: string; stage: StageId; change: string; why: string; by: PersonId; at: number };
type Store = { drafts: AgreementDraft[]; suggestions: ChangeSuggestion[] };

const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "A member";
const sentence = (s: string) => { const t = s.trim(); return /[.!?]$/.test(t) ? t : `${t}.`; };
const NUMBER = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
export const numberWord = (n: number) => NUMBER[n] ?? String(n);

/** The terms a stage proposes, written from the charter and the team. */
export function stageTerms(p: Project, stage: StageId): string[] {
  const c = p.charter;
  switch (stage) {
    case "intent": return [sentence(p.summary)];
    case "roles": return [
      ...p.members.map((m) => `${nameOf(m.id)}: ${m.role}${m.id === p.host ? ", project owner" : ""}.`),
      sentence(c.decisions),
    ];
    case "contributions": return [...p.members.map((m) => `${nameOf(m.id)}: ${sentence(m.contribution)}`), sentence(c.exit)];
    case "ownership": return [sentence(c.credit), sentence(c.ownership), sentence(c.uses)];
    case "revenue": return [
      ...p.members.map((m) => { const n = c.split[m.id] ?? 0; return n ? `${nameOf(m.id)} receives ${n}% of what the project earns.` : `${nameOf(m.id)} takes no share.`; }),
      sentence(c.expenses),
    ];
    default: return [];
  }
}

/** Versions of the charter: the first, then one for every change that asked everyone to sign again. */
export function charterVersions(p: Project) {
  const changes = p.ledger.filter((l) => /^Changed the .+, so everyone signs again$/.test(l.what));
  return [
    { n: 1, at: p.createdAt, by: p.host as PersonId | "akines", what: "" },
    ...changes.map((l, i) => ({ n: i + 2, at: l.at, by: l.who, what: l.what.replace(/, so everyone signs again$/, "") })),
  ];
}

/** When each member signed the current version: the ledger's signatures, or the day everyone had signed. */
export function signedAt(p: Project, id: PersonId) {
  if (!p.charter.signed.includes(id)) return undefined;
  const since = charterVersions(p).at(-1)!.at;
  const own = [...p.ledger].reverse().find((l) => l.who === id && l.what === "Signed the charter" && l.at >= since);
  return own?.at ?? p.charter.signedAt;
}

export type StageView = { id: StageId; index: number; title: string; name: string; text: string; lead: string; status: StageStatus; note: string; terms: string[]; href?: string };

/** Each stage's status and note, from the charter's signatures and the drafts. */
export function agreementStages(p: Project, drafts: AgreementDraft[], base: string): StageView[] {
  const signed = p.charter.signed.filter((id) => p.members.some((m) => m.id === id));
  const total = p.members.length;
  const waiting = p.members.filter((m) => !signed.includes(m.id)).map((m) => nameOf(m.id).split(" ")[0]);
  const list = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0] ?? "");
  return STAGES.map((s, index) => {
    const terms = stageTerms(p, s.id);
    const href = s.id === "formal" ? `${base}/formal-agreement` : s.id === "roles" ? `${base}/roles` : `${base}/${s.id}`;
    if (s.id === "formal") {
      const mine = drafts.filter((d) => d.stage === "formal");
      return { ...s, index, terms, href, status: mine.length ? "In progress" : "Not started", note: mine.length ? "Being drafted. Not shared for acknowledgement yet." : "Optional. A draft is not automatically legally binding." };
    }
    if (signed.length >= total) return { ...s, index, terms, href, status: "Acknowledged", note: `Acknowledged by all ${numberWord(total)} members.` };
    return { ...s, index, terms, href, status: "Awaiting acknowledgement", note: `${signed.length} of ${total} members have acknowledged. Waiting on ${list(waiting)}.` };
  });
}

const KEY = "ak:collab-agreements:v1";

function useLocalAgreements(projectId: string) {
  const [store, setStore] = useLocal<Store>(KEY, { drafts: [], suggestions: [] });
  const drafts = useMemo(() => store.drafts.filter((d) => d.projectId === projectId), [store, projectId]);
  const suggestions = useMemo(() => store.suggestions.filter((d) => d.projectId === projectId), [store, projectId]);
  const create = useCallback((input: { stage: StageId; title: string; description: string }) => {
    setStore((s) => ({ ...s, drafts: [...s.drafts, { ...input, id: newId("ag"), projectId, by: ME, at: Date.now() }] }));
  }, [projectId, setStore]);
  const suggest = useCallback((input: { stage: StageId; change: string; why: string }) => {
    setStore((s) => ({ ...s, suggestions: [...s.suggestions, { ...input, id: newId("sg"), projectId, by: ME, at: Date.now() }] }));
  }, [projectId, setStore]);
  const withdraw = useCallback((id: string) => setStore((s) => ({ ...s, suggestions: s.suggestions.filter((x) => x.id !== id) })), [setStore]);
  /** The host answers a suggestion (in the demo it's simply closed). */
  const answer = useCallback((id: string, a: "accept" | "decline") => { void a; withdraw(id); }, [withdraw]);
  return { drafts, suggestions, create, suggest, withdraw, answer };
}

// ── On the backend ──────────────────────────────────────────────────────────────────────────

const STAGE_IDS = new Set<string>(STAGES.map((s) => s.id));
const stageOf = (s: string) => (STAGE_IDS.has(s) ? s : "ownership") as StageId;
const person = (id: string | null) => (id ?? "akines") as PersonId;
const draftFromApi = (projectId: string, d: ApiDraft): AgreementDraft => ({ id: d.id, projectId, stage: stageOf(d.stage), title: d.title, description: d.description, by: person(d.by), at: Date.parse(d.at) });
const suggestionFromApi = (projectId: string, s: ApiSuggestion): ChangeSuggestion => ({ id: s.id, projectId, stage: stageOf(s.stage), change: s.change, why: s.why, by: person(s.by), at: Date.parse(s.at) });
const NONE: Store = { drafts: [], suggestions: [] };

function useRemoteAgreements(projectId: string) {
  const key = projectId ? `tw:agreements:${projectId}` : null;
  const store = useResource<Store>(key, async () => {
    const [d, s] = await Promise.all([teamwork.drafts(projectId), teamwork.suggestions(projectId)]);
    return d && s ? { drafts: d.map((x) => draftFromApi(projectId, x)), suggestions: s.map((x) => suggestionFromApi(projectId, x)) } : undefined;
  }) ?? NONE;
  const set = useCallback((fn: (s: Store) => Store) => { if (key) mutate<Store>(key, (cur = NONE) => fn(cur)); }, [key]);
  const create = useCallback((input: { stage: StageId; title: string; description: string }) => {
    const made = teamwork.createDraft(projectId, input);
    const id = tempId("ag", made.then((d) => d?.id));
    set((s) => ({ ...s, drafts: [...s.drafts, { ...input, id, projectId, by: ME, at: Date.now() }] }));
    void made.then((d) => set((s) => ({ ...s, drafts: d ? s.drafts.map((x) => (x.id === id ? draftFromApi(projectId, d) : x)) : s.drafts.filter((x) => x.id !== id) })));
  }, [projectId, set]);
  const suggest = useCallback((input: { stage: StageId; change: string; why: string }) => {
    const made = teamwork.suggest(projectId, input);
    const id = tempId("sg", made.then((x) => x?.id));
    set((s) => ({ ...s, suggestions: [...s.suggestions, { ...input, id, projectId, by: ME, at: Date.now() }] }));
    void made.then((x) => set((s) => ({ ...s, suggestions: x ? s.suggestions.map((y) => (y.id === id ? suggestionFromApi(projectId, x) : y)) : s.suggestions.filter((y) => y.id !== id) })));
  }, [projectId, set]);
  const close = useCallback((id: string) => set((s) => ({ ...s, suggestions: s.suggestions.filter((x) => x.id !== id) })), [set]);
  const withdraw = useCallback((id: string) => { close(id); void teamwork.withdrawSuggestion(projectId, aliasOf(id)); }, [projectId, close]);
  const answer = useCallback((id: string, a: "accept" | "decline") => { close(id); void teamwork.answerSuggestion(projectId, aliasOf(id), a); }, [projectId, close]);
  return { drafts: store.drafts, suggestions: store.suggestions, create, suggest, withdraw, answer };
}

export const useAgreements: typeof useLocalAgreements = DEMO ? useLocalAgreements : useRemoteAgreements;
