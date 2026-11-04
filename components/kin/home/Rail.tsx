"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Avatar, { Stack } from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { Media } from "@/components/kin/Card";
import { useJoined } from "@/components/circles/useJoined";
import { CIRCLES } from "@/lib/data/community";
import { GAME_SESSIONS } from "@/lib/data/games";
import type { PhotoKey } from "@/lib/data/images";
import { MATCHES } from "@/lib/data/matches";
import { PEOPLE, type PersonId } from "@/lib/data/people";
import { TRENDS } from "@/lib/data/trends";
import { useLocal } from "@/lib/useLocal";

const GAME_PHOTO: Record<string, PhotoKey> = { remember: "photoAlbum", "two-truths": "talkLaugh", "city-eyes": "galleryViewer" };

/** Beside the feed on desktop, after the hero on phones: your circles, someone to meet, what is trending, tonight. */
export default function Rail({ part = "all" }: { part?: "all" | "top" | "rest" }) {
  const top = part !== "rest";
  const rest = part !== "top";
  return (
    <aside className="h-rail" aria-label="Around you">
      {top && <Circles />}
      {top && <Meet />}
      {rest && <Trending />}
      {rest && <Tonight />}
    </aside>
  );
}

function Circles() {
  const { ids } = useJoined();
  const joined = CIRCLES.filter((c) => ids.includes(c.id));
  return (
    <section className="h-card" aria-labelledby="h-circles">
      <div className="h-card-head"><h2 id="h-circles">Your Circles <span className="n">({joined.length})</span></h2><Link href="/circles" className="h-see">See all</Link></div>
      {joined.length === 0 ? (
        <p className="h-card-empty">You have not joined a circle yet. <Link href="/circles" className="k-link">Find one</Link></p>
      ) : (
        <ul className="h-rows">
          {joined.slice(0, 4).map((c) => (
            <li key={c.id}>
              <Link href={`/circles/${c.id}`} className="h-row">
                <Media photo={c.photo} ratio="1" sizes="112px" />
                <span className="tx"><b>{c.name}</b><small>{c.members} members · {c.active} active</small></span>
                <ChevronRight size={18} strokeWidth={1.5} className="go" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** One match at a time, with the reason, and a gentle way to say hello or pass. */
function Meet() {
  const [i, setI] = useState(0);
  const [hello, setHello] = useLocal<string[]>("ak:home-hellos", []);
  const n = MATCHES.length;
  const match = MATCHES[i];
  const person = PEOPLE[match.id as PersonId];
  const said = hello.includes(match.id);
  const go = (d: number) => setI((x) => (x + d + n) % n);
  return (
    <section className="h-card" aria-labelledby="h-meet" aria-roledescription="carousel">
      <div className="h-card-head"><h2 id="h-meet">You two would get along</h2></div>
      <div className="h-meet" aria-live="polite">
        <Link href={`/profile/${person.id}`} className="who">
          <Avatar person={person} size={56} />
          <span><b>{person.name}</b><small>{person.role} · {person.city}</small></span>
        </Link>
        <blockquote>&ldquo;{match.reason}&rdquo;</blockquote>
        <Link href="/kindred" className="k-link why">Why this match?</Link>
        {said ? (
          <p className="h-said">You said hello. {person.name.split(" ")[0]} will see it in their notifications.</p>
        ) : (
          <div className="acts">
            <Button variant="secondary" onClick={() => go(1)}>Not now</Button>
            <Button variant="primary" onClick={() => setHello([...hello, match.id])}>Say hello</Button>
          </div>
        )}
      </div>
      <div className="h-pager">
        <span className="dots" aria-hidden>{MATCHES.map((m, j) => <i key={m.id} data-on={j === i} />)}</span>
        <span className="count">{i + 1} / {n}</span>
        <span className="arrows">
          <button type="button" onClick={() => go(-1)} aria-label="Previous person"><ChevronLeft size={20} strokeWidth={1.5} aria-hidden /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next person"><ChevronRight size={20} strokeWidth={1.5} aria-hidden /></button>
        </span>
      </div>
    </section>
  );
}

function Trending() {
  const items = Object.entries(TRENDS).flatMap(([circle, t]) => t.stories.slice(0, 1).map((s) => ({ ...s, circle }))).slice(0, 4);
  return (
    <section className="h-card" aria-labelledby="h-trend">
      <div className="h-card-head stack"><h2 id="h-trend">Trending now on Akines</h2><p>Conversations and discoveries</p></div>
      <ul className="h-trend">
        {items.map((s) => {
          const c = CIRCLES.find((x) => x.id === s.circle);
          return (
            <li key={s.id}>
              <Link href={`/circles/${s.circle}`}>
                <span className="k-eyebrow brand">{c ? c.name : "Circles"} · {s.tag}</span>
                <b>{s.title}</b>
                <small>{s.summary}</small>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Tonight() {
  const tonight = GAME_SESSIONS.filter((g) => g.live || g.when.startsWith("Tonight")).slice(0, 2);
  if (tonight.length === 0) return null;
  return (
    <section className="h-card" aria-labelledby="h-tonight">
      <div className="h-card-head"><h2 id="h-tonight">Play tonight</h2><Link href="/play" className="h-see">All games</Link></div>
      <ul className="h-rows">
        {tonight.map((g) => (
          <li key={g.id}>
            <Link href={`/play/session/${g.id}`} className="h-row">
              <Media photo={GAME_PHOTO[g.game] ?? "talkLaugh"} ratio="1" sizes="112px" />
              <span className="tx"><b>{g.title}</b><small>{g.when} · {PEOPLE[g.host].name.split(" ")[0]} is hosting</small></span>
              <Stack people={g.players.slice(0, 3).map((id) => PEOPLE[id])} size={26} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
