"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Pic from "@/components/home/Pic";
import { useJoined } from "@/components/circles/useJoined";
import { AvatarStack } from "@/components/ui/Avatar";
import { CIRCLES } from "@/lib/data/community";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";
import { allActivities, dayDistance, soonLabel, todayIndex, type FlatActivity } from "./activities";

type Mode = "In person" | "Virtual";
type View = "discover" | "going";
const PAGE = 8;

/**
 * "People bond more effectively when they do something together" (brief §6). Activities are
 * real, small-scale things a circle or a member is doing — a walk, a dinner, a studio visit —
 * not a marketplace of listings. RSVP just means "I'm going", so an organiser and other members
 * know who's actually showing up.
 */
export default function ActivitiesGrid() {
  const [rsvp, setRsvp] = useLocal<Record<string, boolean>>("cs:rsvp", {});
  const { ids: joined } = useJoined();
  const [view, setView] = useState<View>("discover");
  const [mode, setMode] = useState<Mode | "all">("all");
  const [circleId, setCircleId] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const today = todayIndex();
  const all = useMemo(() => allActivities(), []);
  const byDistance = (a: FlatActivity, b: FlatActivity) => dayDistance(a.when, today) - dayDistance(b.when, today);

  const { mine, soon, rest } = useMemo(() => {
    const m = all.filter((a) => joined.includes(a.circleId)).sort(byDistance).slice(0, 4);
    const mIds = new Set(m.map((a) => a.id));
    const s = all.filter((a) => !mIds.has(a.id)).slice().sort(byDistance).slice(0, 3);
    const sIds = new Set(s.map((a) => a.id));
    const r = all.filter((a) => !mIds.has(a.id) && !sIds.has(a.id));
    return { mine: m, soon: s, rest: r };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, joined, today]);

  const filtered = rest.filter((a) => (mode === "all" || a.mode === mode) && (circleId === "all" || a.circleId === circleId));
  const shown = showAll ? filtered : filtered.slice(0, PAGE);
  const myPlans = all.filter((a) => rsvp[a.id]).sort(byDistance);

  const rsvpOf = (id: string) => rsvp[id] ?? false;
  const toggleRsvp = (id: string) => setRsvp((cur) => ({ ...cur, [id]: !(cur[id] ?? false) }));
  const card = (a: FlatActivity) => <EventCard key={a.id} a={a} going={rsvpOf(a.id)} onRsvp={() => toggleRsvp(a.id)} />;

  return (
    <div className="act">
      <header className="act-head">
        <div>
          <h1>Activities</h1>
          <p>Walks, dinners, studio visits and listening circles, planned by your circles. RSVP to let the host know you&rsquo;re coming.</p>
        </div>
        <div className="act-stats" aria-label="Your week">
          <span><b>{all.length}</b> this week</span>
          <span><b>{myPlans.length}</b> you&rsquo;re going to</span>
        </div>
      </header>

      <div className="act-tabs" role="tablist" aria-label="Activities view">
        <button type="button" role="tab" aria-selected={view === "discover"} className={view === "discover" ? "on" : undefined} onClick={() => setView("discover")}>
          Discover
        </button>
        <button type="button" role="tab" aria-selected={view === "going"} className={view === "going" ? "on" : undefined} onClick={() => setView("going")}>
          Your plans{myPlans.length > 0 && <span className="n">{myPlans.length}</span>}
        </button>
      </div>

      {view === "going" ? (
        <section className="act-sec">
          {myPlans.length > 0 ? (
            <div className="act-agenda">
              {myPlans.map((a) => (
                <AgendaRow key={a.id} a={a} going onRsvp={() => toggleRsvp(a.id)} />
              ))}
            </div>
          ) : (
            <div className="act-empty">
              <b>No plans yet</b>
              <span>RSVP to something and it shows up here, so you can see your week at a glance.</span>
              <button type="button" onClick={() => setView("discover")}>Find something to do</button>
            </div>
          )}
        </section>
      ) : (
        <>
          {soon.length > 0 && (
            <section className="act-sec">
              <SecHead title="Up next" sub="The soonest things on across Kinnect" />
              <div className="act-agenda">
                {soon.map((a) => (
                  <AgendaRow key={a.id} a={a} going={rsvpOf(a.id)} onRsvp={() => toggleRsvp(a.id)} />
                ))}
              </div>
            </section>
          )}

          {mine.length > 0 && (
            <section className="act-sec">
              <SecHead title="From your circles" sub="Planned by circles you've joined" />
              <div className="act-grid">{mine.map(card)}</div>
            </section>
          )}

          <section className="act-sec">
            <div className="act-toolbar">
              <SecHead title="More activities" sub={`${filtered.length} across every circle`} />
              <div className="act-filters" role="group" aria-label="Filter activities">
                <div className="act-seg">
                  {(["all", "In person", "Virtual"] as const).map((m) => (
                    <button key={m} type="button" className={mode === m ? "on" : undefined} aria-pressed={mode === m} onClick={() => setMode(m)}>
                      {m === "all" ? "All" : m}
                    </button>
                  ))}
                </div>
                <label className="act-select">
                  <select value={circleId} onChange={(e) => setCircleId(e.target.value)} aria-label="Filter by circle">
                    <option value="all">All circles</option>
                    {CIRCLES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="act-grid">{shown.map(card)}</div>
            ) : (
              <div className="act-empty">
                <b>Nothing matches those filters</b>
                <span>Try a different mode or circle.</span>
                <button type="button" onClick={() => { setMode("all"); setCircleId("all"); }}>Clear filters</button>
              </div>
            )}
            {!showAll && filtered.length > PAGE && (
              <button type="button" className="act-showmore" onClick={() => setShowAll(true)}>
                Show {filtered.length - PAGE} more
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SecHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="act-sechead">
      <h2>{title}</h2>
      {sub && <span>{sub}</span>}
    </div>
  );
}

/** "Sat · 10:00" → ["Sat", "10:00"]. */
function splitWhen(when: string): [string, string] {
  const [day = "", time = ""] = when.split("·").map((s) => s.trim());
  return [day, time];
}

function goingPeople(a: FlatActivity) {
  return a.going.map((id) => PEOPLE[id as PersonId]).filter(Boolean);
}

function goingCount(a: FlatActivity, going: boolean) {
  return a.going.length + (going && !a.going.includes(ME.id as PersonId) ? 1 : 0);
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </svg>
  );
}

function RsvpButton({ going, onClick }: { going: boolean; onClick: () => void }) {
  return (
    <button type="button" className={going ? "act-rsvp on" : "act-rsvp"} aria-pressed={going} onClick={onClick}>
      {going ? "✓ Going" : "RSVP"}
    </button>
  );
}

function EventCard({ a, going, onRsvp }: { a: FlatActivity; going: boolean; onRsvp: () => void }) {
  const [day, time] = splitWhen(a.when);
  const href = `/circles/${a.circleId}?tab=activities`;
  return (
    <article className="act-card">
      <Link href={href} className="ph" tabIndex={-1} aria-hidden>
        <Pic name={a.photo} sizes="(max-width: 560px) 100vw, 320px" />
        <span className="date">
          <b>{day}</b>
          {time}
        </span>
        <span className={a.mode === "Virtual" ? "mode virtual" : "mode"}>{a.mode}</span>
      </Link>
      <div className="bd">
        <Link href={href} className="circ">{a.circleName}</Link>
        <h3><Link href={href}>{a.title}</Link></h3>
        <p className="where">{a.mode === "Virtual" ? <VideoIcon /> : <PinIcon />}{a.where}</p>
        <div className="ft">
          <span className="who">
            <AvatarStack people={goingPeople(a)} size={22} max={3} ringClass="ring-white" />
            {goingCount(a, going)} going
          </span>
          <RsvpButton going={going} onClick={onRsvp} />
        </div>
      </div>
    </article>
  );
}

function AgendaRow({ a, going, onRsvp }: { a: FlatActivity; going: boolean; onRsvp: () => void }) {
  const [day, time] = splitWhen(a.when);
  const soon = soonLabel(dayDistance(a.when));
  const href = `/circles/${a.circleId}?tab=activities`;
  return (
    <article className="act-row">
      <div className="when">
        <b>{time}</b>
        <span className={soon === "Today" ? "today" : undefined}>{soon === "Today" || soon === "Tomorrow" ? soon : day}</span>
      </div>
      <Link href={href} className="ph" tabIndex={-1} aria-hidden>
        <Pic name={a.photo} sizes="96px" />
      </Link>
      <div className="bd">
        <Link href={href} className="circ">{a.circleName}</Link>
        <h3><Link href={href}>{a.title}</Link></h3>
        <p className="where">{a.mode === "Virtual" ? <VideoIcon /> : <PinIcon />}{a.where}</p>
      </div>
      <span className="who">
        <AvatarStack people={goingPeople(a)} size={24} max={3} ringClass="ring-white" />
        <span>{goingCount(a, going)} going</span>
      </span>
      <RsvpButton going={going} onClick={onRsvp} />
    </article>
  );
}
