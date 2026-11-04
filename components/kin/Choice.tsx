"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** The design's radio (k-radio): a row, or a card with an index number. */
export function Radio({ checked, onChange, label, description, name, value, disabled, variant = "row", index, className, style }: { checked: boolean; onChange: () => void; label: React.ReactNode; description?: React.ReactNode; name?: string; value?: string; disabled?: boolean; variant?: "row" | "card"; index?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <label className={cn("k-radio", `k-radio--${variant}`, disabled && "k-radio--disabled", className)} style={style}>
      <input type="radio" className="k-radio__input" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange()} />
      {variant === "card" ? (
        <span className="k-radio__meta" aria-hidden><span className="k-radio__index">{index}</span><span className="k-radio__dot"><Check size={14} strokeWidth={1.8} /></span></span>
      ) : <span className="k-radio__dot" aria-hidden />}
      <span className="k-radio__text"><span className="k-radio__label">{label}</span>{description ? <span className="k-radio__desc">{description}</span> : null}</span>
    </label>
  );
}

/** The design's switch (k-toggle): amber with a tick when on. */
export function Toggle({ checked, onChange, label, disabled, className, id, "aria-label": ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; disabled?: boolean; className?: string; id?: string; "aria-label"?: string }) {
  const auto = useId();
  const tid = id ?? auto;
  const track = (
    <button type="button" role="switch" id={tid} aria-checked={checked} aria-label={label ? undefined : ariaLabel} disabled={disabled} className="k-toggle__track" onClick={() => onChange(!checked)}>
      <span className="k-toggle__check" aria-hidden><Check size={12} strokeWidth={1.5} /></span>
      <span className="k-toggle__thumb" aria-hidden />
    </button>
  );
  return label ? (
    <span className={cn("k-toggle", "k-toggle--labelled", disabled && "k-toggle--disabled", className)}>{track}<label className="k-toggle__label" htmlFor={tid}>{label}</label></span>
  ) : <span className={cn("k-toggle", disabled && "k-toggle--disabled", className)}>{track}</span>;
}
