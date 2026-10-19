"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Photo from "@/components/ui/Photo";
import type { PhotoKey } from "@/lib/data/images";
import { ABUJA_AREAS, type AbujaArea, type CommunityCircle } from "@/lib/data/communityCircles";
import { useCommunities } from "../useCommunities";
import Sheet from "./Sheet";

const PHOTOS: PhotoKey[] = ["talkGroup", "talkLaugh", "talkCafe", "talkMugs", "journalCoffee", "calmBench"];

function nextSaturday() {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

/** Create an event for a community circle: free or paid, capacity, private address. */
export default function EventForm({ circle, onClose }: { circle: CommunityCircle; onClose: () => void }) {
  const router = useRouter();
  const { addEvent } = useCommunities();
  const [f, setF] = useState({ title: "", about: "", date: nextSaturday(), start: "16:00", end: "19:00", area: circle.area as AbujaArea, venue: "", venueHidden: true, capacity: "40", paid: false, price: "5000", photo: "talkGroup" as PhotoKey });
  const [tried, setTried] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const err = {
    title: f.title.trim().length < 4 ? "Give the event a title." : "",
    venue: f.venue.trim().length < 3 ? "Add the venue or address." : "",
    capacity: !(parseInt(f.capacity, 10) > 0) ? "How many people can come?" : "",
    price: f.paid && !(parseInt(f.price, 10) >= 100) ? "Ticket price must be at least ₦100." : "",
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.values(err).some(Boolean)) return;
    const ev = addEvent({ circleId: circle.id, title: f.title.trim(), about: f.about.trim(), date: f.date, start: f.start, end: f.end, area: f.area, venue: f.venue.trim(), venueHidden: f.venueHidden, capacity: parseInt(f.capacity, 10), price: f.paid ? parseInt(f.price, 10) : 0, photo: f.photo });
    onClose();
    router.push(`/circles/community/${circle.id}/events/${ev.id}?created=1`);
  };
  const e2 = (k: keyof typeof err) => (tried && err[k] ? <span className="cm-err">{err[k]}</span> : null);

  return (
    <Sheet title="Create an event" sub={`For ${circle.name}`} onClose={onClose} wide>
      <form className="cm-form" onSubmit={submit} noValidate>
        <div className="cm-field"><label htmlFor="ev-title">Title</label><input id="ev-title" value={f.title} onChange={set("title")} placeholder="e.g. Games night: charades and good food" />{e2("title")}</div>
        <div className="cm-field"><label htmlFor="ev-about">What will happen? <small>optional</small></label><textarea id="ev-about" rows={3} value={f.about} onChange={set("about")} placeholder="The plan for the day, what's included, who it's for." /></div>
        <div className="cm-three">
          <div className="cm-field"><label htmlFor="ev-date">Date</label><input id="ev-date" type="date" value={f.date} onChange={set("date")} /></div>
          <div className="cm-field"><label htmlFor="ev-start">Starts</label><input id="ev-start" type="time" value={f.start} onChange={set("start")} /></div>
          <div className="cm-field"><label htmlFor="ev-end">Ends</label><input id="ev-end" type="time" value={f.end} onChange={set("end")} /></div>
        </div>
        <div className="cm-two">
          <div className="cm-field"><label htmlFor="ev-area">Area</label><select id="ev-area" value={f.area} onChange={set("area")}>{ABUJA_AREAS.map((a) => <option key={a}>{a}</option>)}</select></div>
          <div className="cm-field"><label htmlFor="ev-cap">Capacity</label><input id="ev-cap" inputMode="numeric" value={f.capacity} onChange={set("capacity")} />{e2("capacity")}</div>
        </div>
        <div className="cm-field"><label htmlFor="ev-venue">Venue or address</label><input id="ev-venue" value={f.venue} onChange={set("venue")} placeholder="e.g. Garden terrace, 12 Aminu Kano Crescent" />{e2("venue")}</div>
        <label className="cm-check"><input type="checkbox" checked={f.venueHidden} onChange={(e) => setF((x) => ({ ...x, venueHidden: e.target.checked }))} /> Only show the exact address to people with a ticket</label>
        <div className="cm-field">
          <span className="cm-l">Tickets</span>
          <div className="cm-seg" role="radiogroup" aria-label="Tickets">
            <button type="button" role="radio" aria-checked={!f.paid} className={!f.paid ? "on" : undefined} onClick={() => setF((x) => ({ ...x, paid: false }))}>Free</button>
            <button type="button" role="radio" aria-checked={f.paid} className={f.paid ? "on" : undefined} onClick={() => setF((x) => ({ ...x, paid: true }))}>Paid</button>
          </div>
        </div>
        {f.paid && <div className="cm-field"><label htmlFor="ev-price">Ticket price (₦)</label><input id="ev-price" inputMode="numeric" value={f.price} onChange={set("price")} />{e2("price")}<span className="cm-small">Paid through Paystack. In this prototype no money moves.</span></div>}
        <div className="cm-field">
          <span className="cm-l">Photo</span>
          <div className="cm-covers" role="radiogroup" aria-label="Event photo">
            {PHOTOS.map((p) => <button type="button" key={p} role="radio" aria-checked={f.photo === p} className={f.photo === p ? "on" : undefined} onClick={() => setF((x) => ({ ...x, photo: p }))}><Photo name={p} sizes="120px" className="cm-cover" /></button>)}
          </div>
        </div>
        <button type="submit" className="kh-btn amber cm-submit">Publish event</button>
      </form>
    </Sheet>
  );
}
