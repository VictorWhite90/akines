import type { Metadata } from "next";
import { Breathing, BurnoutCheck, Gratitude } from "@/components/home/Wellbeing";
import MoodCanvas from "@/components/home/MoodCanvas";
import PageHeader from "@/components/ui/PageHeader";
import Photo from "@/components/ui/Photo";
import ToggleButton from "@/components/ui/Toggle";
import { CARE_TEAM } from "@/lib/data/community";

export const metadata: Metadata = { title: "Breathing room · Artelia Connect" };

const TOOLS = ["Creative burnout check", "Artist anxiety reflection", "Collector reflection", "Daily mood canvas", "Expressive art journaling", "Breathing exercises", "Mindfulness", "Gratitude", "Licensed therapists", "Art therapists"];

export default function Wellbeing() {
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Creative wellbeing" title={<>A place to <em>breathe out.</em></>} sub="Isolation, creative blocks, financial worry and impostor feelings are part of making art. This space helps you notice them, and points to real people when you need more." />

      <aside className="flex gap-4 rounded-2xl border border-ochre-400/50 bg-ochre-200/40 p-5" role="note">
        <span aria-hidden className="mt-0.5 shrink-0 text-2xl leading-none text-ochre-600">ⓘ</span>
        <div className="text-[15px] leading-relaxed"><b className="font-semibold">The Companion is AI, not a clinician.</b> It doesn't diagnose or treat anything. It can help you reflect, and it will point you to licensed professionals whenever that would help. <span className="mt-1 flex items-center gap-1.5 text-sm text-mute"><span aria-hidden>⊛</span> Everything here is private and never shapes matching, ranking or ads.</span></div>
      </aside>

      <div className="flex flex-wrap gap-2">{TOOLS.map((t) => <span key={t} className="rounded-full border border-line bg-paper-50 px-3.5 py-1.5 text-[13px] font-medium">{t}</span>)}</div>

      <section className="grid gap-6 lg:grid-cols-2"><MoodCanvas /><Breathing /></section>

      <section className="grid gap-6 lg:grid-cols-12" id="check">
        <div className="lg:col-span-8"><BurnoutCheck /></div>
        <div className="self-start lg:col-span-4"><Gratitude /></div>
      </section>

      <section id="care" className="scroll-mt-28">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-clay-600">Real people, when you need them</p><h2 className="font-display mt-1 text-[32px] font-medium">Licensed therapists & art therapists</h2></div><p className="max-w-sm text-sm text-mute">Independent professionals. Sessions are remote and confidential, and Artelia never sees what you discuss.</p></div>
        <ul className="grid gap-5 md:grid-cols-3">
          {CARE_TEAM.map((c) => (
            <li key={c.name} className="card flex flex-col p-6">
              <span className="font-display flex h-14 w-14 items-center justify-center rounded-full bg-moss-100 text-xl text-moss-700">{c.name.split(" ").filter((w) => /^[A-Z]/.test(w) && w !== "Dr").slice(0, 2).map((w) => w[0]).join("")}</span>
              <p className="font-display mt-4 text-[22px] leading-tight font-medium">{c.name}</p>
              <p className="text-sm font-medium text-clay-600">{c.kind}</p>
              <p className="mt-2 text-sm text-mute">{c.where}</p>
              <p className="mt-1 text-sm">Works with: {c.focus}</p>
              <ToggleButton idle="Ask for an introduction" done="Request sent" variant="ghost" size="sm" className="mt-5 self-start" />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-mute">Profiles are fictional in this prototype.</p>
      </section>

      <section className="relative overflow-hidden rounded-[28px]"><Photo name="calmWater" ratio="21/7" sizes="1100px" className="min-h-[220px]" position="center 55%" /><div className="absolute inset-0 bg-ink-950/45" /><p className="font-display absolute inset-0 flex items-center p-8 text-[30px] leading-tight text-paper-50 md:p-12 md:text-[40px]">You don't have to make anything today.</p></section>
    </div>
  );
}
