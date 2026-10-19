"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import BackLink from "@/components/ui/BackLink";
import { eventDate } from "@/lib/data/communityCircles";
import { ME, allPeople } from "@/lib/data/people";
import { useCommunities } from "../useCommunities";

/** Leader check-in: search the guest list or type a ticket code at the door. */
export default function CheckIn({ circleId, eventId }: { circleId: string; eventId: string }) {
  const cc = useCommunities();
  const circle = cc.find(circleId);
  const e = cc.findEvent(eventId);
  const [q, setQ] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  if (!circle || !e) return <div className="kh cm-empty"><h1>Event not found</h1><Link href="/circles" className="kh-btn amber">Back to circles</Link></div>;
  if (!cc.isLeader(circle)) return <div className="kh cm-empty"><h1>Leaders only</h1><p>Only the leaders of {circle.name} can check guests in.</p><Link href={`/circles/community/${circle.id}`} className="kh-btn amber">Back</Link></div>;

  const mine = cc.ticketFor(e.id);
  const guests = [
    ...(mine && mine.status === "going" ? [{ id: ME.id, name: `${ME.name} (you)`, person: ME, code: mine.code }] : []),
    ...allPeople.filter((p) => p.id !== ME.id).slice(0, Math.min(11, e.taken)).map((p, i) => ({ id: p.id, name: p.name, person: p, code: `G${String(1000 + i * 37).slice(-4)}${p.id.slice(0, 1).toUpperCase()}` })),
  ];
  const done = cc.checkedIn(e.id);
  const list = guests.filter((g) => !q.trim() || g.name.toLowerCase().includes(q.trim().toLowerCase()));
  const byCode = (ev: React.FormEvent) => {
    ev.preventDefault();
    const g = guests.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
    if (!g) return setMsg("No ticket with that code. Check the letters and try again.");
    if (!done.includes(g.id)) cc.toggleCheckIn(e.id, g.id);
    setMsg(`${g.name} is checked in.`);
    setCode("");
  };

  return (
    <div className="kh cm cm-checkin">
      <BackLink fallback={`/circles/community/${circle.id}?tab=manage`} className="cm-back">← Back</BackLink>
      <header><p className="cm-over">Check-in · {circle.name}</p><h1>{e.title}</h1><p className="cm-small">{eventDate(e)} · {done.length} of {cc.seatsTaken(e)} checked in</p></header>
      <form className="cm-code-form" onSubmit={byCode}>
        <label htmlFor="ci-code" className="cm-l">Ticket code</label>
        <div className="cm-row"><input id="ci-code" value={code} onChange={(x) => setCode(x.target.value)} placeholder="e.g. 7KQ2MD" autoCapitalize="characters" /><button className="kh-btn amber sm" type="submit">Check in</button></div>
        <span className="cm-small">Scanning the QR code with the phone camera comes with the mobile app. For now, type the code under the QR.</span>
        {msg && <p className="cm-ok" role="status">{msg}</p>}
      </form>
      <input className="cm-search" value={q} onChange={(x) => setQ(x.target.value)} placeholder="Search guests by name" aria-label="Search guests" />
      <ul className="cm-guests">
        {list.map((g) => {
          const on = done.includes(g.id);
          return (
            <li key={g.id} className={on ? "on" : undefined}>
              <Avatar person={g.person} size={36} />
              <span><b>{g.name}</b><small>Ticket {g.code}</small></span>
              <button className={on ? "kh-btn outline sm" : "kh-btn amber sm"} onClick={() => cc.toggleCheckIn(e.id, g.id)} aria-pressed={on}>{on ? "✓ Checked in" : "Check in"}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
