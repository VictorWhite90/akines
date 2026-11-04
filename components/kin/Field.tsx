"use client";

import { Children, cloneElement, forwardRef, isValidElement, useId, useState } from "react";
import { ChevronDown, CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";

type FieldChild = React.ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean; invalid?: boolean; required?: boolean; "aria-required"?: boolean }>;

/** The design's field (k-field): a label, the control, then a hint or an error with its icon. */
export function Field({ label, hint, error, required, htmlFor, children, className }: { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; required?: boolean; htmlFor?: string; children: React.ReactNode; className?: string }) {
  const auto = useId();
  const only = Children.count(children) === 1 && isValidElement(children) ? (children as FieldChild) : null;
  const id = htmlFor ?? (only && typeof only.props.id === "string" ? only.props.id : `${auto}-f`);
  const msgId = `${id}-msg`;
  let control: React.ReactNode = children;
  if (only) {
    const extra: Record<string, unknown> = {};
    if (only.props.id === undefined && htmlFor === undefined) extra.id = id;
    if (error || hint) extra["aria-describedby"] = [only.props["aria-describedby"], msgId].filter(Boolean).join(" ");
    if (error) { extra["aria-invalid"] = true; extra.invalid = true; }
    if (required && only.props.required === undefined) extra["aria-required"] = true;
    control = cloneElement(only, extra);
  }
  return (
    <div className={cn("k-field", !!error && "k-field--error", className)}>
      {label ? <label className="k-field__label" htmlFor={id}>{label}{required && <span className="k-field__req" aria-hidden> *</span>}</label> : null}
      {control}
      {error ? (
        <p className="k-field__msg k-field__msg--error" id={msgId} role="alert"><span className="k-field__msg-icon" aria-hidden><CircleAlert size={16} strokeWidth={1.4} /></span><span>{error}</span></p>
      ) : hint ? <p className="k-field__msg" id={msgId}>{hint}</p> : null}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & { invalid?: boolean; valid?: boolean; shape?: "rect" | "pill"; iconLeft?: React.ReactNode; iconRight?: React.ReactNode };
/** The design's text input (k-input): rectangular or pill, with optional icons and the error or ok mark on pills. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, valid, shape = "rect", iconLeft, iconRight, className, style, disabled, ...rest }, ref) {
  const right = iconRight ?? (shape === "pill" ? (invalid ? <CircleAlert size={20} strokeWidth={1.4} className="k-input__state k-input__state--error" /> : valid ? <CircleCheck size={20} strokeWidth={1.4} className="k-input__state k-input__state--ok" /> : null) : null);
  return (
    <span className={cn("k-input", `k-input--${shape}`, invalid && "k-input--invalid", valid && !invalid && "k-input--valid", disabled && "k-input--disabled", iconLeft ? "k-input--left" : "", right ? "k-input--right" : "", className)} style={style}>
      {iconLeft && <span className="k-input__icon k-input__icon--left" aria-hidden>{iconLeft}</span>}
      <input {...rest} ref={ref} disabled={disabled} aria-invalid={invalid || rest["aria-invalid"]} className="k-input__el" />
      {right && <span className="k-input__icon k-input__icon--right">{right}</span>}
    </span>
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
/** The design's text area (k-textarea), with a counter when it has a maximum length. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, maxLength, className, style, disabled, onChange, value, defaultValue, ...rest }, ref) {
  const [own, setOwn] = useState(() => String(value ?? defaultValue ?? "").length);
  const len = value !== undefined ? String(value).length : own;
  return (
    <span className={cn("k-textarea", !!maxLength && "k-textarea--counter", invalid && "k-textarea--invalid", disabled && "k-textarea--disabled", className)} style={style}>
      <textarea rows={4} {...rest} ref={ref} value={value} defaultValue={defaultValue} disabled={disabled} maxLength={maxLength} aria-invalid={invalid || rest["aria-invalid"]} className="k-textarea__el" onChange={(e) => { setOwn(e.target.value.length); onChange?.(e); }} />
      {maxLength ? <span className={cn("k-textarea__count", len >= maxLength && "k-textarea__count--full")} aria-hidden>{len}/{maxLength}</span> : null}
    </span>
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };
/** The design's select (k-select) with its chevron. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ invalid, className, style, disabled, children, ...rest }, ref) {
  return (
    <span className={cn("k-select", invalid && "k-select--invalid", disabled && "k-select--disabled", className)} style={style}>
      <select {...rest} ref={ref} disabled={disabled} aria-invalid={invalid || rest["aria-invalid"]} className="k-select__el">{children}</select>
      <span className="k-select__chev" aria-hidden><ChevronDown size={20} /></span>
    </span>
  );
});
