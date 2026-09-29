"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import Button from "./Button";
import { ME, PEOPLE, type Person } from "@/lib/data/people";
import type { Room } from "@/lib/data/community";
import { cn } from "@/lib/cn";

const SEATS = 6;

/**
 * Six seats around a table: the signature of a Presence Room. Small on purpose,
 * so it is obvious there is no audience and no stage.
 */
export default function SeatTable({ room, size = 300, tone = "dark", showAction = true }: { room: Room; size?: number; tone?: "dark" | "light"; showAction?: boolean }) {
  const [sitting, setSitting] = useState(false);
  const people: (Person | null)[] = room.seated.map((id) => PEOPLE[id]);
  if (sitting) people.push(ME);
  while (people.length < SEATS) people.push(null);

  const taken = people.filter(Boolean).length;
  const full = taken >= SEATS;
  const seat = size * 0.19;
  const r = size / 2 - seat / 2 - 4;
  const dark = tone === "dark";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ width: size, height: size }} role="group" aria-label={`${taken} of ${SEATS} seats taken`}>
        <div className={cn("absolute inset-[22%] flex flex-col items-center justify-center rounded-full text-center", dark ? "bg-paper-50/8 ring-1 ring-paper-50/15" : "bg-paper-200 ring-1 ring-line")}>
          <span className={cn("font-display text-4xl leading-none", dark ? "text-ochre-300" : "text-clay-500")}>{taken}</span>
          <span className={cn("mt-1 text-[11px] font-semibold tracking-[0.14em] uppercase", dark ? "text-ink-200" : "text-mute")}>of six</span>
        </div>
        {people.map((p, i) => {
          const a = (-90 + i * (360 / SEATS)) * (Math.PI / 180);
          const x = size / 2 + r * Math.cos(a) - seat / 2;
          const y = size / 2 + r * Math.sin(a) - seat / 2;
          const isMe = p?.id === ME.id;
          return (
            <div key={i} className="absolute" style={{ left: x, top: y, width: seat, height: seat }}>
              {p ? (
                <div className={cn("relative rounded-full", isMe && "ring-[3px] ring-ochre-400 ring-offset-2", isMe && (dark ? "ring-offset-ink-900" : "ring-offset-paper-50"))}>
                  <Avatar person={p} size={seat} />
                  {p.id === room.host && <span className="absolute -right-1 -bottom-1 rounded-full bg-ochre-400 px-1.5 py-px text-[9px] font-bold text-ink-950 uppercase">host</span>}
                </div>
              ) : (
                <button
                  onClick={() => !full && setSitting(true)}
                  disabled={full || sitting}
                  aria-label="Take this seat"
                  className={cn("flex h-full w-full items-center justify-center rounded-full border-2 border-dashed text-xl transition-colors", dark ? "border-paper-50/35 text-paper-50/60 hover:border-ochre-300 hover:text-ochre-300" : "border-ink-300 text-ink-400 hover:border-clay-500 hover:text-clay-500")}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>
      {showAction &&
        (sitting ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className={cn("text-sm font-medium", dark ? "text-ochre-200" : "text-clay-600")}>Your seat is held. We'll remind you 10 minutes before.</p>
            <button onClick={() => setSitting(false)} className={cn("text-xs underline underline-offset-4", dark ? "text-ink-200 hover:text-paper-50" : "text-mute hover:text-ink-900")}>
              Give up my seat
            </button>
          </div>
        ) : (
          <Button variant={dark ? "gold" : "primary"} onClick={() => setSitting(true)} disabled={full}>
            {full ? "Room is full" : "Take a seat"}
          </Button>
        ))}
    </div>
  );
}
