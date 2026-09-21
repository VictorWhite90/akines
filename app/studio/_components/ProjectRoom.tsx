"use client";

import { useState } from "react";
import { Eye, Lock1 } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import Tabs from "@/components/ui/Tabs";
import { ME_ID, getPerson } from "@/lib/data";
import type { Project } from "@/lib/types";
import { ROOM_TABS, firstName, joinNames, money, stageIndex, type RoomTab } from "../_data";
import AgreePanel, { type Signature } from "./room/AgreePanel";
import CreatePanel, { trancheFor, type Milestone, type Task } from "./room/CreatePanel";
import ImaginePanel, { DEFAULT_QUESTIONS, type Note, type Question } from "./room/ImaginePanel";
import PresentPanel from "./room/PresentPanel";
import PreservePanel from "./room/PreservePanel";
import ValuePanel from "./room/ValuePanel";
import { UpcomingStage, type LedgerEntry } from "./room/shared";

/** Tabs a non-member can't open: the working, contractual and financial parts of a room. */
const MEMBERS_ONLY: RoomTab[] = ["imagine", "agree", "create", "share-value"];

const TODAY = "Today";

export default function ProjectRoom({ project, initialTab, member }: { project: Project; initialTab: RoomTab; member: boolean }) {
  const [tab, setTab] = useState<RoomTab>(initialTab);
  const [preview, setPreview] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(project.idea.questions.length ? project.idea.questions : DEFAULT_QUESTIONS);
  const [notes, setNotes] = useState<Note[]>([]);
  const [signed, setSigned] = useState<Signature[]>(project.charter.signed);
  const [tasks, setTasks] = useState<Task[]>(project.tasks);
  const [milestones, setMilestones] = useState<Milestone[]>(project.milestones);
  const [ledger, setLedger] = useState<LedgerEntry[]>(project.ledger);
  const [listed, setListed] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const current = stageIndex(project.stage);
  const canAct = member;

  function record(contribution: string) {
    setLedger((l) => [...l, { date: TODAY, personId: ME_ID, contribution }]);
  }

  function answer(index: number, text: string) {
    setQuestions((qs) => qs.map((q, i) => (i === index ? { ...q, answers: [...q.answers, { personId: ME_ID, text }] } : q)));
    record(`Answered “${questions[index].q}”`);
    setAnnouncement("Your answer is on the canvas. Only members can see it.");
  }

  function addNote(text: string) {
    setNotes((n) => [...n, { personId: ME_ID, text, date: TODAY }]);
    record("Added a note to the idea canvas");
    setAnnouncement("Note added to the private canvas.");
  }

  function sign() {
    const next = signed.map((s) => (s.personId === ME_ID ? { ...s, date: TODAY } : s));
    setSigned(next);
    record("Signed the collaboration charter");
    const still = next.filter((s) => !s.date).map((s) => firstName(s.personId));
    setAnnouncement(
      still.length
        ? `You've signed. Waiting for ${joinNames(still)} — production opens when everyone has signed.`
        : "Everyone has signed. The charter is locked and the Create stage is open.",
    );
  }

  function moveTask(id: string, to: Task["status"]) {
    const task = tasks.find((t) => t.id === id);
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: to } : t)));
    if (task && to === "done") record(`Completed: ${task.title}`);
    const label = to === "todo" ? "To do" : to === "doing" ? "Doing" : "Done";
    setAnnouncement(task ? `Moved “${task.title}” to ${label}.` : "");
  }

  function approve(id: string) {
    const target = milestones.find((m) => m.id === id);
    if (!target) return;
    const approvals = target.approvals.map((a) => (a.personId === ME_ID ? { ...a, approved: true } : a));
    const allApproved = approvals.every((a) => a.approved);
    const idx = milestones.findIndex((m) => m.id === id);
    setMilestones((ms) =>
      ms.map((m, i) => {
        if (m.id === id) return { ...m, approvals, status: allApproved ? "done" : m.status };
        if (allApproved && i === idx + 1) {
          return { ...m, status: "current", approvals: m.approvals.length ? m.approvals : project.memberIds.map((personId) => ({ personId, approved: false })) };
        }
        return m;
      }),
    );
    record(`Approved milestone “${target.title}”`);
    const tranche = trancheFor(project);
    setAnnouncement(
      allApproved
        ? `“${target.title}” is approved by everyone. This releases the next budget tranche${tranche ? ` — ${money(tranche, project.currency)} from escrow, split per the charter` : ""}.`
        : `Your approval is recorded. Waiting for ${joinNames(approvals.filter((a) => !a.approved).map((a) => firstName(a.personId)))}.`,
    );
  }

  function list() {
    setListed(true);
    record("Proposed listing the work on Artelia Discover");
    setAnnouncement("Listing drafted — it goes live once every member approves.");
  }

  const hasData: Record<RoomTab, boolean> = {
    imagine: !!project.idea.prompt || project.idea.references.length > 0,
    agree: project.charter.roles.length > 0 || !!project.charter.newIp,
    create: tasks.length > 0 || milestones.length > 0 || project.files.length > 0,
    present: project.stage !== "imagine" && project.stage !== "agree",
    "share-value": project.budget.length > 0 || project.payments.length > 0,
    preserve: ledger.length > 0,
  };

  function panel(id: RoomTab) {
    switch (id) {
      case "imagine":
        return <ImaginePanel project={project} questions={questions} notes={notes} canAct={canAct} onAnswer={answer} onNote={addNote} />;
      case "agree":
        return <AgreePanel project={project} signed={signed} canAct={canAct} onSign={sign} />;
      case "create":
        return <CreatePanel project={project} tasks={tasks} milestones={milestones} canAct={canAct} onMove={moveTask} onApprove={approve} />;
      case "present":
        return <PresentPanel project={project} canAct={canAct && current >= stageIndex("present")} listed={listed} onList={list} showStory={current >= stageIndex("create")} />;
      case "share-value":
        return <ValuePanel project={project} />;
      case "preserve":
        return <PreservePanel project={project} ledger={ledger} />;
    }
  }

  function content(id: RoomTab) {
    if (!member && !preview && (MEMBERS_ONLY.includes(id) || project.stage === "imagine")) {
      return (
        <div className="flex flex-col gap-4">
          <Notice tone="private" title={project.stage === "imagine" ? "This idea canvas is private" : "Members only"}>
            {joinNames(project.memberIds.map((pid) => getPerson(pid).name.split(" ")[0]))} keep their idea canvas, charter, working room and payments private.
            {project.stage === "imagine" ? " Nothing about this canvas is public until they decide to present something." : " What anyone can see is the story (Present) and the credits and history (Preserve)."}
          </Notice>
          <div className="flex flex-col gap-2 rounded-[4px] border border-dashed border-sand-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-grey-700">Prototype only: in the product, people outside a project never see this area.</p>
            <Button size="sm" variant="ghost" onClick={() => setPreview(true)} icon={<Eye size={16} color="currentColor" aria-hidden />}>
              Show the member view
            </Button>
          </div>
        </div>
      );
    }
    const reached = stageIndex(id) <= current;
    if (!reached) {
      return (
        <UpcomingStage tab={id} project={project}>
          {hasData[id] ? panel(id) : undefined}
        </UpcomingStage>
      );
    }
    return panel(id);
  }

  const items = ROOM_TABS.map((t) => {
    const i = stageIndex(t.id);
    return { id: t.id, label: t.label, hint: i === current ? "· now" : i > current ? "· later" : undefined };
  });

  return (
    <section aria-labelledby="room-heading" className="mt-10">
      <h2 id="room-heading" className="sr-only">Project room</h2>
      {!member && preview && (
        <div className="mb-4 flex flex-col gap-2 rounded-[4px] border border-calm/30 bg-calm-bg p-3 text-sm text-calm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Lock1 size={16} color="currentColor" aria-hidden /> Prototype preview of the member view — read-only.
          </p>
          <Button size="sm" variant="ghost" onClick={() => setPreview(false)}>Hide member view</Button>
        </div>
      )}
      <Tabs items={items} value={tab} onChange={setTab} idPrefix="room" label="Project room stages" />
      <div aria-live="polite">
        {announcement && <p className="mt-4 rounded-[4px] bg-verified-bg px-4 py-3 text-sm font-semibold text-verified">{announcement}</p>}
      </div>
      {ROOM_TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`room-panel-${t.id}`}
          aria-labelledby={`room-tab-${t.id}`}
          hidden={tab !== t.id}
          tabIndex={0}
          className="mt-6 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {tab === t.id && content(t.id)}
        </div>
      ))}
    </section>
  );
}
