"use client";

import { useCallback, useEffect } from "react";
import { useMyRooms } from "@/components/rooms/MyRooms";
import type { Room } from "@/lib/data/community";
import type { Convo, KMsg } from "@/lib/data/kinmessage";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { DEMO } from "@/lib/demo/mode";
import { newId, useLocal } from "@/lib/useLocal";
import { sampleProof } from "./proof";
import { seedState } from "./seed";
import { KITS, kindForFields } from "./kits";
import type { AppStage, Application, CollabCall, CollabState, Charter, Checkin, Deliverable, JourneyStage, ProofItem, Project, Proposal, StudioItem, Task, Tool, WorkKind } from "./types";

export const ME: PersonId = "amara";
// v4: the clinic sample gained a bigger team, so older saved demos start fresh.
const KEY = "co:v4";
const SEC = 1000;
const first = (id: PersonId) => PEOPLE[id].name.split(" ")[0];
const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** In demo builds, also put the update in the 🔔 bell. */
function bell(kind: string, text: string, link: string) {
  if (!DEMO) return;
  void import("@/lib/demo/backend").then((d) => d.demoNotice(kind, text, link));
}

export const STAGE_LABEL: Record<AppStage, { applicant: string; host: string }> = {
  submitted: { applicant: "Submitted", host: "New" },
  viewed: { applicant: "Seen by the host", host: "Reviewing" },
  shortlisted: { applicant: "Shortlisted", host: "Shortlisted" },
  conversation: { applicant: "Conversation booked", host: "Conversation" },
  offer: { applicant: "Offer to join", host: "Offer sent" },
  joined: { applicant: "Joined the project", host: "On the team" },
  "not-selected": { applicant: "Not selected this time", host: "Not selected" },
  withdrawn: { applicant: "Withdrawn", host: "Withdrawn" },
};

const SLOTS = ["Tue 12 Nov · 10:00", "Wed 13 Nov · 14:30", "Thu 14 Nov · 16:00"];
export const conversationSlots = () => SLOTS;

function newCharter(members: PersonId[], signed: PersonId[] = []): Charter {
  const even = Math.floor(100 / members.length);
  const split = Object.fromEntries(members.map((m, i) => [m, i === 0 ? 100 - even * (members.length - 1) : even]));
  return {
    credit: "Every member is named on the finished work, in the order they joined.",
    ownership: "What each person brings stays theirs. What we make together belongs to all of us.",
    decisions: "Each person decides their own part. Anything that changes the whole needs everyone to agree.",
    expenses: "Agreed costs come out of the shared budget first, with receipts in the workspace.",
    uses: "Everyone can show their part anywhere. Selling or licensing the whole needs everyone to agree.",
    exit: "Anyone can leave with two weeks' notice. Their finished work stays in, credited.",
    split, signed,
  };
}

/**
 * The collaboration store: calls, applications, offers, proposals and project workspaces, kept in the browser
 * (sample data). In the demo, the other people answer a few seconds after the member acts.
 */
export function useCollab({ engine = false }: { engine?: boolean } = {}) {
  const [state, setState, ready] = useLocal<CollabState>(KEY, seedState());
  const [convos, setConvos] = useLocal<Convo[]>("km:convos", []);
  const [msgs, setMsgs] = useLocal<Record<string, KMsg[]>>("km:msgs", {});
  const [, setRooms] = useMyRooms();

  const update = useCallback((fn: (s: CollabState) => CollabState) => setState((s) => fn(structuredClone(s))), [setState]);

  /** The project's conversation in KinMessage (created with the project). */
  const ensureConvo = useCallback((p: Project, welcome: { from: PersonId; text: string }[]) => {
    setConvos((cur) => (cur.some((c) => c.id === p.convoId) ? cur : [{
      id: p.convoId, kind: "project", name: p.title, members: p.members.map((m) => m.id).filter((m) => m !== ME), intent: "create",
      photo: p.photo, unread: welcome.length, last: clock(),
      health: { label: "Growing", value: 20, exchanges: 0, shared: 1, reciprocity: "Just starting", lastMet: "Not yet" },
      memories: [{ title: "Project started", body: `${p.title} · ${new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` }],
      msgs: welcome.map((w, i) => ({ id: `${p.convoId}-w${i}`, from: w.from, at: clock(), kind: "text" as const, text: w.text })),
    }, ...cur]));
  }, [setConvos]);

  // ── The other side, in the demo: a few seconds after the member acts ──
  // Runs only in the page's top-level component (engine: true), so each reply happens once.
  useEffect(() => {
    if (!ready || !engine) return;
    const t = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const s = structuredClone(state);
      const newProjects: { p: Project; welcome: { from: PersonId; text: string }[] }[] = [];

      for (const a of s.applications) {
        const call = s.calls.find((c) => c.id === a.callId);
        if (!call) continue;
        if (a.arrivesAt && a.arrivesAt <= now) {
          a.arrivesAt = undefined; changed = true;
          bell("collab_application", `${PEOPLE[a.applicant].name} applied to ${call.title} as ${a.role}.`, `/collaborate/review/${call.id}`);
        }
        if (!a.nextAt || a.nextAt > now) continue;
        a.nextAt = undefined; changed = true;
        const host = first(call.host);
        if (a.applicant === ME) {
          // The host's side.
          if (a.stage === "submitted") {
            a.stage = "viewed"; a.history.push({ stage: "viewed", at: now, note: `${host} opened your application.` });
            a.nextAt = now + 12 * SEC;
            bell("collab_update", `${host} is reviewing your application to ${call.title}.`, "/collaborate/applications");
          } else if (a.stage === "viewed") {
            a.stage = "shortlisted"; a.history.push({ stage: "shortlisted", at: now, note: `${host} shortlisted you. Pick a time for a 20-minute conversation.` });
            bell("collab_update", `You're shortlisted for ${call.title}. Pick a time to talk with ${host}.`, "/collaborate/applications");
          } else if (a.stage === "conversation") {
            a.stage = "offer"; a.offer = { role: a.role, fee: call.fee, start: call.timeline[call.timeline.length - 2]?.when ?? "Soon" };
            a.history.push({ stage: "offer", at: now, note: `${host} would like you on the team as ${a.role}.` });
            bell("collab_update", `${host} offered you a place on ${call.title}.`, "/collaborate/applications");
          }
        } else if (call.postedByMe) {
          // An applicant to my call, answering me.
          if (a.stage === "shortlisted" && !a.slot) {
            a.slot = SLOTS[2]; a.history.push({ stage: "shortlisted", at: now, note: `${first(a.applicant)} picked ${a.slot}.` });
          } else if (a.stage === "offer") {
            a.stage = "joined"; a.history.push({ stage: "joined", at: now, note: `${first(a.applicant)} accepted and joined the project.` });
            let p = s.projects.find((x) => x.callId === call.id);
            if (!p) {
              p = makeProject({ title: call.title, summary: call.summary, photo: call.photo, host: ME, callId: call.id, members: [{ id: ME, role: "Host", contribution: "Runs the project" }], stage: 2, kind: kindForFields(call.fields) });
              p.budget.total = feeTotal(call.fee, call.teamSize);
              s.projects.unshift(p);
              newProjects.push({ p, welcome: [{ from: a.applicant, text: `Thanks for having me! Excited to start on ${call.title}.` }] });
            }
            if (!p.members.some((m) => m.id === a.applicant)) {
              p.members.push({ id: a.applicant, role: a.role, contribution: a.role });
              p.charter = { ...newCharter(p.members.map((m) => m.id), p.members.map((m) => m.id).filter((m) => m !== ME)) };
              p.ledger.push({ at: now, who: a.applicant, what: `Joined as ${a.role}` });
              // Nothing started yet: share the starter plan out again now there's someone to share it with.
              if ((p.deliverables ?? []).every((d) => d.status === "todo")) p.deliverables = starterDeliverables(p.kind ?? "make", p);
            }
            a.projectId = p.id;
            bell("collab_update", `${first(a.applicant)} accepted your offer and joined ${call.title}. Agree the terms to start.`, `/collaborate/projects/${p.id}?tab=agree`);
          }
        }
      }

      for (const pr of s.proposals) {
        if (!pr.nextAt || pr.nextAt > now || pr.status !== "sent") continue;
        pr.nextAt = undefined; pr.status = "accepted"; changed = true;
        const p = makeProject({
          title: pr.title, summary: pr.idea, photo: "collabArt", host: ME, proposalId: pr.id, stage: 1,
          members: [{ id: ME, role: pr.myRole, contribution: pr.myRole }, { id: pr.to, role: pr.theirRole, contribution: pr.theirRole }],
        });
        p.studio.push({ id: newId("s"), kind: "note", title: "The idea", by: ME, tag: "Reference", at: now, text: pr.idea, comments: [{ by: pr.to, text: "Love this. I've got a few references, adding them now.", at: now }] });
        p.charter.signed = [];
        pr.projectId = p.id;
        s.projects.unshift(p);
        newProjects.push({ p, welcome: [{ from: pr.to, text: `Yes! Let's make ${pr.title} happen. I've added a note to our studio.` }] });
        bell("collab_update", `${PEOPLE[pr.to].name} said yes to ${pr.title}. Your idea canvas is open.`, `/collaborate/projects/${p.id}?tab=work`);
      }

      // Deliverables: the approver answers what the member sent for review; teammates send back what was asked.
      for (const p of s.projects) {
        for (const d of p.deliverables ?? []) {
          if (!d.nextAt || d.nextAt > now) continue;
          d.nextAt = undefined; changed = true;
          if (d.status === "review" && d.approver !== ME) {
            d.status = "approved"; d.approvedAt = now;
            d.thread.push({ by: d.approver, text: "Checked it properly. This is exactly what we agreed. Approved.", at: now, kind: "approved" });
            p.ledger.push({ at: now, who: d.approver, what: `Approved "${d.title}", delivered by ${first(d.owner)}` });
            bell("collab_update", `${first(d.approver)} approved "${d.title}" on ${p.title}. It's on your work profile as verified work.`, `/collaborate/projects/${p.id}?tab=work&d=${d.id}`);
          } else if (d.status === "changes" && d.owner !== ME) {
            d.status = "review";
            d.thread.push({ by: d.owner, text: "Fixed what you asked for. Have another look?", at: now, kind: "submitted" });
            bell("collab_update", `${first(d.owner)} sent "${d.title}" back for your review.`, `/collaborate/projects/${p.id}?tab=work&d=${d.id}`);
          }
        }
      }

      for (const p of s.projects) {
        if (!p.signAt || p.signAt > now) continue;
        p.signAt = undefined; changed = true;
        for (const m of p.members) if (!p.charter.signed.includes(m.id)) { p.charter.signed.push(m.id); p.ledger.push({ at: now, who: m.id, what: "Signed the charter" }); }
        if (p.charter.signed.length === p.members.length) {
          p.charter.signedAt = now; if (p.stage < 3) p.stage = 3;
          p.ledger.push({ at: now, who: "akines", what: "Charter signed by everyone. Work can start." });
          bell("collab_update", `Everyone signed the charter for ${p.title}. Work can start.`, `/collaborate/projects/${p.id}?tab=work`);
        }
      }

      if (changed) {
        setState(s);
        for (const n of newProjects) ensureConvo(n.p, n.welcome);
      }
    }, SEC);
    return () => clearInterval(t);
  }, [ready, engine, state, setState, ensureConvo]);

  // ── Applicant ──
  const apply = (input: Pick<Application, "callId" | "role" | "works" | "links" | "files" | "statement" | "availability" | "materials">) => {
    const id = newId("a");
    update((s) => ({ ...s, applications: [{ ...input, id, applicant: ME, stage: "submitted", history: [{ stage: "submitted", at: Date.now() }], notes: [], tags: [], nextAt: Date.now() + 6 * SEC }, ...s.applications] }));
    return id;
  };
  const pickSlot = (appId: string, slot: string) => update((s) => {
    const a = s.applications.find((x) => x.id === appId)!;
    a.slot = slot; a.stage = "conversation"; a.history.push({ stage: "conversation", at: Date.now(), note: `Conversation booked: ${slot}.` }); a.nextAt = Date.now() + 8 * SEC;
    return s;
  });
  const withdraw = (appId: string) => update((s) => {
    const a = s.applications.find((x) => x.id === appId)!;
    a.stage = "withdrawn"; a.nextAt = undefined; a.history.push({ stage: "withdrawn", at: Date.now(), note: "You withdrew this application." });
    return s;
  });
  /** Accepting an offer opens the project workspace (S1: Agree comes first). */
  const acceptOffer = (appId: string) => {
    let projectId = "";
    let created: Project | null = null;
    update((s) => {
      const a = s.applications.find((x) => x.id === appId)!;
      const call = s.calls.find((c) => c.id === a.callId)!;
      let p = s.projects.find((x) => x.callId === call.id);
      if (!p) {
        const team: PersonId[] = (["wanjiru", "kwame", "chidi", "tunde"] as PersonId[]).filter((x) => x !== call.host).slice(0, Math.max(0, Math.min(call.teamSize, 3) - 2));
        p = makeProject({
          title: call.title, summary: call.summary, photo: call.photo, host: call.host, callId: call.id, stage: 2, kind: kindForFields(call.fields),
          members: [{ id: call.host, role: "Host", contribution: `For ${call.org}` }, ...team.map((id, i) => ({ id, role: call.roles[(i + 1) % call.roles.length] ?? "Teammate", contribution: call.roles[(i + 1) % call.roles.length] ?? "Teammate" })), { id: ME, role: a.role, contribution: a.role }],
        });
        p.charter.signed = p.members.map((m) => m.id).filter((m) => m !== ME);
        p.budget.total = feeTotal(call.fee, call.teamSize);
        p.ledger.push({ at: Date.now(), who: call.host, what: `Accepted ${first(ME)} from the open call` });
        s.projects.unshift(p);
        created = p;
      }
      a.stage = "joined"; a.projectId = p.id; a.history.push({ stage: "joined", at: Date.now(), note: "You accepted. The project workspace is open." });
      projectId = p.id;
      return s;
    });
    if (created) {
      const p: Project = created;
      ensureConvo(p, [{ from: p.host, text: `Welcome to the team, ${first(ME)}! First step: read the charter and sign it, then we start.` }]);
    }
    return projectId;
  };
  const declineOffer = (appId: string) => update((s) => {
    const a = s.applications.find((x) => x.id === appId)!;
    a.stage = "withdrawn"; a.history.push({ stage: "withdrawn", at: Date.now(), note: "You turned down the offer." });
    return s;
  });

  // ── Host ──
  const postCall = (call: Omit<CollabCall, "id" | "host" | "postedByMe" | "verified">) => {
    const id = `${call.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}-${Date.now().toString(36)}`;
    const now = Date.now();
    const arrivals: [PersonId, number, string][] = [["chidi", 8, "I'd love to help and learn on a real project."], ["wanjiru", 20, "This is close to my own work. I have ideas already."], ["kwame", 40, "I can give two evenings a week and the weekend."]];
    update((s) => ({
      ...s,
      calls: [{ ...call, id, host: ME, postedByMe: true, verified: false }, ...s.calls],
      applications: [...arrivals.map(([who, sec, statement], i): Application => ({
        id: `${id}-${who}`, callId: id, applicant: who, role: call.roles[i % call.roles.length], works: [], ...sampleProof(who, call.roles[i % call.roles.length]), statement, availability: "Weekends and evenings",
        materials: { works: true, why: true, availability: true }, stage: "submitted", history: [{ stage: "submitted", at: now + sec * SEC }], notes: [], tags: [], arrivesAt: now + sec * SEC,
      })), ...s.applications],
    }));
    return id;
  };
  const setAppStage = (appId: string, stage: AppStage, extra: { feedback?: string; note?: string } = {}) => update((s) => {
    const a = s.applications.find((x) => x.id === appId)!;
    const call = s.calls.find((c) => c.id === a.callId)!;
    a.stage = stage;
    if (extra.feedback) a.feedback = extra.feedback;
    if (stage === "offer") a.offer = { role: a.role, fee: call.fee, start: call.timeline[call.timeline.length - 2]?.when ?? "Soon" };
    a.history.push({ stage, at: Date.now(), note: extra.note });
    if (stage === "shortlisted" && !a.slot) a.nextAt = Date.now() + 5 * SEC;
    if (stage === "offer") a.nextAt = Date.now() + 5 * SEC;
    return s;
  });
  const addNote = (appId: string, text: string) => update((s) => { s.applications.find((x) => x.id === appId)!.notes.unshift({ at: Date.now(), text }); return s; });
  const toggleTag = (appId: string, tag: string) => update((s) => {
    const a = s.applications.find((x) => x.id === appId)!;
    a.tags = a.tags.includes(tag) ? a.tags.filter((t) => t !== tag) : [...a.tags, tag];
    return s;
  });
  const rate = (appId: string, rating: number) => update((s) => { s.applications.find((x) => x.id === appId)!.rating = rating; return s; });

  // ── Proposals ──
  const propose = (input: Pick<Proposal, "to" | "title" | "idea" | "myRole" | "theirRole">) => update((s) => ({ ...s, proposals: [{ ...input, id: newId("pr"), status: "sent", at: Date.now(), nextAt: Date.now() + 6 * SEC }, ...s.proposals] }));

  // ── Project workspace ──
  const editProject = (id: string, fn: (p: Project) => void) => update((s) => { const p = s.projects.find((x) => x.id === id); if (p) fn(p); return s; });
  const log = (p: Project, who: Project["ledger"][number]["who"], what: string) => p.ledger.push({ at: Date.now(), who, what });
  const editD = (id: string, dId: string, fn: (d: Deliverable, p: Project) => void) => editProject(id, (p) => { const d = (p.deliverables ?? []).find((x) => x.id === dId); if (d) fn(d, p); });

  const project = {
    sign: (id: string) => editProject(id, (p) => {
      if (!p.charter.signed.includes(ME)) { p.charter.signed.push(ME); log(p, ME, "Signed the charter"); }
      if (p.charter.signed.length === p.members.length) {
        p.charter.signedAt = Date.now(); if (p.stage < 3) p.stage = 3; log(p, "akines", "Charter signed by everyone. Work can start.");
      } else p.signAt = Date.now() + 4 * SEC;
    }),
    editCharter: (id: string, field: keyof Omit<Charter, "split" | "signed" | "signedAt">, value: string) => editProject(id, (p) => {
      p.charter[field] = value;
      if (p.charter.signed.length) { p.charter.signed = []; p.charter.signedAt = undefined; log(p, ME, `Changed the ${field} terms, so everyone signs again`); }
    }),
    setSplit: (id: string, split: Partial<Record<PersonId, number>>) => editProject(id, (p) => {
      p.charter.split = split;
      if (p.charter.signed.length) { p.charter.signed = []; p.charter.signedAt = undefined; log(p, ME, "Changed the revenue split, so everyone signs again"); }
    }),
    toAgree: (id: string) => editProject(id, (p) => { p.stage = 2; log(p, ME, "Moved the idea to Agree: time to set the terms"); }),
    setStage: (id: string, stage: JourneyStage) => editProject(id, (p) => { p.stage = stage; log(p, ME, `Moved the project to ${["Discover", "Imagine", "Agree", "Create", "Present", "Share value", "Preserve"][stage]}`); }),
    addTask: (id: string, task: Omit<Task, "id" | "status">) => editProject(id, (p) => { p.tasks.push({ ...task, id: newId("t"), status: "todo" }); log(p, ME, `Added a task: ${task.title}`); }),
    moveTask: (id: string, taskId: string, status: Task["status"]) => editProject(id, (p) => {
      const t = p.tasks.find((x) => x.id === taskId)!; t.status = status;
      if (status === "done") log(p, t.who, `Finished: ${t.title}`);
    }),
    toggleMilestone: (id: string, mId: string) => editProject(id, (p) => {
      const m = p.milestones.find((x) => x.id === mId)!; m.done = !m.done;
      if (m.done) log(p, "akines", `Milestone done: ${m.title}`);
    }),
    addMilestone: (id: string, title: string, due: string) => editProject(id, (p) => { p.milestones.push({ id: newId("m"), title, due, done: false }); }),
    addStudio: (id: string, item: Omit<StudioItem, "id" | "at" | "comments" | "by">) => editProject(id, (p) => { p.studio.unshift({ ...item, id: newId("s"), by: ME, at: Date.now(), comments: [] }); log(p, ME, `Added "${item.title}" to the studio`); }),
    comment: (id: string, itemId: string, text: string) => editProject(id, (p) => { p.studio.find((x) => x.id === itemId)!.comments.push({ by: ME, text, at: Date.now() }); }),
    tagStudio: (id: string, itemId: string, tag: StudioItem["tag"]) => editProject(id, (p) => {
      const it = p.studio.find((x) => x.id === itemId)!; it.tag = tag;
      if (tag === "Final") log(p, ME, `Marked "${it.title}" as final`);
    }),
    // ── Deliverables (S6): owner, approver, proof, review ──
    setKind: (id: string, kind: WorkKind, withStarter: boolean) => editProject(id, (p) => {
      p.kind = kind;
      if (withStarter && !(p.deliverables ?? []).length) { p.deliverables = starterDeliverables(kind, p); log(p, ME, `Set up the plan for ${KITS[kind].label.toLowerCase()} work`); }
    }),
    addDeliverable: (id: string, d: Pick<Deliverable, "title" | "owner" | "approver" | "due" | "share">) => editProject(id, (p) => {
      (p.deliverables ??= []).push({ ...d, id: newId("d"), status: "todo", steps: [], proof: [], thread: [] });
      log(p, ME, `Added "${d.title}" for ${d.owner === ME ? "you" : first(d.owner)}`);
    }),
    removeDeliverable: (id: string, dId: string) => editProject(id, (p) => { p.deliverables = (p.deliverables ?? []).filter((x) => x.id !== dId); }),
    startDeliverable: (id: string, dId: string) => editD(id, dId, (d) => { d.status = "doing"; }),
    /** Moving a card back to To do (dragging on the board). */
    backToTodo: (id: string, dId: string) => editD(id, dId, (d) => { if (d.status === "doing") d.status = "todo"; }),
    submitDeliverable: (id: string, dId: string, note: string) => editD(id, dId, (d, p) => {
      d.status = "review"; d.thread.push({ by: ME, text: note || "Ready for your review.", at: Date.now(), kind: "submitted" });
      log(p, ME, `Sent "${d.title}" to ${first(d.approver)} for review`);
      if (d.approver !== ME) d.nextAt = Date.now() + 7 * SEC;
    }),
    approveDeliverable: (id: string, dId: string, note: string) => editD(id, dId, (d, p) => {
      d.status = "approved"; d.approvedAt = Date.now(); d.nextAt = undefined;
      d.thread.push({ by: ME, text: note || "Approved. Thank you.", at: Date.now(), kind: "approved" });
      log(p, ME, `Approved "${d.title}", delivered by ${first(d.owner)}`);
    }),
    askChanges: (id: string, dId: string, note: string) => editD(id, dId, (d, p) => {
      d.status = "changes"; d.thread.push({ by: ME, text: note, at: Date.now(), kind: "changes" });
      log(p, ME, `Asked for changes on "${d.title}"`);
      if (d.owner !== ME) d.nextAt = Date.now() + 9 * SEC;
    }),
    commentDeliverable: (id: string, dId: string, text: string) => editD(id, dId, (d) => { d.thread.push({ by: ME, text, at: Date.now(), kind: "comment" }); }),
    addProof: (id: string, dId: string, item: Omit<ProofItem, "id" | "by" | "at">) => editD(id, dId, (d, p) => {
      d.proof.push({ ...item, id: newId("pf"), by: ME, at: Date.now() });
      if (d.status === "todo") d.status = "doing";
      log(p, ME, `Added ${item.kind === "link" ? "a link" : item.kind === "file" ? "a file" : item.kind === "image" ? "a photo" : "a note"} to "${d.title}"`);
    }),
    removeProof: (id: string, dId: string, proofId: string) => editD(id, dId, (d) => { d.proof = d.proof.filter((x) => x.id !== proofId); }),
    addStep: (id: string, dId: string, title: string) => editD(id, dId, (d) => { d.steps.push({ id: newId("st"), title, done: false }); }),
    toggleStep: (id: string, dId: string, stepId: string) => editD(id, dId, (d) => { const st = d.steps.find((x) => x.id === stepId); if (st) st.done = !st.done; }),
    addTool: (id: string, tool: Omit<Tool, "id">) => editProject(id, (p) => { (p.tools ??= []).push({ ...tool, id: newId("tl") }); log(p, ME, `Pinned ${tool.label}`); }),
    removeTool: (id: string, toolId: string) => editProject(id, (p) => { p.tools = (p.tools ?? []).filter((x) => x.id !== toolId); }),
    checkin: (id: string, c: Pick<Checkin, "done" | "next" | "stuck">) => editProject(id, (p) => { (p.checkins ??= []).unshift({ ...c, id: newId("ci"), who: ME, at: Date.now() }); log(p, ME, "Posted a weekly check-in"); }),

    addExpense: (id: string, label: string, amount: number) => editProject(id, (p) => { p.budget.expenses.push({ id: newId("e"), label, amount, by: ME, status: "pending" }); log(p, ME, `Logged an expense: ${label}`); }),
    payExpense: (id: string, eId: string) => editProject(id, (p) => { const e = p.budget.expenses.find((x) => x.id === eId)!; e.status = "paid"; log(p, "akines", `Paid back: ${e.label}`); }),
    payOut: (id: string) => editProject(id, (p) => { p.budget.paidOut = p.members.map((m) => m.id); p.stage = Math.max(p.stage, 5) as JourneyStage; log(p, "akines", "Shares paid out to everyone, as agreed in the charter"); }),
    toggleCheck: (id: string, i: number) => editProject(id, (p) => { p.present.checklist[i].done = !p.present.checklist[i].done; }),
    setPresent: (id: string, present: Project["present"]) => editProject(id, (p) => { p.present = present; }),
    preserve: (id: string) => editProject(id, (p) => { p.stage = 6; log(p, "akines", "Project preserved: credits and history are now permanent"); }),
    /** A private live room for the team (reuses Presence Rooms). Returns the room's address. */
    startRoom: (p: Project, ritual?: string) => {
      const room: Room = {
        id: newId("room"), title: `${p.title} · ${ritual ? ritual.toLowerCase() : "working session"}`, host: ME, when: "Starting now", status: "soon",
        blurb: `A private working session for the ${p.title} team.`, seated: [ME], photo: p.photo, tag: "Collaboration", mine: true, visibility: "private",
      };
      setRooms((cur) => [room, ...cur]);
      editProject(p.id, (x) => { x.rooms.unshift(room.id); log(x, ME, ritual ? `Started a ${ritual.toLowerCase()}` : "Started a live working session"); });
      return `/rooms/${room.id}?demo=start`;
    },
    /** A message in the project's chat (the same thread as in KinMessage); a teammate answers in the demo. */
    send: (p: Project, text: string) => {
      const mine: KMsg = { id: newId("m"), from: ME, at: clock(), kind: "text", text };
      setMsgs((cur) => ({ ...cur, [p.convoId]: [...(cur[p.convoId] ?? []), mine] }));
      const others = p.members.filter((m) => m.id !== ME);
      if (!others.length) return;
      const who = others[Math.floor(Math.random() * others.length)].id;
      const replies = ["Good shout, on it.", "Agreed. I'll put it on the plan.", "Love it. Can we look at it together in the room later?", "Yes! Adding my part to the studio tonight."];
      setTimeout(() => setMsgs((cur) => ({ ...cur, [p.convoId]: [...(cur[p.convoId] ?? []), { id: newId("m"), from: who, at: clock(), kind: "text", text: replies[Math.floor(Math.random() * replies.length)] }] })), 2500);
    },
  };

  const thread = (p: Project): KMsg[] => {
    const base = convos.find((c) => c.id === p.convoId)?.msgs ?? [];
    return [...base, ...(msgs[p.convoId] ?? [])];
  };

  // The engine clears arrivesAt once an application has "arrived".
  const visibleApps = state.applications.filter((a) => !a.arrivesAt);
  return {
    ready, state, calls: state.calls, apps: visibleApps, projects: state.projects, proposals: state.proposals,
    myApps: visibleApps.filter((a) => a.applicant === ME),
    hostedCalls: state.calls.filter((c) => c.postedByMe),
    call: (id: string) => state.calls.find((c) => c.id === id),
    appFor: (callId: string) => visibleApps.find((a) => a.callId === callId && a.applicant === ME && a.stage !== "withdrawn"),
    toggleSave: (callId: string) => update((s) => ({ ...s, saved: s.saved.includes(callId) ? s.saved.filter((x) => x !== callId) : [...s.saved, callId] })),
    apply, pickSlot, withdraw, acceptOffer, declineOffer, postCall, setAppStage, addNote, toggleTag, rate, propose, project, thread, ensureConvo,
    reset: () => setState(seedState()),
  };
}

/** A rough project budget from a call's fee line, e.g. "₦600,000 lead · ₦250,000 per teammate" → 600k + 250k × the rest. */
function feeTotal(fee: string, team: number) {
  const nums = [...fee.matchAll(/₦\s?([\d,.]+)\s?(m|k)?/gi)].map((m) => Number(m[1].replace(/,/g, "")) * (m[2]?.toLowerCase() === "m" ? 1_000_000 : m[2]?.toLowerCase() === "k" ? 1000 : 1));
  if (!nums.length) return 0;
  return nums.length > 1 ? nums[0] + nums[1] * Math.max(0, team - 2) : nums[0];
}

/** A kit's starter plan for this team: owners take turns, the host approves (or the next person, for the host's own). */
function starterDeliverables(kind: WorkKind, p: Pick<Project, "members" | "host">): Deliverable[] {
  const doers = p.members.filter((m) => m.id !== p.host).map((m) => m.id);
  const pool = doers.length ? doers : p.members.map((m) => m.id);
  return KITS[kind].starter.map((st, i) => {
    const owner = pool[i % pool.length];
    const approver = owner === p.host ? (p.members.find((m) => m.id !== owner)?.id ?? owner) : p.host;
    return { id: newId("d"), title: st.title, due: st.due, share: st.share, owner, approver, status: "todo", steps: [], proof: [], thread: [] };
  });
}

function makeProject(p: Pick<Project, "title" | "summary" | "photo" | "host" | "members" | "stage"> & { callId?: string; proposalId?: string; kind?: WorkKind }): Project {
  const id = `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32)}-${Date.now().toString(36)}`;
  const now = Date.now();
  return {
    ...p, id, createdAt: now, charter: newCharter(p.members.map((m) => m.id)),
    tasks: [], milestones: [{ id: "m1", title: "Terms agreed by everyone", due: "This week", done: false }, { id: "m2", title: "First draft shared in the studio", due: "Next week", done: false }, { id: "m3", title: "Presented", due: "Later", done: false }],
    studio: [], present: { what: "", where: "", when: "", checklist: [{ label: "Agree where it will be shown", done: false }, { label: "Final version marked in the studio", done: false }, { label: "Invite people", done: false }] },
    budget: { total: 0, currency: "₦", expenses: [], paidOut: [] },
    ledger: [{ at: now, who: p.host, what: "Started the project" }], convoId: `co-${id}`, rooms: [],
    tools: [], checkins: [], deliverables: p.kind ? starterDeliverables(p.kind, p) : [],
  };
}
