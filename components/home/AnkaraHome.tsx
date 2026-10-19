"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import HeroCarousel from "@/components/home/HeroCarousel";
import Pic from "@/components/home/Pic";
import { ReserveButtons } from "@/components/home/HomeClient";
import { MORE_POSTS } from "@/lib/data/feedMore";
import type { PhotoKey } from "@/lib/data/images";
import Photo from "@/components/ui/Photo";
import Composer from "@/components/feed/Composer";
import PostCard from "@/components/feed/PostCard";
import { usePosts } from "@/components/feed/usePosts";
import { useJoined } from "@/components/circles/useJoined";
import { CIRCLES, COLLABS, ROOMS, STAGES, STUDIOS } from "@/lib/data/community";
import { GAME_SESSIONS, GAMES } from "@/lib/data/games";
import { STORIES } from "@/lib/data/stories";
import BanterCard from "@/components/banter/BanterCard";
import { useBanters } from "@/components/banter/useBanters";
import { TODAYS_BANTER } from "@/lib/data/banter";
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

/** Photos that show each game being played, with its category colour. */
const GAME_PHOTO: Record<string, PhotoKey> = { remember: "photoAlbum", "two-truths": "talkLaugh", "city-eyes": "galleryViewer" };
const GAME_TINT: Record<string, string> = { reconnection: "#e5007e", icebreakers: "#ffb000", creative: "#ff6b1a" };

/** Filter the feed by what people are doing, not by popularity. */
const TOPICS = [
  { id: "all", label: "For you" },
  { id: "ask", label: "Questions" },
  { id: "help", label: "Help needed" },
  { id: "discuss", label: "Discussions" },
  { id: "invite", label: "Invitations" },
  { id: "collaborate", label: "Collaborations" },
  { id: "share", label: "Shared moments" },
];

const LIVE = [
  { kind: "Presence Room", title: "Starting over in a new city", sub: "Live now · 5 of 6 seats", href: "/rooms/photography-memory", who: ["wanjiru", "zuri", "efua"] as PersonId[], dot: "#e5007e" },
  { kind: "Banter Now", title: "Is AI going to take our jobs?", sub: "Live now · 20 min", href: "/banter/now/ai-art", who: ["tunde", "kwame", "zuri"] as PersonId[], dot: "#ffb000" },
  { kind: "Game night", title: "How Well Do We Remember?", sub: "Tonight · 20:00", href: "/play/session/uni-night", who: ["kwame", "tunde", "efua"] as PersonId[], dot: "#ff6b1a" },
];

export default function AnkaraHome() {
  const { posts } = usePosts();
  const { all: banters } = useBanters();
  const { ids: joinedIds } = useJoined();
  const [tab, setTab] = useState<string>("mine");
  const [topic, setTopic] = useState<string>("all");
  const [mood, setMood] = useLocal<number | null>("ak:home-mood", null);
  const [hello, setHello] = useLocal<string[]>("ak:home-hellos", []);

  const joined = CIRCLES.filter((c) => joinedIds.includes(c.id));
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const feed = [...posts, ...MORE_POSTS]
    .filter((p) => (tab === "all" ? true : tab === "mine" ? (p.circle ? joinedIds.includes(p.circle) : p.by === ME.id) : p.circle === tab))
    .filter((p) => topic === "all" || p.type === topic);
  const shown = feed.slice(0, count);
  const done = count >= feed.length;
  const loadMore = () => {
    if (done || loading) return;
    setLoading(true);
    setTimeout(() => {
      setCount((c) => c + 4);
      setLoading(false);
    }, 600);
  };

  // Keep loading as the member scrolls near the end of the feed.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  });

  const collab = COLLABS[0];
  const spot = COLLABS[1];
  const match = MATCHES[0];
  const mp = PEOPLE[match.id as PersonId];
  const room = ROOMS[0];
  const host = PEOPLE[room.host];
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const slides = [
    <Fragment key="kincircle">
      <Pic name="kincircleHero" sizes="(max-width: 1060px) 100vw, 1400px" priority position="center 32%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> KinCircle · Week 4 of 8</span>
        <h2>Bring together the right people around a shared purpose.</h2>
        <p>Weekend Coding Club meets on Thursday. This week: plan the first lesson for twelve teenagers.</p>
        <div className="hero-actions">
          <Link className="join" href="/circles/new">Start a KinCircle</Link>
          <Link className="ghost" href="/circles">Open your circle</Link>
        </div>
      </div>
      <div className="attendees">
        <AvatarStack people={(["wanjiru", "efua", "fatou"] as PersonId[]).map((id) => PEOPLE[id])} size={30} max={3} ringClass="ring-white" />
        <span className="count">{joined.length} circles · {joined.reduce((s2, c) => s2 + c.members, 0)} people</span>
      </div>
    </Fragment>,
    <Fragment key="room">
      <Pic name="talkMugs" sizes="(max-width: 1060px) 100vw, 1400px" position="center 30%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Presence Room · {room.when}</span>
        <h2>{room.title}</h2>
        <p>Hosted by {host.name}. Six seats, no audience, nothing recorded. {6 - room.seated.length} seats left.</p>
        <ReserveButtons roomId={room.id} />
      </div>
    </Fragment>,
    <Fragment key="banter">
      <Pic name="talkLaugh" sizes="(max-width: 1060px) 100vw, 1400px" position="center 40%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Banter Now · live</span>
        <h2>Is AI going to take our jobs?</h2>
        <p>Tunde, Kwame and Zuri are talking right now. Twenty minutes, equal seats, nothing recorded.</p>
        <div className="hero-actions">
          <Link className="join" href="/banter/now/ai-art">Join the conversation</Link>
          <Link className="ghost" href="/banter">See all Banter</Link>
        </div>
      </div>
    </Fragment>,
    <Fragment key="collab">
      <Pic name="collabArt" sizes="(max-width: 1060px) 100vw, 1400px" position="center 45%" />
      <div className="hero-copy">
        <span className="pill"><span className="live-dot" /> Collaboration · {collab.route}</span>
        <h2>Make something neither of you could make alone.</h2>
        <p>{collab.title}: {collab.progress}% made, {collab.next.toLowerCase()}.</p>
        <div className="hero-actions">
          <Link className="join" href="/collaborate">Explore collaborations</Link>
          <Link className="ghost" href={`/collaborate/${collab.id}`}>View the project</Link>
        </div>
      </div>
    </Fragment>,
  ];

  return (
    <div className="ap ap-calm hm" style={{ ["--c" as string]: "#14121a" } as React.CSSProperties}>
      <header className="hm-hello">
        <div>
          <p>{today}</p>
          <h1>{greet}, <span>{ME.name.split(" ")[0]}.</span></h1>
        </div>
        <nav className="hm-stats" aria-label="Waiting for you">
          <Link href="/banter"><b>8</b>Banters for you</Link>
          <Link href="/rooms"><b className="live">1</b>room live now</Link>
          <Link href="/kindred"><b>2</b>introductions</Link>
          <Link href="/banter#start" className="go">❝ Start a Banter</Link>
        </nav>
      </header>

      {/* Phones: what's live right now, in one row you can swipe. Replaces the greeting. */}
      <nav className="hm-livebar" aria-label="Happening now">
        {LIVE.map((l) => (
          <Link key={l.href} href={l.href} className="hm-lb" style={{ ["--k" as string]: l.dot } as React.CSSProperties}>
            <AvatarStack people={l.who.map((id) => PEOPLE[id])} size={26} max={3} ringClass="ring-transparent" />
            <span className="hm-lb-tx"><b>{l.title}</b><small>{l.kind} · {l.sub.replace("Live now · ", "")}</small></span>
            <span className="hm-bars" aria-hidden><i /><i /><i /></span>
          </Link>
        ))}
        <Link href="/banter" className="hm-lb plain"><b className="n">8</b><span className="hm-lb-tx"><b>Banters for you</b></span></Link>
        <Link href="/kindred" className="hm-lb plain"><b className="n">2</b><span className="hm-lb-tx"><b>Introductions</b></span></Link>
      </nav>


      <div className="hm-grid">
        <main className="hm-main">

          <section className="hm-compose" aria-label="Share with your circles">
            <Composer />
          </section>

          <div className="hm-hero"><HeroCarousel slides={slides} /></div>

          <section className="hb" aria-label="Banter">
            <div className="hs-strip-head">
              <div><small>Banter</small><h3>Questions waiting for you</h3></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Link href="/banter">See all →</Link>
                <Link href="/banter#start" className="hb-start">＋ Start a Banter</Link>
              </div>
            </div>
            <Link href="/banter/unfinished" className="hb-banner">
              <span className="hb-banner-img"><Photo name="talkLaugh" sizes="260px" className="absolute inset-0 h-full" position="center 25%" /></span>
              <span className="hb-banner-tx">
                <small>Today&apos;s Banter</small>
                <b>“{TODAYS_BANTER}”</b>
              </span>
              <span className="hb-banner-go">Join the Banter →</span>
            </Link>
            <div className="hb-list">
              {banters.filter((b) => !b.closed).slice(0, 1).map((b) => <BanterCard key={b.id} banter={b} />)}
            </div>
          </section>

          <section aria-label="Your circles' feed">
            <div className="hm-feedhead">
              <h2>Your circles&apos; feed</h2>
              <Link href="/circles">Manage circles →</Link>
            </div>
            <div className="hm-tabs" role="tablist" aria-label="Filter the feed">
              <button role="tab" aria-selected={tab === "mine"} className={tab === "mine" ? "on" : undefined} onClick={() => { setTab("mine"); setCount(6); }}>Your circles</button>
              {joined.map((c) => (
                <button key={c.id} role="tab" aria-selected={tab === c.id} className={tab === c.id ? "on" : undefined} onClick={() => { setTab(c.id); setCount(6); }}>
                  <span className="hm-thumb"><Photo name={c.photo} sizes="24px" className="h-full" /></span>{c.name}
                </button>
              ))}
              <button role="tab" aria-selected={tab === "all"} className={tab === "all" ? "on" : undefined} onClick={() => { setTab("all"); setCount(6); }}>All circles</button>
            </div>
            <div className="hm-topics" role="group" aria-label="Topic">
              {TOPICS.map((t) => (
                <button key={t.id} aria-pressed={topic === t.id} className={topic === t.id ? "on" : undefined} onClick={() => { setTopic(t.id); setCount(6); }}>{t.label}</button>
              ))}
            </div>
            {shown.length === 0 && <p className="hm-none">Nothing like that in these circles yet. <button onClick={() => setTopic("all")}>Show everything</button></p>}
            <div className="hm-feed">
              <div className="hw">{shown.slice(0, 4).map((p) => <PostCard key={p.id} post={p} />)}</div>

              {/* Spotlight: a collaboration in progress */}
              <Link href={`/collaborate/${spot.id}`} className="hs-spot">
                <span className="hs-spot-img"><Photo name={spot.photo} sizes="(max-width: 900px) 100vw, 420px" className="absolute inset-0 h-full" /></span>
                <span className="hs-spot-tx">
                  <small>Collaboration spotlight · {spot.route}</small>
                  <b>{spot.title}</b>
                  <em>{spot.blurb}</em>
                  <span className="hs-stages">{STAGES.map((st, i) => <i key={st} className={i < spot.stage ? "done" : i === spot.stage ? "now" : undefined}>{st}</i>)}</span>
                  <span className="hs-spot-foot"><span className="ap-faces">{spot.makers.map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={28} ring /></span>)}</span>{spot.next}<span className="hs-go">View project →</span></span>
                </span>
              </Link>


              {/* Play tonight */}
              <section className="hs-strip">
                <div className="hs-strip-head"><div><small>Play Together</small><h3>Games your people are playing</h3></div><Link href="/play">All games →</Link></div>
                <div className="hs-row">
                  {GAME_SESSIONS.map((g) => {
                    const game = GAMES.find((x) => x.id === g.game)!;
                    return (
                      <Link key={g.id} href={`/play/session/${g.id}`} className="hs-game">
                        <span className="hs-gph" style={{ ["--gc" as string]: GAME_TINT[game.category] ?? "#ff6b1a" } as React.CSSProperties}>
                          <Photo name={GAME_PHOTO[game.id] ?? game.photo} sizes="320px" className="absolute inset-0 h-full" />
                          <span className="hs-gcard"><small>Card 1</small>{game.cards[0]}</span>
                          <span className="hs-gmode">{g.mode === "slow" ? "Slow play" : "Live play"}</span>
                        </span>
                        <span className="hs-game-tx"><small>{g.when}</small><b>{g.title}</b><span className="ap-faces">{g.players.map((id) => <span key={id}><Avatar person={PEOPLE[id]} size={20} ring /></span>)}</span></span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <div className="hw">{shown.slice(4, 8).map((p) => <PostCard key={p.id} post={p} />)}</div>

              {/* Stories */}
              <section className="hs-strip">
                <div className="hs-strip-head"><div><small>Stories with a pulse</small><h3>A few moments, chosen for what they say</h3></div><Link href="/stories">Explore all →</Link></div>
                <div className="hs-row">
                  {STORIES.filter((st) => st.id !== "five-voices").slice(0, 3).map((st) => (
                    <Link key={st.id} href={`/stories/${st.id}`} className="hs-story">
                      <Photo name={st.photo} sizes="300px" className="absolute inset-0 h-full" />
                      <span className="hs-story-tx"><small>{st.kind}{st.voice ? ` · ▶ ${st.voice}` : ""}</small><b>{st.title}</b><em>{PEOPLE[st.by].name}</em></span>
                    </Link>
                  ))}
                </div>
              </section>

              <div className="hw">{shown.slice(8, 12).map((p) => <PostCard key={p.id} post={p} />)}</div>

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
              <div className="hw">{shown.slice(12).map((p) => <PostCard key={p.id} post={p} />)}</div>

              <div ref={sentinel} className="hm-more">
                {feed.length > 0 && (done ? (
                  <p>✓ You&apos;re all caught up. <Link href="/circles">Find another circle</Link> or <Link href="/banter#start">start a Banter</Link>.</p>
                ) : (
                  <button onClick={loadMore} disabled={loading}>{loading ? <><span className="hm-spin" />Loading more from your circles…</> : `Show more · ${feed.length - count} older posts`}</button>
                ))}
              </div>

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
          <section className="hm-card hm-now">
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
            <h3>How are you today?</h3>
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
