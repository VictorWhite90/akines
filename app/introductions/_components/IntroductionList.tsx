"use client";

import { useState } from "react";
import { TickCircle } from "iconsax-reactjs";
import EmptyState from "@/components/ui/EmptyState";
import Tabs from "@/components/ui/Tabs";
import type { Introduction, Person } from "@/lib/types";
import IntroductionCard from "./IntroductionCard";

type Filter = "all" | "collaborators" | "collectors" | "curators" | "peers";

const MATCHES: Record<Filter, (kind: Introduction["kind"]) => boolean> = {
  all: () => true,
  collaborators: (k) => k === "collaborator",
  collectors: (k) => k === "collector",
  curators: (k) => k === "curator",
  peers: (k) => k === "peer" || k === "mentor",
};

export default function IntroductionList({ items }: { items: { intro: Introduction; person: Person }[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const count = (f: Filter) => items.filter((i) => MATCHES[f](i.intro.kind)).length;
  const tabs: { id: Filter; label: string; hint: string }[] = [
    { id: "all", label: "All", hint: String(count("all")) },
    { id: "collaborators", label: "Collaborators", hint: String(count("collaborators")) },
    { id: "collectors", label: "Collectors", hint: String(count("collectors")) },
    { id: "curators", label: "Curators", hint: String(count("curators")) },
    { id: "peers", label: "Peers & mentors", hint: String(count("peers")) },
  ];
  const shown = items.filter((i) => MATCHES[filter](i.intro.kind));

  return (
    <section aria-labelledby="intros-list-heading">
      <h2 id="intros-list-heading" className="sr-only">
        This week&apos;s introductions
      </h2>
      <Tabs items={tabs} value={filter} onChange={setFilter} idPrefix="intros" label="Filter introductions" />
      <div role="tabpanel" id={`intros-panel-${filter}`} aria-labelledby={`intros-tab-${filter}`} className="pt-6">
        {shown.length === 0 ? (
          <EmptyState title="None of these this week" description="We only introduce people when there's a real reason. Check back next week." />
        ) : (
          <ul className="flex flex-col gap-5">
            {/* Every card stays mounted so a sent request or a decline survives switching tabs. */}
            {items.map(({ intro, person }) => (
              <IntroductionCard key={intro.id} intro={intro} person={person} hidden={!MATCHES[filter](intro.kind)} />
            ))}
          </ul>
        )}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-sand-200 pt-8 text-center">
          <TickCircle size={28} variant="Bulk" color="var(--color-verified)" aria-hidden />
          <p className="font-playfair text-lg font-semibold text-green-950">That&apos;s everyone this week.</p>
          <p className="max-w-md text-sm text-grey-700">
            New introductions arrive on Monday. There&apos;s no more to scroll — if none of these feel right, tell us why and next week will be better.
          </p>
        </div>
      </div>
    </section>
  );
}
