"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Clock, Location, Lock, People, ShieldTick } from "iconsax-reactjs";
import Photo from "@/components/ui/Photo";
import BackLink from "@/components/ui/BackLink";
import { AvatarStack } from "@/components/ui/Avatar";
import { eventDate, naira, type CircleEvent } from "@/lib/data/communityCircles";
import { allPeople } from "@/lib/data/people";
import { FEATURES } from "@/lib/features";
import { useCommunities } from "../useCommunities";
import QR from "./QR";
import Sheet from "./Sheet";

function icsFor(e: CircleEvent, place: string) {
  const d = e.date.replace(/-/g, "");
  const t = (x: string) => x.replace(":", "") + "00";
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${d}T${t(e.start)}`, `DTEND:${d}T${t(e.end)}`, `SUMMARY:${e.title}`, `LOCATION:${place}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}

/** One event: details, booking (free or paid), ticket with QR, "coming alone" pods. */
export default function EventView({ circleId, eventId, created }: { circleId: string; eventId: string; created?: boolean }) {
  const cc = useCommunities();
  const circle = cc.find(circleId);
  const e = cc.findEvent(eventId);
  const [step, setStep] = useState<null | "book" | "pay" | "done">(null);
  const [alone, setAlone] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!circle || !e) {
    return <div className="kh cm-empty"><h1>Event not found</h1><p>It may have been cancelled.</p><Link href={`/circles/community/${circleId}`} className="kh-btn amber">Back to the community</Link></div>;
  }
  const ticket = cc.ticketFor(e.id);
  const taken = cc.seatsTaken(e);
  const left = Math.max(0, e.capacity - taken);
  const full = left === 0;
  const leader = cc.isLeader(circle);
  const showVenue = !e.venueHidden || ticket?.status === "going" || leader;
  const goingFaces = allPeople.slice(0, 5);

  const confirm = () => {
    if (e.price > 0 && !full) {
      setStep("pay");
      return;
    }
    cc.rsvp(e, alone);
    setStep("done");
  };
  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      cc.rsvp(e, alone);
      setPaying(false);
      setStep("done");
    }, 1200);
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${e.title} · ${eventDate(e)} · ${circle.name} on Akines: ${window.location.href.split("?")[0]}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };
  const calendarHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(e, showVenue ? e.venue : e.area + ", Abuja"))}`;

  return (
    <div className="kh cm cm-event">
      <BackLink fallback={`/circles/community/${circle.id}`} className="cm-back">← Back</BackLink>
      {created && <div className="cm-welcome" role="status"><b>Your event is published.</b> Share it with your members so they can book a spot.</div>}

      <div className="cm-event-grid">
        <div className="cm-event-main">
          <Photo name={e.photo} sizes="(max-width: 900px) 100vw, 760px" priority className="cm-event-img" position="center 40%" />
          <Link href={`/circles/community/${circle.id}`} className="cm-host"><Photo name={circle.photo} sizes="40px" className="cm-host-img" /><span>{circle.name}{circle.verified && <ShieldTick size={16} color="#f4a63a" variant="Bold" aria-label="Verified" />}</span></Link>
          <h1>{e.title}</h1>
          <ul className="cm-facts">
            <li><Calendar size={20} color="currentColor" /> {new Date(`${e.date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</li>
            <li><Clock size={20} color="currentColor" /> {e.start} to {e.end}</li>
            <li>{showVenue ? <Location size={20} color="currentColor" /> : <Lock size={20} color="currentColor" />} {showVenue ? `${e.venue}, ${e.area}` : `${e.area}, Abuja · exact address shown on your ticket`}</li>
            <li><People size={20} color="currentColor" /> {taken} going{e.goingAlone > 0 ? ` · ${e.goingAlone} coming alone` : ""}</li>
          </ul>
          {e.about && <p className="cm-event-about">{e.about}</p>}
          <div className="cm-alone-note"><b>Coming alone?</b> You won&apos;t be the only one. Tick the box when you book and we&apos;ll put you in a small group of 3 to 5 with a short chat before the day.</div>
        </div>

        <aside className="cm-book kh-card">
          {ticket ? (
            <>
              <small className="cm-over">{ticket.status === "going" ? "Your ticket" : "You're on the waitlist"}</small>
              {ticket.status === "going" ? (
                <>
                  <QR value={`AKINES-TICKET:${ticket.code}`} size={180} label={`Ticket QR code ${ticket.code}`} />
                  <p className="cm-code">{ticket.code}</p>
                  <p className="cm-small">Show this at the door. It works offline once this page has loaded.</p>
                  {ticket.comingAlone && <p className="cm-chip ok">You&apos;ll be grouped with others coming alone</p>}
                </>
              ) : <p className="cm-small">We&apos;ll tell you as soon as a spot opens.</p>}
              <div className="cm-row">
                <a className="kh-btn outline sm" href={calendarHref} download={`${e.id}.ics`}>Add to calendar</a>
                <button className="kh-btn outline sm" onClick={share}>{copied ? "Link copied" : "Share"}</button>
              </div>
              <button className="cm-leave" onClick={() => cc.cancel(e.id)}>Cancel my spot</button>
            </>
          ) : (
            <>
              <small className="cm-over">{full ? "Fully booked" : `${left} of ${e.capacity} spots left`}</small>
              <p className="cm-big-price">{naira(e.price)}</p>
              <div className="cm-cap" aria-hidden><i style={{ width: `${Math.min(100, (taken / e.capacity) * 100)}%` }} /></div>
              <AvatarStack people={goingFaces} size={28} max={5} />
              <button className="kh-btn amber cm-submit" onClick={() => setStep("book")}>{full ? "Join the waitlist" : e.price > 0 ? "Get a ticket" : "Book a free spot"}</button>
              <button className="kh-btn outline sm" onClick={share}>{copied ? "Link copied" : "Share event"}</button>
            </>
          )}
          {leader && FEATURES.eventCheckIn && <Link href={`/circles/community/${circle.id}/check-in/${e.id}`} className="kh-btn outline sm">Check guests in</Link>}
        </aside>
      </div>

      {/* Phones: price and booking always in reach */}
      <div className="cm-mbar">
        {ticket ? (
          <><span><b>{ticket.status === "going" ? "You're going" : "On the waitlist"}</b><small>Ticket {ticket.code}</small></span><button className="kh-btn amber sm" onClick={() => document.querySelector(".cm-book")?.scrollIntoView({ behavior: "smooth" })}>View ticket</button></>
        ) : (
          <><span><b>{naira(e.price)}</b><small>{full ? "Fully booked" : `${left} spots left`}</small></span><button className="kh-btn amber sm" onClick={() => setStep("book")}>{full ? "Join waitlist" : e.price > 0 ? "Get a ticket" : "Book a spot"}</button></>
        )}
      </div>

      {step === "book" && (
        <Sheet title={full ? "Join the waitlist" : "Book your spot"} sub={`${e.title} · ${eventDate(e)}`} onClose={() => setStep(null)}>
          <div className="cm-form">
            <label className="cm-check"><input type="checkbox" checked={alone} onChange={(x) => setAlone(x.target.checked)} /> I&apos;m coming alone. Put me in a small group before the event.</label>
            <div className="cm-sum"><span>{full ? "Waitlist" : "Ticket"}</span><b>{full ? "Free" : naira(e.price)}</b></div>
            <button className="kh-btn amber cm-submit" onClick={confirm}>{full ? "Join waitlist" : e.price > 0 ? `Continue to payment` : "Confirm my spot"}</button>
          </div>
        </Sheet>
      )}
      {step === "pay" && (
        <Sheet title="Pay with Paystack" sub="Test mode: no real money is taken." onClose={() => setStep(null)}>
          <div className="cm-form">
            <div className="cm-sum"><span>{e.title}</span><b>{naira(e.price)}</b></div>
            <div className="cm-pay-opts" role="radiogroup" aria-label="Payment method">
              {["Card", "Bank transfer", "USSD"].map((m, i) => <label key={m} className="cm-check"><input type="radio" name="pm" defaultChecked={i === 0} /> {m}</label>)}
            </div>
            <button className="kh-btn amber cm-submit" onClick={pay} disabled={paying}>{paying ? "Confirming payment…" : `Pay ${naira(e.price)}`}</button>
          </div>
        </Sheet>
      )}
      {step === "done" && (
        <Sheet title={cc.ticketFor(e.id)?.status === "going" ? "You're going!" : "You're on the waitlist"} sub={e.title} onClose={() => setStep(null)}>
          <div className="cm-form" style={{ alignItems: "center", textAlign: "center" }}>
            {cc.ticketFor(e.id)?.status === "going" && <QR value={`AKINES-TICKET:${cc.ticketFor(e.id)!.code}`} size={160} label="Your ticket QR code" />}
            <p className="cm-small">Your ticket is saved on this page. {alone ? "We'll introduce you to your small group a few days before." : ""}</p>
            <button className="kh-btn amber cm-submit" onClick={() => setStep(null)}>See my ticket</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
