"use client";

import * as RTabs from "@radix-ui/react-tabs";
import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { spring } from "./motion";

export type TabItem<T extends string> = { id: T; label: string; count?: number };

/** Accessible tab strip with the amber indicator sliding between tabs. Render panels with <TabPanel>. */
export function Tabs<T extends string>({ items, value, onChange, label, fill, className, children }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void; label: string; fill?: boolean; className?: string; children?: React.ReactNode }) {
  const id = useId();
  return (
    <RTabs.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <RTabs.List aria-label={label} className={cn("k-tabs", fill && "fill", className)}>
        {items.map((t) => (
          <RTabs.Trigger key={t.id} value={t.id} className="k-tab">
            {t.label}
            {t.count !== undefined && <span className="n">{t.count}</span>}
            {t.id === value && <motion.span layoutId={`${id}-ind`} className="k-tab-ind" transition={spring.indicator} />}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {children}
    </RTabs.Root>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return <RTabs.Content value={value} className={className} style={{ outline: 0 }}>{children}</RTabs.Content>;
}

/** A segmented control for two or three choices, with a sliding pill. */
export function Segmented<T extends string>({ items, value, onChange, label }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const id = useId();
  return (
    <div className="k-seg" role="group" aria-label={label}>
      {items.map((t) => (
        <button key={t.id} type="button" aria-pressed={t.id === value} onClick={() => onChange(t.id)}>
          {t.id === value && <motion.span layoutId={`${id}-pill`} className="k-seg-pill" transition={spring.indicator} />}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
