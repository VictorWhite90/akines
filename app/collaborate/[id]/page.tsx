import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import ToggleButton from "@/components/ui/Toggle";
import Photo from "@/components/ui/Photo";
import { StageTracker } from "@/components/home/cards";
import { COLLABS, STAGES } from "@/lib/data/community";
import { PEOPLE } from "@/lib/data/people";

export function generateStaticParams() {
  return COLLABS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = COLLABS.find((x) => x.id === id);
  return { title: c ? `${c.title} · Akines` : "Collaboration · Akines" };
}

export default async function CollabRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collab = COLLABS.find((c) => c.id === id);
  if (!collab) notFound();

  const makers = collab.makers.map((m) => PEOPLE[m]);

  return (
    <div className="space-y-10">
      <Link href="/collaborate" className="text-sm font-semibold text-mute hover:text-ink-900">← All collaborations</Link>

      <section className="relative overflow-hidden rounded-[28px]">
        <Photo name={collab.photo} ratio="21/9" sizes="1100px" className="min-h-[260px]" priority />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/88 via-ink-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-7 text-paper-50 md:p-10">
          <span className="eyebrow w-fit rounded-full bg-paper-50/15 px-3 py-1 text-paper-50 backdrop-blur">{collab.route} · {collab.medium}</span>
          <h1 className="font-display max-w-2xl text-[32px] leading-[1.08] font-medium md:text-[44px]">{collab.title}</h1>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="card p-7 md:p-8">
            <p className="eyebrow text-clay-600">About this collaboration</p>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-800">{collab.blurb}</p>
            <div className="mt-6"><StageTracker stage={collab.stage} progress={collab.progress} /></div>
            <p className="mt-3 text-sm text-mute">Next: {collab.next}</p>
          </section>

          <section className="card p-7 md:p-8">
            <p className="eyebrow text-clay-600">How this project works</p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {STAGES.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 rounded-2xl border p-4 ${i === collab.stage ? "border-clay-400 bg-clay-100/40" : i < collab.stage ? "border-line bg-paper-100" : "border-line bg-paper-50"}`}>
                  <span className={`grid h-7 w-7 flex-none place-items-center rounded-full text-[12px] font-bold ${i < collab.stage ? "bg-ink-900 text-paper-50" : i === collab.stage ? "bg-clay-500 text-paper-50" : "border border-line text-mute"}`}>
                    {i < collab.stage ? "✓" : i + 1}
                  </span>
                  <span className="text-[14px] font-semibold text-ink-950">{s}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-6">
            <p className="eyebrow text-clay-600">Makers</p>
            <div className="mt-4 flex flex-col gap-4">
              {makers.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar person={p} size={44} ring />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink-950">{p.name}</p>
                    <p className="truncate text-[12.5px] text-mute">{p.role} · {p.city}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <p className="eyebrow text-clay-600">Join the conversation</p>
            <p className="mt-2 text-[13px] leading-relaxed text-mute">Projects stay invite-only while they're being made. Let the makers know you're interested in what happens next.</p>
            <ToggleButton idle="Follow this project" done="Following, we'll keep you posted" size="md" className="mt-4 w-full" />
            <Button href="/collaborate#calls" variant="ghost" size="md" className="mt-2 w-full">See open calls instead</Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
