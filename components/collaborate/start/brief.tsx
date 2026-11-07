"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CircleCheck, Eye, Lock, Pencil, SlidersHorizontal, Sparkle, X } from "lucide-react";
import Button from "@/components/kin/Button";
import type { DraftAnswers } from "@/lib/collab/drafts";
import type { WorkspaceKind } from "@/lib/collab/workspace";
import { BRIEF_PARTS, PREPARE_MS, PREPARING, SUGGESTIONS, WORKSPACES, ideaLine, needsList, needsSentence, purposeLine, stageOf, type Brief, type BriefKey, type Step } from "./data";
import { Arrow, Back, Head, Ico, Notice } from "./parts";

/* The brief steps, mirrored from the product design: preparing, interrupted, review (editable) and approved. */

type MsgState = "done" | "active" | "pending";

function Messages({ states }: { states: MsgState[] }) {
  return (
    <ol className="cs-msgs" aria-label="Progress">
      {PREPARING.map((t, i) => (
        <li key={t} className="cs-msg" data-state={states[i]} aria-current={states[i] === "active" ? "step" : undefined}>
          <span className="cs-msg__ind" aria-hidden>{states[i] === "done" ? <Ico icon={Check} size={14} /> : states[i] === "active" ? <span className="cs-msg__dot" /> : null}</span>
          <span className="cs-msg__text">{t}</span>
        </li>
      ))}
    </ol>
  );
}

function WorkingFrom({ answers }: { answers: DraftAnswers }) {
  const rows: [string, string][] = [["Your idea", ideaLine(answers)], ["Your purpose", purposeLine(answers)], ["Your progress", stageOf(answers.stage)?.title ?? "Not chosen yet"], ["Your people", needsSentence(answers.needs)]];
  return (
    <aside className="cs-panel" aria-label="What we are working from">
      <p className="cs-eyebrow">What we’re working from</p>
      <dl className="cs-panel__rows">
        {rows.map(([k, v]) => <div key={k} className="cs-panel__row"><dt className="cs-eyebrow">{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <p className="cs-panel__note">Your answers are saved. You can return to edit them at any time.</p>
    </aside>
  );
}

/** Prepares the brief: four messages tick through, then the review (or the interruption, when offline). */
export function Preparing({ answers, go }: { answers: DraftAnswers; go: (s: Step) => void }) {
  const [at, setAt] = useState(0);
  const goRef = useRef(go);
  useEffect(() => { goRef.current = go; });
  useEffect(() => {
    const t: number[] = [];
    for (let i = 1; i < PREPARING.length; i++) t.push(window.setTimeout(() => setAt(i), (PREPARE_MS / 4) * i));
    t.push(window.setTimeout(() => { setAt(PREPARING.length); goRef.current(typeof navigator !== "undefined" && navigator.onLine === false ? "error" : "review"); }, PREPARE_MS));
    return () => t.forEach((x) => window.clearTimeout(x));
  }, []);
  const states = PREPARING.map((_, i): MsgState => (i < at ? "done" : i === at ? "active" : "pending"));
  return (
    <section className="cs-split" aria-busy="true">
      <div className="cs-split__main">
        <div className="cs-split__text cs-split__text--wide">
          <div className="cs-head">
            <p className="cs-eyebrow">Preparing your brief</p>
            <h1 className="cs-hero cs-hero--sm" tabIndex={-1} data-m="words">Bringing your idea into focus.</h1>
            <p className="cs-hero__support">We’re organising your thoughts into a project brief you can review, refine and share with potential collaborators.</p>
          </div>
          <Messages states={states} />
          <Back onClick={() => go("people")}>Back to my answers</Back>
        </div>
      </div>
      <WorkingFrom answers={answers} />
    </section>
  );
}

export function BriefError({ answers, go }: { answers: DraftAnswers; go: (s: Step) => void }) {
  return (
    <section className="cs-split">
      <div className="cs-split__main">
        <div className="cs-split__text cs-split__text--wide">
          <div className="cs-head">
            <p className="cs-eyebrow">Brief interrupted</p>
            <h1 className="cs-hero cs-hero--sm" tabIndex={-1} data-m="words">We couldn’t finish your brief.</h1>
            <p className="cs-hero__support">Nothing has been lost. Your answers are saved, so you can try again or go back and edit them.</p>
          </div>
          <Messages states={["done", "done", "pending", "pending"]} />
          <Notice title="Something interrupted the brief." tone="error">This is on our side. Please try again in a moment.</Notice>
          <div className="cs-btnrow">
            <Button onClick={() => go("preparing")}>Try again</Button>
            <Button variant="secondary" onClick={() => go("idea")}>Edit my answers</Button>
          </div>
        </div>
      </div>
      <WorkingFrom answers={answers} />
    </section>
  );
}

function Part({ id, label, title, text, editing, onEdit, onSave, onCancel }: { id: BriefKey; label: string; title?: boolean; text: string; editing: boolean; onEdit: () => void; onSave: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(text);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
  }, [editing]);
  useEffect(() => { const el = ref.current; if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight + 2}px`; } }, [draft, editing]);
  const can = draft.trim().length > 0;
  return (
    <section className="cs-bs" data-editing={editing || undefined} data-kind={title ? "title" : undefined} aria-label={label}>
      <div className="cs-bs__head">
        <h3 className="cs-bs__label">{label}</h3>
        {editing ? null : <button type="button" className="cs-bs__edit" onClick={() => { setDraft(text); onEdit(); }} aria-label={`Edit ${label.toLowerCase()}`}><Ico icon={Pencil} size={14} /><span>Edit</span></button>}
      </div>
      {editing ? (
        <>
          <textarea ref={ref} className="cs-bs__input" value={draft} rows={1} aria-label={label} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }} />
          <div className="cs-bs__actions">
            <Button disabled={!can} onClick={() => onSave(draft.trim())}>Save changes</Button>
            <Button variant="link" onClick={onCancel}>Cancel</Button>
          </div>
        </>
      ) : (
        <p className={title ? "cs-bs__text cs-bs__text--title" : "cs-bs__text"} id={`cs-bs-${id}`}>{text}</p>
      )}
    </section>
  );
}

export type SuggestionState = "default" | "applied" | "dismissed";
function Suggestion({ title, text, state, set }: { title: string; text: string; state: SuggestionState; set: (s: SuggestionState) => void }) {
  return (
    <article className="cs-sg" data-state={state}>
      <header className="cs-sg__head">
        <span className="cs-sg__icon" aria-hidden><Ico icon={state === "applied" ? CircleCheck : state === "dismissed" ? X : Sparkle} size={16} /></span>
        <span className="cs-sg__cap">{state === "applied" ? "Added to your brief" : state === "dismissed" ? "Set aside" : "Akines suggests"}</span>
      </header>
      <h4 className="cs-sg__title">{title}</h4>
      <p className="cs-sg__text">{text}</p>
      <div className="cs-sg__actions">
        {state === "default" ? (
          <>
            <Button variant="secondary" onClick={() => set("applied")}>Add to my brief</Button>
            <Button variant="link" onClick={() => set("dismissed")}>Not now</Button>
          </>
        ) : <Button variant="link" onClick={() => set("default")}>Undo</Button>}
      </div>
    </article>
  );
}

export function Review({ brief, workspace, setBrief, suggestions, setSuggestion, go, onDraft }: { brief: Brief; workspace: WorkspaceKind; setBrief: (k: BriefKey, v: string) => void; suggestions: Record<string, SuggestionState>; setSuggestion: (id: string, s: SuggestionState) => void; go: (s: Step) => void; onDraft: () => void }) {
  const [editing, setEditing] = useState<BriefKey | null>(null);
  return (
    <section className="cs-review">
      <div className="cs-review__brief">
        <Head eyebrow="Your project brief" title="Here’s what we’re creating." support="Review your idea and make any changes before finding your collaborators." />
        <div className="cs-bs__list">
          {BRIEF_PARTS.map((p) => (
            <Part key={p.id} id={p.id} label={p.label} title={p.title} text={brief[p.id]} editing={editing === p.id}
              onEdit={() => setEditing(p.id)} onCancel={() => setEditing(null)} onSave={(v) => { setBrief(p.id, v); setEditing(null); }} />
          ))}
          <section className="cs-bs" data-kind="fixed" aria-label="Workspace">
            <div className="cs-bs__head"><h3 className="cs-bs__label">Workspace</h3></div>
            <p className="cs-bs__text" id="cs-bs-workspace">{WORKSPACES[workspace].name}</p>
          </section>
        </div>
      </div>
      <div className="cs-review__side">
        <div className="cs-approve">
          <span className="cs-approve__rule" aria-hidden />
          <p className="cs-eyebrow">Ready when you are</p>
          <h2 className="cs-approve__title">Approve your brief to start finding collaborators.</h2>
          <p className="cs-approve__text">Nothing is shared until you approve it. You can keep editing any section first.</p>
          <div className="cs-approve__btns">
            <Button full iconRight={<Arrow />} onClick={() => go("ready")}>Approve brief</Button>
            <Button full variant="secondary" onClick={() => go("idea")}>Edit my answers</Button>
          </div>
          <Button variant="link" className="cs-approve__draft" onClick={onDraft}>Save as draft</Button>
        </div>
        <div className="cs-sgs">
          <p className="cs-eyebrow">Optional suggestions from Akines</p>
          {SUGGESTIONS.map((s) => <Suggestion key={s.id} title={s.title} text={s.text} state={suggestions[s.id] ?? "default"} set={(v) => setSuggestion(s.id, v)} />)}
        </div>
      </div>
    </section>
  );
}

const TIERS = [
  { icon: Eye, title: "In your project brief", text: "Your project name, overview, stage and support needed. People you contact can see this." },
  { icon: SlidersHorizontal, title: "Used for matching", text: "Your purpose, problem, audience and desired outcome. Akines uses them to recommend people and does not show them." },
  { icon: Lock, title: "Stays private", text: "Your drafts, any answer you haven’t approved and everything outside this brief." },
];

export function Ready({ answers, brief, onExplore, onSave, saving }: { answers: DraftAnswers; brief: Brief; onExplore: () => void; onSave: () => void; saving: boolean }) {
  return (
    <section className="cs-ready">
      <div className="cs-ready__summary">
        <Head big eyebrow="Brief approved" title="Your idea is ready for its next step." support="Your project brief is ready. You can now explore people whose skills and experience may complement your idea." />
        <article className="cs-card">
          <p className="cs-eyebrow">Project summary</p>
          <h2 className="cs-card__name">{brief.name}</h2>
          <p className="cs-card__text">{brief.overview}</p>
          <hr className="cs-card__rule" />
          <dl className="cs-card__meta">
            <div><dt className="cs-eyebrow">Project stage</dt><dd>{stageOf(answers.stage)?.title ?? "Not chosen yet"}</dd></div>
            <div><dt className="cs-eyebrow">Support needed</dt><dd>{needsList(answers.needs)}</dd></div>
          </dl>
        </article>
        <div className="cs-btnrow">
          <Button iconRight={<Arrow />} onClick={onExplore}>Explore collaborators</Button>
          <Button variant="secondary" loading={saving} onClick={onSave}>Save project</Button>
        </div>
        <p className="cs-note">Akines will never send an introduction request on your behalf.</p>
      </div>
      <div className="cs-ready__share">
        <p className="cs-eyebrow">What happens to your information</p>
        <ul className="cs-tiers">
          {TIERS.map((t) => (
            <li key={t.title} className="cs-tier">
              <span className="cs-tier__icon" aria-hidden><Ico icon={t.icon} size={20} /></span>
              <div className="cs-tier__body"><h3 className="cs-tier__title">{t.title}</h3><p className="cs-tier__text">{t.text}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
