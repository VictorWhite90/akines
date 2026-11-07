"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/kin/Toast";
import { DEMO } from "@/lib/demo/mode";
import { useCollab } from "@/lib/collab/useCollab";
import { useDrafts, type DraftAnswers, type DraftAt, type ProjectDraft } from "@/lib/collab/drafts";
import type { WorkspaceKind } from "@/lib/collab/workspace";
import { useLocal } from "@/lib/useLocal";
import { BLANK, SAMPLE, SAMPLE_ART, briefOf, followSample, isSample, recommend, type Brief, type BriefKey, type QId, type Step } from "./data";
import { Entry, Idea, People, Question, Stage, Workspace } from "./steps";
import { BriefError, Preparing, Ready, Review, type SuggestionState } from "./brief";
import { callFrom } from "./call";
import "../styles/home-start.css";

/*
 * Start a project, mirrored from the product design's builder (cs-flow): the idea, four questions on its purpose,
 * how far along it is and who would help, then the workspace Create AI recommends, the prepared brief and its
 * approval. The answers are kept in the browser as the member goes, and the builder is kept as a draft
 * (lib/collab/drafts) once they are past the idea. Saving the project posts an open call for the people it needs.
 */

const FRESH: DraftAnswers = DEMO ? SAMPLE : BLANK;
const TOAST_MS = 2500;

/** Where a builder step sits for a draft (null: not worth keeping yet). */
function atOf(s: Step): DraftAt | null {
  if (s === "entry" || s === "idea") return null;
  if (s === "q1" || s === "q2" || s === "q3" || s === "q4" || s === "stage" || s === "people") return s;
  if (s === "review" || s === "ready") return "review";
  return "workspace";
}

export default function StartProject({ initial = "entry" }: { initial?: Step }) {
  const router = useRouter();
  const params = useSearchParams();
  const collab = useCollab();
  const drafts = useDrafts();
  const [step, setStep] = useState<Step>(initial);
  const [answers, setAnswers] = useLocal<DraftAnswers>("ak:collab-start-answers", FRESH);
  const [edits, setEdits] = useLocal<Partial<Brief>>("ak:collab-start-brief", {});
  const [accepted, setAccepted] = useLocal<WorkspaceKind | null>("ak:collab-start-workspace", null);
  const [draftId, setDraftId] = useLocal<string | null>("ak:collab-start-draft", null);
  const [suggestions, setSuggestions] = useState<Record<string, SuggestionState>>({});
  const [saving, setSaving] = useState(false);
  const first = useRef(true);
  const resetOnLeave = useRef(false);

  const brief: Brief = { ...briefOf(answers), ...edits };
  const kind = accepted ?? recommend(answers);

  const reset = () => { setAnswers(FRESH); setEdits({}); setAccepted(null); setDraftId(null); };

  const resume = (d: ProjectDraft) => {
    setAnswers(d.answers); setEdits(d.brief as Partial<Brief>); setAccepted(d.workspace ?? null); setDraftId(d.id);
    const k = d.workspace ?? recommend(d.answers);
    setStep(d.at === "workspace" ? (k === "art" ? (d.workspace ? "workspace-art-accepted" : "workspace-art") : d.workspace ? "workspace-accepted" : "workspace") : d.at);
  };

  // Arriving: resume a draft (?draft=<id>), or start where the route says (their initial effect).
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !drafts.ready) return;
    loaded.current = true;
    const id = params.get("draft");
    if (id) {
      const d = drafts.get(id);
      // The drafts live in the browser, so they can only be read once it is ready.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (d) resume(d);
      router.replace("/collaborate/start", { scroll: false });
      return;
    }
    // The builder in the browser belongs to a draft that has since been deleted: start fresh.
    if (draftId && !drafts.get(draftId)) { reset(); return; }
    if (initial === "entry") { setAccepted(null); setAnswers((a) => (isSample(a, SAMPLE_ART) ? SAMPLE : a)); }
    if (initial === "workspace-art") setAnswers((a) => (isSample(a, SAMPLE) ? SAMPLE_ART : a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts.ready]);

  // After saving (a draft, or the project) the next Start a project begins empty.
  const resetRef = useRef(reset);
  useEffect(() => { resetRef.current = reset; });
  useEffect(() => () => { if (resetOnLeave.current) resetRef.current(); }, []);

  // A new step: back to the top, focus on its title.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector<HTMLElement>(".cs-step h1")?.focus({ preventScroll: true });
  }, [step]);

  function keep(at: DraftAt, a: DraftAnswers, ws: WorkspaceKind | null) {
    const b = { ...briefOf(a), ...edits };
    const none = b.overview.startsWith("Not added yet");
    const id = drafts.save({ id: draftId ?? undefined, title: b.name, description: none ? a.idea.trim() : b.overview, answers: a, brief: edits as Record<string, string>, workspace: ws ?? undefined, at });
    if (id !== draftId) setDraftId(id);
    return id;
  }

  const go = (to: Step) => {
    let next = to;
    if (next === "workspace") next = recommend(answers) === "art" ? "workspace-art" : "workspace";
    let a = answers;
    if (step === "idea" && next === "q1") { a = followSample(answers); setAnswers(a); }
    if (step === "preparing" && next === "review") setEdits({});
    if (next === "preparing") setSuggestions({});
    if (next === "entry") setAccepted(null);
    const at = atOf(next);
    if (at && a.idea.trim()) keep(at, a, next === "entry" ? null : accepted);
    setStep(next);
  };

  const saveDraft = () => {
    const id = keep("review", answers, accepted);
    resetOnLeave.current = true;
    router.push("/collaborate/my-projects/drafts");
    toast.show({ message: "Draft saved.", actionLabel: "Undo", duration: TOAST_MS, onAction: () => router.push(`/collaborate/start?draft=${encodeURIComponent(id)}`) });
  };

  const saveProject = async () => {
    if (saving) return;
    setSaving(true);
    const r = await collab.postCall(callFrom(answers, brief, kind));
    setSaving(false);
    if (!r.ok) { toast.show({ message: r.message || "We couldn’t save your project. Please try again." }); return; }
    if (draftId) drafts.remove(draftId);
    resetOnLeave.current = true;
    router.push(`/collaborate/projects/${encodeURIComponent(r.id)}`);
    toast.show({ message: "Project saved.", duration: TOAST_MS });
  };

  const props = { answers, setAnswers: (fn: (a: DraftAnswers) => DraftAnswers) => setAnswers(fn), go };
  let view: React.ReactNode = null;
  switch (step) {
    case "entry": view = <Entry go={go} />; break;
    case "idea": view = <Idea {...props} />; break;
    case "q1": case "q2": case "q3": case "q4": view = <Question {...props} qid={step as QId} />; break;
    case "stage": view = <Stage {...props} />; break;
    case "people": view = <People {...props} />; break;
    case "workspace": case "workspace-art": case "workspace-accepted": case "workspace-art-accepted": {
      const k: WorkspaceKind = step === "workspace" || step === "workspace-accepted" ? "research" : "art";
      view = <Workspace kind={k} accepted={step === "workspace-accepted" || step === "workspace-art-accepted"} project={brief.name}
        onAccept={() => { setAccepted(k); if (answers.idea.trim()) keep("workspace", answers, k); setStep(k === "research" ? "workspace-accepted" : "workspace-art-accepted"); }} go={go} />;
      break;
    }
    case "preparing": view = <Preparing answers={answers} go={go} />; break;
    case "error": view = <BriefError answers={answers} go={go} />; break;
    case "review":
      view = <Review brief={brief} workspace={kind} setBrief={(k: BriefKey, v: string) => setEdits((e) => ({ ...e, [k]: v }))} suggestions={suggestions}
        setSuggestion={(id, s) => setSuggestions((x) => ({ ...x, [id]: s }))} go={go} onDraft={saveDraft} />;
      break;
    case "ready": view = <Ready answers={answers} brief={brief} saving={saving} onExplore={() => router.push("/collaborate/collaborators/matching")} onSave={() => void saveProject()} />; break;
  }
  return (
    <div className="cs-flow" data-step={step}>
      <div key={step} className="cs-step">{view}</div>
    </div>
  );
}
