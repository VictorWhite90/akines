"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collabApi, type ApiInvitation, type ApiJoinRequest } from "@/lib/api/collab";
import { DEMO } from "@/lib/demo/mode";
import { registerPerson } from "@/lib/data/people";
import { newId, useLocal } from "@/lib/useLocal";
import { ME } from "@/lib/collab/me";
import type { Decision } from "@/lib/collab/decisions";
import type { Deliverable, Project } from "@/lib/collab/types";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { apiPhoto } from "@/lib/images";

/*
 * A project's team beyond its members, as the design's Team page shows it (components/collaborate/workspace/Team):
 * interest requests from people who want to join, invitations the team has sent, and each person's skills.
 * Our Project has members only, so this is its own resource, shaped like the REST one it will become:
 *   GET  /collab/projects/:id/requests                 → JoinRequest[]
 *   POST /collab/projects/:id/requests/:rid/accept     (adds them to Project.members)
 *   POST /collab/projects/:id/requests/:rid/not-now    ← { message }
 *   POST /collab/projects/:id/invitations              ← { to, role, message }
 *   GET  /people/:id/skills                            → string[]
 * The demo keeps them in the browser (the sample projects' interest requests are applications: lib/collab/applicants).
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
  // Career Guidance for Everyone
  kemi: ["Product design", "Facilitation", "Prototyping"],
  adaeze: ["Interface design", "Prototyping", "Design systems"],
  tobi: ["Frontend engineering", "Prototyping", "Accessibility"],
  ngozi: ["Career research", "Student interviews", "Synthesis"],
  amina: ["Career research", "Student interviews", "Survey design"],
  // Adire Stories
  "amara-obi": ["Line illustration", "Sketching", "Pattern repeats"],
  "ayo-bello": ["Colour palettes", "Sketching", "Print proofing"],
  "yusuf-danjuma": ["Resist patterns", "Cloth documentation", "Pattern notes"],
  "bisi-adeoye": ["Resist patterns", "Cloth documentation", "Dye pot notes"],
  // Applicants and introductions
  kunle: ["Mobile development", "Low-bandwidth design", "APIs"],
  funmi: ["Learning design", "Facilitation", "Content"],
  chidi: ["Partnerships", "Student outreach", "Facilitation"],
  folake: ["Feature writing", "Interviews", "Oral history"],
  "tunde-bello": ["Street photography", "Portraits", "Photo editing"],
  chuka: ["Portraits", "Market scenes", "Photo editing"],
  "amara-okafor": ["Long form writing", "Interviews", "Editing"],
};
/** Skills that differ on one project (Kemi directs the art on Adire Stories). */
const PROJECT_SKILLS: Record<string, Partial<Record<PersonId, string[]>>> = {
  "adire-stories": { kemi: ["Art direction", "Facilitation", "Sketching"] },
};
/** The skills a member has used in this project's work (the member page marks them with a dot). */
const USED: Record<string, Partial<Record<PersonId, string[]>>> = {
  "career-guidance-for-everyone": { adaeze: ["Interface design", "Prototyping"] },
};
/** Sample skills in the demo; outside it, what the member's published work profile lists. */
export const skillsOf = (id: PersonId, projectId?: string) => (projectId && PROJECT_SKILLS[projectId]?.[id]) || SKILLS[id] || (DEMO ? [] : collabApi.person(id)?.skills ?? []);
export const usedSkills = (projectId: string, id: PersonId) => USED[projectId]?.[id] ?? [];

/*
 * Preview only: what the design's member pages say that our project record can't tell yet: the latest
 * contribution on each member card, and Adaeze's page (her role in the project and her contribution history).
 */
type SampleMember = { recent?: string; lead?: string; fields?: { label: string; value: string }[]; rows?: { title: string; status: string; at: number; to?: string }[] };
const on = (month: number, day: number) => new Date(2026, month - 1, day, 12).getTime();
const SAMPLE_MEMBERS: Record<string, Partial<Record<PersonId, SampleMember>>> = {
  "career-guidance-for-everyone": {
    kemi: { recent: "Set up the shared workspace." },
    adaeze: {
      recent: "Shared the second onboarding screen for review.",
      lead: "Product Designer, designing the student-facing screens.",
      fields: [
        { label: "PROJECT ROLE", value: "Product Designer, supporting" },
        { label: "EXPECTED", value: "Review work on the first student experience" },
        { label: "RESPONSIBLE FOR", value: "Student-facing screens and design review" },
        { label: "WORKS BEST WITH", value: "Written feedback first, then a short call" },
      ],
      rows: [
        { title: "Second onboarding screen", status: "Work submitted, Mon 2 Nov", at: on(11, 2) },
        { title: "Choose the onboarding approach", status: "Decision influenced, Fri 30 Oct", at: on(10, 30), to: "conversations/decision-discussion" },
        { title: "Project brief approved", status: "Milestone completed, Mon 12 Oct", at: on(10, 12), to: "brief" },
        { title: "Map the student journey", status: "Acknowledged by Tobi Adeyemi, Tue 27 Oct", at: on(10, 27) },
        { title: "Interface design", status: "Skill demonstrated, Mon 2 Nov", at: on(11, 2) - 1, to: "milestones/first-student-experience" },
      ],
    },
    tobi: { recent: "Shared the student onboarding draft." },
    ngozi: { recent: "Shared the career interview notes." },
    amina: { recent: "Joined the project today." },
  },
  "adire-stories": {
    kemi: { recent: "Approved the series brief." },
    "amara-obi": { recent: "Shared the headwrap colour layer for review." },
    "ayo-bello": { recent: "Shared the headwrap palette draft." },
    "yusuf-danjuma": { recent: "Shared the dyer interview notes." },
    "bisi-adeoye": { recent: "Joined the project today." },
  },
};
/** A different photo of someone on one project's team (the Career Guidance team shows Ngozi's team portrait). */
const TEAM_PHOTOS: Record<string, Partial<Record<PersonId, string>>> = {
  "career-guidance-for-everyone": { ngozi: "/kin/design/people/team/ngozi.jpg" },
};
export const teamPhoto = (projectId: string, id: PersonId) => (DEMO ? TEAM_PHOTOS[projectId]?.[id] : undefined);

/** The design's own words for a member of one of its sample projects (preview only). */
export const sampleMember = (projectId: string, id: PersonId): SampleMember | undefined => (DEMO ? SAMPLE_MEMBERS[projectId]?.[id] : undefined);

function seed(): JoinRequest[] {
  return [];
}

const KEY = "ak:collab-team:v2";
type Store = { requests: JoinRequest[]; invitations: Invitation[] };

/* ---------- Outside the demo: the backend's requests and invitations ---------- */

const REQUEST_STATUS: Record<ApiJoinRequest["status"], JoinRequestStatus> = { pending: "pending", accepted: "accepted", not_now: "dismissed", withdrawn: "dismissed" };
function requestFromApi(r: ApiJoinRequest): JoinRequest {
  const name = `${r.person.first_name} ${r.person.last_name}`.trim() || r.person.username || "A member";
  registerPerson({ id: r.person.user_id, name, role: r.person.headline ?? "", city: "", presence: "open", about: "", photo: apiPhoto(r.person.profile_photo, r.person.profile_photo_image) });
  return {
    id: r.id, projectId: r.workspace_id, person: r.person.user_id as PersonId, role: r.person.headline ?? "", wants: r.role, message: r.message,
    sentAt: Date.parse(r.sent_at), status: REQUEST_STATUS[r.status], decidedAt: r.decided_at ? Date.parse(r.decided_at) : undefined, reply: r.reply || undefined,
  };
}
const invitationFromApi = (i: ApiInvitation): Invitation => ({
  id: i.id, projectId: i.workspace_id, to: `${i.to.first_name} ${i.to.last_name}`.trim() || i.to.username || "A member", role: i.role,
  message: i.message, sentAt: Date.parse(i.sent_at), by: i.by.user_id as PersonId,
});

function useRemoteTeam(projectId: string) {
  const [store, setStore] = useState<Store & { ready: boolean }>({ requests: [], invitations: [], ready: false });
  /** Invitations sent from this screen, by the id shown until the server's comes back (for Undo). */
  const pendingIds = useRef(new Map<string, Promise<ApiInvitation | null>>());
  const load = useCallback(async () => {
    if (!projectId) return;
    const [requests, invitations] = await Promise.all([collabApi.requests(projectId), collabApi.invitations(projectId)]);
    setStore({
      ready: true,
      requests: requests.ok ? requests.items.map(requestFromApi) : [],
      invitations: invitations.ok ? invitations.items.filter((i) => i.status === "sent").map(invitationFromApi) : [],
    });
  }, [projectId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the project's lists when it opens
  useEffect(() => { void load(); }, [load]);
  const replace = (r: ApiJoinRequest | null) => {
    if (r) setStore((cur) => ({ ...cur, requests: cur.requests.map((x) => (x.id === r.id ? requestFromApi(r) : x)) }));
  };
  const requests = store.requests;
  return {
    ready: store.ready,
    pending: requests.filter((r) => r.status === "pending").sort((a, b) => b.sentAt - a.sentAt),
    joined: requests.filter((r) => r.status === "accepted").sort((a, b) => (a.decidedAt ?? 0) - (b.decidedAt ?? 0)),
    latest: requests.filter((r) => r.status !== "pending").sort((a, b) => (b.decidedAt ?? 0) - (a.decidedAt ?? 0))[0],
    invitations: store.invitations,
    accept: (id: string) => void collabApi.decideRequest(projectId, id, "accept").then(replace),
    notNow: (id: string, reply: string) => void collabApi.decideRequest(projectId, id, "not-now", reply.trim()).then(replace),
    reopen: (id: string) => void collabApi.decideRequest(projectId, id, "reopen").then(replace),
    invite: (input: Pick<Invitation, "to" | "role" | "message">) => {
      const shown: Invitation = { ...input, id: newId("inv"), projectId, sentAt: Date.now(), by: ME };
      setStore((cur) => ({ ...cur, invitations: [...cur.invitations, shown] }));
      const sent = collabApi.invite(projectId, input);
      pendingIds.current.set(shown.id, sent);
      void sent.then((i) => setStore((cur) => ({
        ...cur, invitations: i ? cur.invitations.map((x) => (x.id === shown.id ? invitationFromApi(i) : x)) : cur.invitations.filter((x) => x.id !== shown.id),
      })));
      return shown;
    },
    uninvite: (id: string) => {
      setStore((cur) => ({ ...cur, invitations: cur.invitations.filter((i) => i.id !== id) }));
      const sending = pendingIds.current.get(id);
      void (sending ? sending.then((i) => i && collabApi.withdrawInvitation(projectId, i.id)) : collabApi.withdrawInvitation(projectId, id));
    },
  };
}

/** A project's requests and invitations, and what the team can do with them: the backend's outside the demo. */
export function useTeam(projectId: string) {
  // DEMO is fixed for a build, so the same hook runs on every render.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return DEMO ? useLocalTeam(projectId) : useRemoteTeam(projectId);
}

function useLocalTeam(projectId: string) {
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
  const sample = sampleMember(p.id, id)?.rows;
  if (sample) return sample.map((r, i) => ({ id: `s${i}`, title: r.title, status: r.status, at: r.at, href: r.to ? `/collaborate/my-projects/${p.id}/${r.to}` : undefined }));
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
