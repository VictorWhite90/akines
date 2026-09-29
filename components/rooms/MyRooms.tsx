"use client";

import Link from "next/link";
import Pic from "@/components/home/Pic";
import { Ico } from "@/components/chat/bits";
import type { Room } from "@/lib/data/community";
import { useLocal } from "@/lib/useLocal";
import RoomCard from "./RoomCard";

export const MY_ROOMS_KEY = "ac:rooms";
export const useMyRooms = () => useLocal<Room[]>(MY_ROOMS_KEY, []);

/**
 * Rooms the signed-in member has created.
 * Default: a compact "Your rooms" strip (public and private).
 * mode="public": their public rooms as cards, for the shared grid everyone sees.
 */
export default function MyRooms({ mode = "strip", circle }: { mode?: "strip" | "public"; circle?: string }) {
  const [rooms] = useMyRooms();
  const mine = rooms.filter((r) => (circle ? r.circle === circle : true));

  if (mode === "public") {
    return <>{mine.filter((r) => r.visibility !== "private" && !r.circle).map((r) => <RoomCard key={r.id} room={r} />)}</>;
  }
  if (!mine.length) return null;
  return (
    <section aria-label="Your rooms">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="ac-eyebrow">Hosted by you</p>
          <h2 className="font-display mt-1 text-[26px] leading-tight">Your rooms</h2>
        </div>
        <Link href={circle ? `/rooms/new?circle=${circle}` : "/rooms/new"} className="text-[13px] font-semibold underline decoration-2 underline-offset-4">＋ Create another</Link>
      </div>
      <ul className="myrooms">
        {mine.map((r) => (
          <li key={r.id}>
            <Link href={`/rooms/${r.id}`}>
              <span className="th"><Pic name={r.photo} sizes="64px" /></span>
              <span className="tx">
                <b>{r.title}</b>
                <small>{r.when}</small>
              </span>
              <span className={`vis ${r.visibility === "private" ? "priv" : ""}`}>
                <Ico n={r.visibility === "private" ? "lock" : "globe"} size={12} />
                {r.visibility === "private" ? "Private" : r.visibility === "circle" ? "Circle" : "Public"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
