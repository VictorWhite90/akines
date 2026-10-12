"use client";

import Link from "next/link";
import { useState } from "react";
import { Logout, Notification, TickCircle, UserAdd } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ME, getPerson } from "@/lib/data";
import type { PresenceRoom } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ROLE_LABEL } from "../_data";
import SeatDots from "./SeatDots";

export default function RoomSeatMap({ room }: { room: PresenceRoom }) {
  const initiallyIn = room.participantIds.includes(ME.id);
  const others = room.participantIds.filter((id) => id !== ME.id);
  const [joined, setJoined] = useState(initiallyIn);
  const [notify, setNotify] = useState(false);
  const [message, setMessage] = useState("");

  const seated = joined ? [...others, ME.id] : others;
  const full = seated.length >= 6;
  const seats = Array.from({ length: 6 }, (_, i) => seated[i] ?? null);

  function join() {
    setJoined(true);
    setNotify(false);
    setMessage(`You have a seat in “${room.title}”. We'll send one reminder 30 minutes before — nothing else.`);
  }
  function leave() {
    setJoined(false);
    setMessage("You've left the room. Your seat is open for someone else; nobody is told why.");
  }
  function toggleNotify() {
    setNotify((n) => !n);
    setMessage(notify ? "Okay — no notification." : "We'll send one quiet note if a seat opens.");
  }

  return (
    <div className="flex flex-col gap-5">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Seat map, six seats">
        {seats.map((id, i) => {
          if (!id) {
            return (
              <li key={`open-${i}`} className="flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-sand-300 bg-sand-50 p-3 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-green-700 text-green-800">
                  <UserAdd size={18} color="currentColor" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-green-950">Your seat?</span>
                <span className="text-xs text-grey-700">Seat {i + 1} · open</span>
              </li>
            );
          }
          const person = getPerson(id);
          const isMe = id === ME.id;
          const isFacilitator = id === room.facilitatorId;
          return (
            <li
              key={id}
              className={cn(
                "flex min-h-[132px] flex-col items-center gap-2 rounded-[4px] border p-3 text-center",
                isMe ? "border-green-950 bg-green-50" : "border-sand-200 bg-white",
              )}
            >
              <Avatar name={person.name} size="md" verified={person.verified} />
              {isMe ? (
                <span className="text-sm font-semibold text-green-950">You</span>
              ) : (
                <Link href={`/people/${person.id}`} className="text-sm font-semibold text-green-950 hover:underline">
                  {person.name}
                </Link>
              )}
              <span className="text-xs text-grey-700">{person.title}</span>
              <span className="flex flex-wrap justify-center gap-1">
                <Badge tone="neutral">{ROLE_LABEL[person.role]}</Badge>
                {isFacilitator && <Badge tone="gold">Facilitator</Badge>}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 rounded-[4px] bg-sand-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <SeatDots taken={seated.length} />
        <div className="flex flex-wrap gap-2">
          {joined ? (
            <>
              <Badge tone="green" icon={<TickCircle size={12} variant="Bold" color="currentColor" aria-hidden />}>You have a seat</Badge>
              <Button variant="outline" size="sm" onClick={leave} icon={<Logout size={16} color="currentColor" aria-hidden />}>
                Leave room
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={join} disabled={full} icon={<UserAdd size={16} color="currentColor" aria-hidden />}>
                {full ? "Room is full" : "Take a seat"}
              </Button>
              {full && (
                <Button
                  variant={notify ? "ghost" : "outline"}
                  size="sm"
                  aria-pressed={notify}
                  onClick={toggleNotify}
                  icon={<Notification size={16} color="currentColor" aria-hidden />}
                >
                  {notify ? "We'll tell you if a seat opens" : "Tell me if a seat opens"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <p className={message ? "text-sm text-grey-800" : "sr-only"} aria-live="polite">{message}</p>
    </div>
  );
}
