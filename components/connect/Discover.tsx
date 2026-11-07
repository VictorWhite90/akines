"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Button, { IconButton } from "@/components/kin/Button";
import { allActivities, dayDistance } from "@/components/activities/activities";
import { useJoined } from "@/components/circles/useJoined";
import HomeRail from "@/components/kin/home/HomeRail";
import { FdLink, faceSrc, photoSrc } from "@/components/kin/home/parts";
import { useAllProducts } from "@/components/shop/useShop";
import { useCollab } from "@/lib/collab/useCollab";
import { CIRCLES, STUDIOS } from "@/lib/data/community";
import { MATCHES } from "@/lib/data/matches";
import { allPeople, ME, PEOPLE, type PersonId } from "@/lib/data/people";
import { sortProducts } from "@/lib/data/shop";
import { STORIES } from "@/lib/data/stories";
import { useLocal } from "@/lib/useLocal";
import "@/components/kin/home/home.css";
import "./discover.css";

/*
 * Connect, Discover, mirrored from the product design (classes in discover.css, with Community Home's in home.css):
 * a row of places to explore, a filterable mix of what suits you, interests, people to meet, and the same rail as
 * Community Home. Every card reads our own people, circles, shop, projects, studios, stories and activities.
 */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const first = (id: PersonId) => PEOPLE[id]?.name.split(" ")[0] ?? "";

const EXPLORE = [
  { id: "people", title: "People", text: "Artists, creators and kindred spirits.", image: "/kin/discover/ngozi.jpg", href: "/kindred" },
  { id: "circles", title: "Circles", text: "Communities and shared interests.", image: "/kin/discover/kincircle.jpg", href: "/circles" },
  { id: "stores", title: "Artworks & Stores", text: "Original work that's made-to-order.", image: "/kin/discover/explore-stores.jpg", href: "/shop" },
  { id: "projects", title: "Projects", text: "Collaborations and creative builds.", image: "/kin/discover/zine.jpg", href: "/collaborate/discover" },
  { id: "events", title: "Events", text: "Talks, workshops and gatherings.", image: "/kin/discover/event-workshop.jpg", href: "/activities" },
];
const INTERESTS = [
  { id: "visual-arts", title: "Visual Arts", text: "Painters, illustrators, photographers and other visual creatives.", image: "/kin/discover/interest-visual-arts.jpg" },
  { id: "music", title: "Music", text: "Musicians, producers, sound artists and music enthusiasts.", image: "/kin/discover/interest-music.jpg" },
  { id: "film-media", title: "Film & Media", text: "Filmmakers, editors, storytellers and media creatives.", image: "/kin/discover/interest-film.jpg" },
  { id: "design", title: "Design", text: "Designers, product thinkers and UX creatives.", image: "/kin/discover/interest-design.jpg" },
];
const FILTERS = [
  { key: "all", label: "All" },
  { key: "people", label: "People" },
  { key: "circles", label: "Circles" },
  { key: "projects", label: "Projects" },
  { key: "studio-visits", label: "Studio Visits" },
  { key: "stories", label: "Stories" },
  { key: "events", label: "Events" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

type PersonCard = { kind: "person"; id: string; person: PersonId; name: string; image?: string; identity: string; text: string };
type CircleCard = { kind: "circle"; id: string; circle: string; name: string; image: string; meta: string; text: string };
type ArtCard = { kind: "artwork"; id: string; tag: string; title: string; maker: PersonId; price: string; edition: string; image: string; href: string };
type ItemCard = { kind: "project" | "studio" | "story" | "event"; id: string; tag: string; title: string; text: string; meta: string; image: string; action: string; href: string };
type Card = PersonCard | CircleCard | ArtCard | ItemCard;

function useCards(): Record<Filter, Card[]> {
  const { calls } = useCollab();
  const products = sortProducts(useAllProducts(), "new");
  const people: Card[] = allPeople.filter((p) => p.id !== ME.id).slice(0, 6).map((p) => ({ kind: "person", id: `person-${p.id}`, person: p.id as PersonId, name: p.name, image: faceSrc(p.id as PersonId, 640), identity: `${p.role} · ${p.city}`, text: p.about }));
  const circles: Card[] = CIRCLES.filter((c) => !c.joined).slice(0, 6).map((c) => ({ kind: "circle", id: `circle-${c.id}`, circle: c.id, name: c.name, image: photoSrc(c.photo), meta: `${c.members} members · ${c.active} active`, text: c.blurb }));
  const art: Card[] = products.slice(0, 1).map((p) => ({ kind: "artwork", id: `artwork-${p.id}`, tag: p.category.toUpperCase(), title: p.title, maker: p.seller, price: `$${p.price.toLocaleString()}`, edition: p.unique ? "1 of 1" : `${p.stock} available`, image: photoSrc(p.photos[0]), href: `/shop/${p.id}` }));
  const projects: Card[] = calls.filter((c) => !c.postedByMe).slice(0, 3).map((c) => ({ kind: "project", id: `project-${c.id}`, tag: "PROJECT", title: c.title, text: c.summary, meta: `${PEOPLE[c.host]?.name ?? c.org} · ${c.teamSize} people`, image: photoSrc(c.photo), action: "View project", href: `/collaborate/projects/${c.id}` }));
  const studios: Card[] = STUDIOS.slice(0, 3).map((v) => ({ kind: "studio", id: `studio-${v.id}`, tag: "STUDIO VISIT", title: `${first(v.artist)}'s studio`, text: v.blurb, meta: `${v.place} · ${v.when}`, image: photoSrc(v.photo), action: "Request a visit", href: `/studios/${v.id}` }));
  const stories: Card[] = STORIES.slice(0, 3).map((s) => ({ kind: "story", id: `story-${s.id}`, tag: "STORY", title: s.title, text: s.excerpt, meta: `By ${PEOPLE[s.by]?.name ?? "a member"}`, image: photoSrc(s.photo), action: "Read story", href: `/stories/${s.id}` }));
  const events: Card[] = allActivities().sort((a, b) => dayDistance(a.when) - dayDistance(b.when)).slice(0, 3).map((a) => ({ kind: "event", id: `event-${a.circleId}-${a.id}`, tag: a.when.toUpperCase(), title: a.title, text: a.blurb, meta: `${a.where} · ${a.mode}`, image: photoSrc(a.photo), action: "View event", href: "/activities" }));
  // The design's mix for All: two people and two circles around one of everything else.
  const all = [people[0], circles[0], art[0], projects[0], studios[0], stories[0], events[0], people[1], circles[1]].filter(Boolean);
  return { all, people, circles, projects, "studio-visits": studios, stories, events };
}

/** Section heading in the Community Home style, with the design's section ids. */
function Section({ id, title, support, link, className, children }: { id: string; title: string; support?: string; link?: { label: string; href: string }; className?: string; children: React.ReactNode }) {
  return (
    <section className={["fd-section", "dx-section", className].filter(Boolean).join(" ")} id={`dx-${id}`} aria-labelledby={`dx-title-${id}`} data-dx-section={id}>
      <header className="fd-head" data-m="up">
        <div className="fd-head__copy">
          <h2 className="fd-head__title" id={`dx-title-${id}`}>{title}</h2>
          {support ? <p className="fd-head__support">{support}</p> : null}
        </div>
        {link ? <FdLink href={link.href}>{link.label}</FdLink> : null}
      </header>
      {children}
    </section>
  );
}

function Explore() {
  const row = useRef<HTMLUListElement>(null);
  const go = (to: "previous" | "next") => { const s = row.current; if (s) s.scrollTo({ left: to === "next" ? s.scrollWidth - s.clientWidth : 0, behavior: reduced() ? "auto" : "smooth" }); };
  const reveal = (e: React.FocusEvent) => { const t = e.target as HTMLElement; if (t.matches(":focus-visible")) t.closest("li")?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduced() ? "auto" : "smooth" }); };
  return (
    <section className="fd-section dx-section" id="dx-explore" aria-labelledby="dx-title-explore" data-dx-section="explore">
      <header className="dxe-head" data-m="up">
        <h2 className="fd-head__title" id="dx-title-explore">Explore</h2>
        <div className="dxe-arrows">
          <IconButton variant="ghost" className="fd-arrow" label="Previous categories" tooltip={false} aria-controls="dx-explore-cards" onClick={() => go("previous")}><ChevronLeft size={24} strokeWidth={1.5} /></IconButton>
          <IconButton variant="ghost" className="fd-arrow" label="Next categories" tooltip={false} aria-controls="dx-explore-cards" onClick={() => go("next")}><ChevronRight size={24} strokeWidth={1.5} /></IconButton>
        </div>
      </header>
      <ul className="dxe-scroller" id="dx-explore-cards" ref={row} onFocus={reveal}>
        {EXPLORE.map((c, i) => (
          <li key={c.id} className="dxe-item" style={{ ["--i" as string]: i } as React.CSSProperties}>
            <Link className="dxe-card" href={c.href} draggable={false}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the design's category photo */}
              <span className="dxe-photo"><img className="dxe-img" src={c.image} alt="" loading={i < 4 ? "eager" : "lazy"} decoding="async" draggable={false} /></span>
              <span className="dxe-text">
                <span className="dxe-line"><span className="dxe-title">{c.title}</span><span className="dxe-arrow" aria-hidden><ArrowRight size={20} strokeWidth={1.5} /></span></span>
                <span className="dxe-desc">{c.text}</span>
              </span>
              <span className="dxe-rule" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Photo({ src, reveal }: { src?: string; reveal: boolean }) {
  return (
    <div className="fd-photo dxf-photo" data-m={reveal ? "frame" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the card's photo */}
      {src ? <img className="cover" src={src} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
    </div>
  );
}

function Done({ done, label, children }: { done: boolean; label: string; children: React.ReactNode }) {
  return <div className="dxf-act" aria-live="polite" aria-atomic="true">{done ? <span className="dxf-pill"><Check size={16} strokeWidth={1.25} aria-hidden /><span>{label}</span></span> : children}</div>;
}

function CardView({ card, reveal, requested, onRequest }: { card: Card; reveal: boolean; requested: boolean; onRequest: () => void }) {
  const { has, toggle } = useJoined();
  const body = (() => {
    switch (card.kind) {
      case "person":
        return (
          <>
            <Photo src={card.image} reveal={reveal} />
            <div className="dxf-text">
              <h3 className="dxf-name"><Link className="dxf-main" href={`/profile/${card.person}`}>{card.name}</Link></h3>
              <p className="dxf-role">{card.identity}</p>
              <p className="dxf-desc">{card.text}</p>
            </div>
            <div className="dxf-foot dxf-foot--end">
              <Done done={requested} label="Requested"><Button variant="secondary" aria-label={`Connect with ${card.name}`} onClick={onRequest}>Connect</Button></Done>
            </div>
          </>
        );
      case "circle":
        return (
          <>
            <Photo src={card.image} reveal={reveal} />
            <div className="dxf-text">
              <h3 className="dxf-name"><Link className="dxf-main" href={`/circles/${card.circle}`}>{card.name}</Link></h3>
              <p className="dxf-meta dxf-meta--block">{card.meta}</p>
              <p className="dxf-desc">{card.text}</p>
            </div>
            <div className="dxf-foot dxf-foot--end">
              <Done done={has(card.circle)} label="Joined"><Button variant="secondary" aria-label={`Join ${card.name}`} onClick={() => toggle(card.circle)}>Join</Button></Done>
            </div>
          </>
        );
      case "artwork":
        return (
          <>
            <Photo src={card.image} reveal={reveal} />
            <div className="dxf-text">
              <p className="dxf-tag">{card.tag}</p>
              <h3 className="dxf-name"><Link className="dxf-main" href={card.href}>{card.title}</Link></h3>
              <div className="dxf-maker">
                {/* eslint-disable-next-line @next/next/no-img-element -- the maker's face */}
                <span className="fd-av dxf-av">{faceSrc(card.maker) ? <img src={faceSrc(card.maker)} alt="" loading="lazy" decoding="async" draggable={false} /> : null}</span>
                <span>{PEOPLE[card.maker]?.name ?? "A member"}</span>
              </div>
            </div>
            <div className="dxf-foot">
              <p className="dxf-price"><span>{card.price}</span><span className="dxf-meta">{card.edition}</span></p>
              <div className="dxf-act"><Button variant="secondary" href={card.href} aria-label={`Buy ${card.title}`}>Buy</Button></div>
            </div>
          </>
        );
      default:
        return (
          <>
            <Photo src={card.image} reveal={reveal} />
            <div className="dxf-text">
              <p className="dxf-tag">{card.tag}</p>
              <h3 className="dxf-title"><Link className="dxf-main" href={card.href}><span className="dxf-clamp">{card.title}</span></Link></h3>
              <p className="dxf-desc dxf-desc--tall">{card.text}</p>
            </div>
            <div className="dxf-foot">
              <span className="dxf-meta">{card.meta}</span>
              <div className="dxf-act">
                <Link className="fd-link dxf-link" href={card.href}><span>{card.action}<span className="sr-only"> {card.title}</span></span><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></Link>
              </div>
            </div>
          </>
        );
    }
  })();
  return <article className="dxf-card" data-kind={card.kind}>{body}<span className="dxf-rule" aria-hidden /></article>;
}

function ForYou({ initial }: { initial: Filter }) {
  const cards = useCards();
  const [filter, setFilter] = useState<Filter>(initial);
  const [swapped, setSwapped] = useState(false);
  const [status, setStatus] = useState("");
  const [requested, setRequested] = useLocal<string[]>("ak:discover-requested", []);
  const list = cards[filter];
  const pick = (f: Filter) => {
    if (f === filter) return;
    setFilter(f);
    setSwapped(true);
    setStatus(`Showing ${FILTERS.find((x) => x.key === f)?.label ?? f}, ${cards[f].length} cards.`);
  };
  return (
    <Section id="for-you" title="For you on Akines" support="A mix of people, circles, projects and stories based on your interests and activity." link={{ label: "Explore all", href: "/kindred" }}>
      <div className="dxf">
        <div className="dxf-filters" role="group" aria-label="Filter For you on Akines" data-m="up">
          {FILTERS.map((f) => <button key={f.key} type="button" className="dxf-chip" aria-pressed={filter === f.key} onClick={() => pick(f.key)}>{f.label}</button>)}
        </div>
        <p className="sr-only" role="status">{status}</p>
        {/* A new filter swaps the grid in place; only the first grid plays the scroll reveal. */}
        <ul key={filter} className={swapped ? "dxf-grid dxf-grid--swap" : "dxf-grid"} role="list" data-m={swapped ? undefined : "stagger"}>
          {list.map((c) => (
            <li key={c.id} className="dxf-cell">
              <CardView card={c} reveal={!swapped} requested={requested.includes(c.id)} onRequest={() => setRequested((r) => (r.includes(c.id) ? r : [...r, c.id]))} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function Interests() {
  const reveal = (e: React.FocusEvent) => { const t = e.target as HTMLElement; if (t.matches(":focus-visible")) t.closest("li")?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduced() ? "auto" : "smooth" }); };
  return (
    <Section id="interests" title="Explore by interest" support="Dive into what moves you. Find people, circles and content around the things you love." link={{ label: "Explore all", href: "/kindred" }}>
      <ul className="dxi-row" data-m="stagger" onFocus={reveal}>
        {INTERESTS.map((r) => (
          <li key={r.id} className="dxi-item">
            <Link className="dxi-card" href="/kindred">
              {/* eslint-disable-next-line @next/next/no-img-element -- the design's interest photo */}
              <img className="dxi-photo" src={r.image} alt="" loading="lazy" decoding="async" draggable={false} />
              <span className="dxi-blur" aria-hidden><i /><i /><i /></span>
              <span className="dxi-scrim" aria-hidden />
              <span className="dxi-title">{r.title}</span>
              <span className="dxi-desc">{r.text}</span>
              <span className="dxi-action">Explore<ArrowRight size={16} strokeWidth={1.5} aria-hidden /></span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** The design's Akines assistant mark, deep amber on ivory. */
function AssistantMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 600 600" width={size} height={size} aria-hidden focusable="false">
      <path d="M104.9 378.5A222.75 222.75 0 1 1 495.1 378.5" fill="none" stroke="#AE690A" strokeWidth="49.5" strokeLinecap="round" />
      <circle cx="225" cy="258" r="42.5" fill="#AE690A" />
      <circle cx="376" cy="258" r="42.5" fill="#AE690A" />
      <path d="M300.0 577.5L431.2 489.8A155 66 0 1 0 300.0 520.3Z" fill="#AE690A" />
    </svg>
  );
}

type RecStatus = "idle" | "sent" | "dismissed";
function Rec({ id, index, status, set }: { id: PersonId; index: number; status: RecStatus; set: (s: RecStatus) => void }) {
  const m = MATCHES.find((x) => x.id === id)!;
  const p = PEOPLE[id];
  const name = first(id);
  const notNow = useRef<HTMLButtonElement>(null), sent = useRef<HTMLParagraphElement>(null), undo = useRef<HTMLButtonElement>(null);
  const after = useRef<RecStatus | "back" | null>(null);
  // Keep focus on the control that replaces the one just pressed, as the design does.
  useEffect(() => {
    const was = after.current; after.current = null;
    if (was === "sent" && status === "sent") sent.current?.focus();
    else if (was === "dismissed" && status === "dismissed") undo.current?.focus();
    else if (was === "back" && status === "idle") notNow.current?.focus();
  }, [status]);
  const nameId = `dxr-name-${id}`, noteId = `dxr-note-${id}`;
  return (
    <li className="dxr-card" data-status={status} style={{ ["--dxr-i" as string]: index } as React.CSSProperties}>
      <div className="dxr-card__body" inert={status === "dismissed"}>
        <div className="dxr-top"><p className="dxr-eyebrow">Someone to meet</p></div>
        <Link className="dxr-who" href={`/profile/${id}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the member's face */}
          <span className="dxr-photo">{faceSrc(id) ? <img src={faceSrc(id)} alt="" width={72} height={72} loading="lazy" decoding="async" draggable={false} /> : null}</span>
          <span className="dxr-who__text"><span className="dxr-name" id={nameId}>{p?.name}</span><span className="dxr-role">{p ? `${p.role} · ${p.city}` : ""}</span></span>
        </Link>
        <ul className="dxr-tags">{m.signals.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="dxr-reason">{`“${m.ask ?? m.reason}”`}</p>
        <div className="dxr-slot">
          {status === "sent" ? (
            <p className="dxr-sent" ref={sent} tabIndex={-1}>{`Hello sent to ${name}. We will let you know when they reply.`}</p>
          ) : (
            <div className="dxr-actions">
              <Button variant="secondary" full ref={notNow} onClick={() => { after.current = "dismissed"; set("dismissed"); }} aria-describedby={nameId}>Not now</Button>
              <Button full onClick={() => { after.current = "sent"; set("sent"); }} aria-describedby={nameId}>Say hello</Button>
            </div>
          )}
        </div>
      </div>
      {status === "dismissed" ? (
        <div className="dxr-dismissed">
          <p className="dxr-dismissed__text" id={noteId}>{`Not now noted. We will not show ${name} for a while.`}</p>
          <button type="button" className="fd-link" ref={undo} onClick={() => { after.current = "back"; set("idle"); }} aria-describedby={noteId}>Undo</button>
        </div>
      ) : null}
    </li>
  );
}

function Recommendations() {
  const [recs, setRecs] = useLocal<Record<string, RecStatus>>("ak:discover-recs", {});
  const list = MATCHES.slice(0, 4);
  return (
    <Section id="recommendations" className="dxr-section" title="People whose journeys complement yours" support="Meet people for a reason, not by chance." link={{ label: "See all", href: "/kindred" }}>
      <p className="dxr-label"><AssistantMark /><span>AI Suggestion</span></p>
      {list.length === 0 ? (
        <p className="dxs-empty">We&apos;re finding people who may be relevant to you.</p>
      ) : (
        <div className="dxr-cards">
          <ul className="dxr-grid">
            {list.map((m, i) => <Rec key={m.id} id={m.id} index={i} status={recs[m.id] ?? "idle"} set={(s) => setRecs((r) => ({ ...r, [m.id]: s }))} />)}
          </ul>
        </div>
      )}
    </Section>
  );
}

export default function Discover() {
  const asked = useSearchParams().get("filter");
  const initial: Filter = FILTERS.some((f) => f.key === asked) ? (asked as Filter) : "all";
  const { ids } = useJoined();
  return (
    <div className="fd-page dx-feed">
      <div className="dx-body">
        <div className="dx-column">
          <Explore />
          <ForYou key={initial} initial={initial} />
          <Interests />
          <Recommendations />
        </div>
        <HomeRail circles={CIRCLES.filter((c) => ids.includes(c.id))} className="dx-rail" />
      </div>
    </div>
  );
}
