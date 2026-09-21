import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Single figure with a label, e.g. on the pilot dashboard. */
export default function Stat({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[4px] border border-sand-200 bg-white p-4", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-grey-700">{label}</p>
      <p className="mt-2 font-playfair text-3xl font-bold text-green-950">{value}</p>
      {hint && <p className="mt-1 text-xs text-grey-700">{hint}</p>}
    </div>
  );
}
