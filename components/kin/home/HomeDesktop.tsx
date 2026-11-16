"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, Handshake, CircleCheck, DoorOpen, Fingerprint, Leaf, MessagesSquare, Radio, ShoppingBag, Sparkles, Users } from "lucide-react";
import Button from "@/components/kin/Button";
import { Chip } from "@/components/kin/Chip";
import Img from "@/components/kin/Img";
import { Skeleton } from "@/components/kin/Overlay";
import { toast } from "@/components/kin/Toast";
import { DEMO } from "@/lib/demo/mode";
import { soon } from "@/lib/soon";
import { useLocal } from "@/lib/useLocal";
import {
  ACTIVITY_CARDS, BANTER_CARDS, BANTER_JOIN, CIRCLES, CIRCLES_COPY, EXPLORE_CARDS, HEADS, MATCHES, MATCH_COPY, PRODUCTS, PROJECT_CARDS,
  ROOM_CARDS, SHOP_COPY, STORY_CARDS, STUDIO_CARDS, TRAITS, TRAIT_LINK, TRAIT_META, WELLBEING, type FeedCard, type FeedKey,
} from "./content";
import FeedPosts from "./FeedPosts";
import { Carousel, SlidePhoto } from "./Carousel";
import { ErrorPanel, FdAvatar, FdFaces, FdLink } from "./parts";
import "./home-desktop.css";

/*
 * Community Home on desktop (1280 and up), laid out like Instagram's desktop web: below the hero, a centred feed column
 * with a column on the right (your circles, and people you would get along with as a "suggested" list), wide gutters on
 * both sides. Every feed section is a post: a header row (the section's mark, title and support line, and its link), a
 * carousel of the section's items, and the current item's caption. Your circles' feed is real posts (FeedPosts, variant
 * "post"). Same content, links and states as the other layouts (./content.ts); styles in home-desktop.css.
 */

const MARK: Record<FeedKey, typeof Sparkles> = {
  explore: Sparkles, kincircle: Users, banter: MessagesSquare, rooms: Radio, activities: CalendarDays, collaborate: Handshake,
  shop: ShoppingBag, studios: DoorOpen, stories: BookOpen, wellbeing: Leaf, dna: Fingerprint,
};

/* ---------------------------------------------------------------- section posts */

/** The header row every section post shares: the section's mark, its title and support line, and its link. */
function PostHead({ name, id }: { name: FeedKey; id: string }) {
  const h = HEADS[name];
  const Mark = MARK[name];
  return (
    <header className="ig-head">
      <span className="ig-mark" aria-hidden><Mark size={18} strokeWidth={1.5} /></span>
      <div className="ig-head__who">
        <h2 className="ig-head__title" id={id}>{h.title}</h2>
        <p className="ig-head__ctx">{h.support}</p>
      </div>
      {h.link ? <Link className="ig-act" href={h.link.href}>{h.link.label}</Link> : null}
    </header>
  );
}

/** Photo sections (explore, rooms, activities, projects, studios, stories): one photo per item, its caption below. */
function PhotoPost({ name, cards }: { name: FeedKey; cards: FeedCard[] }) {
  const [i, setI] = useState(0);
  const c = cards[i];
  return (
    <>
      <Carousel
        label={HEADS[name].title.replace(/\.$/, "")}
        index={i}
        onIndex={setI}
        slides={cards.map((x) => ({
          key: x.id,
          label: x.title,
          node: (
            <Link className="ig-slide" href={x.href} draggable={false} tabIndex={-1} aria-hidden>
              <SlidePhoto src={x.image} />
              {x.tag ? <span className="ig-slide__tag">{x.tag.toLowerCase().startsWith("live") ? <span className="ig-slide__dot" aria-hidden /> : null}{x.tag}</span> : null}
            </Link>
          ),
        }))}
      />
      <div className="ig-cap" key={c.id}>
        <h3 className="ig-cap__title"><Link href={c.href}>{c.title}</Link></h3>
        <p className="ig-cap__text">{c.text}</p>
        {c.left || c.right ? <p className="ig-cap__meta"><span>{c.left}</span>{c.left && c.right ? <span aria-hidden>·</span> : null}{c.right ? <span>{c.right}</span> : null}</p> : null}
      </div>
    </>
  );
}

function BanterPost() {
  const [i, setI] = useState(0);
  return (
    <Carousel
      label="Conversations worth joining"
      index={i}
      onIndex={setI}
      ratio="16 / 9"
      slides={BANTER_CARDS.map((b) => ({
        key: b.id,
        label: b.title,
        node: (
          <Link className="ig-text ig-text--banter" href={b.href} draggable={false}>
            <p className="ig-text__eyebrow">{b.tag.endsWith("LIVE") ? <span className="ig-slide__dot" aria-hidden /> : null}{b.tag}</p>
            <h3 className="ig-text__title">{b.title}</h3>
            <p className="ig-text__body">{b.text}</p>
            <span className="ig-text__foot">
              <span className="ig-text__people"><FdFaces ids={b.faces} /><span>{b.talking}</span></span>
              <span className="fd-link fd-link--static"><span>{BANTER_JOIN.label}</span><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></span>
            </span>
          </Link>
        ),
      }))}
    />
  );
}

function DnaPost() {
  const [i, setI] = useState(0);
  return (
    <Carousel
      label="Your creative DNA"
      index={i}
      onIndex={setI}
      ratio="16 / 9"
      slides={TRAITS.map((t) => ({
        key: t.id,
        label: t.title,
        node: (
          <article className="ig-text ig-text--trait">
            <p className="ig-text__eyebrow">{t.eyebrow}</p>
            <h3 className="ig-text__title">{t.title}</h3>
            <p className="ig-text__body">{t.text}</p>
            <span className="ig-text__foot">
              <span className="ig-text__people"><FdFaces ids={t.faces} /><span>{TRAIT_META}</span></span>
              <FdLink href={soon(TRAIT_LINK.href, t.title)}>{TRAIT_LINK.label}</FdLink>
            </span>
          </article>
        ),
      }))}
    />
  );
}

function ShopPost() {
  const [i, setI] = useState(0);
  const p = PRODUCTS[i];
  return (
    <>
      <Carousel
        label="Fresh from the makers"
        index={i}
        onIndex={setI}
        slides={PRODUCTS.map((x) => ({
          key: x.id,
          label: x.title,
          node: (
            <Link className="ig-slide" href={x.href} draggable={false} tabIndex={-1} aria-hidden>
              <SlidePhoto src={x.image} />
              <span className="ig-slide__tag">{x.tag}</span>
            </Link>
          ),
        }))}
      />
      <div className="ig-cap ig-cap--shop" key={p.id}>
        <div className="ig-cap__copy">
          <p className="ig-cap__maker"><FdAvatar src={p.face} size={24} /><span>{p.maker}</span></p>
          <h3 className="ig-cap__title"><Link href={p.href}>{p.title}</Link></h3>
          <p className="ig-cap__price"><span>{p.price}</span>{p.edition ? <span className="ig-cap__edition">{p.edition}</span> : null}</p>
        </div>
        <Button variant="secondary" onClick={() => toast.show({ message: SHOP_COPY.toast })} aria-label={`${SHOP_COPY.buy} ${p.title}`}>{SHOP_COPY.buy}</Button>
      </div>
    </>
  );
}

function WellbeingBody() {
  const [mood, setMood] = useLocal<string | null>("ak:feed-wellbeing", null);
  const reply = WELLBEING.options.find((w) => w.id === mood)?.reply;
  return (
    <>
      <div className="ig-single" style={{ aspectRatio: "4 / 3" }}><SlidePhoto src={WELLBEING.image} /></div>
      <div className="ig-cap ig-cap--well">
        <p className="ig-cap__tag">{WELLBEING.eyebrow}</p>
        <div className="fd-well__chips" role="group" aria-label="How is your creative energy today?">
          {WELLBEING.options.map((w) => <Chip key={w.id} selected={mood === w.id} onClick={() => setMood(mood === w.id ? null : w.id)}>{w.label}</Chip>)}
        </div>
        <p className="ig-cap__reply" aria-live="polite">{reply ? <span key={mood}>{reply}</span> : null}</p>
        <FdLink href={WELLBEING.link.href}>{WELLBEING.link.label}</FdLink>
      </div>
    </>
  );
}

function SectionBody({ name }: { name: FeedKey }) {
  switch (name) {
    case "explore": return <PhotoPost name={name} cards={EXPLORE_CARDS} />;
    case "rooms": return <PhotoPost name={name} cards={ROOM_CARDS} />;
    case "activities": return <PhotoPost name={name} cards={ACTIVITY_CARDS} />;
    case "collaborate": return <PhotoPost name={name} cards={PROJECT_CARDS.map(({ match, ...c }) => ({ ...c, right: DEMO ? match : undefined }))} />;
    case "studios": return <PhotoPost name={name} cards={STUDIO_CARDS} />;
    case "stories": return <PhotoPost name={name} cards={STORY_CARDS} />;
    case "banter": return <BanterPost />;
    case "dna": return <DnaPost />;
    case "shop": return <ShopPost />;
    case "wellbeing": return <WellbeingBody />;
    default: return null;
  }
}

/** A square grey post while a section loads again ("Try again"). */
function PostSkeleton() {
  return (
    <div className="ig-sk" aria-hidden>
      <div className="ig-sk__media"><Skeleton width="100%" height="100%" radius={0} /></div>
      <Skeleton width="72%" height={22} radius={2} />
      <Skeleton width="100%" height={14} radius={2} />
    </div>
  );
}

/**
 * One feed section as a post. `failing` starts it in its error state (the state-error link); "Try again" shows the
 * skeleton for a moment, then the section, as on the other layouts. Your circles' feed is its header, then the posts.
 */
export function SectionPost({ name, isFirst, failing }: { name: FeedKey; isFirst: boolean; failing?: boolean }) {
  const [phase, setPhase] = useState<"error" | "loading" | "live">(failing && name !== "wellbeing" ? "error" : "live");
  useEffect(() => {
    if (phase !== "loading") return;
    const t = window.setTimeout(() => setPhase("live"), 900);
    return () => window.clearTimeout(t);
  }, [phase]);
  const id = `fd-title-${name}`;
  const kin = name === "kincircle" && phase === "live";
  return (
    <section className={kin ? "ig-section ig-section--posts" : "ig-section"} id={isFirst ? "fd-first" : undefined} data-feed-section={name} aria-labelledby={id}>
      <article className="ig-post" data-m="up">
        <PostHead name={name} id={id} />
        {phase === "error" ? <ErrorPanel onRetry={() => setPhase("loading")} /> : phase === "loading" ? <PostSkeleton /> : kin ? null : <SectionBody name={name} />}
      </article>
      {kin ? <FeedPosts variant="post" /> : null}
    </section>
  );
}

/* ---------------------------------------------------------------- loading */

/** The whole feed while it loads: three grey posts, with "Getting things ready" above them in the loading state. */
export function FeedSkeletonDesktop({ note }: { note?: boolean }) {
  return (
    <div className="ig-feed__sk" aria-busy="true" aria-label="Loading your feed" role="status">
      {note ? <p className="fd-note"><RefreshIcon /><span>Getting things ready</span></p> : null}
      {Array.from({ length: 3 }, (_, i) => (
        <div className="ig-sk ig-sk--post" key={i}>
          <div className="ig-sk__head"><Skeleton width={40} height={40} radius={999} /><div className="ig-sk__lines"><Skeleton width="min(320px, 70%)" height={18} radius={2} /><Skeleton width="min(420px, 90%)" height={12} radius={2} /></div></div>
          <div className="ig-sk__media"><Skeleton width="100%" height="100%" radius={0} /></div>
          <Skeleton width="60%" height={22} radius={2} />
          <Skeleton width="100%" height={14} radius={2} />
        </div>
      ))}
    </div>
  );
}
function RefreshIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>;
}

/* ---------------------------------------------------------------- right column */

const SUGGEST_MAX = 5;

/** The right column: your circles, then people you would get along with as a list, each with "Say hello". */
export function HomeSide({ empty }: { empty?: boolean }) {
  const [hello, setHello] = useLocal<Record<string, boolean>>("ak:feed-hello", {});
  const people = MATCHES.slice(0, SUGGEST_MAX);
  return (
    <aside className="ig-side" aria-label="Your circles and people to meet">
      <section className="ig-box" aria-labelledby="ig-circles-title">
        <div className="ig-box__head">
          <h2 className="ig-box__title" id="ig-circles-title">{CIRCLES_COPY.title} <span className="ig-box__count">({CIRCLES.length})</span></h2>
          <Link className="ig-box__link" href={CIRCLES_COPY.link.href}>{CIRCLES_COPY.link.label}</Link>
        </div>
        <ul className="ig-list">
          {CIRCLES.map((c) => (
            <li key={c.id}>
              <Link className="ig-row ig-row--link" href={c.href}>
                <span className="ig-row__photo"><Img className="cover" src={c.image} sizes="44px" draggable={false} /></span>
                <span className="ig-row__text"><span className="ig-row__name">{c.name}</span><span className="ig-row__meta">{c.meta}</span></span>
                <span className="ig-row__go" aria-hidden>Open</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="ig-box" aria-labelledby="ig-match-title">
        <div className="ig-box__head">
          <h2 className="ig-box__title" id="ig-match-title">{MATCH_COPY.title}</h2>
          {empty || people.length === 0 ? null : <Link className="ig-box__link" href={MATCH_COPY.link.href}>{MATCH_COPY.link.label}</Link>}
        </div>
        {empty || people.length === 0 ? (
          <div className="ig-box__empty">
            <p>{MATCH_COPY.empty.text}</p>
            <FdLink href={MATCH_COPY.empty.link.href}>{MATCH_COPY.empty.link.label}</FdLink>
          </div>
        ) : (
          <ul className="ig-list">
            {people.map((m) => {
              const first = m.name.split(" ")[0];
              const sent = !!hello[m.id];
              return (
                <li key={m.id} className="ig-row" title={`“${m.quote}”`}>
                  <FdAvatar src={m.image} size={44} />
                  <span className="ig-row__text"><span className="ig-row__name" id={`ig-name-${m.id}`}>{m.name}</span><span className="ig-row__meta">{m.role} · {m.place}</span></span>
                  {sent ? (
                    <span className="ig-row__sent" role="status"><CircleCheck size={16} strokeWidth={1.5} aria-hidden /><span>Hello sent</span></span>
                  ) : (
                    <button type="button" className="ig-row__act" aria-describedby={`ig-name-${m.id}`} onClick={() => { setHello((h) => ({ ...h, [m.id]: true })); toast.show({ message: `Hello sent to ${first}` }); }}>{MATCH_COPY.hello}</button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}
