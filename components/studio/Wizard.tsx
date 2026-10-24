"use client";

import { useState } from "react";
import { Field, PhotoPicker, StudioCard } from "./parts";
import { COVER_CHOICES, DAYS, DISCIPLINES, THEMES, VISITING, blankStudio, hoursText, sampleNotes, sampleVisits, sampleWorks, todayIso, type Studio, type VisitingStyle } from "@/lib/data/studio";
import { cn } from "@/lib/cn";
import Icon from "@/components/ui/Icon";

const STEPS = ["Name it", "Look & feel", "The door"];
const MOODS: Record<string, string> = { forest: "Calm and deep", indigo: "Night-shift focus", clay: "Warm, busy hands", cream: "Quiet daylight", lime: "Bright and awake" };

/** "Open your space": three warm steps with a live preview card. */
export default function Wizard({ onFinish, initialStep = 1, prefill = false }: { onFinish: (s: Studio) => void; initialStep?: 1 | 2 | 3; prefill?: boolean }) {
  const [step, setStep] = useState<number>(initialStep);
  const [draft, setDraft] = useState<Studio>(() =>
    prefill
      ? { ...blankStudio(), name: "My space", tagline: "Cooking, coaching, code or craft: what you do, in Yaba.", disciplines: ["Design", "Food & cooking"], about: "Come in, sit down, tell me what you see." }
      : blankStudio(),
  );
  const [samples, setSamples] = useState(true);
  const set = (patch: Partial<Studio>) => setDraft((d) => ({ ...d, ...patch }));

  const canNext = step === 1 ? draft.name.trim().length >= 2 && draft.disciplines.length > 0 : true;
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const finish = () => {
    const today = todayIso();
    onFinish({
      ...draft,
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      createdAt: today,
      works: samples ? sampleWorks() : [],
      notes: samples ? sampleNotes(today) : [],
      visits: samples ? sampleVisits(today) : [],
    });
  };

  return (
    <div className="sd sd-wiz">
      <header className="sd-wiz-head">
        <p className="ac-eyebrow">My studio</p>
        <h1 className="font-display">Everyone needs <em>a door.</em></h1>
        <p>Open your space in three small steps. You can change any of it later.</p>
      </header>

      <ol className="sd-steps" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} className={cn(step === i + 1 && "on", step > i + 1 && "done")}>
            <button onClick={() => (i + 1 < step || canNext) && setStep(i + 1)} aria-current={step === i + 1 ? "step" : undefined}>
              <b>{step > i + 1 ? "✓" : i + 1}</b>{s}
            </button>
          </li>
        ))}
      </ol>

      <div className="sd-wiz-grid">
        <section className="sd-panel sd-form" aria-label={STEPS[step - 1]}>
          {step === 1 && (
            <>
              <Field label="Studio name">
                <input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Room with a blue door" maxLength={48} autoFocus />
              </Field>
              <Field label="Tagline" hint="One line on what you do">
                <input value={draft.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder="What you do, and why it matters to you." maxLength={90} />
              </Field>
              <div className="sd-field">
                <span className="lb">What do you do? <small>Pick as many as fit</small></span>
                <div className="sd-chips" role="group" aria-label="Disciplines">
                  {DISCIPLINES.map((d) => (
                    <button type="button" key={d} aria-pressed={draft.disciplines.includes(d)} className={draft.disciplines.includes(d) ? "on" : ""} onClick={() => set({ disciplines: toggle(draft.disciplines, d as string) })}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="sd-two">
                <Field label="City"><input value={draft.city} onChange={(e) => set({ city: e.target.value })} placeholder="Lagos" /></Field>
                <Field label="Country"><input value={draft.country} onChange={(e) => set({ country: e.target.value })} placeholder="Nigeria" /></Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="sd-field">
                <span className="lb">Cover photo <small>The first thing visitors see</small></span>
                <PhotoPicker keys={COVER_CHOICES} value={draft.cover} onChange={(k) => k && set({ cover: k })} label="Cover photo" />
              </div>
              <div className="sd-field">
                <span className="lb">Wall colour <small>It tints your hero and small accents</small></span>
                <div className="sd-swatches" role="radiogroup" aria-label="Wall colour">
                  {THEMES.map((t) => (
                    <button type="button" key={t.id} role="radio" aria-checked={draft.theme === t.id} className={draft.theme === t.id ? "on" : ""} onClick={() => set({ theme: t.id })}>
                      <i style={{ background: t.wall, boxShadow: `inset -14px 0 0 ${t.accent}` }} />
                      <b>{t.name}</b>
                      <small>{MOODS[t.id]}</small>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="sd-field">
                <span className="lb">How do people visit?</span>
                <div className="sd-styles" role="radiogroup" aria-label="Visiting style">
                  {(Object.keys(VISITING) as VisitingStyle[]).map((v) => (
                    <button type="button" key={v} role="radio" aria-checked={draft.visiting === v} className={draft.visiting === v ? "on" : ""} onClick={() => set({ visiting: v })}>
                      <b>{VISITING[v].label}</b>
                      <small>{VISITING[v].blurb}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="sd-field">
                <span className="lb">Weekly open hours <small>Shown on your door. Leave empty for none.</small></span>
                <div className="sd-days" role="group" aria-label="Open days">
                  {DAYS.map((d) => (
                    <button type="button" key={d} aria-pressed={draft.hours.days.includes(d)} className={draft.hours.days.includes(d) ? "on" : ""} onClick={() => set({ hours: { ...draft.hours, days: toggle(draft.hours.days, d as string) } })}>{d}</button>
                  ))}
                </div>
                <div className="sd-two tight">
                  <Field label="From"><input type="time" value={draft.hours.from} onChange={(e) => set({ hours: { ...draft.hours, from: e.target.value } })} /></Field>
                  <Field label="To"><input type="time" value={draft.hours.to} onChange={(e) => set({ hours: { ...draft.hours, to: e.target.value } })} /></Field>
                </div>
              </div>
              <Field label="About my space">
                <textarea rows={3} value={draft.about} onChange={(e) => set({ about: e.target.value })} placeholder="Who are you, and what happens here?" />
              </Field>
              <Field label="What you're working on right now">
                <input value={draft.now} onChange={(e) => set({ now: e.target.value })} placeholder="e.g. Finishing the second coat on a large canvas" maxLength={120} />
              </Field>
              <button type="button" role="switch" aria-checked={samples} className={cn("sd-sample", samples && "on")} onClick={() => setSamples((v) => !v)}>
                <span className="sw" aria-hidden><i /></span>
                <span><b>Start with sample content</b><small>A few placeholder pieces, updates and open doors so your space isn&apos;t empty. Edit or remove them any time.</small></span>
              </button>
            </>
          )}

          <div className="sd-nav">
            {step > 1 ? <button className="sd-btn quiet" onClick={() => setStep(step - 1)}>← Back</button> : <span />}
            {step < 3 ? (
              <button className="sd-btn dark" disabled={!canNext} onClick={() => setStep(step + 1)}>{canNext ? "Continue →" : step === 1 ? "Add a name and what you do" : "Continue"}</button>
            ) : (
              <button className="sd-btn dark big" onClick={finish}>Open my space <Icon name="spark" size={16} className="ic-inline" /></button>
            )}
          </div>
        </section>

        <aside className="sd-preview" aria-label="Live preview">
          <p className="ac-eyebrow">Live preview</p>
          <StudioCard name={draft.name} tagline={draft.tagline} place={[draft.city, draft.country].filter(Boolean).join(", ")} disciplines={draft.disciplines} cover={draft.cover} theme={draft.theme} visiting={draft.visiting} hours={hoursText(draft.hours)} />
          <p className="sd-hint">This is how your space looks to other members. No follower counts. No likes. Just you and what you do.</p>
        </aside>
      </div>
    </div>
  );
}
