"use client";

import { useId } from "react";

import Button from "@/components/kin/Button";

/* The product design's sign-in and Join building blocks, mirrored from its prototype (classes in auth.css). */

export function IconAlert({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <circle cx="10" cy="10" r="8.333" /><path d="M10 6.667V10" /><path d="M10 13.333h.008" />
    </svg>
  );
}
export function IconOk({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <circle cx="10" cy="10" r="8.333" /><path d="m7.5 10 1.667 1.667L12.5 8.333" />
    </svg>
  );
}
export function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="M3.333 8h9.334" /><path d="m8 3.333 4.667 4.667L8 12.667" />
    </svg>
  );
}
export function IconClose({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}
export function IconTick({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="m2.5 7.2 3 3 6-6.2" />
    </svg>
  );
}
function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
function AppleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
    </svg>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  id?: string;
  name?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  /** An error message: turns the field red with the alert icon. */
  message?: string;
  verified?: boolean;
  helper?: React.ReactNode;
  helperTone?: "default" | "success" | "strong" | "error";
  /** Something inside the field on the right, like Show. */
  action?: React.ReactNode;
  /** Something under the field, like the strength meter. */
  below?: React.ReactNode;
  onBlur?: () => void;
  onEnter?: () => void;
};

/** The design's sign-in field: label, pill input with the error or ok icon, then the message or helper. */
export function AuField(e: FieldProps) {
  const auto = useId();
  const id = e.id ?? auto;
  const msg = `${id}-msg`, help = `${id}-help`;
  const state = e.message ? "error" : e.verified ? "verified" : "default";
  return (
    <div className="au-field" data-state={state}>
      <label className="au-field__label" htmlFor={id}>{e.label}</label>
      <div className="au-input" data-state={state}>
        <input ref={e.inputRef} id={id} name={e.name} className="au-input__el" type={e.type ?? "text"} inputMode={e.inputMode} autoComplete={e.autoComplete} maxLength={e.maxLength} placeholder={e.placeholder} value={e.value} readOnly={e.readOnly} spellCheck={false} autoCapitalize="none" autoCorrect="off" autoFocus={e.autoFocus} aria-invalid={e.message ? true : undefined} aria-describedby={e.message ? msg : e.helper ? help : undefined} onChange={(ev) => e.onChange?.(ev.target.value)} onBlur={e.onBlur} onKeyDown={(ev) => { if (ev.key === "Enter" && e.onEnter) { ev.preventDefault(); e.onEnter(); } }} />
        {e.message ? <IconAlert className="au-input__icon au-input__icon--error" /> : null}
        {!e.message && e.verified ? <IconOk className="au-input__icon au-input__icon--ok" /> : null}
        {e.action}
      </div>
      {e.message ? (
        <p className="au-msg" id={msg} role="alert"><IconAlert size={16} /><span>{e.message}</span></p>
      ) : e.helper ? <p className="au-helper" id={help} data-tone={e.helperTone ?? "default"}>{e.helper}</p> : null}
      {e.below}
    </div>
  );
}

export function ShowToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return <button type="button" className="au-show" aria-pressed={shown} onClick={onToggle}>{shown ? "Hide" : "Show"}</button>;
}

/** The full-width ink button with the design's small arrow. */
export function AuSubmit({ label, onClick, loading, looksDisabled, type = "button", className }: { label: string; onClick?: () => void; loading?: boolean; looksDisabled?: boolean; type?: "button" | "submit"; className?: string }) {
  return <Button type={type} full className={className} loading={loading} looksDisabled={looksDisabled} iconRight={<IconArrow />} onClick={onClick ? () => onClick() : undefined}>{label}</Button>;
}

export function Provider({ provider, loading, onClick }: { provider: "google" | "apple"; loading?: boolean; onClick?: () => void }) {
  return <Button variant="secondary" full className="au-social" loading={loading} icon={provider === "google" ? <GoogleMark /> : <AppleMark />} onClick={() => onClick?.()}>{provider === "google" ? "Continue with Google" : "Continue with Apple"}</Button>;
}

export function OrRule() {
  return <div className="au-or" role="separator"><span className="au-or__line" /><span className="au-or__label">or continue with</span><span className="au-or__line" /></div>;
}

export function Progress({ step, of = 5 }: { step: number; of?: number }) {
  return (
    <div className="au-progress" role="img" aria-label={`Step ${step} of ${of}`}>
      {Array.from({ length: of }, (_, i) => <span key={i} className="au-progress__seg" data-on={i + 1 <= step ? "" : undefined} />)}
    </div>
  );
}

export function StepHeader({ eyebrow, title, children, headingRef }: { eyebrow: string; title: string; children: React.ReactNode; headingRef?: React.Ref<HTMLHeadingElement> }) {
  return (
    <div className="au-header">
      <p className="au-eyebrow">{eyebrow}</p>
      <h1 ref={headingRef} tabIndex={-1} className="au-h1">{title}</h1>
      <p className="au-lede">{children}</p>
    </div>
  );
}

export type Strength = "empty" | "weak" | "okay" | "strong";
const METER: Record<Strength, string> = { empty: "Use 12 or more characters.", weak: "Weak. Add more characters.", okay: "Okay. A longer phrase is stronger.", strong: "Strong. Nice." };
export function Meter({ level, label }: { level: Strength; label?: string }) {
  const on = level === "weak" ? 1 : level === "okay" ? 2 : level === "strong" ? 4 : 0;
  return (
    <div className="au-meter" data-level={level} aria-live="polite">
      <div className="au-meter__bars" aria-hidden>{[0, 1, 2, 3].map((t) => <span key={t} className="au-meter__bar" data-on={t < on ? "" : undefined} />)}</div>
      <p className="au-meter__label">{label ?? METER[level]}</p>
    </div>
  );
}

export function AgeCheck({ checked, onChange, error, inputRef, href }: { checked: boolean; onChange: (v: boolean) => void; error?: boolean; inputRef?: React.Ref<HTMLInputElement>; href?: string }) {
  return (
    <div className="au-checkrow">
      <label className="au-check" data-error={error ? "" : undefined}>
        <input ref={inputRef} type="checkbox" className="au-check__input" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={error ? true : undefined} />
        <span className="au-check__box" aria-hidden><IconTick size={14} /></span>
        <span className="au-check__text">I&apos;m 18 or over and accept the {href ? <a className="au-check__link" href={href} target="_blank" rel="noreferrer">community promises</a> : <span className="au-check__link">community promises</span>}.</span>
      </label>
      {error ? <p className="au-check__error" role="alert">Tick the box to confirm you are 18 or over.</p> : null}
    </div>
  );
}

