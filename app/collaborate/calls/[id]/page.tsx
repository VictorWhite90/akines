import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import ToggleButton from "@/components/ui/Toggle";
import Chip from "@/components/ui/Chip";
import Photo from "@/components/ui/Photo";
import { CALLS } from "@/lib/data/community";
import { PEOPLE } from "@/lib/data/people";
import BackLink from "@/components/ui/BackLink";

export function generateStaticParams() {
  return CALLS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = CALLS.find((x) => x.id === id);
  return { title: c ? `${c.title} · Open call · Akines` : "Open call · Akines" };
}

export default async function CallDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const call = CALLS.find((c) => c.id === id);
  if (!call) notFound();

  const by = PEOPLE[call.by];

  return (
    <div className="space-y-8">
      <BackLink fallback="/collaborate#calls" className="text-sm font-semibold text-mute hover:text-ink-900">← Back</BackLink>

      <section className="relative overflow-hidden rounded-[28px]">
        <Photo name={call.photo} ratio="21/9" sizes="1100px" className="min-h-[220px]" priority position="center 25%" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/88 via-ink-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-7 text-paper-50 md:p-10">
          <div className="flex items-center gap-2">
            <span className="eyebrow rounded-full bg-ochre-400 px-3 py-1 text-ink-950">Curator open call</span>
            <span className="eyebrow rounded-full bg-paper-50/15 px-3 py-1 text-paper-50 backdrop-blur">{call.days} days left</span>
          </div>
          <h1 className="font-display max-w-2xl text-[30px] leading-[1.1] font-medium md:text-[40px]">{call.title}</h1>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="card space-y-5 p-7 md:p-8">
          <p className="text-[16px] leading-relaxed text-ink-800">{call.blurb}</p>
          <div className="flex flex-wrap gap-2">{call.tags.map((t) => <Chip key={t} tone="outline">{t}</Chip>)}</div>
          <div className="border-t border-line pt-5">
            <p className="eyebrow text-clay-600">What to send</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[14px] leading-relaxed text-mute">
              <li>A short portfolio of recent, relevant work</li>
              <li>One line on why this call speaks to you</li>
              <li>Your availability over the next few weeks</li>
            </ul>
          </div>
        </div>

        <aside className="card space-y-5 p-6">
          <div>
            <p className="eyebrow text-clay-600">Hosted by</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar person={by} size={44} ring />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-ink-950">{by.name}</p>
                <p className="text-[12.5px] leading-snug text-mute">Verified curator · {call.org}, {call.city}</p>
              </div>
            </div>
          </div>
          <ToggleButton idle="Apply with my portfolio" done="Application sent, we'll tell you when it's read" size="md" className="w-full" />
          <p className="text-[12px] leading-relaxed text-mute">Applications are reviewed by {by.name.split(" ")[0]} directly. No public voting, no algorithmic ranking.</p>
        </aside>
      </div>
    </div>
  );
}
