"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, type LucideIcon } from "lucide-react";
import { Field, Textarea } from "@/components/kin/Field";
import { STEP_NAMES, type Opt } from "./data";

/*
 * The builder's small parts, mirrored from the product design (cs-* in ../styles/home-start.css): the four-step
 * progress, the step heading, the option cards, the notice, the growing answer field, Back and the question count.
 */

/** Their icons: lucide at an absolute stroke, 1.25 under 24px, 1.5 from 24px. */
export function Ico({ icon: I, size = 16, stroke }: { icon: LucideIcon; size?: number; stroke?: number }) {
  return <I size={size} strokeWidth={stroke ?? (size >= 24 ? 1.5 : 1.25)} absoluteStrokeWidth aria-hidden focusable={false} />;
}
export const Arrow = () => <Ico icon={ArrowRight} />;

export function Progress({ step }: { step: number }) {
  return (
    <ol className="cs-bp" aria-label="Project builder progress">
      {STEP_NAMES.map((name, i) => {
        const n = i + 1;
        const state = n === step ? "current" : n < step ? "done" : "todo";
        return (
          <li key={name} className="cs-bp__cell" data-state={state} aria-current={state === "current" ? "step" : undefined}>
            <span className="cs-bp__bar" />
            <span className="cs-bp__label"><span className="cs-bp__num">{String(n).padStart(2, "0")}</span><span className="cs-bp__name">{name}</span></span>
          </li>
        );
      })}
    </ol>
  );
}

export function Head({ eyebrow, title, support, big }: { eyebrow: string; title: string; support: string; big?: boolean }) {
  return (
    <div className={big ? "cs-head cs-head--big" : "cs-head"}>
      <p className="cs-eyebrow">{eyebrow}</p>
      <h1 className="cs-title" tabIndex={-1} data-m="words">{title}</h1>
      <p className="cs-support">{support}</p>
    </div>
  );
}

/** Option cards: a radio group (arrow keys move and choose) or, with `multi`, checkboxes. */
export function Options({ items, value, onChange, multi, label, wide = [], deselectable }: { items: Opt[]; value: string[]; onChange: (v: string[]) => void; multi?: boolean; label: string; wide?: string[]; deselectable?: boolean }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const on = (id: string) => value.includes(id);
  const pick = (id: string) => onChange(multi ? (on(id) ? value.filter((v) => v !== id) : [...value, id]) : deselectable && on(id) ? [] : [id]);
  const keys = (e: React.KeyboardEvent, i: number) => {
    if (multi) return;
    const to = e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? i - 1 : null;
    if (to === null) return;
    e.preventDefault();
    const k = (to + items.length) % items.length;
    refs.current[k]?.focus();
    onChange([items[k].id]);
  };
  const tabbable = multi ? -1 : Math.max(0, items.findIndex((it) => on(it.id)));
  return (
    <div className="cs-opts" role={multi ? "group" : "radiogroup"} aria-label={label}>
      {items.map((it, i) => {
        const sel = on(it.id);
        return (
          <button key={it.id} ref={(el) => { refs.current[i] = el; }} type="button" role={multi ? "checkbox" : "radio"} aria-checked={sel} tabIndex={multi || i === tabbable ? 0 : -1}
            className="cs-opt" data-selected={sel || undefined} data-wide={wide.includes(it.id) || undefined} onClick={() => pick(it.id)} onKeyDown={(e) => keys(e, i)}>
            <span className="cs-opt__meta">
              <span className="cs-opt__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="cs-opt__mark" aria-hidden><Ico icon={Check} size={14} /></span>
            </span>
            <span className="cs-opt__title">{it.title}</span>
            {it.text ? <span className="cs-opt__text">{it.text}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function Notice({ title, children, tone = "accent" }: { title: string; children: React.ReactNode; tone?: "accent" | "error" }) {
  return (
    <div className="cs-notice" data-tone={tone}>
      <span className="cs-notice__rule" aria-hidden />
      <div className="cs-notice__body"><p className="cs-notice__title">{title}</p><p className="cs-notice__text">{children}</p></div>
    </div>
  );
}

/** An answer field that grows with its text, never shorter than `min`. */
export function GrowField({ label, hint, value, onChange, placeholder, min, error, onBlur }: { label: string; hint: string; value: string; onChange: (v: string) => void; placeholder: string; min: number; error?: string; onBlur?: () => void }) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const fit = useCallback(() => { const el = ref.current; if (el) { el.style.height = "auto"; el.style.height = `${Math.max(min, el.scrollHeight + 2)}px`; } }, [min]);
  useLayoutEffect(fit, [fit, value]);
  useEffect(() => {
    const ready = document.fonts?.ready;
    if (ready) void ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} className="cs-field">
      <Textarea id={id} ref={ref} value={value} rows={1} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} style={{ ["--cs-ta-min" as string]: `${min}px` } as React.CSSProperties} />
    </Field>
  );
}

export function Back({ onClick, children = "Back" }: { onClick: () => void; children?: React.ReactNode }) {
  return <button type="button" className="cs-back" onClick={onClick}><Ico icon={ArrowLeft} stroke={1} /><span>{children}</span></button>;
}

export function QuestionCount({ n }: { n: number }) {
  return (
    <div className="cs-qp" role="img" aria-label={`Question ${n} of 4`}>
      <p className="cs-qp__text" aria-hidden>Question {n} of 4</p>
      <div className="cs-qp__bars" aria-hidden>{[1, 2, 3, 4].map((i) => <span key={i} className="cs-qp__bar" data-on={i <= n || undefined} />)}</div>
    </div>
  );
}
