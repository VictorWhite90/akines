"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowDown2, CloseCircle, Gallery } from "iconsax-reactjs";
import Avatar, { Faces, Tie } from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { Media } from "@/components/kin/Card";
import Settle from "@/components/kin/Settle";
import { usePosts } from "@/components/feed/usePosts";
import { useJoined } from "@/components/circles/useJoined";
import { useMe } from "@/components/shell/MemberContext";
import { BANTER_NOW, TODAYS_BANTER } from "@/lib/data/banter";
import { CIRCLES, COLLABS, ROOMS } from "@/lib/data/community";
import { MORE_POSTS } from "@/lib/data/feedMore";
import { GAME_SESSIONS } from "@/lib/data/games";
import { STORIES } from "@/lib/data/stories";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";
import ComposeSheet from "./ComposeSheet";
import Post from "./Post";
import Rail from "./Rail";
import "./home.css";

type LiveItem = { href: string; title: string; sub: string; who: PersonId[]; live: boolean };

/** What is happening right now, from the same data the rooms, Banter and games pages read. */
function liveNow(): LiveItem[] {
  const rooms = ROOMS.filter((r) => r.status === "live" || r.status === "soon").map((r) => ({ href: `/rooms/${r.id}`, title: r.title, sub: r.status === "live" ? "Room · live" : `Room · ${r.when.replace("Tonight · ", "")}`, who: r.seated.length ? r.seated : [r.host], live: r.status === "live" }));
  const banters = BANTER_NOW.map((b) => ({ href: `/banter/now/${b.id}`, title: b.topic, sub: b.live ? `Banter · ${b.minutes} min` : `Banter · ${b.startsIn}`, who: b.people, live: b.live }));
  const games = GAME_SESSIONS.filter((g) => g.live).map((g) => ({ href: `/play/session/${g.id}`, title: g.title, sub: `Game · ${g.when.replace("Tonight · ", "")}`, who: g.players, live: false }));
  return [...rooms, ...banters, ...games].sort((a, b) => Number(b.live) - Number(a.live));
}

export default function Home() {
  const { posts } = usePosts();
  const { ids: joinedIds } = useJoined();
  const { me } = useMe();
  const [filter, setFilter] = useState<string>("mine");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [compose, setCompose] = useState(false);
  const [count, setCount] = useState(8);
  const [moodDone, setMoodDone] = useLocal<string>("ak:home-mood-day", "");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!filterOpen) return;
    const down = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setFilterOpen(false);
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [filterOpen]);

  const joined = CIRCLES.filter((c) => joinedIds.includes(c.id));
  const feed = [...posts, ...MORE_POSTS].filter((p) => (filter === "all" ? true : filter === "mine" ? (p.circle ? joinedIds.includes(p.circle) : p.by === ME.id) : p.circle === filter));
  const shown = feed.slice(0, count);
  const live = liveNow();
  const spot = COLLABS[1];
  const stories = STORIES.filter((s) => s.id !== "five-voices").slice(0, 4);
  const filterLabel = filter === "mine" ? "Your circles" : filter === "all" ? "All circles" : CIRCLES.find((c) => c.id === filter)?.name ?? "Your circles";
  const meAvatar = { name: me?.name ?? ME.name, photo: me?.photo, face: me?.photo ? undefined : ME.face };

  /** Rows that live inside the feed, placed after a given post. */
  const inline: Record<number, React.ReactNode> = {
    1: moodDone !== today ? (
      <div className="h-mood" role="status">
        <span>How are you arriving today? <Link href="/wellbeing" onClick={() => setMoodDone(today)}>Check in privately</Link></span>
        <button type="button" onClick={() => setMoodDone(today)} aria-label="Not today"><CloseCircle size={18} color="currentColor" /></button>
      </div>
    ) : null,
    4: (
      <section className="h-inline" aria-labelledby="h-stories">
        <div className="h-inline-head"><h2 id="h-stories">Stories from people like you</h2><Link href="/stories">All stories</Link></div>
        <div className="h-stories">
          {stories.map((s) => (
            <Link key={s.id} href={`/stories/${s.id}`} className="h-story">
              <Media photo={s.photo} ratio="4 / 5" sizes="180px" />
              <b>{s.title}</b>
              <small>{PEOPLE[s.by].name.split(" ")[0]} · {s.voice ? `voice ${s.voice}` : `${s.read} read`}</small>
            </Link>
          ))}
        </div>
      </section>
    ),
    8: (
      <section className="h-inline" aria-labelledby="h-banter">
        <div className="h-inline-head"><h2 id="h-banter">Today&apos;s Banter</h2><Link href="/banter">All Banter</Link></div>
        <div className="h-banter">
          <blockquote>&ldquo;{TODAYS_BANTER}&rdquo;</blockquote>
          <div className="k-row"><Faces people={(["kwame", "ayo", "leila"] as PersonId[]).map((id) => PEOPLE[id])} size={24} max={3} /><span className="t-small c-3">12 people answered</span></div>
          <div><Button variant="primary" size="sm" href="/banter/unfinished">Add your answer</Button></div>
        </div>
      </section>
    ),
    12: (
      <section className="h-inline" aria-labelledby="h-spot">
        <div className="h-inline-head"><h2 id="h-spot">Being made right now</h2><Link href="/collaborate">Collaborate</Link></div>
        <Link href={`/collaborate/${spot.id}`} className="h-spot">
          <Media photo={spot.photo} ratio="1" sizes="120px" />
          <span><b>{spot.title}</b><p>{spot.blurb}</p><Tie a={PEOPLE[spot.makers[0]]} b={PEOPLE[spot.makers[1]]} size={24} /></span>
        </Link>
      </section>
    ),
  };

  return (
    <div className="h">
      <div className="h-wrap">
        <div className="h-main">
          <nav className="h-live" aria-label="Happening now">
            {live.map((l, i) => (
              <Settle key={l.href} index={i}>
                <Link href={l.href} className="h-live-item">
                  <Avatar person={PEOPLE[l.who[0]]} size={56} live={l.live} />
                  <b>{l.title}</b>
                  <small>{l.sub}</small>
                </Link>
              </Settle>
            ))}
            <Settle index={live.length}>
              <Link href="/banter" className="h-live-item all"><span className="n">8</span><b>Banters for you</b></Link>
            </Settle>
          </nav>

          <div className="h-compose">
            <Avatar person={meAvatar} size={40} />
            <button type="button" className="line" onClick={() => setCompose(true)}>Share with your circles</button>
            <Button variant="ghost" icon onClick={() => setCompose(true)} aria-label="Share a photo"><Gallery size={22} color="currentColor" /></Button>
          </div>

          <div className="h-feedhead">
            <h1>Home</h1>
            <div className="h-filter" ref={filterRef}>
              <button type="button" aria-expanded={filterOpen} aria-haspopup="menu" onClick={() => setFilterOpen((v) => !v)}>{filterLabel}<ArrowDown2 size={16} color="currentColor" /></button>
              {filterOpen && (
                <div className="k-menu" role="menu">
                  {[{ id: "mine", name: "Your circles" }, ...joined, { id: "all", name: "All circles" }].map((c) => (
                    <button key={c.id} type="button" role="menuitemradio" aria-checked={filter === c.id} className={filter === c.id ? "on" : undefined} onClick={() => { setFilter(c.id); setFilterOpen(false); setCount(8); }}>{c.name}</button>
                  ))}
                  <Link href="/circles" role="menuitem" className="c-3">Manage circles</Link>
                </div>
              )}
            </div>
          </div>

          {shown.length === 0 && (
            <div className="h-end">Nothing here yet. <Link href="/circles" className="c-brand">Join a circle</Link> to see what people are sharing.</div>
          )}
          {shown.map((p, i) => (
            <Fragment key={p.id}>
              <Settle index={i}><Post post={p} /></Settle>
              {inline[i + 1]}
            </Fragment>
          ))}
          {count < feed.length ? (
            <div className="h-more"><Button onClick={() => setCount((c) => c + 8)}>Show more</Button></div>
          ) : shown.length > 0 && (
            <p className="h-end">You&apos;re caught up. <Link href="/circles" className="c-brand">Find another circle</Link></p>
          )}
        </div>
        <Rail />
      </div>
      <ComposeSheet open={compose} onClose={() => setCompose(false)} />
    </div>
  );
}
