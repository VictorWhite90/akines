"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag, Forward, Logout, Microphone2, MicrophoneSlash, Radar, ShieldTick } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export type Seat = { id: string; name: string; role: string; verified: boolean; facilitator: boolean };

const SEAT_ANGLES = [-90, -30, 30, 90, 150, 210];

/**
 * Six seats around a fire. You can see who is here and what they do, take an
 * empty seat, and leave any time. Nothing is recorded (C4, T7).
 */
export default function Palaver({
  seats,
  prompts,
  live,
  when,
  meName,
}: {
  seats: Seat[];
  prompts: string[];
  live: boolean;
  when: string;
  meName: string;
}) {
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hand, setHand] = useState(false);
  const [prompt, setPrompt] = useState(0);
  const [notify, setNotify] = useState(false);
  const [status, setStatus] = useState("");

  const full = seats.length >= 6;
  const people: (Seat | null)[] = Array.from({ length: 6 }, (_, i) => seats[i] ?? null);
  if (joined) {
    const firstEmpty = people.findIndex((s) => s === null);
    if (firstEmpty !== -1) people[firstEmpty] = { id: "me", name: meName, role: "You", verified: true, facilitator: false };
  }
  const speakingId = seats.find((s) => s.facilitator)?.id;

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-[560px]">
        {/* the fire */}
        <div className="absolute left-1/2 top-1/2 flex h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(245,176,65,0.35)_0%,rgba(232,116,59,0.12)_45%,transparent_70%)] p-4 text-center">
          <span className="mb-2 h-3 w-3 rounded-full bg-fire shadow-[0_0_24px_10px_rgba(245,176,65,0.55)] motion-safe:animate-pulse" aria-hidden />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fire">{live ? `Prompt ${prompt + 1} of ${prompts.length}` : "First prompt"}</p>
          <p className="mt-1 font-playfair text-sm leading-snug text-white sm:text-lg">“{prompts[prompt]}”</p>
          {live && joined && prompts.length > 1 && (
            <button type="button" onClick={() => setPrompt((p) => (p + 1) % prompts.length)} className="mt-2 cursor-pointer text-xs text-night-muted underline underline-offset-2 hover:text-white">
              Next prompt
            </button>
          )}
        </div>

        {people.map((seat, i) => {
          const angle = (SEAT_ANGLES[i] * Math.PI) / 180;
          const x = 50 + 38 * Math.cos(angle);
          const y = 50 + 36 * Math.sin(angle);
          return (
            <div key={i} className="absolute flex w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${x}%`, top: `${y}%` }}>
              {seat ? (
                <>
                  <span className={cn("rounded-full p-1", live && seat.id === speakingId ? "ring-2 ring-fire motion-safe:animate-pulse" : seat.id === "me" ? "ring-2 ring-presence-around" : "")}>
                    <Avatar name={seat.name} size="lg" />
                  </span>
                  <span className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-white sm:text-sm">
                    {seat.name.split(" ")[0]}
                    {seat.verified && <ShieldTick size={12} variant="Bold" color="var(--color-presence-around)" aria-label="Verified" />}
                  </span>
                  <span className="text-[10px] text-night-muted sm:text-xs">{seat.facilitator ? "Facilitator" : seat.role}</span>
                </>
              ) : (
                <button
                  type="button"
                  disabled={joined}
                  onClick={() => {
                    setJoined(true);
                    setStatus(live ? "You took a seat. You're muted until you unmute." : `Seat saved for ${when}.`);
                  }}
                  className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-night-600 text-[10px] text-night-muted transition-colors hover:border-fire hover:text-fire disabled:cursor-default disabled:opacity-40 sm:h-16 sm:w-16"
                >
                  {joined ? "Open" : "Take seat"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Room controls">
        {!joined ? (
          full ? (
            <button type="button" onClick={() => setNotify((v) => !v)} aria-pressed={notify} className="cursor-pointer rounded-full bg-night-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-night-600">
              {notify ? "We'll tell you when a seat opens" : "All six seats taken — tell me if one opens"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setJoined(true);
                setStatus(live ? "You took a seat. You're muted until you unmute." : `Seat saved for ${when}.`);
              }}
              className="cursor-pointer rounded-full bg-fire px-6 py-2.5 text-sm font-bold text-night-950 hover:brightness-110"
            >
              {live ? "Take a seat" : `Save my seat · ${when}`}
            </button>
          )
        ) : (
          <>
            {live && (
              <>
                <button type="button" onClick={() => setMuted((m) => !m)} aria-pressed={!muted} className={cn("flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold", muted ? "bg-night-700 text-white" : "bg-presence-around text-night-950")}>
                  {muted ? <MicrophoneSlash size={18} color="currentColor" aria-hidden /> : <Microphone2 size={18} color="currentColor" aria-hidden />}
                  {muted ? "Unmute" : "Speaking"}
                </button>
                <button type="button" onClick={() => setHand((h) => !h)} aria-pressed={hand} className={cn("flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold", hand ? "bg-fire text-night-950" : "bg-night-700 text-white")}>
                  <Radar size={18} color="currentColor" aria-hidden /> {hand ? "Hand raised" : "Raise hand"}
                </button>
                <button type="button" onClick={() => setStatus("You passed — the facilitator will come back to you.")} className="flex cursor-pointer items-center gap-2 rounded-full bg-night-700 px-4 py-2.5 text-sm font-semibold text-white">
                  <Forward size={18} color="currentColor" aria-hidden /> Pass
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setJoined(false);
                setHand(false);
                setMuted(true);
                setStatus("You left the room. No one is notified.");
              }}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-alert px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Logout size={18} color="currentColor" aria-hidden /> Leave
            </button>
          </>
        )}
      </div>
      <p className="mt-3 min-h-5 text-center text-sm text-night-muted" aria-live="polite">{status}</p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-night-muted">
        <span>Not recorded</span>·<span>Six seats, no audience</span>·<span>Leave any time</span>·
        <Link href="/trust" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-white">
          <Flag size={12} color="currentColor" aria-hidden /> Report
        </Link>
      </p>
    </div>
  );
}
