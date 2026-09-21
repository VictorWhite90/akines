import { TickCircle } from "iconsax-reactjs";
import { cn } from "@/lib/cn";

/**
 * Horizontal step tracker: done / current / upcoming. Used for application
 * status and the Collaboration Studio's seven stages.
 */
export default function StageTracker({
  steps,
  current,
  className,
  label,
}: {
  steps: { id: string; label: string }[];
  current: number;
  className?: string;
  label: string;
}) {
  return (
    <ol aria-label={label} className={cn("flex w-full items-start", className)}>
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li key={step.id} className="relative flex flex-1 flex-col items-center text-center" aria-current={state === "current" ? "step" : undefined}>
            {i > 0 && (
              <span aria-hidden className={cn("absolute right-1/2 top-3 h-0.5 w-full", i <= current ? "bg-green-950" : "bg-sand-300")} />
            )}
            <span
              className={cn(
                "relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                state === "done" && "bg-green-950 text-white",
                state === "current" && "bg-gold-400 text-green-950 ring-4 ring-gold-300/50",
                state === "upcoming" && "border border-sand-300 bg-white text-grey-600",
              )}
            >
              {state === "done" ? <TickCircle size={14} variant="Bold" color="currentColor" aria-hidden /> : i + 1}
            </span>
            <span className={cn("mt-2 px-1 text-[11px] leading-tight sm:text-xs", state === "upcoming" ? "text-grey-600" : "font-semibold text-green-950")}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
