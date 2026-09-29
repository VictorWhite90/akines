import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Photo from "@/components/ui/Photo";
import CircleJoin from "@/components/circles/CircleJoin";
import { CIRCLES } from "@/lib/data/community";

export const metadata: Metadata = { title: "Creative Circles · Artelia Connect" };

export default function Circles() {
  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Creative circles" title={<>Small communities, <em>real conversation.</em></>} sub="Ten circles, each held small enough that people know each other's names. Join one to chat with the circle, see what's happening around the world in your field, and open private rooms for live calls." />
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {CIRCLES.map((c) => (
          <li key={c.id} className="card card-lift group flex flex-col overflow-hidden">
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
