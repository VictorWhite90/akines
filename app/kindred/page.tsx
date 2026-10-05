import type { Metadata } from "next";
import IntroCard from "@/components/home/IntroCard";
import PageHeader from "@/components/ui/PageHeader";
import { AiTag } from "@/components/ui/Chip";
import { MATCHES } from "@/lib/data/matches";

export const metadata: Metadata = { title: "Kindred · Akines" };

const HOW = [
  { t: "Things you discovered", d: "Artists, works and traditions you've spent real time with." },
  { t: "Things you keep", d: "What you collect, make or write about, in journals you chose to share." },
  { t: "How you like to talk", d: "Quiet observer or conversation starter. We pair gently, not loudly." },
];

export default function Kindred() {
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Meaningful matching" title={<>People whose journeys <em>complement yours.</em></>} sub="Not “people you may know”. Every introduction arrives with the reason for it, so a first hello has something real in it." />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Introductions for you">
        {MATCHES.map((m) => <IntroCard key={m.id} match={m} compact />)}
      </section>

      <section className="pattern-kuba rounded-[28px] border border-line bg-paper-200/70 p-7 md:p-9">
        <div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-[28px] font-medium">How we choose</h2><AiTag /></div>
        <p className="mt-2 max-w-2xl text-mute">You can see, edit and switch off every signal. Wellbeing check-ins and private journals are never used here.</p>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {HOW.map((h, i) => (
            <li key={h.t} className="rounded-2xl bg-paper-50 p-5 shadow-soft">
              <span className="font-display text-3xl text-clay-500">0{i + 1}</span>
              <p className="mt-1 font-semibold">{h.t}</p>
              <p className="mt-1 text-sm text-mute">{h.d}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
