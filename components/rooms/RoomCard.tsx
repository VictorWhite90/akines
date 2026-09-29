import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import SeatRow from "@/components/ui/SeatRow";
import ToggleButton from "@/components/ui/Toggle";
import type { Room } from "@/lib/data/community";
import { PEOPLE } from "@/lib/data/people";

export default function RoomCard({ room, preview = false }: { room: Room; preview?: boolean }) {
  const host = PEOPLE[room.host];
  const live = room.status === "live";
  const Wrap = preview ? "div" : Link;
  const wrapProps = preview ? {} : { href: `/rooms/${room.id}` };
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-paper-50 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lift">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Wrap {...(wrapProps as any)} className="relative block h-[168px] overflow-hidden bg-paper-200">
        <Photo name={room.photo} sizes="(max-width: 768px) 100vw, 420px" className="absolute inset-0 h-full [&_img]:transition-transform [&_img]:duration-700 [&_img]:group-hover:scale-105" position="center 35%" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 z-10 rounded-full bg-paper-50/95 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">{room.tag}</span>
        {room.mine && <span className="absolute top-3 right-3 z-10 rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold tracking-wide text-ink-900 uppercase">{room.visibility === "private" ? "Yours · Private" : "Yours"}</span>}
        <span className={`absolute right-3 bottom-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${live ? "bg-clay-500 text-white" : "bg-night/80 text-white backdrop-blur"}`}>
          {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}{room.when}
        </span>
      </Wrap>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[19px] leading-[1.2]">{preview ? room.title : <Link href={`/rooms/${room.id}`} className="hover:underline">{room.title}</Link>}</h3>
        <p className="mt-2 flex items-center gap-2 text-[11.5px] text-mute"><Avatar person={host} size={22} />Hosted by {room.mine ? "you" : host.name}</p>
        <p className="mt-2.5 line-clamp-2 text-[12px] leading-[1.5] text-mute">{room.blurb}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <SeatRow room={room} size={24} />
          {room.mine ? (
            preview ? <span className="text-[11px] font-semibold text-mute">Open room</span> : <Link href={`/rooms/${room.id}`} className="inline-flex h-8 items-center rounded-full bg-night px-3.5 text-[11px] font-semibold text-white">Open room</Link>
          ) : (
            <ToggleButton idle="Take a seat" done="Seat held" size="sm" className="!h-8 !px-3.5 !text-[11px]" />
          )}
        </div>
      </div>
    </article>
  );
}
