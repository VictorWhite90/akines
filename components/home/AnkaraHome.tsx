"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import HeroCarousel from "@/components/home/HeroCarousel";
import Pic from "@/components/home/Pic";
import { ReserveButtons } from "@/components/home/HomeClient";
import Composer from "@/components/feed/Composer";
import PostCard from "@/components/feed/PostCard";
import { usePosts } from "@/components/feed/usePosts";
import { useJoined } from "@/components/circles/useJoined";
import { CIRCLES, ROOMS } from "@/lib/data/community";
import { MATCHES } from "@/lib/data/matches";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";

const MOODS = [
  { face: "😞", label: "Low" },
  { face: "😕", label: "Unsettled" },
  { face: "😐", label: "Okay" },
  { face: "🙂", label: "Good" },
  { face: "😄", label: "Great" },
];

const LIVE = [
  { kind: "Presence Room", title: "Photography and memory", sub: "Live now · 5 of 6 seats", href: "/rooms/photography-memory", who: ["wanjiru", "zuri", "efua"] as PersonId[], dot: "#e5007e" },
  { kind: "Banter Now", title: "Is AI helping or damaging African art?", sub: "Live now · 20 min", href: "/banter/now/ai-art", who: ["tunde", "kwame", "zuri"] as PersonId[], dot: "#ffb000" },
  { kind: "Game night", title: "How Well Do We Remember?", sub: "Tonight · 20:00", href: "/play/session/uni-night", who: ["kwame", "tunde", "efua"] as PersonId[], dot: "#ff6b1a" },
];

export default function AnkaraHome() {
  const { posts } = usePosts();
  const { ids: joinedIds } = useJoined();
  const [tab, setTab] = useState<string>("mine");
  const [mood, setMood] = useLocal<number | null>("ak:home-mood", null);
  const [hello, setHello] = useLocal<string[]>("ak:home-hellos", []);

  const joined = CIRCLES.filter((c) => joinedIds.includes(c.id));
  const feed = posts.filter((p) => (tab === "all" ? true : tab === "mine" ? (p.circle ? joinedIds.includes(p.circle) : p.by === ME.id) : p.circle === tab));
  const match = MATCHES[0];
  const mp = PEOPLE[match.id as PersonId];
  const room = ROOMS[0];
  const host = PEOPLE[room.host];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const slides = [
    <Fragment key="kincircle">
      <Pic name="kincircleHero" sizes="(max-width: 1060px) 100vw, 1000px" priority position="center 32%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> KinCircle</span>
        <h2>Bring together the right people around a shared purpose.</h2>
        <div className="hero-actions">
          <Link className="join" href="/circles/new">Start a KinCircle</Link>
          <Link className="ghost" href="/circles">See how it works</Link>
        </div>
      </div>
      <div className="attendees">
        <AvatarStack people={(["ayo", "zuri", "thandi"] as PersonId[]).map((id) => PEOPLE[id])} size={30} max={3} ringClass="ring-white" />
        <span className="count">{joined.length} circles · {joined.reduce((s, c) => s + c.members, 0)} creatives</span>
      </div>
    </Fragment>,
    <Fragment key="room">
      <Pic name="heroStudio" sizes="(max-width: 1060px) 100vw, 1000px" position="center 30%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Presence Room · {room.when}</span>
        <h2>{room.title}</h2>
        <p>Hosted by {host.name}. Six seats, no audience, nothing recorded.</p>
        <ReserveButtons roomId={room.id} />
      </div>
    </Fragment>,
    <Fragment key="collab">
      <Pic name="collabArt" sizes="(max-width: 1060px) 100vw, 1000px" position="center 45%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Collaboration Studio</span>
        <h2>Make something neither of you could make alone.</h2>
        <div className="hero-actions">
          <Link className="join" href="/collaborate">Explore collaborations</Link>
          <Link className="ghost" href="/collaborate">Answer an open call</Link>
        </div>
      </div>
    </Fragment>,
  ];

  return (
    <div className="ap ap-calm hm" style={{ ["--c" as string]: "#14121a" } as React.CSSProperties}>
      <header className="hm-hello">
        <div>
          <p>{greet}</p>
          <h1>Welcome back, {ME.name.split(" ")[0]}.</h1>
        </div>
        <Link href="/banter#compose" className="hm-ask">
          <Avatar person={ME} size={30} />
          <span>Ask your circles something honest…</span>
        </Link>
      </header>

      <div className="hm-grid">
        <main className="hm-main">
          <div className="hm-hero"><HeroCarousel slides={slides} /></div>

          <section className="hm-compose" aria-label="Share with your circles">
            <Composer />
          </section>

          <section aria-label="Your circles' feed">
            <div className="hm-feedhead">
              <h2>Your circles&apos; feed</h2>
              <Link href="/circles">Manage circles →</Link>
            </div>
            <div className="hm-tabs" role="tablist" aria-label="Filter the feed">
              <button role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "on" : undefined} onClick={() => setTab("mine")}>Your circles</button>
              {joined.map((c) => (
                <button key={c.id} role="tab" aria-selected={tab === c.id} className={tab === c.id ? "on" : undefined} onClick={() => setTab(c.id)}>
                  <span className="hm-thumb"><Photo name={c.photo} sizes="24px" className="h-full" /></span>{c.name}
                </button>
              ))}
              <button role="tab" aria-selected={tab === "all"} className={tab === "all" ? "on" : undefined} onClick={() => setTab("all")}>All circles</button>
            </div>
            <div className="hm-feed">
              {feed.map((p) => <PostCard key={p.id} post={p} />)}
              {feed.length === 0 && (
                <div className="hm-empty">
                  <p>Nothing here yet.</p>
                  <span>Be the first to share something with this circle, or <button onClick={() => setTab("all")}>see all circles</button>.</span>
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="hm-side">
          <section className="hm-card">
            <div className="hm-cardhead"><h3>Happening now</h3><span className="hm-pulse" /></div>
            {LIVE.map((l) => (
              <Link key={l.title} href={l.href} className="hm-live">
                <span className="hm-dot" style={{ background: l.dot }} />
                <span className="hm-live-tx">
                  <small>{l.kind} · {l.sub}</small>
                  <b>{l.title}</b>
                </span>
                <span className="ap-faces">{l.who.map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={22} ring /></span>)}</span>
              </Link>
            ))}
          </section>

          <section className="hm-card">
            <div className="hm-cardhead"><h3>Someone to meet</h3><Link href="/kindred">More</Link></div>
            <div className="hm-match">
              <Avatar person={mp} size={48} />
              <div><b>{mp.name}</b><small>{mp.role} · {mp.city}</small></div>
            </div>
            <p className="hm-why">“{match.reason}”</p>
            {hello.includes(match.id) ? (
              <p className="hm-sent">✓ Hello sent. Waiting for {mp.name.split(" ")[0]}&apos;s yes.</p>
            ) : (
              <div className="hm-two">
                <Link href="/kindred" className="hm-btn">Why this match?</Link>
                <button className="hm-btn dark" onClick={() => setHello([...hello, match.id])}>Say hello</button>
              </div>
            )}
          </section>

          <section className="hm-card">
            <div className="hm-cardhead"><h3>Your circles</h3><Link href="/circles">See all</Link></div>
            {joined.map((c) => (
              <Link key={c.id} href={`/circles/${c.id}`} className="hm-circle">
                <span className="hm-cthumb"><Photo name={c.photo} sizes="44px" className="h-full" /></span>
                <span><b>{c.name}</b><small>{c.members} members · {c.active} active</small></span>
                <span className="hm-open">Open</span>
              </Link>
            ))}
            <Link href="/circles/new" className="hm-newc">＋ Start a KinCircle</Link>
          </section>

          <section className="hm-card">
            <h3>How is your creative self today?</h3>
            <div className="hm-moods" role="radiogroup" aria-label="How you are today">
              {MOODS.map((m, i) => (
                <button key={m.label} role="radio" aria-checked={mood === i} aria-label={m.label} className={mood === i ? "on" : undefined} onClick={() => setMood(i)}>{m.face}</button>
              ))}
            </div>
            <p className="hm-private">{mood === null ? "Private to you. Never used for ranking or ads." : mood <= 1 ? "Thanks for saying so. Gentle things today: a quiet room or a slow game." : "Lovely. A good day to share something or say hello."}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
