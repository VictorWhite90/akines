import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Top of every page: small eyebrow, Playfair title, one-line purpose. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-sm text-grey-700">{eyebrow}</p>}
        <h1 className="font-playfair text-[34px] font-bold leading-tight text-green-950 md:text-[48px] md:leading-[1.1]">
          {title}
        </h1>
        {description && <p className="mt-3 text-base leading-relaxed text-grey-700">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** Heading for a block within a page. */
export function SectionHeader({
  title,
  description,
  action,
  eyebrow,
  id,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-grey-700">{eyebrow}</p>}
        <h2 id={id} className="font-playfair text-xl font-semibold text-green-950 md:text-2xl">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-grey-700">{description}</p>}
      </div>
      {action}
    </div>
  );
}
