"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft2, ArrowRight, ArrowRight2, GalleryAdd, Link1, Video } from "iconsax-reactjs";
import Avatar, { AvatarStack } from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import PostCard from "@/components/feed/PostCard";
import { usePosts } from "@/components/feed/usePosts";
import { useJoined } from "@/components/circles/useJoined";
import { CIRCLES, COLLABS, ROOMS, STUDIOS } from "@/lib/data/community";
import { MORE_POSTS } from "@/lib/data/feedMore";
import type { PhotoKey } from "@/lib/data/images";
import { JOURNAL } from "@/lib/data/journals";
import { MATCHES } from "@/lib/data/matches";
import { ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { SEED_PRODUCTS } from "@/lib/data/shop";
import { STORIES } from "@/lib/data/stories";
import type { PostType } from "@/lib/data/feed";

/** Filter the feed by what people are doing, not by popularity. */
const TOPICS: { id: "all" | PostType; label: string }[] = [
  { id: "all", label: "For you" },
  { id: "ask", label: "Questions" },
  { id: "help", label: "Help needed" },
  { id: "discuss", label: "Discussions" },
  { id: "invite", label: "Invitations" },
  { id: "collaborate", label: "Collaborations" },
  { id: "share", label: "Shared moments" },
];

/** Happening now, for the swipe row on phones. */
const LIVE = [
  { kind: "Presence Room", title: "Starting over in a new city", sub: "5 of 6 seats", href: "/rooms/photography-memory", who: ["wanjiru", "zuri", "efua"] as PersonId[], dot: "#e5007e" },
  { kind: "Banter Now", title: "Is AI going to take our jobs?", sub: "20 min", href: "/banter/now/ai-art", who: ["tunde", "kwame", "zuri"] as PersonId[], dot: "#ffb000" },
  { kind: "Game night", title: "How Well Do We Remember?", sub: "Tonight · 20:00", href: "/play/session/uni-night", who: ["kwame", "tunde", "efua"] as PersonId[], dot: "#ff6b1a" },
];

/** Trending: live rooms, conversations and open calls worth joining. */
const TRENDING = [
  { cat: "Presence Room", type: "Live now", title: "Starting over in a new city", sub: "Five of six seats taken", href: "/rooms/photography-memory" },
  { cat: "Banter", type: "Conversation", title: "Is AI going to take our jobs?", sub: "Tunde, Kwame and Zuri, live", href: "/banter/now/ai-art" },
  { cat: "Collaborate", type: "Open call", title: "Looking for a partner?", sub: "Find someone to build something with", href: "/collaborate" },
  { cat: "Play together", type: "Tonight", title: "How Well Do We Remember?", sub: "Game night at 20:00", href: "/play/session/uni-night" },
  { cat: "Stories", type: "Life", title: "The kitchen I almost sold", sub: "Three generations behind a blue door", href: "/stories/indigo-room" },
];

type Slide = { badge: string; title: string; body: string; photo: PhotoKey; primary: { label: string; href: string }; secondary: { label: string; href: string } };

function Hero() {
  const room = ROOMS[0];
  const collab = COLLABS[0];
  const slides: Slide[] = [
    { badge: "KinCircle", title: "Bring together the right people around a shared purpose.", body: "Build trust, support one another and create something meaningful, without the noise of another group chat.", photo: "kincircleHero", primary: { label: "Start a KinCircle", href: "/circles/new" }, secondary: { label: "See how it works", href: "/circles" } },
    { badge: "Presence Room", title: room.title, body: `Hosted by ${PEOPLE[room.host].name}. Six seats, no audience, nothing recorded.`, photo: "talkMugs", primary: { label: "Reserve my seat", href: `/rooms/${room.id}` }, secondary: { label: "All rooms", href: "/rooms" } },
    { badge: "Banter Now", title: "Is AI going to take our jobs?", body: "Tunde, Kwame and Zuri are talking right now. Twenty minutes, equal seats.", photo: "talkLaugh", primary: { label: "Join the conversation", href: "/banter/now/ai-art" }, secondary: { label: "See all Banter", href: "/banter" } },
    { badge: "Collaborate", title: "Make something neither of you could make alone.", body: `${collab.title}: ${collab.progress}% made.`, photo: "collabArt", primary: { label: "Explore collaborations", href: "/collaborate" }, secondary: { label: "View the project", href: `/collaborate/${collab.id}` } },
  ];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, slides.length]);
  const s = slides[i];
  const go = (d: number) => setI((x) => (x + d + slides.length) % slides.length);

  return (
    <section className="kh-hero" aria-roledescription="carousel" aria-label="Featured" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Photo key={s.photo} name={s.photo} sizes="(max-width: 900px) 100vw, 860px" priority className="kh-hero-img" position="center 32%" />
      <div className="kh-hero-shade" />
      <div className="kh-hero-copy" key={i}>
        <span className="kh-badge"><i aria-hidden><b /></i>{s.badge}</span>
        <div>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
        </div>
        <div className="kh-hero-acts">
          <Link href={s.primary.href} className="kh-btn amber">{s.primary.label}</Link>
          <Link href={s.secondary.href} className="kh-btn glass">{s.secondary.label}</Link>
        </div>
      </div>
      {i === 0 && (
        <div className="kh-hero-faces"><AvatarStack people={(["wanjiru", "efua", "fatou"] as PersonId[]).map((id) => PEOPLE[id])} size={30} max={3} ringClass="ring-white" /></div>
      )}
      <button className="kh-hero-nav prev" onClick={() => go(-1)} aria-label="Previous"><ArrowLeft2 size={14} color="currentColor" /></button>
      <button className="kh-hero-nav next" onClick={() => go(1)} aria-label="Next"><ArrowRight2 size={14} color="currentColor" /></button>
      <div className="kh-dots" role="tablist" aria-label="Slides">
        {slides.map((x, k) => <button key={x.badge} role="tab" aria-selected={k === i} aria-label={x.badge} className={k === i ? "on" : undefined} onClick={() => setI(k)} />)}
      </div>
    </section>
  );
}

function Composer() {
  const { addPost } = usePosts();
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const post = () => {
    if (!text.trim()) return;
    addPost({ type: "share", text });
    setText("");
    setSent(true);
    setTimeout(() => setSent(false), 2400);
  };
  return (
    <section className="kh-card kh-composer" aria-label="Share with your circles">
      <div className="kh-composer-top">
        <Avatar person={ME} size={32} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={sent ? "Posted to your circles." : "Share an idea, thought or ask a question…"} aria-label="Write a post" rows={3} />
      </div>
      <div className="kh-composer-bar">
        <div className="kh-tools">
          <button type="button" aria-label="Add a photo"><GalleryAdd size={20} color="currentColor" /></button>
          <button type="button" aria-label="Add a video"><Video size={20} color="currentColor" /></button>
          <button type="button" aria-label="Add a link"><Link1 size={20} color="currentColor" /></button>
        </div>
        <button className="kh-post" onClick={post} disabled={!text.trim()}>Post</button>
      </div>
    </section>
  );
}

function SectionHead({ title, sub, href, cta = "Explore all" }: { title: string; sub: string; href: string; cta?: string }) {
  return (
    <div className="kh-sec">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      <Link href={href} className="kh-link">{cta} <ArrowRight size={12} color="currentColor" /></Link>
    </div>
  );
}

function Tile({ href, photo, kicker, title, body, foot }: { href: string; photo: PhotoKey; kicker?: string; title: string; body?: string; foot: React.ReactNode }) {
  return (
    <Link href={href} className="kh-tile">
      <Photo name={photo} sizes="280px" className="kh-tile-img" />
      {kicker && <span className="kh-tag">{kicker}</span>}
      <div className="kh-tile-tx">
        <b>{title}</b>
        {body && <p>{body}</p>}
        <div className="kh-tile-foot">{foot}</div>
      </div>
    </Link>
  );
}

/** Community home, built to the Figma "01 – community home" frame with Akines content. */
export default function KinHome() {
  const { posts } = usePosts();
  const { ids: joinedIds } = useJoined();
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["id"]>("all");
  const [count, setCount] = useState(4);
  const [hello, setHello] = useState<"idle" | "sent" | "skip">("idle");

  const joined = CIRCLES.filter((c) => joinedIds.includes(c.id));
  const feed = [...posts, ...MORE_POSTS].filter((p) => (topic === "all" ? true : p.type === topic));
  const shown = feed.slice(0, count);
  const match = MATCHES[0];
  const mp = PEOPLE[match.id as PersonId];


  return (
    <div className="kh">
      <nav className="kh-chips" aria-label="Topics">
        {TOPICS.map((t) => (
          <button key={t.id} aria-pressed={topic === t.id} className={topic === t.id ? "on" : undefined} onClick={() => { setTopic(t.id); setCount(4); }}>{t.label}</button>
        ))}
        <Link href="/banter" className="kh-chip-more" aria-label="More on Banter"><ArrowRight size={16} color="currentColor" /></Link>
      </nav>

      {/* Phones: what's live right now, in one row you can swipe. */}
      <nav className="hm-livebar" aria-label="Happening now">
        {LIVE.map((l) => (
          <Link key={l.href} href={l.href} className="hm-lb" style={{ ["--k" as string]: l.dot } as React.CSSProperties}>
            <AvatarStack people={l.who.map((id) => PEOPLE[id])} size={26} max={3} ringClass="ring-transparent" />
            <span className="hm-lb-tx"><b>{l.title}</b><small>{l.kind} · {l.sub}</small></span>
            <span className="hm-bars" aria-hidden><i /><i /><i /></span>
          </Link>
        ))}
      </nav>

      <div className="kh-grid">
        <main className="kh-main">
          <Composer />
          <Hero />

          <section aria-label="Stories">
            <SectionHead title="These might resonate with you." sub="Discover stories, ideas and conversations worth your time." href="/stories" />
            <div className="kh-row">
              {STORIES.slice(1, 4).map((s) => (
                <Tile key={s.id} href={`/stories/${s.id}`} photo={s.photo} kicker={s.kind} title={s.title} body={s.excerpt} foot={<><span>{s.voice ? `▶ ${s.voice} voice note` : `${s.read} read`}</span><span>{s.reflections} reflections</span></>} />
              ))}
            </div>
          </section>

          <section aria-label="Your circles' feed">
            <SectionHead title="Your circles' feed" sub="What people are sharing in the circles you've joined." href="/circles" cta="Manage circles" />
            <div className="kh-feed">
              {shown.map((p) => <PostCard key={p.id} post={p} />)}
              {shown.length === 0 && <p className="kh-none">Nothing like that yet. <button onClick={() => setTopic("all")}>Show everything</button></p>}
              {count < feed.length && <button className="kh-more" onClick={() => setCount((c) => c + 4)}>See more posts ({feed.length - count})</button>}
            </div>
          </section>

          <section aria-label="Journals">
            <SectionHead title="Witness the journey" sub="Work and life journals, shared by members." href="/journal" cta="Open journals" />
            <div className="kh-row">
              {JOURNAL.slice(0, 3).map((j) => (
                <Tile key={j.id} href="/journal" photo={j.photo ?? "journalOpen"} kicker={j.kind === "work" ? "Work journal" : "Life journal"} title={j.title} body={j.text} foot={<><span>{PEOPLE[j.by].name}</span><span>{j.date}</span></>} />
              ))}
            </div>
          </section>

          <section aria-label="Open doors">
            <SectionHead title="Step through an open door" sub="Live, virtual or 360°. Meet people where they work." href="/studios" cta="All open doors" />
            <div className="kh-row">
              {STUDIOS.slice(0, 3).map((v) => (
                <Tile key={v.id} href={`/studios/${v.id}`} photo={v.photo} kicker={v.mode} title={`${PEOPLE[v.artist].name.split(" ")[0]}'s space`} body={v.blurb} foot={<><span className="kh-amber">{v.when}</span><span>{v.place}</span></>} />
              ))}
            </div>
          </section>

          <section aria-label="Marketplace">
            <SectionHead title="Fresh from the community" sub="Food, classes and services, sold by the people who offer them." href="/shop" cta="Shop all" />
            <div className="kh-row">
              {SEED_PRODUCTS.slice(0, 3).map((x) => (
                <Link key={x.id} href={`/shop/${x.id}`} className="kh-tile kh-product">
                  <Photo name={x.photos[0]} sizes="280px" className="kh-tile-img" />
                  <div className="kh-tile-tx">
                    <small className="kh-over">{x.category}</small>
                    <b className="kh-pname">{x.title}</b>
                    <span className="kh-maker"><Avatar person={PEOPLE[x.seller]} size={30} />{PEOPLE[x.seller].name}</span>
                    <div className="kh-tile-foot"><span className="kh-price">${x.price}</span><span className="kh-btn amber sm">Buy</span></div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside className="kh-side">
          <section className="kh-card">
            <div className="kh-side-head"><b>Your Circles ({joined.length})</b><Link href="/circles" className="kh-link">See all <ArrowRight size={12} color="currentColor" /></Link></div>
            <ul className="kh-circles">
              {joined.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link href={`/circles/${c.id}`}>
                    <Photo name={c.photo} sizes="74px" className="kh-circle-img" />
                    <span className="kh-circle-tx"><span>{c.name}</span><small>{c.members} members <i aria-hidden /> {c.active} active</small></span>
                    <ArrowRight2 size={12} color="currentColor" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="kh-card kh-match">
            <div className="kh-side-head"><b>You two would get along</b><Link href="/kindred" className="kh-link">Why this match?</Link></div>
            <Link href={`/profile/${mp.id}`} className="kh-person">
              <Avatar person={mp} size={48} />
              <span><span>{mp.name}</span><small>{mp.role} <i aria-hidden /> {mp.city}</small></span>
            </Link>
            <p className="kh-quote">“{match.reason}”</p>
            {hello === "idle" ? (
              <div className="kh-acts">
                <button className="kh-btn outline sm" onClick={() => setHello("skip")}>Not now</button>
                <Link href={`/messages/${mp.id}`} className="kh-btn amber sm" onClick={() => setHello("sent")}>Say hello</Link>
              </div>
            ) : (
              <p className="kh-quote">{hello === "sent" ? "Opening a chat…" : "Okay. We'll suggest someone else soon."}</p>
            )}
          </section>

          <section className="kh-card kh-trend">
            <div className="kh-trend-head"><b>Trending now on Akines</b><small>Conversations and discoveries</small></div>
            <ul>
              {TRENDING.map((t) => (
                <li key={t.title}>
                  <Link href={t.href}>
                    <small>{t.cat} <i aria-hidden /> {t.type}</small>
                    <b>{t.title}</b>
                    <span>{t.sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/banter" className="kh-link">Explore more discoveries <ArrowRight size={12} color="currentColor" /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

