import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { CallCard, CollabCard } from "@/components/home/cards";
import Avatar from "@/components/ui/Avatar";
import ToggleButton from "@/components/ui/Toggle";
import Photo from "@/components/ui/Photo";
import { CALLS, COLLABS } from "@/lib/data/community";
import { PEOPLE, type PersonId } from "@/lib/data/people";

export const metadata: Metadata = { title: "Collaborate · Akines" };

const PAIRS: { a: PersonId; b: PersonId; why: string; route: string }[] = [
  { a: "ayo", b: "wanjiru", why: "Cloth and photography both hold memory. Ayo's dye work has no image record yet; Wanjiru's archive has no cloth.", route: "Nigeria × Kenya" },
  { a: "thandi", b: "tunde", why: "Vessels and figures. Two clay practices with different scales and firing methods, and a shared interest in the body.", route: "South Africa × Nigeria" },
  { a: "fatou", b: "kwame", why: "A designer thinking in silhouette and a painter thinking in layers. Both are circling the same green.", route: "Senegal × Ghana" },
];

const STEPS = [
  { t: "Portfolio-first", d: "Apply with your work, not a cover letter." },
  { t: "Rights up front", d: "Roles, credits and revenue split agreed before you begin." },
  { t: "Shared milestones", d: "Spark, sketch, making, showing, tracked together." },
  { t: "Permanent credit", d: "Every maker is named on the work and on its legacy page, forever." },
];

export default function Collaborate() {
  return (
    <div className="space-y-14">
      <PageHeader eyebrow="Shared creation" title={<>Make something <em>neither of you could make alone.</em></>} sub="Joint exhibitions, shared sketchbooks and cross-country collaborations, in a protected project room from first spark to exhibition." />

      <ol className="grid gap-4 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.t} className="rounded-2xl border border-line bg-paper-50 p-5"><span className="text-[11px] font-bold text-clay-500">0{i + 1}</span><p className="font-display mt-1 text-xl font-medium">{s.t}</p><p className="mt-1 text-sm text-mute">{s.d}</p></li>
        ))}
      </ol>

      <section aria-label="In progress">
        <h2 className="font-display mb-5 text-[30px] font-medium">Being made right now</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{COLLABS.map((c) => <CollabCard key={c.id} c={c} />)}</div>
      </section>

      <section id="calls" aria-label="Open calls" className="scroll-mt-28">
        <div className="mb-5 flex items-end justify-between"><h2 className="font-display text-[30px] font-medium">Curator open calls</h2><span className="text-sm text-mute">3 open</span></div>
        <div className="grid gap-5 md:grid-cols-3">
          {CALLS.map((c) => (
            <div key={c.id} className="flex flex-col gap-3">
              <CallCard c={c} className="flex-1" />
              <ToggleButton idle="Apply with my portfolio" done="Application sent, we'll tell you when it's read" size="md" className="w-full" />
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Complementary voices" className="pattern-kuba rounded-[28px] border border-line bg-paper-200/70 p-7 md:p-9">
        <p className="eyebrow text-clay-600">Complementary voices</p>
        <h2 className="font-display mt-1 text-[30px] font-medium">Pairs we think should meet</h2>
        <ul className="mt-6 grid gap-5 lg:grid-cols-3">
          {PAIRS.map((p) => {
            const a = PEOPLE[p.a], b = PEOPLE[p.b];
            return (
              <li key={p.a + p.b} className="flex flex-col rounded-2xl bg-paper-50 p-5 shadow-soft">
                <p className="eyebrow text-[10px] text-clay-600">{p.route}</p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar person={a} size={48} ring /><span className="h-px w-5 border-t-2 border-dashed border-clay-400" /><Avatar person={b} size={48} ring />
                  <p className="text-sm font-semibold leading-tight">{a.name.split(" ")[0]} & {b.name.split(" ")[0]}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-mute">{p.why}</p>
                <ToggleButton idle="Propose a project" done="Proposal sent" variant="ghost" size="sm" className="mt-auto self-start" />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="relative overflow-hidden rounded-[28px]">
        <Photo name="textileRolls" ratio="21/8" sizes="1100px" className="min-h-[240px]" />
        <div className="absolute inset-0 bg-linear-to-r from-ink-950/85 to-ink-950/20" />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 p-8 text-paper-50 md:p-12"><p className="eyebrow text-ochre-300">Every project gets a room</p><p className="font-display max-w-lg text-[30px] leading-tight md:text-[38px]">Shared sketchbook, shared timeline, shared credit.</p></div>
      </section>
    </div>
  );
}
