"use client";

import { useState } from "react";
import { Check, Sparkle } from "lucide-react";
import Button from "@/components/kin/Button";
import type { DraftAnswers } from "@/lib/collab/drafts";
import type { WorkspaceKind } from "@/lib/collab/workspace";
import { NEEDS, QN, QUESTIONS, STAGES, TYPES, WORKSPACES, nextOfQ, prevOfQ, type QId, type Step } from "./data";
import { Arrow, Back, GrowField, Head, Ico, Notice, Options, Progress, QuestionCount } from "./parts";

/* The builder's question steps, mirrored from the product design: entry, idea, purpose, progress, people, workspace. */

type StepProps = { answers: DraftAnswers; setAnswers: (fn: (a: DraftAnswers) => DraftAnswers) => void; go: (s: Step) => void };

export function Entry({ go }: { go: (s: Step) => void }) {
  return (
    <section className="cs-split cs-entry">
      <div className="cs-split__main">
        <div className="cs-split__text">
          <p className="cs-eyebrow">Start something meaningful</p>
          <h1 className="cs-hero" id="cs-entry-title" tabIndex={-1} data-m="words">Every meaningful project begins somewhere.</h1>
          <p className="cs-hero__support">Bring an idea, a question or something you’ve been thinking about. We’ll help you shape it into a project and find the people who can bring it to life.</p>
          <div className="cs-btnrow">
            <Button iconRight={<Arrow />} onClick={() => go("idea")}>Start with my idea</Button>
            <Button variant="secondary" href="/collaborate/collaborators">Explore collaborators</Button>
          </div>
          <p className="cs-note">You don’t need to have everything figured out.</p>
        </div>
      </div>
      <div className="cs-split__photo" data-m="frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cover cs-photo" src="/kin/collab-start/start-idea.jpg" loading="lazy" decoding="async" alt="" />
      </div>
    </section>
  );
}

export function Idea({ answers, setAnswers, go }: StepProps) {
  const [touched, setTouched] = useState(false);
  const typed = !!answers.type;
  const written = answers.idea.trim().length > 0;
  const can = typed && written;
  return (
    <section className="cs-col">
      <div className="cs-top">
        <Progress step={1} />
        <Head eyebrow="01 / Your idea" title="What would you like to bring to life?" support="It can be something you’ve been imagining, something you’re already building or something you want to explore with others." />
      </div>
      <Options label="Type of project" deselectable items={TYPES} value={answers.type ? [answers.type] : []} onChange={(v) => setAnswers((a) => ({ ...a, type: v[0] ?? "" }))} />
      {typed ? null : <Notice title="Every idea is different.">Describe what you’re imagining and we’ll help you find the right direction.</Notice>}
      <GrowField label="Tell us about your idea." hint="A few sentences are enough to get started." placeholder="I’ve been thinking about creating..." value={answers.idea}
        onChange={(v) => setAnswers((a) => ({ ...a, idea: v }))} onBlur={() => setTouched(true)} error={touched && !written ? "Write a short message to continue." : undefined} min={120} />
      {written ? null : <Notice title="Let’s start with what you have.">A sentence, a question or a rough idea is enough to begin.</Notice>}
      <div className="cs-actions">
        <Back onClick={() => go("entry")} />
        <Button disabled={!can} iconRight={can ? <Arrow /> : undefined} onClick={() => go("q1")}>Continue</Button>
      </div>
    </section>
  );
}

export function Question({ qid, answers, setAnswers, go }: StepProps & { qid: QId }) {
  const q = QUESTIONS.find((x) => x.id === qid)!;
  const n = QN[qid];
  const earlier = QUESTIONS.filter((x) => QN[x.id] < n && answers.q[x.id].trim());
  const next = () => go(nextOfQ(qid));
  return (
    <section className="cs-col">
      <div className="cs-top">
        <Progress step={2} />
        <Head eyebrow="02 / Your purpose" title="Why does this matter to you?" support="Help us understand the problem, the people it matters to and the change you hope to make." />
      </div>
      <QuestionCount n={n} />
      {earlier.length ? (
        <ul className="cs-answered" aria-label="Your earlier answers">
          {earlier.map((x) => (
            <li key={x.id} className="cs-answered__row">
              <span className="cs-answered__label">{x.label}</span>
              <span className="cs-answered__text">{answers.q[x.id]}</span>
              <Button variant="link" className="cs-answered__edit" onClick={() => go(x.id)} aria-label={`Edit your answer: ${x.label}`}>Edit</Button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="cs-question">
        <h2 className="cs-question__title">{q.title}</h2>
        <GrowField label="Your answer" hint="Add as much or as little as you like. You can skip this and come back later." placeholder={q.placeholder} value={answers.q[qid]}
          onChange={(v) => setAnswers((a) => ({ ...a, q: { ...a.q, [qid]: v } }))} min={144} />
      </div>
      <div className="cs-actions">
        <Back onClick={() => go(prevOfQ(qid))} />
        <div className="cs-actions__right">
          <Button variant="link" onClick={next}>Skip for now</Button>
          <Button iconRight={<Arrow />} onClick={next}>Continue</Button>
        </div>
      </div>
    </section>
  );
}

export function Stage({ answers, setAnswers, go }: StepProps) {
  const can = !!answers.stage;
  return (
    <section className="cs-col">
      <div className="cs-top">
        <Progress step={3} />
        <Head eyebrow="03 / Your progress" title="Where are you with this idea?" support="Every project starts somewhere. Tell us where yours stands today." />
      </div>
      <Options label="Where the project stands" items={STAGES} value={answers.stage ? [answers.stage] : []} onChange={(v) => setAnswers((a) => ({ ...a, stage: v[0] ?? "" }))} />
      <div className="cs-actions">
        <Back onClick={() => go("q4")} />
        <Button disabled={!can} iconRight={can ? <Arrow /> : undefined} onClick={() => go("people")}>Continue</Button>
      </div>
    </section>
  );
}

export function People({ answers, setAnswers, go }: StepProps) {
  const can = answers.needs.length > 0;
  return (
    <section className="cs-col">
      <div className="cs-top">
        <Progress step={4} />
        <Head eyebrow="04 / Your people" title="What would help you move forward?" support="Tell us what you need. We’ll help you identify the people, skills and resources that could make a difference." />
      </div>
      <Options multi label="What would help" items={NEEDS} wide={["collaborators"]} value={answers.needs}
        onChange={(v) => setAnswers((a) => ({ ...a, needs: NEEDS.filter((n) => v.includes(n.id)).map((n) => n.id) }))} />
      <div className="cs-actions">
        <Back onClick={() => go("stage")} />
        <Button disabled={!can} iconRight={can ? <Arrow /> : undefined} onClick={() => go("workspace")}>Prepare my project brief</Button>
      </div>
    </section>
  );
}

/** The workspace Create AI recommends; it has to be accepted before the brief is prepared. */
export function Workspace({ kind, accepted, project, onAccept, go }: { kind: WorkspaceKind; accepted: boolean; project: string; onAccept: () => void; go: (s: Step) => void }) {
  const w = WORKSPACES[kind];
  return (
    <section className="cs-col">
      <div className="cs-top">
        <Progress step={4} />
        {accepted
          ? <Head eyebrow="Your Workspace" title="Your Workspace is ready" support="Your accepted Workspace is saved to the project. You can continue to your brief." />
          : <Head eyebrow="Your Workspace" title="Here’s the Workspace we recommend" support="Based on what you told us, Create AI suggests the Workspace where your team will work together. Accept it to continue." />}
      </div>
      <article className="cs-wsr" data-accepted={accepted || undefined} data-kind={kind} aria-label={w.name} data-m="up">
        <div className="cs-wsr__photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cover cs-wsr__img" src={w.photo} loading="lazy" decoding="async" alt="" />
        </div>
        <div className="cs-wsr__body">
          {accepted
            ? <p className="cs-wsr__chip" data-tone="success"><Ico icon={Check} size={14} stroke={1.5} /><span>Accepted</span></p>
            : <p className="cs-wsr__chip"><Ico icon={Sparkle} size={14} stroke={1.5} /><span>Recommended for your project</span></p>}
          <div className="cs-wsr__head">
            <h2 className="cs-wsr__name">{w.name}</h2>
            <p className="cs-wsr__why">{w.why}</p>
          </div>
          <ul className="cs-wsr__features">
            {w.features.map((f) => <li key={f} className="cs-wsr__feature"><Ico icon={Check} size={16} stroke={1.5} /><span>{f}</span></li>)}
          </ul>
          <hr className="cs-wsr__rule" />
          {accepted ? (
            <p className="cs-wsr__note" role="status"><Ico icon={Check} size={20} stroke={1.5} /><span>{w.name} is saved to {project}.</span></p>
          ) : (
            <div className="cs-wsr__actions">
              <Button onClick={onAccept}>Accept Workspace</Button>
              <p className="cs-wsr__helper">Your Workspace is created when you accept.</p>
            </div>
          )}
        </div>
      </article>
      <div className="cs-actions">
        <Back onClick={() => go("people")} />
        <Button disabled={!accepted} arrow="up-right" onClick={() => go("preparing")}>Prepare my project brief</Button>
      </div>
    </section>
  );
}
