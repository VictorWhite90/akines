"use client";

import Link from "next/link";
import { useState } from "react";
import { Add, ArrowRight2, Calendar, Location, People, ShieldTick, TicketStar } from "iconsax-reactjs";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import BackLink from "@/components/ui/BackLink";
import { eventDate, naira, type CircleEvent, type CommunityCircle } from "@/lib/data/communityCircles";
import { PEOPLE, allPeople, type PersonId } from "@/lib/data/people";
import { CIRCLE_TYPES } from "../CreateKinCircle";
import { FEATURES } from "@/lib/features";
import { useCommunities } from "../useCommunities";
import EventForm from "./EventForm";
import InviteSheet from "./InviteSheet";

type Tab = "events" | "small" | "members" | "about" | "manage";

export function EventCard({ e, circle }: { e: CircleEvent; circle?: CommunityCircle }) {
  const { seatsTaken, ticketFor } = useCommunities();
  const left = Math.max(0, e.capacity - seatsTaken(e));
  const t = ticketFor(e.id);
  return (
    <Link href={`/circles/community/${e.circleId}/events/${e.id}`} className="cm-ev">
      <Photo name={e.photo} sizes="220px" className="cm-ev-img" />
      <div className="cm-ev-tx">
        <small>{eventDate(e)}</small>
        <b>{e.title}</b>
        <span className="cm-ev-meta"><Location size={14} color="currentColor" />{e.area}{circle ? ` · ${circle.name}` : ""}</span>
        <span className="cm-ev-foot">
          <span className="cm-price">{naira(e.price)}</span>
          {t ? <span className="cm-chip ok">{t.status === "going" ? "You're going" : "On the waitlist"}</span> : left === 0 ? <span className="cm-chip">Full · join waitlist</span> : <span className="cm-chip">{left} {left === 1 ? "spot" : "spots"} left</span>}
        </span>
      </div>
    </Link>
  );
}

export default function CommunityCircleView({ id, startTab, welcome }: { id: string; startTab?: string; welcome?: boolean }) {
  const cc = useCommunities();
  const circle = cc.find(id);
  const [tab, setTab] = useState<Tab>((["events", "small", "members", "about", "manage"] as Tab[]).includes(startTab as Tab) ? (startTab as Tab) : "events");
  const [invite, setInvite] = useState(!!welcome);
  const [newEvent, setNewEvent] = useState(false);

  if (!circle) {
    return (
      <div className="kh cm-empty">
        <h1>We couldn&apos;t find that circle</h1>
        <p>It may have been removed, or the link is incomplete.</p>
        <Link href="/circles" className="kh-btn amber">Browse circles</Link>
      </div>
    );
  }

  const leader = cc.isLeader(circle);
  const member = cc.isMember(circle.id);
  const events = cc.eventsOf(circle.id);
  const smalls = cc.smallCirclesOf(circle.id);
  const leaders = circle.leaders.map((p) => PEOPLE[p]).filter(Boolean);
  const sample = allPeople.filter((p) => !circle.leaders.includes(p.id as PersonId)).slice(0, 9);
  const totalRsvps = events.reduce((n, e) => n + cc.seatsTaken(e), 0);
  const totalCheckins = events.reduce((n, e) => n + cc.checkedIn(e.id).length, 0);
  const income = events.reduce((n, e) => n + cc.seatsTaken(e) * e.price, 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "events", label: `Events (${events.length})` },
    { id: "small", label: `Small circles (${smalls.length})` },
    { id: "members", label: "Members" },
    { id: "about", label: "About" },
    ...(leader ? [{ id: "manage" as Tab, label: "Manage" }] : []),
  ];

  return (
    <div className="kh cm">
      <BackLink fallback="/circles" className="cm-back">← Back</BackLink>

      <section className="cm-hero">
        <Photo name={circle.photo} sizes="(max-width: 900px) 100vw, 1100px" priority className="cm-hero-img" position="center 35%" />
        <div className="cm-hero-shade" />
        <div className="cm-hero-tx">
          <span className="kh-badge"><i aria-hidden><b /></i>Community circle · {circle.category}</span>
          <h1>{circle.name}{circle.verified && <ShieldTick size={26} color="#f4a63a" variant="Bold" aria-label="Verified community" />}</h1>
          <p>{circle.tagline}</p>
          <div className="cm-hero-meta">
            <span><People size={16} color="currentColor" /> {cc.memberCount(circle).toLocaleString()} members</span>
            <span><Location size={16} color="currentColor" /> {circle.area}, Abuja</span>
            <span><Calendar size={16} color="currentColor" /> {events.length} upcoming</span>
          </div>
          <div className="cm-hero-acts">
            {member ? <span className="kh-btn glass">✓ {leader ? "You lead this circle" : "You're a member"}</span> : <button className="kh-btn amber" onClick={() => cc.join(circle.id)}>Join community</button>}
            <button className="kh-btn glass" onClick={() => setInvite(true)}>Invite people</button>
            {member && !leader && <button className="cm-leave" onClick={() => cc.leave(circle.id)}>Leave</button>}
          </div>
        </div>
      </section>

      {welcome && leader && (
        <div className="cm-welcome" role="status">
          <b>Your community circle is live.</b> Share your invite link with your members, then create your first event.
          {!circle.verified && <span> Verification by the Akines team is pending.</span>}
        </div>
      )}

      <nav className="cm-tabs" role="tablist" aria-label="Community sections">
        {tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : undefined} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </nav>

      {tab === "events" && (
        <section className="cm-sec">
          <div className="kh-sec"><div><h2>Upcoming events</h2><p>Book a spot. If you're coming alone, tell us and we'll put you in a small group before you arrive.</p></div>{leader && <button className="kh-btn amber sm" onClick={() => setNewEvent(true)}><Add size={16} color="currentColor" /> Create event</button>}</div>
          <div className="cm-evs">
            {events.map((e) => <EventCard key={e.id} e={e} />)}
            {events.length === 0 && <p className="kh-none">No events yet.{leader ? " Create the first one so members have something to come to." : " Check back soon."}</p>}
          </div>
        </section>
      )}

      {tab === "small" && (
        <section className="cm-sec">
          <div className="kh-sec"><div><h2>Small circles</h2><p>Groups of 3 to 8 inside {circle.name}: first-timers, a monthly book group, a project team.</p></div>{member && <Link href={`/circles/new?in=${circle.id}`} className="kh-btn amber sm"><Add size={16} color="currentColor" /> Start a small circle</Link>}</div>
          <div className="cm-smalls">
            {smalls.map((s) => {
              const type = CIRCLE_TYPES.find((t) => t.id === s.type);
              return (
                <article key={s.id} className="kh-card cm-small-card">
                  <small>{type?.glyph} {type?.label}</small>
                  <b>{s.name}</b>
                  {s.purpose && <p>{s.purpose}</p>}
                  <AvatarStack people={s.invitees.map((p) => PEOPLE[p]).filter(Boolean)} size={26} max={5} />
                </article>
              );
            })}
            {smalls.length === 0 && <p className="kh-none">No small circles yet. {member ? "Start one for people who want to meet more often." : "Join the community to start one."}</p>}
          </div>
        </section>
      )}

      {tab === "members" && (
        <section className="cm-sec">
          <div className="kh-sec"><div><h2>Leaders</h2><p>The people who run {circle.name}.</p></div></div>
          <div className="cm-people">
            {leaders.map((p) => <Link key={p.id} href={`/profile/${p.id}`} className="kh-person"><Avatar person={p} size={48} /><span><span>{p.name}</span><small>Leader <i aria-hidden /> {p.city}</small></span></Link>)}
          </div>
          <div className="kh-sec" style={{ marginTop: 16 }}><div><h2>Members</h2><p>{cc.memberCount(circle).toLocaleString()} people. Here are a few.</p></div></div>
          <div className="cm-people">
            {sample.map((p) => <Link key={p.id} href={`/profile/${p.id}`} className="kh-person"><Avatar person={p} size={40} /><span><span>{p.name}</span><small>{p.role}</small></span></Link>)}
          </div>
        </section>
      )}

      {tab === "about" && (
        <section className="cm-sec cm-about">
          <div className="kh-card"><h2>About</h2><p>{circle.about}</p>
            <div className="cm-links">
              {circle.instagram && <a href={`https://instagram.com/${circle.instagram}`} target="_blank" rel="noreferrer">Instagram @{circle.instagram}</a>}
              {circle.whatsapp && <span>WhatsApp {circle.whatsapp}</span>}
            </div>
          </div>
          <div className="kh-card"><h2>Community guidelines</h2><ul>{circle.guidelines.map((g) => <li key={g}>{g}</li>)}</ul></div>
        </section>
      )}

      {tab === "manage" && leader && (
        <section className="cm-sec">
          <div className="cm-stats">
            <div className="kh-card"><small>Members</small><b>{cc.memberCount(circle).toLocaleString()}</b></div>
            <div className="kh-card"><small>Upcoming events</small><b>{events.length}</b></div>
            <div className="kh-card"><small>Spots booked</small><b>{totalRsvps}</b></div>
            {FEATURES.eventCheckIn && <div className="kh-card"><small>Checked in</small><b>{totalCheckins}</b></div>}
            <div className="kh-card"><small>Ticket income</small><b>{naira(income)}</b></div>
          </div>
          <div className="kh-sec"><div><h2>{FEATURES.eventCheckIn ? "Event check-in" : "Your events"}</h2><p>{FEATURES.eventCheckIn ? "Open an event on the day to check guests in by name or ticket code." : "See bookings for each event."}</p></div><button className="kh-btn amber sm" onClick={() => setNewEvent(true)}><Add size={16} color="currentColor" /> Create event</button></div>
          <ul className="cm-manage">
            {events.map((e) => (
              <li key={e.id}><Link href={FEATURES.eventCheckIn ? `/circles/community/${circle.id}/check-in/${e.id}` : `/circles/community/${circle.id}/events/${e.id}`}><TicketStar size={20} color="currentColor" /><span><b>{e.title}</b><small>{eventDate(e)} · {cc.seatsTaken(e)}/{e.capacity} booked{FEATURES.eventCheckIn ? ` · ${cc.checkedIn(e.id).length} checked in` : ""}</small></span><ArrowRight2 size={16} color="currentColor" /></Link></li>
            ))}
          </ul>
          <button className="kh-btn outline sm" onClick={() => setInvite(true)}>Invite link and QR code</button>
        </section>
      )}

      {invite && <InviteSheet circle={circle} onClose={() => setInvite(false)} />}
      {newEvent && <EventForm circle={circle} onClose={() => setNewEvent(false)} />}
    </div>
  );
}
