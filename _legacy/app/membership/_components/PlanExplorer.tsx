"use client";

import { useState } from "react";
import { Briefcase, Building, Crown1, PercentageSquare, Receipt1, SecuritySafe, Teacher, Ticket, TickCircle } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Chip from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { STREAMS, WORKSPACE_TIERS, type Audience, type Stream } from "../_data";

const ICONS: Record<Stream["icon"], typeof Crown1> = {
  crown: Crown1,
  briefcase: Briefcase,
  shield: SecuritySafe,
  percent: PercentageSquare,
  ticket: Ticket,
  teacher: Teacher,
  building: Building,
  receipt: Receipt1,
};

const FILTERS: { id: Audience; label: string }[] = [
  { id: "everyone", label: "Everything" },
  { id: "collectors", label: "Collectors" },
  { id: "professionals", label: "Curators & galleries" },
  { id: "institutions", label: "Institutions & brands" },
];

/** Revenue streams as scannable cards, filterable by who pays (B2). */
export default function PlanExplorer() {
  const [audience, setAudience] = useState<Audience>("everyone");
  const streams = audience === "everyone" ? STREAMS : STREAMS.filter((s) => s.audience.includes(audience));
  const showWorkspaces = audience === "everyone" || audience === "professionals" || audience === "institutions";
  const count = streams.length + (showWorkspaces ? 1 : 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Show what each group pays for">
        {FILTERS.map((f) => (
          <Chip key={f.id} selected={audience === f.id} onToggle={() => setAudience(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>
      <p aria-live="polite" className="mt-3 text-sm text-grey-700">
        {audience === "everyone" ? `All ${count} ways Artelia Connect earns.` : `${count} ways ${FILTERS.find((f) => f.id === audience)?.label.toLowerCase()} might pay.`}
      </p>

      {showWorkspaces && (
        <section aria-labelledby="workspaces-heading" className="mt-6 rounded-[4px] border border-sand-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-900">
                <Briefcase size={22} variant="Bulk" color="currentColor" aria-hidden />
              </span>
              <div>
                <h3 id="workspaces-heading" className="font-playfair text-xl font-semibold text-green-950">
                  Professional workspaces
                </h3>
                <p className="text-sm text-grey-700">Pipeline, review, CRM and analytics for the people who select and show artists.</p>
              </div>
            </div>
            <Badge tone="gold">Paid by curators, galleries & institutions</Badge>
          </div>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {WORKSPACE_TIERS.map((t) => (
              <li
                key={t.name}
                className={cn("relative flex flex-col gap-3 rounded-[4px] border p-5", t.highlight ? "border-green-950 bg-sand-50" : "border-sand-200 bg-white")}
              >
                {t.highlight && <Badge tone="green" className="absolute -top-3 left-4">Most pilot galleries</Badge>}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ruby-600">{t.name}</p>
                  <p className="mt-1 text-xs text-grey-700">{t.for}</p>
                </div>
                <p>
                  <span className="font-playfair text-3xl font-bold text-green-950">{t.price}</span>
                  <span className="ml-1 text-xs text-grey-700">{t.unit}</span>
                </p>
                <ul className="flex flex-col gap-1.5 text-sm text-grey-800">
                  {t.includes.map((i) => (
                    <li key={i} className="flex gap-2">
                      <TickCircle size={16} variant="Bulk" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
                      {i}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {streams.map((s) => {
          const Icon = ICONS[s.icon];
          return (
            <li key={s.id} className="flex flex-col gap-4 rounded-[4px] border border-sand-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-300/60 text-ruby-800">
                  <Icon size={20} variant="Bulk" color="currentColor" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-playfair text-lg font-semibold leading-snug text-green-950">{s.title}</h3>
                  <p className="text-xs text-grey-700">Paid by: {s.payer}</p>
                </div>
              </div>
              <p>
                <span className="font-playfair text-2xl font-bold text-green-950">{s.price}</span>
                <span className="mt-0.5 block text-xs text-grey-700">{s.unit}</span>
              </p>
              <ul className="flex flex-col gap-1.5 text-sm text-grey-800">
                {s.includes.map((i) => (
                  <li key={i} className="flex gap-2">
                    <TickCircle size={16} variant="Bulk" color="var(--color-verified)" className="mt-0.5 shrink-0" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>
              <p className="mt-auto rounded-[4px] bg-sand-100 px-3 py-2 text-xs text-grey-800">
                <span className="font-semibold text-green-950">When: </span>
                {s.when}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
