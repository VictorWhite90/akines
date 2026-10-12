"use client";

import { useState } from "react";
import { ArrowRight2, Flag, Logout, Next, RecordCircle, ShieldTick } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { ME, getPerson } from "@/lib/data";
import type { PresenceRoom } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ROLE_LABEL } from "../_data";

const CONTROL = "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[2px] border px-3 text-xs font-semibold transition-colors";

const REPORT_REASONS = ["Harassment or intimidation", "Cultural appropriation or misrepresentation", "Sharing without permission", "Something else"];

/** A static-feeling mock of the in-room UI: tiles with initials, the prompt card, and gentle controls. */
export default function RoomPreview({ room }: { room: PresenceRoom }) {
  const ids = [...room.participantIds.filter((id) => id !== ME.id).slice(0, 5), ME.id];
  const [promptIndex, setPromptIndex] = useState(0);
  const [hand, setHand] = useState(false);
  const [left, setLeft] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [status, setStatus] = useState("");
  const speaker = room.facilitatorId;

  if (left) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[4px] border border-sand-200 bg-white p-5" aria-live="polite">
        <p className="font-playfair text-lg font-semibold text-green-950">You&apos;ve left the preview.</p>
        <p className="text-sm text-grey-700">In a real room, leaving is one tap and nobody is asked why. The conversation carries on without a fuss.</p>
        <Button size="sm" variant="outline" onClick={() => { setLeft(false); setStatus(""); }}>Back into the preview</Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[4px] border border-green-900 bg-green-950 text-white">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/10 bg-green-900 px-4 py-2.5 text-xs font-semibold" role="note" aria-label="Room safety">
        <span className="flex items-center gap-1.5"><RecordCircle size={14} color="currentColor" aria-hidden /> Not recorded</span>
        <span aria-hidden>·</span>
        <span className="flex items-center gap-1.5"><Logout size={14} color="currentColor" aria-hidden /> Leave any time</span>
        <span aria-hidden>·</span>
        <button
          type="button"
          onClick={() => setReporting((r) => !r)}
          aria-expanded={reporting}
          className="flex cursor-pointer items-center gap-1.5 underline underline-offset-4 hover:text-gold-300"
        >
          <Flag size={14} color="currentColor" aria-hidden /> Report
        </button>
      </div>

      {reporting && (
        <div className="border-b border-white/10 bg-white p-4 text-green-950">
          <p className="text-sm font-semibold">What happened? A moderator joins within a minute.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REPORT_REASONS.map((reason) => (
              <Button
                key={reason}
                size="sm"
                variant="outline"
                onClick={() => { setReporting(false); setStatus(`Report sent: “${reason}”. A moderator is on the way; only they can see who reported.`); }}
              >
                {reason}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_260px]">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="People in the room">
          {ids.map((id) => {
            const person = getPerson(id);
            const isMe = id === ME.id;
            const speaking = id === speaker;
            return (
              <li
                key={id}
                className={cn(
                  "relative flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-[4px] bg-green-900 p-2 text-center",
                  speaking && "ring-2 ring-gold-400",
                )}
              >
                <Avatar name={person.name} size="md" />
                <span className="text-xs font-semibold">{isMe ? "You" : person.name.split(" ")[0]}</span>
                <span className="text-[11px] text-white/70">{ROLE_LABEL[person.role]}</span>
                {speaking && <span className="absolute left-2 top-2 rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-semibold text-green-950">Speaking</span>}
                {isMe && hand && <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-green-950">Hand raised</span>}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-3 rounded-[4px] bg-white p-4 text-green-950">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ruby-600">
            Prompt {promptIndex + 1} of {room.prompts.length}
          </p>
          <p className="font-playfair text-lg leading-snug">“{room.prompts[promptIndex]}”</p>
          <p className="text-xs text-grey-700">Everyone gets a turn. Passing is always fine.</p>
          <button
            type="button"
            onClick={() => setPromptIndex((i) => (i + 1) % room.prompts.length)}
            className="inline-flex cursor-pointer items-center gap-1.5 self-start text-xs font-semibold text-green-950 underline underline-offset-4"
          >
            Facilitator: next prompt <ArrowRight2 size={14} color="currentColor" aria-hidden />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 p-4">
        <button
          type="button"
          aria-pressed={hand}
          onClick={() => { setHand((h) => !h); setStatus(hand ? "Hand lowered." : "Hand raised — the facilitator will bring you in next."); }}
          className={cn(CONTROL, hand ? "border-gold-400 bg-gold-400 text-green-950" : "border-white text-white hover:bg-white/10")}
        >
          {hand ? "Lower hand" : "Raise hand"}
        </button>
        <button
          type="button"
          onClick={() => setStatus("You passed on this prompt. No explanation needed.")}
          className={cn(CONTROL, "border-white text-white hover:bg-white/10")}
        >
          <Next size={16} color="currentColor" aria-hidden /> Pass
        </button>
        <Button size="sm" variant="danger" onClick={() => setLeft(true)} icon={<Logout size={16} color="currentColor" aria-hidden />}>
          Leave
        </Button>
      </div>
      <p className={cn("flex items-center gap-2 px-4 text-sm", status ? "pb-4 text-white/90" : "sr-only")} aria-live="polite">
        {status && <ShieldTick size={16} color="currentColor" aria-hidden />}
        {status}
      </p>
    </div>
  );
}
