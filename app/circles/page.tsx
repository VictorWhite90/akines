import type { Metadata } from "next";
import Link from "next/link";
import Photo from "@/components/ui/Photo";
import CircleJoin from "@/components/circles/CircleJoin";
import KinCircleHero from "@/components/circles/KinCircleHero";
import { CIRCLES } from "@/lib/data/community";

export const metadata: Metadata = { title: "KinCircle · Akines" };

export default function Circles() {
  return (
    <div className="space-y-12">
      <KinCircleHero />

      <div id="find-a-circle" className="scroll-mt-24">
        <p className="text-[11px] font-bold tracking-[2px] text-clay-600 uppercase">Find a circle</p>
        <h2 className="font-display mt-2 text-[30px] leading-[1.1] font-semibold">Small communities, <em className="font-medium text-clay-500 italic">real conversation.</em></h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-mute">Ten circles, each held small enough that people know each other&rsquo;s names. Join one to chat with the circle, see what&rsquo;s happening around the world in your field, and open private rooms for live calls.</p>
      </div>

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {CIRCLES.map((c) => (
          <li key={c.id} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-paper-50 shadow-soft transition hover:shadow-lift hover:-translate-y-0.5">
            <Link href={`/circles/${c.id}`} className="block">
              <Photo name={c.photo} ratio="16/10" sizes="(max-width: 768px) 100vw, 400px" className="[&_img]:transition-transform [&_img]:duration-500 [&_img]:group-hover:scale-105">
                <div className="absolute inset-0 bg-linear-to-t from-ink-950/75 to-transparent" />
                <p className="font-display absolute bottom-4 left-5 text-[28px] leading-none text-paper-50">{c.name}</p>
              </Photo>
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[15px] leading-relaxed text-mute">{c.blurb}</p>
              <p className="font-display mt-3 text-[15px] leading-snug text-ink-800 italic">“{c.starter}”</p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-xs text-mute">{c.members} members · {c.active} active now</span>
                <CircleJoin id={c.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
