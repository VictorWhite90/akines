"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUp, Check, Sparkle } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { toast } from "@/components/kin/Toast";
import { DEMO } from "@/lib/demo/mode";
import { useCollab } from "@/lib/collab/useCollab";
import { useDrafts, type DraftAnswers } from "@/lib/collab/drafts";
import type { WorkspaceKind } from "@/lib/collab/workspace";
import { BLANK, NEEDS, PREPARE_MS, SAMPLE, STAGES, TYPES, briefOf, followSample, needsList, needsSentence, recommend, stageOf, type Brief } from "@/components/collaborate/start/data";
import { callFrom } from "@/components/collaborate/start/call";
import "../project-chat.css";

/*
 * Create AI starts a project inside the thread, mirrored from the product design (Figma section 16, journey 16.3,
 * their project-chat.tsx). Each step shows the person's last answer and the assistant's current message, nothing
 * older. Questions and the brief and workspace rules are our Start a project builder's (collaborate/start/data), and
 * it ends the same way: Save project posts the open call (useCollab().postCall), Save as draft keeps a draft.
 * The state lives in `useProjectChat`, called by Companion, so closing and reopening the panel keeps the conversation.
 */

export type ChatStep = "start" | "idea" | "q1" | "q2" | "q3" | "q4" | "stage" | "people" | "workspace" | "accepted"
  | "preparing" | "interrupted" | "review" | "change" | "updated" | "approved" | "saved" | "draft";
type View = { step: ChatStep; you: string | null };

/** The button "Start a project" of the Ask anything answer opens this thread instead of the page. */
export const START_PATH = "/collaborate/start";
const MATCHING = "/collaborate/collaborators/matching";
const DRAFTS = "/collaborate/my-projects/drafts";

/** The design's sample answers fill the field in the demo; members start empty. */
const FRESH: DraftAnswers = DEMO ? SAMPLE : BLANK;

/** Figma "Create AI / Workspace card" Type=Research and Type=Digital art. `recommend` (start/data) picks the type. */
const WORKSPACE: Record<WorkspaceKind, { name: string; why: string; photo: string; ask: string; idea: string }> = {
  research: {
    name: "Research Workspace",
    why: "Research, shared writing and a team report.",
    photo: "/kin/assistant/workspace-research.jpg",
    ask: "Based on your project, I recommend the Research Workspace. It is where your team will write, comment and review together. Accept it to continue.",
    idea: "One idea: name the students, teachers and parents you want to help, so it is easier to find the right collaborators.",
  },
  art: {
    name: "Digital Art Workspace",
    why: "Visual creation, illustration and shared artwork.",
    photo: "/kin/assistant/workspace-art.jpg",
    ask: "Based on your project, I recommend the Digital Art Workspace. It is where your team will draw, comment and review together. Accept it to continue.",
    idea: "One idea: name the dyers and makers you want to feature, so it is easier to find the right collaborators.",
  },
};
/** Figma Message form, Filled, on the Change step (the demo's sample). */
const CHANGE_DUMMY = DEMO ? "Add that we will start with ten schools in Lagos." : "";

const QUESTION_COPY: Record<"q1" | "q2" | "q3" | "q4", string> = {
  q1: "Thanks. What problem are you trying to solve?",
  q2: "Who is this for?",
  q3: "What would success look like?",
  q4: "Why do you care about this?",
};
const NEXT_Q = { q1: "q2", q2: "q3", q3: "q4", q4: "stage" } as const;
const isQ = (s: ChatStep): s is "q1" | "q2" | "q3" | "q4" => s === "q1" || s === "q2" || s === "q3" || s === "q4";

/** "Add that we will start with ten schools in Lagos." becomes the sentence "We will start with ten schools in Lagos." */
function sentenceOf(text: string): string {
  let s = text.trim().replace(/^add( that)?\s+/i, "");
  if (!s) return "";
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?]$/.test(s) ? s : `${s}.`;
}

export type ProjectChat = ReturnType<typeof useProjectChat>;

export function useProjectChat() {
  const [active, setActive] = useState(false);
  const [view, setView] = useState<View>({ step: "start", you: "Start a project" });
  const [answers, setAnswers] = useState<DraftAnswers>(FRESH);
  const [extra, setExtra] = useState("");
  const [draft, setDraft] = useState("");
  const [workspace, setWorkspace] = useState<WorkspaceKind | null>(null);
  /** What the thread saved: the open call it posted, or the draft it kept. */
  const [saved, setSaved] = useState<{ callId?: string; draftId?: string }>({});

  const enter = useCallback((step: ChatStep, you: string | null, a: DraftAnswers = answers) => {
    setView({ step, you });
    setDraft(step === "idea" ? a.idea : isQ(step) ? a.q[step] : step === "change" ? CHANGE_DUMMY : "");
  }, [answers]);

  const begin = useCallback(() => {
    setAnswers(FRESH); setExtra(""); setWorkspace(null); setDraft(""); setSaved({});
    setView({ step: "start", you: "Start a project" });
    setActive(true);
  }, []);
  const stop = useCallback(() => setActive(false), []);

  return { active, begin, stop, view, enter, answers, setAnswers, extra, setExtra, draft, setDraft, workspace, setWorkspace, saved, setSaved };
}

/* ------------------------------------------------------------------ pieces */

function Pills({ label, items, selected, onPick }: { label: string; items: { id: string; title: string }[]; selected?: string[]; onPick: (id: string, title: string) => void }) {
  return (
    <div className="cai-pills" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" className="cai-pill" aria-pressed={selected ? selected.includes(it.id) : undefined} onClick={() => onPick(it.id, it.title)}>
          {it.title}
        </button>
      ))}
    </div>
  );
}

/** Figma "Create AI / Workspace card": preview, status chip, name, why it fits. */
function WorkspaceCard({ accepted, kind }: { accepted: boolean; kind: WorkspaceKind }) {
  const ws = WORKSPACE[kind];
  return (
    <article className="cai-wcard" data-state={accepted ? "accepted" : "default"} data-kind={kind} aria-label={`${ws.name}, ${accepted ? "accepted" : "recommended"}`}>
      <div className="cai-wcard__preview">
        {/* eslint-disable-next-line @next/next/no-img-element -- a small fixed crop, as the design's */}
        <img src={ws.photo} loading="lazy" decoding="async" alt="" />
      </div>
      <div className="cai-wcard__body">
        <span className="cai-wcard__chip">
          {accepted ? <Check strokeWidth={1.5} absoluteStrokeWidth aria-hidden /> : <Sparkle strokeWidth={1.5} absoluteStrokeWidth aria-hidden />}
          <span>{accepted ? "ACCEPTED" : "RECOMMENDED"}</span>
        </span>
        <h3 className="cai-wcard__name">{ws.name}</h3>
        <p className="cai-wcard__why">{ws.why}</p>
      </div>
    </article>
  );
}

/** Figma "Create AI / Brief summary". */
function BriefCard({ name, overview, stage, support, workspace }: { name: string; overview: string; stage: string; support: string; workspace: string }) {
  return (
    <article className="cai-brief" aria-label="Project brief">
      <p className="cai-brief__name">{name}</p>
      <p className="cai-brief__text">{overview}</p>
      <p className="cai-brief__meta">Stage: {stage}</p>
      <p className="cai-brief__meta">Support needed: {support}</p>
      <p className="cai-brief__meta">Workspace: {workspace}</p>
    </article>
  );
}

const Typing = () => (
  <p className="cai-typing" role="status" aria-label="Create AI is putting your brief together"><span /><span /><span /></p>
);

/* ------------------------------------------------------------------ view */

type ViewProps = {
  chat: ProjectChat;
  /** closes the panel and goes to a page (sign up first for a visitor) */
  leave: (path: string) => void;
  /** a free question typed on a step whose field says "Ask Create AI anything": the thread goes back to the open chat */
  onAsk: (text: string) => void;
  signedIn: boolean;
};

const FREE_STEPS: ChatStep[] = ["preparing", "interrupted", "review", "updated", "approved", "saved", "draft"];

export function ProjectChatView({ chat, leave, onAsk, signedIn }: ViewProps) {
  const collab = useCollab();
  const drafts = useDrafts();
  const { view, enter, answers, setAnswers, extra, setExtra, draft, setDraft, workspace, setWorkspace, saved, setSaved } = chat;
  const { step, you } = view;
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const first = useRef(true);

  // the Workspace on offer follows the answers; once accepted, the accepted one stands for the rest of the thread
  const offered = recommend(answers);
  const kind: WorkspaceKind = workspace ?? offered;
  const ws = WORKSPACE[kind];
  const base = briefOf(answers);
  const overview = extra ? `${base.overview} ${sentenceOf(extra)}`.trim() : base.overview;
  const brief: Brief = { ...base, overview };
  const stage = stageOf(answers.stage)?.title ?? "Not chosen yet";
  const support = needsList(answers.needs);
  const needsLine = NEEDS.filter((n) => answers.needs.includes(n.id)).map((n) => n.title).join(", ");

  // every step is a fresh view: back to the top, and the text steps put the cursor in the field
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
    if (first.current) { first.current = false; return; }
    if ((step === "idea" || isQ(step) || step === "change") && window.matchMedia("(min-width: 1280px)").matches) {
      window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 60);
    }
  }, [step]);

  // Preparing: after a moment the brief. Offline, the brief is interrupted instead (the Interrupted frame).
  useEffect(() => {
    if (step !== "preparing") return;
    const t = window.setTimeout(() => (navigator.onLine === false ? enter("interrupted", you) : enter("review", null)), PREPARE_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /** Save as draft: the same draft the builder keeps, at the brief, with the overview the thread added to. */
  const saveDraft = () => {
    if (!signedIn) { leave("/signup"); return; }
    const none = base.overview.startsWith("Not added yet");
    const id = drafts.save({
      id: saved.draftId, title: brief.name, description: none ? answers.idea.trim() : brief.overview, answers,
      brief: extra ? { overview } : {}, workspace: workspace ?? undefined, at: "review",
    });
    setSaved({ ...saved, draftId: id });
    enter("draft", "Save as draft");
  };
  /** Save project: the open call for the people it needs, as the builder posts it. */
  const saveProject = async () => {
    if (!signedIn) { leave("/signup"); return; }
    if (saving) return;
    setSaving(true);
    const r = await collab.postCall(callFrom(answers, brief, kind));
    setSaving(false);
    if (!r.ok) { toast.show({ message: r.message || "We couldn’t save your project. Please try again." }); return; }
    if (saved.draftId) drafts.remove(saved.draftId);
    setSaved({ callId: r.id });
    enter("saved", "Save project");
  };

  /* ---- the field: its placeholder, whether it is a text step, what Send does */
  const locked = step === "workspace";
  const placeholder = step === "workspace" ? "Accept the Workspace to continue" : FREE_STEPS.includes(step) ? "Ask Create AI anything" : "Or type your own answer";
  const canSend = !locked && draft.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!canSend) return;
    switch (step) {
      case "start": {
        const next = { ...answers, type: "other" };
        setAnswers(next); setDraft("");
        enter("idea", text, next);
        return;
      }
      case "idea": {
        const next = followSample({ ...answers, idea: text });
        setAnswers(next);
        enter("q1", text, next);
        return;
      }
      case "q1": case "q2": case "q3": case "q4": {
        const next = { ...answers, q: { ...answers.q, [step]: text } };
        setAnswers(next);
        enter(NEXT_Q[step], text, next);
        return;
      }
      case "stage": enter("people", text); return;
      case "people": enter("workspace", text); return;
      case "accepted": enter("preparing", text); return;
      case "change": setExtra(text); enter("updated", text); return;
      default:
        // Preparing, Interrupted, Review, Updated, Approved, Saved, Draft saved: the field says "Ask Create AI anything"
        setDraft("");
        onAsk(text);
    }
  };

  const toggleNeed = (id: string) =>
    setAnswers((a) => ({ ...a, needs: NEEDS.filter((n) => (n.id === id ? !a.needs.includes(id) : a.needs.includes(n.id))).map((n) => n.id) }));

  /* ---- the message of each step */
  let assistant: ReactNode = null;
  switch (step) {
    case "start":
      assistant = (
        <>
          <p className="cai-ptext">Happy to help you start a project. I’ll ask a few short questions, and you can skip any of them. What would you like to bring to life?</p>
          <Pills label="What would you like to bring to life?" items={TYPES} onPick={(id, title) => { const next = { ...answers, type: id }; setAnswers(next); enter("idea", title, next); }} />
        </>
      );
      break;
    case "idea":
      assistant = <p className="cai-ptext">Nice. Tell me about your idea in a few sentences.</p>;
      break;
    case "q1": case "q2": case "q3": case "q4":
      assistant = (
        <>
          <p className="cai-ptext">{QUESTION_COPY[step]}</p>
          <div className="cai-pgo"><Button size="sm" variant="ghost" onClick={() => enter(NEXT_Q[step], null)}>Skip this one</Button></div>
        </>
      );
      break;
    case "stage":
      assistant = (
        <>
          <p className="cai-ptext">Where are you with this idea?</p>
          <Pills label="Where are you with this idea?" items={STAGES} onPick={(id, title) => { setAnswers((a) => ({ ...a, stage: id })); enter("people", title); }} />
        </>
      );
      break;
    case "people":
      assistant = (
        <>
          <p className="cai-ptext">What would help you move forward? Pick as many as you like.</p>
          <Pills label="What would help you move forward?" items={NEEDS} selected={answers.needs} onPick={(id) => toggleNeed(id)} />
          <div className="cai-pgo"><Button size="sm" disabled={answers.needs.length === 0} onClick={() => enter("workspace", needsLine)}>Done</Button></div>
        </>
      );
      break;
    case "workspace":
      assistant = (
        <>
          <p className="cai-ptext">{WORKSPACE[offered].ask}</p>
          <WorkspaceCard accepted={false} kind={offered} />
          <div className="cai-pgo"><Button size="sm" onClick={() => { setWorkspace(offered); enter("accepted", "Accept Workspace"); }}>Accept Workspace</Button></div>
        </>
      );
      break;
    case "accepted":
      assistant = (
        <>
          <p className="cai-ptext">Done. Your {ws.name} is saved to this project.</p>
          <WorkspaceCard accepted kind={kind} />
          <p className="cai-ptext">Next, I will prepare your project brief.</p>
          <div className="cai-pgo"><Button size="sm" onClick={() => enter("preparing", needsSentence(answers.needs))}>Prepare my brief</Button></div>
        </>
      );
      break;
    case "preparing":
      assistant = (
        <>
          <p className="cai-ptext">Thank you. Give me a moment while I put your brief together.</p>
          <Typing />
        </>
      );
      break;
    case "interrupted":
      assistant = (
        <>
          <p className="cai-ptext">Sorry, something interrupted your brief. Your answers are saved. Shall I try again?</p>
          <div className="cai-pgo">
            <Button size="sm" onClick={() => enter("preparing", you)}>Try again</Button>
            <Button size="sm" variant="secondary" onClick={chat.begin}>Start over</Button>
          </div>
        </>
      );
      break;
    case "review":
      assistant = (
        <>
          <p className="cai-ptext">Here is your project brief.</p>
          <BriefCard name={brief.name} overview={overview} stage={stage} support={support} workspace={ws.name} />
          <p className="cai-ptext">{ws.idea}</p>
          <div className="cai-pgo">
            <Button size="sm" onClick={() => enter("approved", "Approve brief")}>Approve brief</Button>
            <Button size="sm" variant="secondary" onClick={() => enter("change", "Change something")}>Change something</Button>
            <Button size="sm" variant="ghost" onClick={saveDraft}>Save as draft</Button>
          </div>
        </>
      );
      break;
    case "change":
      assistant = <p className="cai-ptext">Sure. What would you like to change?</p>;
      break;
    case "updated":
      assistant = (
        <>
          <p className="cai-ptext">Done. I’ve added it to the overview.</p>
          <BriefCard name={brief.name} overview={overview} stage={stage} support={support} workspace={ws.name} />
          <div className="cai-pgo">
            <Button size="sm" onClick={() => enter("approved", "Approve brief")}>Approve brief</Button>
            <Button size="sm" variant="ghost" onClick={saveDraft}>Save as draft</Button>
          </div>
        </>
      );
      break;
    case "approved":
      assistant = (
        <>
          <p className="cai-ptext">Your brief is approved. People you contact can see the name, overview, stage and support needed. Everything else stays private. Would you like to look for collaborators now?</p>
          <div className="cai-pgo">
            <Button size="sm" arrow="right" onClick={() => leave(MATCHING)}>Explore collaborators</Button>
            <Button size="sm" variant="secondary" loading={saving} onClick={() => void saveProject()}>Save project</Button>
          </div>
        </>
      );
      break;
    case "saved":
      assistant = (
        <>
          <p className="cai-ptext">Saved. {brief.name} is now in My Projects.</p>
          <div className="cai-pgo">
            <Button size="sm" variant="secondary" arrow="up-right" onClick={() => leave(saved.callId ? `/collaborate/projects/${encodeURIComponent(saved.callId)}` : "/collaborate/my-projects")}>Open my project</Button>
          </div>
        </>
      );
      break;
    case "draft":
      assistant = (
        <>
          <p className="cai-ptext">Draft saved. You can finish it any time from My Projects.</p>
          <div className="cai-pgo"><Button size="sm" variant="secondary" arrow="up-right" onClick={() => leave(DRAFTS)}>Open My Projects</Button></div>
        </>
      );
      break;
  }

  return (
    <>
      <div className="cai-body cai-body--flow" ref={bodyRef} aria-live="polite">
        {you ? <div className="cai-pmsg cai-pmsg--you" key={`you-${step}`}><p className="cai-bubble">{you}</p></div> : null}
        <div className="cai-pmsg" key={`bot-${step}`}>{assistant}</div>
      </div>
      <form className="cai-form" onSubmit={submit}>
        <label className="cai-field">
          <span className="sr-only">Message Create AI</span>
          <input ref={inputRef} className="cai-input" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} autoComplete="off" enterKeyHint="send" maxLength={600} disabled={locked} />
          <IconButton label="Send" size="sm" variant="primary" type="submit" disabled={!canSend}><ArrowUp strokeWidth={1.6} /></IconButton>
        </label>
        <p className="cai-foot">Create AI can get things wrong. Please check anything important.</p>
      </form>
    </>
  );
}
