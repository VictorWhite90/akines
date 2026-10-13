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
import { CIRCLES, COLLABS, ROOMS, STAGES, STUDIOS } from "@/lib/data/community";
import { GAME_SESSIONS, GAMES } from "@/lib/data/games";
import { STORIES } from "@/lib/data/stories";
import GameCover from "@/components/play/GameCover";
import BanterCard from "@/components/banter/BanterCard";
import { useBanters } from "@/components/banter/useBanters";
import { TODAYS_BANTER } from "@/lib/data/banter";
import type { PhotoKey } from "@/lib/data/images";
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

const TILES: { title: string; stat: string; body: string; href: string; photo: PhotoKey; color: string; glyph: string }[] = [
  { title: "Banter", stat: "8 waiting for you", body: "One honest question, to the right people.", href: "/banter", photo: "talkLaugh", color: "#ffb000", glyph: "❝" },
  { title: "Presence Rooms", stat: "1 live · 3 this week", body: "Six seats. No audience. Nothing recorded.", href: "/rooms", photo: "talkMugs", color: "#e5007e", glyph: "◉" },
  { title: "KinCircles", stat: "Week 4 of 8", body: "Small groups on a journey with purpose.", href: "/circles", photo: "talkGroup", color: "#00a86b", glyph: "◎" },
  { title: "Collaborate", stat: "4 in progress · 3 calls", body: "Make what neither of you could alone.", href: "/collaborate", photo: "collabArt", color: "#2547d0", glyph: "⌘" },
];

const LIVE = [
  { kind: "Presence Room", title: "Photography and memory", sub: "Live now · 5 of 6 seats", href: "/rooms/photography-memory", who: ["wanjiru", "zuri", "efua"] as PersonId[], dot: "#e5007e" },
  { kind: "Banter Now", title: "Is AI helping or damaging African art?", sub: "Live now · 20 min", href: "/banter/now/ai-art", who: ["tunde", "kwame", "zuri"] as PersonId[], dot: "#ffb000" },
  { kind: "Game night", title: "How Well Do We Remember?", sub: "Tonight · 20:00", href: "/play/session/uni-night", who: ["kwame", "tunde", "efua"] as PersonId[], dot: "#ff6b1a" },
];

export default function AnkaraHome() {
  const { posts } = usePosts();
  const { all: banters } = useBanters();
  const { ids: joinedIds } = useJoined();
  const [tab, setTab] = useState<string>("mine");
  const [mood, setMood] = useLocal<number | null>("ak:home-mood", null);
  const [hello, setHello] = useLocal<string[]>("ak:home-hellos", []);

  const joined = CIRCLES.filter((c) => joinedIds.includes(c.id));
  const feed = posts.filter((p) => (tab === "all" ? true : tab === "mine" ? (p.circle ? joinedIds.includes(p.circle) : p.by === ME.id) : p.circle === tab));
  const collab = COLLABS[0];
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

          <nav className="hs-tiles" aria-label="Jump back in">
            {TILES.map((t) => (
              <Link key={t.title} href={t.href} className="hs-tile" style={{ ["--t" as string]: t.color } as React.CSSProperties}>
                <Photo name={t.photo} sizes="300px" className="absolute inset-0 h-full" />
                <span className="hs-tile-shade" />
                <span className="hs-tile-ic">{t.glyph}</span>
                <span className="hs-tile-tx"><small>{t.stat}</small><b>{t.title}</b><em>{t.body}</em></span>
              </Link>
            ))}
          </nav>

          <section className="hb" aria-label="Banter">
            <div className="hs-strip-head">
              <div><small>Banter</small><h3>Questions waiting for you</h3></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Link href="/banter">See all →</Link>
                <Link href="/banter#compose" className="hb-start">＋ Start a Banter</Link>
              </div>
            </div>
            <div className="hb-grid">
              <Link href="/banter/unfinished" className="hb-today">
                <Photo name="paintingWoman" sizes="320px" className="absolute inset-0 h-full" />
                <span className="hb-today-tx">
                  <small>Today&apos;s Banter</small>
                  <b>“{TODAYS_BANTER}”</b>
                  <span>Join the Banter →</span>
                </span>
              </Link>
              <div className="hb-list">
                {banters.filter((b) => !b.closed).slice(0, 2).map((b) => <BanterCard key={b.id} banter={b} />)}
              </div>
            </div>
          </section>

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
              {feed.slice(0, 2).map((p) => <PostCard key={p.id} post={p} />)}

              {/* Spotlight: a collaboration in progress */}
              <Link href={`/collaborate/${collab.id}`} className="hs-spot">
                <span className="hs-spot-img"><Photo name={collab.photo} sizes="(max-width: 900px) 100vw, 420px" className="absolute inset-0 h-full" /></span>
                <span className="hs-spot-tx">
                  <small>Collaboration spotlight · {collab.route}</small>
                  <b>{collab.title}</b>
                  <em>{collab.blurb}</em>
                  <span className="hs-stages">{STAGES.map((st, i) => <i key={st} className={i < collab.stage ? "done" : i === collab.stage ? "now" : undefined}>{st}</i>)}</span>
                  <span className="hs-spot-foot"><span className="ap-faces">{collab.makers.map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={28} ring /></span>)}</span>{collab.next}<span className="hs-go">View project →</span></span>
                </span>
              </Link>

              {feed.slice(2, 4).map((p) => <PostCard key={p.id} post={p} />)}

              {/* Play tonight */}
              <section className="hs-strip">
                <div className="hs-strip-head"><div><small>Play Together</small><h3>Games your people are playing</h3></div><Link href="/play">All games →</Link></div>
                <div className="hs-row">
                  {GAME_SESSIONS.map((g) => {
                    const game = GAMES.find((x) => x.id === g.game)!;
                    return (
                      <Link key={g.id} href={`/play/session/${g.id}`} className="hs-game">
                        <GameCover game={game} className="hs-cover" />
                        <span className="hs-game-tx"><small>{g.when}</small><b>{g.title}</b><span className="ap-faces">{g.players.map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={20} ring /></span>)}</span></span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {feed.slice(4, 6).map((p) => <PostCard key={p.id} post={p} />)}

              {/* Stories */}
              <section className="hs-strip">
                <div className="hs-strip-head"><div><small>Stories with a pulse</small><h3>A few moments, chosen for what they say</h3></div><Link href="/stories">Explore all →</Link></div>
                <div className="hs-row">
                  {STORIES.slice(0, 3).map((st) => (
                    <Link key={st.id} href={`/stories/${st.id}`} className="hs-story">
                      <Photo name={st.photo} sizes="300px" className="absolute inset-0 h-full" />
                      <span className="hs-story-tx"><small>{st.kind}{st.voice ? ` · ▶ ${st.voice}` : ""}</small><b>{st.title}</b><em>{PEOPLE[st.by].name}</em></span>
                    </Link>
                  ))}
                </div>
              </section>

              {feed.slice(6).map((p) => <PostCard key={p.id} post={p} />)}

              {/* Studio visits */}
              <section className="hs-strip">
                <div className="hs-strip-head"><div><small>Studio visits</small><h3>Step inside a studio this week</h3></div><Link href="/studios">All studios →</Link></div>
                <div className="hs-row">
                  {STUDIOS.slice(0, 3).map((v) => (
                    <Link key={v.id} href={`/studios/${v.id}`} className="hs-visit">
                      <span className="hs-visit-img"><Photo name={v.photo} sizes="300px" className="absolute inset-0 h-full" /><i>{v.mode}</i></span>
                      <span className="hs-visit-tx"><Avatar person={PEOPLE[v.artist]} size={30} /><span><b>{PEOPLE[v.artist].name}</b><small>{v.place} · {v.when}</small></span></span>
                    </Link>
                  ))}
                </div>
              </section>
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
