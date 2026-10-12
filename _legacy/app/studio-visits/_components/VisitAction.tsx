"use client";

import { useState, type ReactNode } from "react";
import { Monitor, Notification, PlayCircle, Ticket, TickCircle } from "iconsax-reactjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { StudioVisit } from "@/lib/types";

export default function VisitAction({ visit, artistFirstName }: { visit: StudioVisit; artistFirstName: string }) {
  const [booked, setBooked] = useState(false);
  const [waitlist, setWaitlist] = useState(false);
  const [message, setMessage] = useState("");
  const seatsLeft = visit.seatsLeft - (booked ? 1 : 0);

  let controls: ReactNode;
  if (visit.format === "live") {
    controls = (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-green-950">
          {visit.seatsLeft === 0 && !booked ? `Full · ${visit.seats} seats` : `${seatsLeft} of ${visit.seats} seats left`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {booked ? (
            <>
              <Badge tone="green" icon={<TickCircle size={12} variant="Bold" color="currentColor" aria-hidden />}>Seat booked</Badge>
              <Button size="sm" variant="ghost" onClick={() => { setBooked(false); setMessage("Booking cancelled. Your seat has gone back to the pool."); }}>Cancel</Button>
            </>
          ) : visit.seatsLeft === 0 ? (
            <Button
              size="sm"
              variant={waitlist ? "ghost" : "outline"}
              aria-pressed={waitlist}
              onClick={() => { setWaitlist((w) => !w); setMessage(waitlist ? "Removed from the waitlist." : `You're on the waitlist. If a seat opens, you'll hear once — and ${artistFirstName} often adds a second session.`); }}
              icon={<Notification size={16} color="currentColor" aria-hidden />}
            >
              {waitlist ? "On the waitlist" : "Join the waitlist"}
            </Button>
          ) : (
            <Button size="sm" onClick={() => { setBooked(true); setMessage(`Booked for ${visit.when}. You'll get the link an hour before. ${artistFirstName} sees your name and what you're curious about — nothing else.`); }} icon={<Ticket size={16} color="currentColor" aria-hidden />}>
              Book a seat
            </Button>
          )}
        </div>
      </div>
    );
  } else if (visit.format === "360") {
    controls = <Button href="#viewer-heading" size="sm" variant="outline">Open the 360° tour below</Button>;
  } else if (visit.format === "vr") {
    controls = (
      <Button size="sm" variant="outline" onClick={() => setMessage("Link sent to your phone. Open it in any VR headset or hold your phone up to look around — no app needed.")} icon={<Monitor size={16} color="currentColor" aria-hidden />}>
        Send to my headset or phone
      </Button>
    );
  } else {
    controls = (
      <Button size="sm" variant="outline" onClick={() => setMessage(`Playing “${visit.title}”. Captions on; pause any time to ask ${artistFirstName} a question.`)} icon={<PlayCircle size={16} color="currentColor" aria-hidden />}>
        Watch recording
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {controls}
      <p className={message ? "text-xs text-grey-800" : "sr-only"} aria-live="polite">{message}</p>
    </div>
  );
}
