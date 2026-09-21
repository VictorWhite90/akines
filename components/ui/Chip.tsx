"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Toggleable pill for multi-select choices (intents, media, filters). */
export default function Chip({
  selected,
  onToggle,
  children,
  icon,
  className,
}: {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
        selected ? "border-green-950 bg-green-950 text-white" : "border-sand-300 bg-white text-green-950 hover:border-green-950",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
