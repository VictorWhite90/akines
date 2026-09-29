"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/* ---------- Breathing exercise ---------- */
const PHASES = [
  { label: "Breathe in", secs: 4, scale: 1 },
  { label: "Hold", secs: 4, scale: 1 },
  { label: "Breathe out", secs: 6, scale: 0.55 },
] as const;

export function Breathing() {
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(2);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    let idx = 0;
    let timer: number;
    const step = () => {
      timer = window.setTimeout(() => {
        idx = (idx + 1) % PHASES.length;
        if (idx === 0) setCycles((c) => c + 1);
        setI(idx);
        step();
      }, PHASES[idx].secs * 1000);
    };
    step();
    return () => window.clearTimeout(timer);
  }, [running]);

  const phase = PHASES[i];
  return (
    <div className="pattern-adire on-dark flex h-full flex-col items-center rounded-[28px] bg-ink-900 p-8 text-center text-paper-50">
      <p className="eyebrow text-ochre-300">Breathing exercise</p>
      <h3 className="font-display mt-2 text-[28px] leading-tight font-medium">Two minutes, nothing to make</h3>
      <div className="relative my-8 flex h-56 w-56 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-paper-50/20" />
        <div className="h-full w-full rounded-full bg-linear-to-br from-ochre-300 to-clay-400 opacity-90" style={{ transform: `scale(${running ? phase.scale : 0.55})`, transition: `transform ${running ? phase.secs : 0.6}s ease-in-out` }} />
        <span className="absolute font-display text-2xl text-ink-950" aria-live="polite">{running ? phase.label : "Ready"}</span>
      </div>
      <Button variant={running ? "ghost-dark" : "gold"} onClick={() => { setI(0); setCycles(0); setRunning((r) => !r); }}>{running ? "Stop" : "Begin"}</Button>
      <p className="mt-4 h-5 text-sm text-ink-200">{running ? `${cycles} slow ${cycles === 1 ? "breath" : "breaths"} so far` : "In for four, hold for four, out for six."}</p>
    </div>
  );
}

/* ---------- Creative burnout check ---------- */
const QUESTIONS = [
  "I feel drained after making, or after preparing work.",
  "I've struggled to start, even when I wanted to.",
  "I've felt cut off from other artists or collectors.",
  "I've worried about money or recognition more than the work itself.",
  "I've doubted that my work is worth showing.",
];
const SAFETY = "I've felt hopeless, or like I don't want to be here.";
const OPTIONS = ["Not at all", "Some days", "Most days", "Nearly every day"];

export function BurnoutCheck() {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length + 1).fill(null));
  const [done, setDone] = useState(false);
  const complete = answers.every((a) => a !== null);
  const total = answers.slice(0, QUESTIONS.length).reduce<number>((s, a) => s + (a ?? 0), 0);
  const safety = (answers[QUESTIONS.length] ?? 0) > 0;
  const band = total <= 4 ? 0 : total <= 9 ? 1 : 2;
  const RESULTS = [
    { title: "You seem to be carrying this lightly", body: "Your answers don't suggest much strain right now. A small habit still helps: a two-minute pause after finishing something." },
    { title: "There are signs of strain", body: "A few of these have been showing up. Rest that isn't scrolling, a private journal page, and one conversation in a Presence Room can each help." },
    { title: "This looks heavy, and you deserve support", body: "Several of these are showing up most days. Talking to a licensed therapist or art therapist could really help. That's a strength, not a failure." },
  ];

  function set(q: number, v: number) {
    setAnswers((a) => a.map((x, i) => (i === q ? v : x)));
  }

  if (done) {
    const r = RESULTS[band];
    return (
      <div className="card p-7">
        <p className="eyebrow text-clay-600">Your reflection</p>
        <h3 className="font-display mt-1 text-[28px] leading-tight font-medium">{r.title}</h3>
        <p className="mt-3 text-[16px] leading-relaxed">{r.body}</p>
        {safety && (
          <div className="mt-5 rounded-2xl border-2 border-clay-500 bg-clay-100 p-5" role="alert">
            <p className="font-semibold text-clay-700">You said you've felt hopeless. Thank you for telling us.</p>
            <p className="mt-1 text-[15px]">Please reach out to someone today: a person you trust, a licensed professional, or a crisis line in your country (findahelpline.com lists them worldwide). If you might be in danger, contact your local emergency number now.</p>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href="#care">See therapists & art therapists</Button>
          <Button variant="ghost" onClick={() => { setAnswers(Array(QUESTIONS.length + 1).fill(null)); setDone(false); }}>Start again</Button>
        </div>
        <p className="mt-5 text-xs text-mute">This is a reflection tool, not a medical assessment, and it can't diagnose anything. Your answers stay private and are never used for matching, ranking or ads.</p>
      </div>
    );
  }

  return (
    <div className="card p-7">
      <p className="eyebrow text-clay-600">Creative burnout check</p>
      <h3 className="font-display mt-1 text-[28px] leading-tight font-medium">How has the last month been?</h3>
      <p className="mt-2 text-sm text-mute">Six short questions. It helps you notice, and points to support if it would help.</p>
      <ol className="mt-6 space-y-6">
        {[...QUESTIONS, SAFETY].map((q, qi) => (
          <li key={q}>
            <p className="text-[15.5px] font-medium">{qi + 1}. {q}</p>
            <div role="radiogroup" aria-label={q} className="mt-2.5 grid grid-cols-2 gap-2 md:grid-cols-4">
              {OPTIONS.map((o, oi) => (
                <button key={o} role="radio" aria-checked={answers[qi] === oi} onClick={() => set(qi, oi)} className={cn("rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors", answers[qi] === oi ? "border-ink-900 bg-ink-900 text-paper-50" : "border-line bg-paper-100 hover:bg-paper-200")}>{o}</button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <Button className="mt-7" disabled={!complete} onClick={() => setDone(true)}>See my reflection</Button>
    </div>
  );
}

/* ---------- Gratitude ---------- */
export function Gratitude() {
  const [items, setItems] = useState<string[]>(["The light in my studio at 4pm."]);
  const [draft, setDraft] = useState("");
  return (
    <div className="card h-full p-7">
      <p className="eyebrow text-clay-600">Gratitude</p>
      <h3 className="font-display mt-1 text-[26px] leading-tight font-medium">Three small things</h3>
      <form onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { setItems((l) => [draft.trim(), ...l].slice(0, 6)); setDraft(""); } }} className="mt-4 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Something you're glad of today" aria-label="Gratitude" className="min-w-0 flex-1 rounded-full border border-line bg-paper-100 px-4 py-2.5 text-sm outline-none focus:border-ink-500" />
        <Button type="submit" size="sm" className="h-auto">Add</Button>
      </form>
      <ul className="mt-4 space-y-2">{items.map((t, i) => <li key={t + i} className="animate-rise flex gap-2.5 rounded-xl bg-paper-100 px-4 py-2.5 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-ochre-500" />{t}</li>)}</ul>
    </div>
  );
}
