"use client";

import { useId, useMemo, useState } from "react";
import { TickCircle } from "iconsax-reactjs";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import type { OpenCall } from "@/lib/types";
import {
  CALL_GEO,
  EXPERIENCE_FILTERS,
  GEO_FILTERS,
  MEDIUM_FILTERS,
  acceptsExperience,
  acceptsMedium,
  type ExperienceFilter,
  type GeoFilter,
} from "../_data";
import CallCard from "./CallCard";

const selectCls = "h-11 w-full rounded-[2px] border border-sand-300 bg-white px-3 text-sm text-green-950";

export default function CallsBrowser({ calls }: { calls: OpenCall[] }) {
  const id = useId();
  const [media, setMedia] = useState<string[]>([]);
  const [geo, setGeo] = useState<GeoFilter>("all");
  const [experience, setExperience] = useState<ExperienceFilter>("all");
  const [budgetOnly, setBudgetOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { shown, hiddenFlagged } = useMemo(() => {
    const matchesBase = (call: OpenCall) =>
      (media.length === 0 || media.some((m) => acceptsMedium(call, m))) &&
      (geo === "all" || CALL_GEO[call.id]?.includes(geo)) &&
      acceptsExperience(call, experience);
    const base = calls.filter(matchesBase);
    const result = base.filter((call) => (!budgetOnly || call.budget) && (!verifiedOnly || call.organiserVerified));
    // Flagged calls are never hidden silently — say so when a trust filter removes them.
    const flaggedGone = base.filter((c) => c.flags?.length && !result.includes(c));
    // Open calls first, closed last; the order is by deadline status, never popularity.
    const order = { "closing-soon": 0, open: 1, closed: 2 } as const;
    result.sort((a, b) => order[a.status] - order[b.status]);
    return { shown: result, hiddenFlagged: flaggedGone };
  }, [calls, media, geo, experience, budgetOnly, verifiedOnly]);

  const active = media.length > 0 || geo !== "all" || experience !== "all" || budgetOnly || verifiedOnly;
  const reset = () => {
    setMedia([]);
    setGeo("all");
    setExperience("all");
    setBudgetOnly(false);
    setVerifiedOnly(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Filter open calls" className="rounded-[4px] border border-sand-200 bg-white p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-green-950">Medium</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MEDIUM_FILTERS.map((m) => (
              <Chip key={m} selected={media.includes(m)} onToggle={() => setMedia((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))}>
                {m}
              </Chip>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-geo`} className="text-sm font-semibold text-green-950">Geography</label>
            <select id={`${id}-geo`} value={geo} onChange={(e) => setGeo(e.target.value as GeoFilter)} className={`mt-2 ${selectCls}`}>
              {GEO_FILTERS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-exp`} className="text-sm font-semibold text-green-950">Experience level</label>
            <select id={`${id}-exp`} value={experience} onChange={(e) => setExperience(e.target.value as ExperienceFilter)} className={`mt-2 ${selectCls}`}>
              {EXPERIENCE_FILTERS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip selected={budgetOnly} onToggle={() => setBudgetOnly((v) => !v)} icon={budgetOnly ? <TickCircle size={16} variant="Bold" color="currentColor" aria-hidden /> : undefined}>
            Budget disclosed only
          </Chip>
          <Chip selected={verifiedOnly} onToggle={() => setVerifiedOnly((v) => !v)} icon={verifiedOnly ? <TickCircle size={16} variant="Bold" color="currentColor" aria-hidden /> : undefined}>
            Verified organisers only
          </Chip>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2" aria-live="polite">
        <p className="text-sm text-grey-800">
          {shown.length} of {calls.length} calls{active ? " match your filters" : ""}.
        </p>
        {active && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
      </div>

      {hiddenFlagged.length > 0 && (
        <p role="note" className="rounded-[4px] border border-alert/20 bg-alert-bg px-4 py-3 text-sm text-grey-800">
          <span className="font-semibold text-alert">{hiddenFlagged.length} flagged call hidden by your trust filters: </span>
          {hiddenFlagged.map((c) => `${c.title} (${c.flags!.join("; ").toLowerCase()})`).join(", ")}. If someone sends it to you directly, don&apos;t pay anything.{" "}
          <button type="button" className="cursor-pointer font-semibold text-green-950 underline underline-offset-2" onClick={() => { setBudgetOnly(false); setVerifiedOnly(false); }}>
            Show it with warnings
          </button>
        </p>
      )}

      <h2 className="sr-only">Calls</h2>
      {shown.length > 0 ? (
        <ul className="grid gap-5 md:grid-cols-2">
          {shown.map((call) => <CallCard key={call.id} call={call} />)}
        </ul>
      ) : (
        <EmptyState
          title="No calls match all of those filters"
          description="Try widening geography or experience. We only list calls with the standard fields filled in, so there are fewer, better ones."
          action={<Button variant="outline" size="sm" onClick={reset}>Clear filters</Button>}
        />
      )}

      {shown.length > 0 && (
        <p className="border-t border-sand-200 pt-6 text-center text-sm text-grey-700">
          That&apos;s every call that fits. New calls are added after a person checks them — usually a few each week.
        </p>
      )}
    </div>
  );
}
