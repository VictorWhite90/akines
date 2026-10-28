import type { Metadata } from "next";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import SeatTable from "@/components/ui/SeatTable";
import MyRooms from "@/components/rooms/MyRooms";
import RoomCard from "@/components/rooms/RoomCard";
import { ROOMS } from "@/lib/data/community";
import { PEOPLE } from "@/lib/data/people";

export const metadata: Metadata = { title: "Presence Rooms · Akines" };

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
    <div className="ap ap-calm flex flex-col gap-10" style={{ ["--c" as string]: "#e5007e" } as React.CSSProperties}>
      <div className="bt-head" style={{ marginBottom: 0 }}>
        <section className="bt-intro rm-intro">
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#e5007e" }}>Presence Rooms</p>
          <h1>Six chairs. One conversation.</h1>
          <p>Nurses sit with founders, students with parents, coaches with engineers. Everybody learns, and nobody performs.</p>
          <div className="rm-rules">
            {RULES.map(([t, d]) => <span key={t} title={d}><i /><b>{t}</b> {d}</span>)}
          </div>
        </section>
        <div className="rm-host">
          <span className="seatsdeco" aria-hidden />
          <p style={{ textTransform: "uppercase", letterSpacing: ".12em", fontSize: 11, fontWeight: 700, color: "#ff8cc6" }}>Host a room</p>
          <b>Have a question you&apos;d like to sit inside for an hour?</b>
          <p>Pick a question, a time and who can come in. Six seats, always.</p>
          <Link href="/rooms/new">＋ Create a room</Link>
        </div>
      </div>

      {/* Live now */}
      <section aria-label="Live now" className="relative overflow-hidden rounded-[26px] bg-[#14121a] text-white shadow-lift">
        <Photo name={featured.photo} sizes="(max-width: 1060px) 100vw, 1200px" priority className="absolute inset-0 h-full" position="center 40%" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14121a]/85 via-[#14121a]/35 to-transparent" />
        <div className="relative grid items-center gap-8 p-7 md:p-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] backdrop-blur"><span className="h-[7px] w-[7px] rounded-full bg-[#ff4fa8] shadow-[0_0_0_5px_rgba(229,0,126,.25)]" />{featured.status === "live" ? "Live now" : featured.when} · {featured.tag}</span>
            <h2 className="font-display mt-4 max-w-xl text-[34px] leading-[1.05] md:text-[42px]">{featured.title}</h2>
            <p className="mt-3 flex items-center gap-2.5 text-[13px] text-white/85"><Avatar person={fHost} size={30} />Hosted by <b className="font-semibold text-white">{fHost.name}</b> · {fHost.role}, {fHost.city}</p>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/80">{featured.blurb}</p>
            <Link href={`/rooms/${featured.id}`} className="mt-6 inline-block text-[13px] font-semibold text-white underline decoration-2 underline-offset-4">What we'll talk about →</Link>
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

    </div>
  );
}
