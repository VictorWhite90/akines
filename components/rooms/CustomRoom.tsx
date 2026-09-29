"use client";

import Link from "next/link";
import { useMyRooms } from "./MyRooms";
import RoomSpace from "./RoomSpace";

/** A room the member created: found in their saved rooms. */
export default function CustomRoom({ id, demo }: { id: string; demo?: string }) {
  const [rooms, , ready] = useMyRooms();
  const room = rooms.find((r) => r.id === id);
  if (!ready) return <div className="rs" style={{ opacity: 0.4 }} aria-busy />;
  if (!room) {
    return (
      <div className="cr-note" style={{ maxWidth: 520, margin: "60px auto", textAlign: "center", padding: 28 }}>
        <p className="font-display" style={{ fontSize: 24, marginBottom: 8 }}>We can&apos;t find that room</p>
        <p style={{ marginBottom: 16 }}>It may have been created on another device (this prototype keeps rooms in your browser), or it was removed.</p>
        <Link href="/rooms" className="cr-go" style={{ display: "inline-block", width: "auto" }}>Back to rooms</Link>
      </div>
    );
  }
  return <RoomSpace key={room.id} room={room} demo={demo} />;
}
