"use client";

import TrustLabel from "@/components/ui/TrustLabel";
import type { TrustSource } from "@/lib/types";

/**
 * One Creative DNA dimension as a two-ended spectrum
 * (e.g. Traditional ↔ Contemporary). Read-only unless `onChange` is given.
 */
export default function Spectrum({
  label,
  left,
  right,
  value,
  source,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  /** 0 = fully `left`, 100 = fully `right`. */
  value: number;
  source?: TrustSource;
  onChange?: (value: number) => void;
}) {
  const id = `spectrum-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={onChange ? id : undefined} className="text-sm font-semibold text-green-950">
          {label}
        </label>
        {source && <TrustLabel source={source} compact />}
      </div>
      {onChange ? (
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={`${value < 50 ? left : right} (${value})`}
          className="mt-3 w-full cursor-pointer accent-green-950"
        />
      ) : (
        <div className="relative mt-3 h-1.5 rounded-full bg-sand-200" role="img" aria-label={`${label}: ${value < 50 ? left : right}`}>
          <span className="absolute inset-y-0 left-0 rounded-full bg-green-950/80" style={{ width: `${value}%` }} />
          <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-green-950 shadow" style={{ left: `${value}%` }} />
        </div>
      )}
      <div className="mt-1.5 flex justify-between text-[11px] text-grey-700">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
