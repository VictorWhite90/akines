"use client";

import { cn } from "@/lib/cn";

export type TabItem<T extends string> = { id: T; label: string; hint?: string };

/**
 * Accessible tab strip. Render the matching panel yourself with
 * `role="tabpanel"`, `id={`${idPrefix}-panel-${id}`}` and
 * `aria-labelledby={`${idPrefix}-tab-${id}`}`.
 */
export default function Tabs<T extends string>({
  items,
  value,
  onChange,
  idPrefix,
  label,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  idPrefix: string;
  label: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("scrollbar-hide flex gap-1 overflow-x-auto border-b border-sand-200", className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.id}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel-${item.id}`}
            onClick={() => onChange(item.id)}
            className={cn(
              "-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors",
              active ? "border-green-950 font-semibold text-green-950" : "border-transparent text-grey-700 hover:text-green-950",
            )}
          >
            {item.label}
            {item.hint && <span className="ml-1.5 text-xs text-grey-600">{item.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
