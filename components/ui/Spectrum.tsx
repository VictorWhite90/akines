import { cn } from "@/lib/cn";

/** A spectrum between two poles with a marker. Not a score: there's no "better" end. */
export default function Spectrum({ left, right, value, dark = false }: { left: string; right: string; value: number; dark?: boolean }) {
  return (
    <div>
      <div className={cn("flex justify-between text-[12px] font-medium", dark ? "text-ink-100" : "text-ink-800")}>
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div className={cn("relative mt-2 h-1.5 rounded-full", dark ? "bg-paper-50/20" : "bg-ink-900/12")} role="img" aria-label={`${left} to ${right}: ${value} out of 100 toward ${right}`}>
        <span className={cn("absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px] border-2", dark ? "border-ink-900 bg-ochre-300" : "border-paper-50 bg-clay-500 shadow-soft")} style={{ left: `${value}%` }} />
      </div>
    </div>
  );
}
