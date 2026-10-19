"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Add, ArrowLeft2, ArrowRight, ArrowRight2, Bookmark2, Share } from "iconsax-reactjs";
import Avatar from "@/components/ui/Avatar";
import Photo from "@/components/ui/Photo";
import BanterCreate from "./BanterCreate";
import { useBanterReplies, useBanters } from "./useBanters";
import { BANTER_MOODS, BANTER_NOW, BANTER_TYPES, type Banter, type BanterNow } from "@/lib/data/banter";
import type { PhotoKey } from "@/lib/data/images";
import { ME, PEOPLE } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";

const TOPIC_PHOTO: Record<string, PhotoKey> = { everyday: "journalCoffee", creative: "studioBusy", culture: "talkGroup", debate: "talkLaugh", memory: "photoAlbum", collab: "collabArt", support: "calmBench", celebration: "talkCafe" };
const UPCOMING = [
  { title: "Money talk", sub: "What's your first big money lesson?", when: "Fri, 25 Oct · 7pm", href: "/banter" },
  { title: "Career changers", sub: "Leaving a safe job, honestly", when: "Sat, 26 Oct · 3pm", href: "/banter" },
  { title: "Wellbeing", sub: "Rest, guilt and the weekly grind", when: "Sun, 27 Oct · 6pm", href: "/wellbeing" },
];

/** Live Banter: the amber card, one live conversation at a time. */
function LiveCard({ s, onSkip }: { s: BanterNow; onSkip: () => void }) {
  const host = PEOPLE[s.host];
  const listening = Math.max(0, s.people.length - 1);
  return (
    <article className="bh-live">
      <span className="bh-badge">{s.live ? "Live now" : `Starts ${s.startsIn}`}</span>
      <p className="bh-host"><Avatar person={host} size={28} />{host.name}</p>
      <h2>{s.topic}</h2>
      <div className="bh-live-foot">
        <p className="bh-label">Inside the conversation</p>
        <div className="bh-live-row">
          <span className="bh-faces">
            {s.people.slice(0, 4).map((id) => <Avatar key={id} person={PEOPLE[id]} size={38} />)}
            {s.people.length > 4 && <i>+{s.people.length - 4}</i>}
          </span>
          <span className="bh-count"><b>{s.people.length} people are in this Banter</b><small>1 speaking · {listening} listening · {s.minutes} min</small></span>
          <span className="bh-live-acts">
            <button onClick={onSkip}>Not for me</button>
            <Link href={`/banter/now/${s.id}`} className="bh-join">{s.live ? "Join the conversation" : "Remind me"} <ArrowRight2 size={16} color="currentColor" /></Link>
          </span>
        </div>
      </div>
    </article>
  );
}

/** One Banter chat, laid out like the Figma feed post: text left, photo right. */
function ChatCard({ b }: { b: Banter }) {
  const [added] = useBanterReplies(b.id);
  const replies = [...b.replies, ...added];
  const by = PEOPLE[b.by];
  const last = replies[replies.length - 1];
  const people = [...new Set(replies.map((r) => r.by))];
  const total = Object.values(b.reactions).reduce((a, n) => a + n, 0);
  const mood = BANTER_MOODS.find((m) => m.id === b.mood)?.label;
  const type = BANTER_TYPES.find((t) => t.id === b.type)?.label;
  const [saved, setSaved] = useState(false);
  return (
    <article className="bh-chat">
      <div className="bh-chat-main">
        <div className="bh-chat-tx">
          <header>
            <Avatar person={by} size={48} />
            <span>
              <span>{b.mine ? "You" : by.name}</span>
              <small>{by.role} <i /> {by.city} <i /> {b.ago} <i /> <Link href="/circles" className="bh-circle">{b.audienceLabel}</Link></small>
            </span>
          </header>
          <Link href={`/banter/${b.id}`} className="bh-q">{b.prompt}</Link>
          <p className="bh-preview">{last ? `${last.by === ME.id ? "You" : PEOPLE[last.by].name.split(" ")[0]}: ${last.kind === "voice" ? `voice note ${last.length}` : last.kind === "photo" ? "shared a photo" : last.text}` : "Nobody has answered yet. Be the first voice."}</p>
          <div className="bh-tags">
            {mood && <span className="hl">{mood}</span>}
            {type && <span>{type}</span>}
            {b.poll && <span>Poll</span>}
          </div>
        </div>
        {b.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- member's own upload, stored as a data URL
          <img src={b.image} alt="" className="bh-chat-img" />
        ) : b.photo ? <Photo name={b.photo} sizes="280px" className="bh-chat-img" /> : null}
      </div>
      <footer className="bh-chat-foot">
        <span className="bh-eng">
          {total > 0 && <span>❤️ {total}</span>}
          <Link href={`/banter/${b.id}`}><Add size={16} color="currentColor" /> React</Link>
          <button aria-pressed={saved} onClick={() => setSaved(!saved)} aria-label={saved ? "Saved" : "Save"} className={saved ? "on" : undefined}><Bookmark2 size={20} color="currentColor" /></button>
          <button aria-label="Share"><Share size={20} color="currentColor" /></button>
        </span>
        {people.length > 0 && (
          <span className="bh-faces sm">
            {people.slice(0, 4).map((id) => <Avatar key={id} person={PEOPLE[id]} size={30} />)}
            {(b.reach ?? 0) > people.length && <i>+{(b.reach ?? 0) - people.length}</i>}
          </span>
        )}
        <Link href={`/banter/${b.id}`} className="bh-open">Open <ArrowRight2 size={16} color="currentColor" /></Link>
      </footer>
    </article>
  );
}

/** Banter, laid out to the Figma frame: one live conversation on top, then Banter chats. */
export default function BanterHub() {
  const { all } = useBanters();
  const [sessions] = useLocal<BanterNow[]>("ak:banter-now", []);
  const live = [...sessions, ...BANTER_NOW];
  const [li, setLi] = useState(0);
  const [type, setType] = useState<string>("all");
  const [create, setCreate] = useState(false);
  const open = all.filter((b) => !b.closed);
  const shown = open.filter((b) => type === "all" || b.type === type);

  // The Create menu links to /banter?new=chat (or live): open the modal with that choice.
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const want = params.get("new");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL asks for the create modal
    if (want === "chat" || want === "live" || location.hash === "#start") setCreate(true);
  }, [want]);
  const close = () => {
    setCreate(false);
    if (want || location.hash) router.replace(pathname, { scroll: false });
  };

  const SEEDED: Record<string, number> = { everyday: 1240, culture: 980, support: 873, debate: 612, creative: 540, collab: 410, memory: 388, celebration: 301 };
  const counts = BANTER_TYPES.map((t) => ({ ...t, n: (SEEDED[t.id] ?? 200) + open.filter((b) => b.type === t.id).length })).sort((a, b) => b.n - a.n);

  return (
    <div className="kh bh">
      <div className="bh-grid">
        <main className="bh-main">
          <header className="bh-head">
            <div>
              <small>Banter</small>
              <h1>One question. A small chat. It fades, or it grows.</h1>
            </div>
            <button className="kh-btn amber bh-start" onClick={() => setCreate(true)}><Add size={16} color="currentColor" /> Start a Banter</button>
          </header>

          <section aria-label="Live Banter">
            <div className="bh-sub">
              <h3>Live now <span>{li + 1} of {live.length}</span></h3>
              <span className="bh-arrows">
                <button onClick={() => setLi((x) => (x - 1 + live.length) % live.length)} aria-label="Previous"><ArrowLeft2 size={16} color="currentColor" /></button>
                <button onClick={() => setLi((x) => (x + 1) % live.length)} aria-label="Next"><ArrowRight2 size={16} color="currentColor" /></button>
              </span>
            </div>
            <LiveCard key={live[li].id} s={live[li]} onSkip={() => setLi((x) => (x + 1) % live.length)} />
          </section>

          <section aria-label="Banter chats">
            <div className="kh-sec">
              <div>
                <h2>Banter chats</h2>
                <p>Questions from your people, circles and the wider community. Reply in your own time.</p>
              </div>
            </div>
            <nav className="bh-filters" aria-label="Filter Banter chats">
              <button className={type === "all" ? "on" : undefined} aria-pressed={type === "all"} onClick={() => setType("all")}>All</button>
              {BANTER_TYPES.map((t) => <button key={t.id} className={type === t.id ? "on" : undefined} aria-pressed={type === t.id} onClick={() => setType(t.id)}>{t.label}</button>)}
            </nav>
            <div className="bh-list">
              {shown.map((b) => <ChatCard key={b.id} b={b} />)}
              {shown.length === 0 && <p className="kh-none">No Banter like that yet. <button onClick={() => setCreate(true)}>Start one</button></p>}
            </div>
          </section>
        </main>

        <aside className="bh-side">
          <section className="kh-card">
            <div className="kh-side-head"><b>Popular Banter topics</b></div>
            <ul className="bh-topics">
              {counts.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <button onClick={() => { setType(t.id); window.scrollTo({ top: 600, behavior: "smooth" }); }}>
                    <Photo name={TOPIC_PHOTO[t.id]} sizes="78px" className="bh-topic-img" />
                    <span><b>{t.label}</b><small>{t.n.toLocaleString()} contributions</small></span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="kh-card kh-trend">
            <div className="kh-trend-head"><b>Upcoming Banter</b><small>Live chats you can join</small></div>
            <ul>
              {UPCOMING.map((u) => (
                <li key={u.title}><Link href={u.href}><b>{u.title}</b><span>{u.sub}</span><small>{u.when}</small></Link></li>
              ))}
            </ul>
            <Link href="/banter" className="kh-link">Explore more discoveries <ArrowRight size={12} color="currentColor" /></Link>
          </section>
        </aside>
      </div>

      <BanterCreate open={create} onClose={close} initialShape={want === "live" ? "live" : "chat"} />
    </div>
  );
}
