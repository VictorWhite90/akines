import type { Metadata } from "next";
import DnaControls from "@/components/home/DnaControls";
import PageHeader from "@/components/ui/PageHeader";
import Radar from "@/components/ui/Radar";
import Spectrum from "@/components/ui/Spectrum";
import { AiTag } from "@/components/ui/Chip";
import { CAPTIONS, COLLECTOR_TYPES, DNA_SUMMARY, DNA_TITLE, RADAR, SPECTRA } from "@/lib/data/dna";

export const metadata: Metadata = { title: "Creative DNA · Akines" };

export default function Dna() {
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Creative DNA™" title={<>How you <em>see, keep and share.</em></>} sub="Not a personality test. A living picture of how you connect with art, shaped by what you actually spend time with. You can edit it, hide it or delete it." />

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="pattern-adire on-dark rounded-[28px] bg-ink-900 p-8 text-paper-50 lg:col-span-7 md:p-10">
          <div className="flex items-center justify-between"><p className="eyebrow text-ochre-300">Your archetype</p><AiTag className="border-paper-50/25 text-ink-200" /></div>
          <h2 className="font-display mt-2 text-[40px] leading-[1.05] font-medium md:text-[52px]">{DNA_TITLE}<span className="text-ochre-300">.</span></h2>
          <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-paper-100/85">{DNA_SUMMARY}</p>
          <Radar axes={RADAR} dark className="mx-auto mt-6 max-w-[560px]" />
        </div>
        <div className="card p-7 lg:col-span-5">
          <p className="eyebrow text-clay-600">Where you sit</p>
          <h3 className="font-display mt-1 text-[26px] font-medium">Spectrums, not scores</h3>
          <p className="mt-1 text-sm text-mute">Neither end is better. They help us seat you with people who'll enjoy you.</p>
          <div className="mt-6 space-y-7">{SPECTRA.map((s) => <Spectrum key={s.key} left={s.left} right={s.right} value={s.value} />)}</div>
          <div className="mt-8 border-t border-line pt-6">
            <p className="eyebrow text-clay-600">What we noticed</p>
            <ul className="mt-3 space-y-2.5 text-[15px]">{CAPTIONS.map((c) => <li key={c} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-clay-500" />{c}</li>)}</ul>
          </div>
        </div>
      </section>

      <section>
        <p className="eyebrow text-clay-600">Collector type</p>
        <h2 className="font-display mt-1 text-[32px] font-medium">You lean <em>Historian</em>, with an Explorer's curiosity</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {COLLECTOR_TYPES.map((t, i) => (
            <li key={t.key} className="card p-5">
              <div className="flex items-baseline justify-between"><p className="font-display text-2xl font-medium">{t.label}</p><span className="text-sm font-semibold text-clay-600">{t.value}%</span></div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-900/10"><div className="h-full rounded-full" style={{ width: `${t.value * 2}%`, background: i === 0 ? "var(--color-clay-500)" : "var(--color-ochre-400)" }} /></div>
              <p className="mt-3 text-sm text-mute">{t.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-7 md:p-9"><p className="eyebrow text-clay-600">You decide</p><h2 className="font-display mt-1 mb-6 text-[28px] font-medium">How your Creative DNA is used</h2><DnaControls /></section>
    </div>
  );
}
