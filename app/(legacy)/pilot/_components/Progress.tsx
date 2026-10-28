import { cn } from "@/lib/cn";

/**
 * CSS progress bar against a target range. `max` sets the full width; when
 * `min` differs, a marker shows where the target range begins.
 */
export default function Progress({
  label,
  current,
  min,
  max,
  valueText,
  className,
}: {
  label: string;
  current: number;
  min: number;
  max: number;
  valueText: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  const minPct = Math.round((min / max) * 100);
  const reached = current >= min;
  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={valueText}
        className="relative h-2.5 rounded-full bg-sand-200"
      >
        <span className={cn("absolute inset-y-0 left-0 rounded-full", reached ? "bg-verified" : "bg-gold-500")} style={{ width: `${pct}%` }} />
        {min !== max && (
          <span aria-hidden className="absolute -top-1 h-[18px] w-0.5 rounded-full bg-green-950" style={{ left: `${minPct}%` }} title="Start of target range" />
        )}
      </div>
    </div>
  );
}
