"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/** A labelled on/off switch with a plain-language explanation of what it does in each state. */
export default function ConsentToggle({
  label,
  description,
  checked,
  onChange,
  className,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-semibold text-green-950">
          {label}
        </p>
        <p id={`${id}-desc`} className="mt-1 text-sm leading-relaxed text-grey-700">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors",
          checked ? "border-green-950 bg-green-950" : "border-sand-300 bg-sand-200",
        )}
      >
        <span className="sr-only">{checked ? "On" : "Off"}</span>
        <span aria-hidden className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
      </button>
    </div>
  );
}
