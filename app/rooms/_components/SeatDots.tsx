import { cn } from "@/lib/cn";

/** Six small seats: filled = taken, outlined = open. Always exactly six. */
export default function SeatDots({ taken, className }: { taken: number; className?: string }) {
  const open = 6 - taken;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-3 rounded-full border",
              i < taken ? "border-green-950 bg-green-950" : "border-green-700 bg-white",
            )}
          />
        ))}
      </span>
      <span className="text-xs font-semibold text-green-950">
        {open === 0 ? "Full · 6 of 6 seats taken" : `${open} of 6 seats open`}
      </span>
    </span>
  );
}
