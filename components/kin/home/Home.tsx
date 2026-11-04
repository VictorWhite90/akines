"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ImagePlus } from "lucide-react";
import Avatar from "@/components/kin/Avatar";
import Button from "@/components/kin/Button";
import { SectionHead, Tile } from "@/components/kin/Tile";
import { allActivities, dayDistance } from "@/components/activities/activities";
import { usePosts } from "@/components/feed/usePosts";
import { useJoined } from "@/components/circles/useJoined";
import { useMe } from "@/components/shell/MemberContext";
import { useCollab } from "@/lib/collab/useCollab";
import { CIRCLES, ROOMS, STUDIOS } from "@/lib/data/community";
import { MORE_POSTS } from "@/lib/data/feedMore";
import { JOURNAL } from "@/lib/data/journals";
import { STORIES } from "@/lib/data/stories";
import { ME, PEOPLE } from "@/lib/data/people";
import { useLocal } from "@/lib/useLocal";
import ComposeSheet from "./ComposeSheet";
import Post from "./Post";
import Rail from "./Rail";
import "./home.css";

const MOODS = ["Full", "Steady", "Low", "Running on empty"] as const;
const first = (id: keyof typeof PEOPLE) => PEOPLE[id].name.split(" ")[0];

/**
 * Community Home, as the product design lays it out: a welcome, living journals, your circles' posts,
 * then rooms, projects, things to do, studios, a quiet moment and stories. Your circles, a person to meet
 * and what is trending sit in a column beside it on desktop and after the welcome on phones.
 * Everything reads the same data the rest of the app reads.
 */
export default function Home() {
  const { posts } = usePosts();
  const { ids: joinedIds } = useJoined();
  const { me } = useMe();
  const { calls } = useCollab();
  const [filter, setFilter] = useState<string>("mine");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [compose, setCompose] = useState(false);
  const [count, setCount] = useState(3);
  const [mood, setMood] = useLocal<{ day: string; mood: string } | null>("ak:home-mood", null);
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
  const filterLabel = filter === "mine" ? "Your circles" : filter === "all" ? "All circles" : CIRCLES.find((c) => c.id === filter)?.name ?? "Your circles";
  const meAvatar = { name: me?.name ?? ME.name, photo: me?.photo, face: me?.photo ? undefined : ME.face };

  const journals = JOURNAL.filter((j) => j.photo).slice(0, 3);
  const rooms = [...ROOMS].sort((a, b) => (a.status === "live" ? -1 : b.status === "live" ? 1 : a.status === "soon" ? -1 : b.status === "soon" ? 1 : 0)).slice(0, 3);
  const projects = calls.filter((c) => !c.postedByMe).slice(0, 3);
  const things = allActivities().sort((a, b) => dayDistance(a.when) - dayDistance(b.when)).slice(0, 3);
  const studios = STUDIOS.slice(0, 3);
  const stories = STORIES.slice(0, 3);
  const moodToday = mood?.day === today ? mood.mood : null;

  return (
    <div className="h">
      <div className="h-wrap">
        <div className="h-main">
          <section className="h-hero" aria-labelledby="h-hero">
            <Image src="/kin/home/hero.jpg" alt="" fill priority sizes="(max-width: 1023px) 100vw, 900px" className="h-hero-img" />
            <div className="h-hero-body">
              <h1 id="h-hero">Bring together the right people around a shared purpose.</h1>
              <div className="h-hero-acts">
                <Button variant="primary" light href="/circles/new">Start a KinCircle</Button>
                <Button variant="link" light href="/about/philosophy" arrow="right">See how it works</Button>
              </div>
            </div>
          </section>

          <div className="h-phone-rail"><Rail /></div>

          <section className="h-sec" aria-labelledby="h-journals">
            <SectionHead id="h-journals" title="Witness the journey." sub="Living journals from people at work and in life." href="/journal" cta="Open journals" />
            <div className="k-tiles">
              {journals.map((j) => (
                <Tile key={j.id} href={`/profile/${j.by}`} photo={j.photo!} label={j.kind === "work" ? "Work journal" : "Life journal"} title={j.title} text={j.text} left={`By ${first(j.by)}`} right={j.date} />
              ))}
            </div>
          </section>

          <section className="h-sec" aria-labelledby="h-feed">
            <div className="h-feedhead">
              <div>
                <h2 id="h-feed">From your circles.</h2>
                <p>What the people you gather with are sharing.</p>
              </div>
              <div className="h-filter" ref={filterRef}>
                <button type="button" aria-expanded={filterOpen} aria-haspopup="menu" onClick={() => setFilterOpen((v) => !v)}>{filterLabel}<ChevronDown size={16} strokeWidth={1.5} aria-hidden /></button>
                {filterOpen && (
                  <div className="k-menu" role="menu">
                    {[{ id: "mine", name: "Your circles" }, ...joined, { id: "all", name: "All circles" }].map((c) => (
                      <button key={c.id} type="button" role="menuitemradio" aria-checked={filter === c.id} className={filter === c.id ? "on" : undefined} onClick={() => { setFilter(c.id); setFilterOpen(false); setCount(3); }}>{c.name}</button>
                    ))}
                    <Link href="/circles" role="menuitem">Manage circles</Link>
                  </div>
                )}
              </div>
            </div>
            <div className="h-compose">
              <Avatar person={meAvatar} size={44} />
              <button type="button" className="line" onClick={() => setCompose(true)}>Share with your circles</button>
              <Button variant="ghost" icon onClick={() => setCompose(true)} aria-label="Share a photo"><ImagePlus size={22} strokeWidth={1.5} /></Button>
            </div>
            <div className="h-posts">
              {shown.length === 0 && <p className="h-empty">Nothing here yet. <Link href="/circles" className="k-link">Join a circle</Link> to see what people are sharing.</p>}
              {shown.map((p) => <Post key={p.id} post={p} />)}
            </div>
            {count < feed.length ? (
              <div className="h-more"><Button variant="secondary" onClick={() => setCount((c) => c + 5)}>Show more posts</Button></div>
            ) : shown.length > 0 && (
              <p className="h-empty">You&apos;re caught up. <Link href="/circles" className="k-link">Find another circle</Link></p>
            )}
          </section>

          <section className="h-sec" aria-labelledby="h-rooms">
            <SectionHead id="h-rooms" title="Rooms open now." sub="Drop in, listen, or speak when you are ready." href="/rooms" cta="See all rooms" />
            <div className="k-tiles">
              {rooms.map((r) => (
                <Tile key={r.id} href={`/rooms/${r.id}`} photo={r.photo} label={r.status === "live" ? "Live now" : r.when.startsWith("Tonight") ? `Starts ${r.when.replace("Tonight · ", "")}` : r.when} title={r.title} text={r.blurb} left={`${r.seated.length} ${r.status === "live" ? "in the room" : "going"}`} right={`Hosted by ${first(r.host)}`} />
              ))}
            </div>
          </section>

          {projects.length > 0 && (
            <section className="h-sec" aria-labelledby="h-projects">
              <SectionHead id="h-projects" title="Projects looking for you." sub="Open calls that could use what you do." href="/collaborate" cta="Discover projects" />
              <div className="k-tiles">
                {projects.map((c) => (
                  <Tile key={c.id} href={`/collaborate/calls/${c.id}`} photo={c.photo} label={`Looking for: ${c.roles[0]}`} title={c.title} text={c.summary} left={`${c.city} · ${c.where}`} right={c.closesInDays <= 0 ? "Closing today" : `Closes in ${c.closesInDays} days`} />
                ))}
              </div>
            </section>
          )}

          <section className="h-sec" aria-labelledby="h-things">
            <SectionHead id="h-things" title="Things to do together." sub="Small, easy ways to meet people through doing something." href="/activities" cta="See all activities" />
            <div className="k-tiles">
              {things.map((a) => (
                <Tile key={a.circleId + a.id} href="/activities" photo={a.photo} label={a.when} title={a.title} text={a.blurb} left={a.where} right={`${a.going.length} going`} />
              ))}
            </div>
          </section>

          <section className="h-sec" aria-labelledby="h-studios">
            <SectionHead id="h-studios" title="Step inside the studio." sub="Live, virtual or 360°. Talk to the maker directly." href="/studios" cta="Visit studios" />
            <div className="k-tiles">
              {studios.map((v) => (
                <Tile key={v.id} href={`/studios/${v.id}`} photo={v.photo} label={v.mode} title={`${PEOPLE[v.artist].name}'s studio`} text={v.blurb} left={v.place} right={v.when} />
              ))}
            </div>
          </section>

          <section className="h-quiet" aria-labelledby="h-quiet">
            <div className="h-quiet-body">
              <span className="k-eyebrow">Wellbeing</span>
              <h2 id="h-quiet">A quiet moment.</h2>
              <p>How is your energy today? Only you can see your answer.</p>
              <div className="h-quiet-moods" role="radiogroup" aria-label="Your energy today">
                {MOODS.map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={moodToday === m} className="k-chip" onClick={() => setMood({ day: today, mood: m })}>{m}</button>
                ))}
              </div>
              {moodToday && <p className="h-quiet-thanks" role="status">Noted for today. {moodToday === "Low" || moodToday === "Running on empty" ? "Be gentle with yourself; there is a breathing room in Wellbeing." : "Thank you for checking in."}</p>}
              <Link href="/wellbeing" className="k-link">Reflect privately<ArrowRight size={16} strokeWidth={1.75} aria-hidden /></Link>
            </div>
            <div className="h-quiet-photo"><Image src="/kin/home/quiet.jpg" alt="" fill sizes="(max-width: 1023px) 100vw, 360px" /></div>
          </section>

          <section className="h-sec" aria-labelledby="h-stories">
            <SectionHead id="h-stories" title="These might resonate with you." sub="Stories, ideas and conversations worth your time." href="/stories" cta="Explore all" />
            <div className="k-tiles">
              {stories.map((s) => (
                <Tile key={s.id} href={`/stories/${s.id}`} photo={s.photo} title={s.title} text={s.excerpt} left={`${s.reflections} reflections`} right={s.voice ? `Voice · ${s.voice}` : `${s.read} read`} />
              ))}
            </div>
          </section>
        </div>
        <div className="h-desk-rail"><Rail /></div>
      </div>
      <ComposeSheet open={compose} onClose={() => setCompose(false)} />
    </div>
  );
}
