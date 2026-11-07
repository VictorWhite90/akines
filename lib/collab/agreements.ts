"use client";

import { useCallback, useMemo } from "react";
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
 * What the charter can't hold, new agreements the team drafts and suggested changes, is kept here, shaped like:
 *   POST /collab/projects/:id/agreements              ← { stage, title, description }
 *   POST /collab/projects/:id/agreements/suggestions  ← { stage, change, why }
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

export function useAgreements(projectId: string) {
  const [store, setStore] = useLocal<Store>(KEY, { drafts: [], suggestions: [] });
  const drafts = useMemo(() => store.drafts.filter((d) => d.projectId === projectId), [store, projectId]);
  const suggestions = useMemo(() => store.suggestions.filter((d) => d.projectId === projectId), [store, projectId]);
  const create = useCallback((input: { stage: StageId; title: string; description: string }) => {
    setStore((s) => ({ ...s, drafts: [...s.drafts, { ...input, id: newId("ag"), projectId, by: ME, at: Date.now() }] }));
  }, [projectId, setStore]);
  const suggest = useCallback((input: { stage: StageId; change: string; why: string }) => {
    setStore((s) => ({ ...s, suggestions: [...s.suggestions, { ...input, id: newId("sg"), projectId, by: ME, at: Date.now() }] }));
  }, [projectId, setStore]);
  return { drafts, suggestions, create, suggest };
}
