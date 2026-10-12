import type { ReactNode } from "react";
import { Routing2 } from "iconsax-reactjs";
import Card from "@/components/ui/Card";
import { getPerson } from "@/lib/data";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/cn";
import { PROJECT_STAGES } from "@/lib/data";
import { STAGE_GUIDE, type RoomTab } from "../../_data";

export type LedgerEntry = Project["ledger"][number];

/** Shown on a tab whose stage the project hasn't reached yet — never a blank screen. */
export function UpcomingStage({ tab, project, children }: { tab: RoomTab; project: Project; children?: ReactNode }) {
  const stage = PROJECT_STAGES.find((s) => s.id === tab)!;
  const guide = STAGE_GUIDE[tab];
  return (
    <div className="flex flex-col gap-6">
      <Card tone="sand" className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-grey-700">
          <Routing2 size={18} color="currentColor" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-[0.12em]">Not reached yet</p>
        </div>
        <div>
          <h3 className="font-playfair text-xl font-semibold text-green-950">{stage.label}: {stage.outcome}</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-green-950">What happens here</p>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-grey-800">
              {guide.what.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-950">How to get there</p>
            <p className="mt-2 text-sm text-grey-800">{guide.howToGetThere(project)}</p>
          </div>
        </div>
      </Card>
      {children && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-grey-700">Already taking shape</p>
          {children}
        </div>
      )}
    </div>
  );
}

/** Plain-language line in a charter or summary. Empty values read as "not agreed yet". */
export function Term({ label, children, empty = "Not agreed yet" }: { label: string; children?: ReactNode; empty?: string }) {
  const hasValue = children !== undefined && children !== null && children !== "";
  return (
    <div className="grid gap-1 border-b border-sand-200 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm font-semibold text-green-950">{label}</dt>
      <dd className={cn("text-sm", hasValue ? "text-grey-800" : "italic text-grey-600")}>{hasValue ? children : empty}</dd>
    </div>
  );
}

const SPLIT_COLOURS = ["bg-green-950 text-white", "bg-gold-400 text-green-950", "bg-ruby-600 text-white", "bg-calm text-white", "bg-green-600 text-white"];
const SPLIT_DOTS = ["bg-green-950", "bg-gold-400", "bg-ruby-600", "bg-calm", "bg-green-600"];

/** Visual revenue split with a readable legend. */
export function SplitBar({ shares, label }: { shares: { personId: string; share: number }[]; label: string }) {
  if (shares.length === 0) return <p className="text-sm italic text-grey-600">No revenue share agreed yet.</p>;
  return (
    <figure className="flex flex-col gap-3">
      <div className="flex h-9 w-full overflow-hidden rounded-[4px]" role="img" aria-label={`${label}: ${shares.map((s) => `${getPerson(s.personId).name} ${s.share}%`).join(", ")}`}>
        {shares.map((s, i) => (
          <div
            key={s.personId}
            className={cn("flex items-center justify-center text-xs font-semibold", SPLIT_COLOURS[i % SPLIT_COLOURS.length], i > 0 && "border-l-2 border-white")}
            style={{ width: `${s.share}%` }}
          >
            {s.share >= 12 && `${s.share}%`}
          </div>
        ))}
      </div>
      <figcaption className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-grey-800">
        {shares.map((s, i) => (
          <span key={s.personId} className="inline-flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-full", SPLIT_DOTS[i % SPLIT_DOTS.length])} aria-hidden />
            {getPerson(s.personId).name} · <span className="font-semibold text-green-950">{s.share}%</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function PanelHeading({ children, description }: { children: ReactNode; description?: ReactNode }) {
  return (
    <div>
      <h3 className="font-playfair text-lg font-semibold text-green-950 md:text-xl">{children}</h3>
      {description && <p className="mt-1 text-sm text-grey-700">{description}</p>}
    </div>
  );
}

export function Quiet({ children }: { children: ReactNode }) {
  return <p className="rounded-[4px] border border-dashed border-sand-300 bg-white p-4 text-sm text-grey-700">{children}</p>;
}
