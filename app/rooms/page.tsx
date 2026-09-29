import type { Metadata } from "next";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import PageHeader from "@/components/ui/PageHeader";
import Photo from "@/components/ui/Photo";
import SeatTable from "@/components/ui/SeatTable";
import MyRooms from "@/components/rooms/MyRooms";
import RoomCard from "@/components/rooms/RoomCard";
import { ROOMS } from "@/lib/data/community";
import { PEOPLE } from "@/lib/data/people";

export const metadata: Metadata = { title: "Presence Rooms · Artelia Connect" };

const RULES = [
  ["Six seats", "Never more. Everyone is heard."],
  ["No audience", "Nobody watches from outside."],
  ["Not recorded", "What's said stays in the room."],
  ["No followers", "You come as yourself."],
];

export default function Rooms() {
  const featured = ROOMS.find((r) => r.status === "live") ?? ROOMS[0];
  const fHost = PEOPLE[featured.host];
  const rest = ROOMS.filter((r) => r.id !== featured.id);
  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Art Presence Rooms" title={<>Six chairs. <em>One conversation.</em></>} sub="Artists sit with collectors, collectors with students, students with curators. Everybody learns, and nobody performs.">
        <Link href="/rooms/new" className="inline-flex items-center gap-2 rounded-full bg-night px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-ink-800">＋ Create a room</Link>
      </PageHeader>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {RULES.map(([t, d]) => (
          <li key={t} className="rounded-2xl border border-line bg-paper-50 px-4 py-3.5">
            <p className="font-display text-[16px]">{t}</p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-mute">{d}</p>
          </li>
        ))}
      </ul>

      {/* Live now */}
      <section aria-label="Live now" className="relative overflow-hidden rounded-[26px] bg-ink-900 text-paper-50 shadow-lift">
        <Photo name={featured.photo} sizes="(max-width: 1060px) 100vw, 1200px" priority className="absolute inset-0 h-full" position="center 40%" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1c17]/85 via-[#12261f]/35 to-transparent" />
        <div className="relative grid items-center gap-8 p-7 md:p-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] backdrop-blur"><span className="h-[7px] w-[7px] rounded-full bg-[#d9ed6c] shadow-[0_0_0_5px_rgba(217,237,108,.17)]" />{featured.status === "live" ? "Live now" : featured.when} · {featured.tag}</span>
            <h2 className="font-display mt-4 max-w-xl text-[34px] leading-[1.05] md:text-[42px]">{featured.title}</h2>
            <p className="mt-3 flex items-center gap-2.5 text-[13px] text-paper-100/90"><Avatar person={fHost} size={30} />Hosted by <b className="font-semibold text-paper-50">{fHost.name}</b> · {fHost.role}, {fHost.city}</p>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[#d9e1dd]">{featured.blurb}</p>
            <Link href={`/rooms/${featured.id}`} className="mt-6 inline-block text-[13px] font-semibold text-lime underline decoration-2 underline-offset-4">What we'll talk about →</Link>
          </div>
          <div className="rounded-[22px] border border-white/15 bg-night/30 p-5 backdrop-blur-sm">
            <SeatTable room={featured} size={220} tone="dark" />
          </div>
        </div>
      </section>

      <MyRooms />

      <section aria-label="More rooms">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="ac-eyebrow">Coming up</p>
            <h2 className="font-display mt-1 text-[28px] leading-tight">Rooms this week</h2>
          </div>
          <p className="hidden text-[12px] text-mute md:block">Every room is hosted, and every seat is held for ten minutes.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MyRooms mode="public" />
          {rest.map((r) => <RoomCard key={r.id} room={r} />)}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[24px]">
        <Photo name="talkLaugh" ratio="21/6" sizes="1100px" className="min-h-[190px]" position="center 40%" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/85 to-night/30" />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 p-8 text-paper-50 md:p-10">
          <p className="ac-eyebrow" style={{ color: "var(--lime)" }}>Host a room</p>
          <p className="font-display max-w-lg text-[26px] leading-tight md:text-[32px]">Have a question you'd like to sit inside for an hour?</p>
          <Link href="/rooms/new" className="mt-2 inline-block w-fit rounded-full bg-lime px-5 py-2.5 text-[13px] font-bold text-ink-900">Create your room →</Link>
        </div>
      </section>
    </div>
  );
}
