import Avatar from "./Avatar";
import { PEOPLE } from "@/lib/data/people";
import type { Room } from "@/lib/data/community";
import { cn } from "@/lib/cn";

/** Six small seats in a row: filled with a face, or a dashed empty seat. */
export default function SeatRow({ room, size = 28, dark = false }: { room: Room; size?: number; dark?: boolean }) {
  const seats = Array.from({ length: 6 }, (_, i) => room.seated[i]);
  const left = 6 - room.seated.length;
  return (
    <div className="flex items-center gap-2.5" role="group" aria-label={`${room.seated.length} of 6 seats taken`}>
      <span className="flex items-center">
        {seats.map((id, i) => (
          <span key={i} className={cn("-ml-1.5 first:ml-0 inline-flex rounded-full ring-2", dark ? "ring-ink-900" : "ring-paper-50")}>
            {id ? (
              <Avatar person={PEOPLE[id]} size={size} />
            ) : (
              <span className={cn("rounded-full border border-dashed", dark ? "border-paper-50/50" : "border-ink-300 bg-paper-100")} style={{ width: size, height: size }} />
            )}
          </span>
        ))}
      </span>
      <span className={cn("text-[11px] font-semibold", dark ? "text-ochre-300" : left === 0 ? "text-mute" : "text-clay-600")}>{left === 0 ? "Full" : left === 1 ? "1 seat left" : `${left} seats left`}</span>
    </div>
  );
}
