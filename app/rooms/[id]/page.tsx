// Covers: C4 (six seats, facilitated, no audience/livestream/followers), T7 (house rules, report), T8 (human review), U4 (collector joins a room)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Microphone2 } from "iconsax-reactjs";
import { CIRCLES, ME, getPerson } from "@/lib/data";
import { LIVE_ROOM_IDS } from "@/lib/data/village";
import Palaver, { type Seat } from "../_components/Palaver";
import { ALL_ROOMS, HOUSE_RULES, ROLE_LABEL, findRoom } from "../_data";

export function generateStaticParams() {
  return ALL_ROOMS.map((room) => ({ id: room.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const room = findRoom(id);
  return { title: room ? room.title : "Palaver" };
}

export default async function PalaverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = findRoom(id);
  if (!room) notFound();

  const live = LIVE_ROOM_IDS.includes(room.id);
  const circle = CIRCLES.find((c) => c.id === room.circleId);
  const seats: Seat[] = room.participantIds
    .filter((pid) => pid !== ME.id)
    .map((pid) => {
      const p = getPerson(pid);
      return { id: pid, name: p.name, role: ROLE_LABEL[p.role], verified: p.verified, facilitator: pid === room.facilitatorId };
    });
  const alreadyIn = room.participantIds.includes(ME.id);

  return (
    <div className="min-h-full bg-night-900 text-night-text">
      <header className="flex h-14 items-center gap-3 border-b border-night-700 px-4 sm:px-6">
        <Microphone2 size={20} color="var(--color-night-muted)" aria-hidden />
        <h1 className="truncate font-semibold text-white">{room.title}</h1>
        {live ? (
          <span className="flex items-center gap-1.5 rounded-full bg-live/20 px-2.5 py-0.5 text-xs font-bold text-fire">
            <span className="h-1.5 w-1.5 rounded-full bg-fire motion-safe:animate-pulse" /> LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-night-muted"><Calendar size={14} color="currentColor" aria-hidden /> {room.when}</span>
        )}
        {circle && (
          <Link href={`/c/${circle.id}/general`} className="ml-auto hidden text-sm text-night-muted hover:text-white sm:block">
            {circle.name} circle
          </Link>
        )}
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          {alreadyIn && <p className="mb-4 rounded-[8px] bg-night-800 px-4 py-3 text-center text-sm text-night-text">You already hold a seat in this palaver.</p>}
          <Palaver seats={seats} prompts={room.prompts} live={live} when={room.when} meName={ME.name} />
        </div>

        <aside className="flex flex-col gap-6 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-night-muted">Tonight&apos;s prompts</p>
            <ol className="mt-3 flex flex-col gap-2">
              {room.prompts.map((p, i) => (
                <li key={p} className="flex gap-2 text-night-text">
                  <span className="text-fire">{i + 1}.</span> {p}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-night-muted">House rules</p>
            <ul className="mt-3 flex flex-col gap-3">
              {HOUSE_RULES.map((r) => (
                <li key={r.title}>
                  <p className="font-semibold text-white">{r.title}</p>
                  <p className="mt-0.5 text-night-muted">{r.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
