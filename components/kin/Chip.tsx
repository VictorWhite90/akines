import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

/** The design's chip (k-chip): filter, choice (amber dot) or removable. `selected` sets aria-pressed. */
export function Chip({ selected, icon, count, removable, onRemove, as, variant = "filter", className, children, type, ...rest }: { selected?: boolean; icon?: React.ReactNode; count?: React.ReactNode; removable?: boolean; onRemove?: () => void; as?: "span"; variant?: "filter" | "choice"; className?: string; children: React.ReactNode } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  const cls = cn("k-chip", `k-chip--${variant}`, selected && "k-chip--selected", removable && "k-chip--removable", className);
  const inner = (
    <>
      {variant === "choice" ? (
        <span className="k-chip__ind" aria-hidden><span className="k-chip__ind-dot" /><Check size={12} strokeWidth={1.6} /></span>
      ) : selected ? (
        <span className="k-chip__icon" aria-hidden><Check size={14} strokeWidth={1.6} /></span>
      ) : icon ? <span className="k-chip__icon" aria-hidden>{icon}</span> : null}
      <span className="k-chip__label">{children}</span>
      {count != null && count !== "" && <span className="k-chip__count">{count}</span>}
    </>
  );
  if (removable) {
    const name = typeof children === "string" ? children : undefined;
    return <span className={cls} data-selected={selected || undefined}>{inner}<button type="button" className="k-chip__x" aria-label={name ? `Remove ${name}` : "Remove"} onClick={onRemove}><X size={14} /></button></span>;
  }
  if (as === "span") return <span className={cls} data-selected={selected || undefined}>{inner}</span>;
  return <button type={type ?? "button"} className={cls} aria-pressed={selected === undefined ? undefined : selected} data-selected={selected || undefined} {...rest}>{inner}</button>;
}

/** A small status label (k-tag): neutral, or a tone with a dot. */
export function Tag({ tone = "neutral", icon, className, children }: { tone?: string; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("k-tag", `k-tag--${tone}`, className)}>
      {icon ? <span className="k-tag__icon" aria-hidden>{icon}</span> : tone !== "neutral" ? <span className="k-tag__dot" aria-hidden /> : null}
      {children}
    </span>
  );
}
