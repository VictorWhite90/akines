"use client";

import { useCallback, useMemo } from "react";
import { newId, useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { Decision } from "@/lib/collab/decisions";
import type { Deliverable, Project } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";

/*
 * A project's team beyond its members, as the design's Team page shows it (components/collaborate/workspace/Team):
 * interest requests from people who want to join, invitations the team has sent, and each person's skills.
 * Our Project has members only, so this is its own resource, shaped like the REST one it will become:
 *   GET  /collab/projects/:id/requests                 → JoinRequest[]
 *   POST /collab/projects/:id/requests/:rid/accept     (adds them to Project.members)
 *   POST /collab/projects/:id/requests/:rid/not-now    ← { message }
 *   POST /collab/projects/:id/invitations              ← { to, role, message }
 *   GET  /people/:id/skills                            → string[]
 * The demo keeps them in the browser, seeded with requests to our sample projects.
 */

export type JoinRequestStatus = "pending" | "accepted" | "dismissed";
export type JoinRequest = {
  id: string;
  projectId: string;
  person: PersonId;
  /** What they do, as their profile says it. */
  role: string;
  /** The role they would like on this project. */
  wants: string;
  message: string;
  sentAt: number;
  status: JoinRequestStatus;
  decidedAt?: number;
  /** What the team said when it was not the right time. */
  reply?: string;
};
export type Invitation = { id: string; projectId: string; to: string; role: string; message: string; sentAt: number; by: PersonId };

/** Each person's skills. A real build reads them from the person's work profile. */
export const SKILLS: Partial<Record<PersonId, string[]>> = {
  amara: ["Product design", "Prototyping", "Design systems", "Accessibility"],
  ayo: ["Patient care", "Clinic operations", "Staff training"],
  kwame: ["Backend engineering", "APIs", "SMS gateways"],
  chidi: ["Frontend engineering", "Android testing", "Accessibility"],
  wanjiru: ["Portrait photography", "Photo editing", "Storytelling"],
  leila: ["Plain-language writing", "Product strategy", "Translation"],
  efua: ["Oral history", "Interviewing", "Captions"],
  thandi: ["User testing", "Teaching", "Parent groups"],
  zuri: ["Community organising", "Events", "Outreach"],
  fatou: ["Cooking", "Teaching", "Small business"],
  tunde: ["Coaching", "Survey design", "Data entry"],
  nandi: ["Facilitation", "Listening", "Wellbeing"],
};
/** The skills a member has used in this project's work (the member page marks them with a dot). */
const USED: Record<string, Partial<Record<PersonId, string[]>>> = {
  "garki-clinic-booking": { amara: ["Product design", "Prototyping"], kwame: ["Backend engineering", "APIs"], chidi: ["Frontend engineering", "Android testing"], wanjiru: ["Portrait photography"], leila: ["Plain-language writing"] },
  "market-light": { wanjiru: ["Portrait photography", "Photo editing"], amara: ["Product design"], efua: ["Interviewing", "Captions"] },
};
export const skillsOf = (id: PersonId) => SKILLS[id] ?? [];
export const usedSkills = (projectId: string, id: PersonId) => USED[projectId]?.[id] ?? [];

const HOUR = 3_600_000, DAY = 24 * HOUR;
function seed(): JoinRequest[] {
  const now = Date.now();
  return [
    { id: "jr-garki-thandi", projectId: "garki-clinic-booking", person: "thandi", role: "Teacher", wants: "Tester", message: "I would like to test the booking screens with the parents at my school.", sentAt: now - 2 * DAY, status: "pending" },
    { id: "jr-market-zuri", projectId: "market-light", person: "zuri", role: "Community organiser", wants: "Launch organiser", message: "I would like to help bring the traders and their families to the launch.", sentAt: now - 3 * DAY, status: "pending" },
  ];
}

const KEY = "ak:collab-team:v1";
type Store = { requests: JoinRequest[]; invitations: Invitation[] };

/** A project's requests and invitations, and what the team can do with them. */
export function useTeam(projectId: string) {
  const [all, setAll, ready] = useLocal<Store>(KEY, { requests: seed(), invitations: [] });
  const requests = useMemo(() => all.requests.filter((r) => r.projectId === projectId), [all.requests, projectId]);
  const pending = useMemo(() => requests.filter((r) => r.status === "pending").sort((a, b) => b.sentAt - a.sentAt), [requests]);
  /** Accepted requests: they are on the team. */
  const joined = useMemo(() => requests.filter((r) => r.status === "accepted").sort((a, b) => (a.decidedAt ?? 0) - (b.decidedAt ?? 0)), [requests]);
  /** The most recent request the team answered, for the confirmation line. */
  const latest = useMemo(() => requests.filter((r) => r.status !== "pending").sort((a, b) => (b.decidedAt ?? 0) - (a.decidedAt ?? 0))[0], [requests]);
  const edit = useCallback((id: string, fn: (r: JoinRequest) => JoinRequest) => setAll((cur) => ({ ...cur, requests: cur.requests.map((r) => (r.id === id ? fn({ ...r }) : r)) })), [setAll]);

  return {
    ready,
    pending,
    joined,
    latest,
    invitations: all.invitations.filter((i) => i.projectId === projectId),
    accept: (id: string) => edit(id, (r) => ({ ...r, status: "accepted", decidedAt: Date.now() })),
    notNow: (id: string, reply: string) => edit(id, (r) => ({ ...r, status: "dismissed", decidedAt: Date.now(), reply: reply.trim() || undefined })),
    /** The toast's Undo: the request is waiting again. */
    reopen: (id: string) => edit(id, (r) => ({ ...r, status: "pending", decidedAt: undefined, reply: undefined })),
    invite: (input: Pick<Invitation, "to" | "role" | "message">) => {
      const inv: Invitation = { ...input, id: newId("inv"), projectId, sentAt: Date.now(), by: ME };
      setAll((cur) => ({ ...cur, invitations: [...cur.invitations, inv] }));
      return inv;
    },
    uninvite: (id: string) => setAll((cur) => ({ ...cur, invitations: cur.invitations.filter((i) => i.id !== id) })),
  };
}

/* ---------- A member's contribution history, read from the project ---------- */

export type Contribution = { id: string; title: string; status: string; at: number; href?: string };
const day = (at: number) => new Date(at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", "");
const nameOf = (id: PersonId) => PEOPLE[id]?.name ?? "A teammate";

/**
 * Meaningful work only, as the design asks: work sent for review, work approved by a teammate, decisions proposed
 * and what the project record says they did. Hours online and message counts are never counted.
 * `hrefs` gives the addresses of the pages each row opens.
 */
export function contributionsOf(p: Project, id: PersonId, decisions: Decision[], hrefs: { work: (d: Deliverable) => string; decision: (d: Decision) => string }): Contribution[] {
  const rows: Contribution[] = [];
  const titles: string[] = [];
  for (const d of p.deliverables ?? []) {
    d.thread.forEach((t, i) => {
      if (t.by === id && t.kind === "submitted") { rows.push({ id: `${d.id}-s${i}`, title: d.title, status: `Work submitted, ${day(t.at)}`, at: t.at, href: hrefs.work(d) }); titles.push(d.title); }
    });
    if (d.owner === id && d.status === "approved" && d.approvedAt) rows.push({ id: `${d.id}-a`, title: d.title, status: `Approved by ${nameOf(d.approver)}, ${day(d.approvedAt)}`, at: d.approvedAt, href: hrefs.work(d) });
  }
  for (const d of decisions) if (d.proposedBy === id) rows.push({ id: `dec-${d.id}`, title: d.title, status: `Decision proposed, ${day(d.proposedAt)}`, at: d.proposedAt, href: hrefs.decision(d) });
  // The record, less what the rows above already say.
  p.ledger.forEach((l, i) => {
    if (l.who !== id || titles.some((t) => l.what.includes(t))) return;
    rows.push({ id: `l${i}`, title: l.what, status: `Project record, ${day(l.at)}`, at: l.at });
  });
  return rows.sort((a, b) => b.at - a.at);
}

/** The credits row: agreed once everyone has signed the charter. */
export function creditsRow(p: Project, href: string): Contribution {
  const agreed = p.charter.signed.length === p.members.length && !!p.charter.signedAt;
  return { id: "credits", title: "Final credits", status: agreed ? `Agreed, ${day(p.charter.signedAt!)}` : "To be agreed, not agreed yet", at: 0, href };
}
